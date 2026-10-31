import test from "node:test";
import assert from "node:assert/strict";
import { AFRICAN_COUNTRIES } from "../dist/index.mjs";

test("AFRICAN_COUNTRIES contains key African markets", () => {
  const codes = AFRICAN_COUNTRIES.map((c) => c.iso2);
  assert.ok(codes.includes("CI"), "Côte d'Ivoire must be present");
  assert.ok(codes.includes("SN"), "Sénégal must be present");
  assert.ok(codes.includes("CM"), "Cameroun must be present");
  assert.ok(codes.includes("GA"), "Gabon must be present");
  assert.ok(codes.includes("NG"), "Nigeria must be present");
  assert.ok(codes.includes("GH"), "Ghana must be present");
});
