/** @jest-environment node */
import { assertStaging } from "./guard.mjs";

test("staging is allowed", () => {
  expect(() => assertStaging("staging")).not.toThrow();
});

test.each(["test", "toronto", "", "Staging"])("%p is refused", (name) => {
  expect(() => assertStaging(name)).toThrow(`refusing to read "${name}": the price diff only reads the staging database`);
});
