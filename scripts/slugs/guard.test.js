/** @jest-environment node */
import { assertTarget } from "./guard.mjs";

describe("assertTarget", () => {
  it("allows staging", () => {
    expect(() => assertTarget("staging", {})).not.toThrow();
  });

  it("refuses production without --production", () => {
    expect(() => assertTarget("test", {})).toThrow(/"test"/);
  });

  it("allows production only with --production", () => {
    expect(() => assertTarget("test", { production: true })).not.toThrow();
  });

  it("refuses any other database, even with --production", () => {
    expect(() => assertTarget("toronto", { production: true })).toThrow(/"toronto"/);
  });
});
