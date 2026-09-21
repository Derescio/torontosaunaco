import { readJsonResponse } from "./readJsonResponse.js";

function mockResponse({ ok = true, contentType = "application/json", body } = {}) {
  return {
    ok,
    headers: {
      get: (name) => (name.toLowerCase() === "content-type" ? contentType : null),
    },
    json: async () => body,
  };
}

describe("readJsonResponse", () => {
  it("returns parsed JSON for a successful JSON response", async () => {
    const res = mockResponse({ body: [{ id: "1" }] });
    await expect(readJsonResponse(res, [])).resolves.toEqual([{ id: "1" }]);
  });

  it("parses JSON even when the API returns text/plain", async () => {
    const res = mockResponse({
      contentType: "text/plain;charset=UTF-8",
      body: [{ id: "1" }],
    });
    await expect(readJsonResponse(res, [])).resolves.toEqual([{ id: "1" }]);
  });

  it("returns the fallback when the body is HTML", async () => {
    const res = mockResponse({
      contentType: "text/html; charset=utf-8",
      body: "<!DOCTYPE html>",
    });
    await expect(readJsonResponse(res, [])).resolves.toEqual([]);
  });

  it("returns the fallback when the status is not ok", async () => {
    const res = mockResponse({ ok: false, body: { error: "nope" } });
    await expect(readJsonResponse(res, null)).resolves.toBeNull();
  });
});
