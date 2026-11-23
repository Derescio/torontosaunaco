import {
  isProduction,
  getMongoDbName,
  assertMongoTargetAllowed,
  applyEmailSafety,
} from "./safety.js";

const PROD = { VERCEL_ENV: "production" };
const STAGING = { VERCEL_ENV: "preview", STAGING_EMAIL_TO: "dev@example.com" };
const LOCAL = { STAGING_EMAIL_TO: "dev@example.com" };

describe("isProduction", () => {
  it("is true only when VERCEL_ENV is production", () => {
    expect(isProduction(PROD)).toBe(true);
    expect(isProduction({ VERCEL_ENV: "preview" })).toBe(false);
    expect(isProduction({})).toBe(false);
  });
});

describe("getMongoDbName", () => {
  it("reads the database name from an SRV URI", () => {
    expect(getMongoDbName("mongodb+srv://u:p@host.mongodb.net/staging?retryWrites=true")).toBe("staging");
  });

  it("reads the database name from a standard URI", () => {
    expect(getMongoDbName("mongodb://u:p@h1:27017,h2:27017/toronto")).toBe("toronto");
  });

  it("falls back to test, MongoDB's default, when the URI names no database", () => {
    expect(getMongoDbName("mongodb+srv://u:p@host.mongodb.net/?retryWrites=true")).toBe("test");
    expect(getMongoDbName("mongodb+srv://u:p@host.mongodb.net")).toBe("test");
  });
});

describe("assertMongoTargetAllowed", () => {
  const testUri = "mongodb+srv://u:p@host.mongodb.net/test";
  const stagingUri = "mongodb+srv://u:p@host.mongodb.net/staging";

  it("allows the production database in production", () => {
    expect(() => assertMongoTargetAllowed(testUri, PROD)).not.toThrow();
  });

  it("refuses the production database outside production", () => {
    expect(() => assertMongoTargetAllowed(testUri, STAGING)).toThrow(/production database/);
    expect(() => assertMongoTargetAllowed(testUri, LOCAL)).toThrow(/production database/);
  });

  it("refuses a URI with no database name outside production, since it defaults to test", () => {
    expect(() => assertMongoTargetAllowed("mongodb+srv://u:p@host.mongodb.net/", LOCAL)).toThrow();
  });

  it("allows other databases outside production", () => {
    expect(() => assertMongoTargetAllowed(stagingUri, LOCAL)).not.toThrow();
  });

  it("never includes credentials in the error", () => {
    expect(() => assertMongoTargetAllowed("mongodb+srv://secretuser:secretpass@h/test", LOCAL)).toThrow(
      expect.objectContaining({ message: expect.not.stringMatching(/secret/) })
    );
  });
});

describe("applyEmailSafety", () => {
  const mail = {
    from: "site@example.com",
    to: "sales@example.com",
    cc: "boss@example.com",
    bcc: ["x@example.com"],
    subject: "New lead",
    html: "<p>Hello</p>",
  };

  it("leaves mail unchanged in production", () => {
    expect(applyEmailSafety(mail, PROD)).toEqual(mail);
  });

  it("sends only to STAGING_EMAIL_TO outside production", () => {
    const safe = applyEmailSafety(mail, STAGING);
    expect(safe.to).toBe("dev@example.com");
    expect(safe.cc).toBeUndefined();
    expect(safe.bcc).toBeUndefined();
  });

  it("marks the subject and records the original recipients outside production", () => {
    const safe = applyEmailSafety(mail, STAGING);
    expect(safe.subject).toBe("[STAGING] New lead");
    expect(safe.html).toContain("sales@example.com");
    expect(safe.html).toContain("boss@example.com");
    expect(safe.html).toContain("x@example.com");
    expect(safe.html).toContain("<p>Hello</p>");
  });

  it("refuses to send outside production when STAGING_EMAIL_TO is missing", () => {
    expect(() => applyEmailSafety(mail, { VERCEL_ENV: "preview" })).toThrow(/STAGING_EMAIL_TO/);
  });
});
