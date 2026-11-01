import test from "node:test";
import assert from "node:assert/strict";
import { formatAmountOffline, FIXED_PARITY, WezasClient } from "../dist/index.js";

test("offline formatAmountOffline with XOF", () => {
  const res = formatAmountOffline(15000, "XOF");
  assert.equal(res.ok, true);
  const formatted = res.data?.montant_formate || "";
  assert.ok(formatted.includes("15") && formatted.includes("FCFA"));
});

test("offline FIXED_PARITY", () => {
  assert.equal(FIXED_PARITY.EUR_TO_XOF, 655.957);
  assert.equal(FIXED_PARITY.EUR_TO_XAF, 655.957);
  assert.equal(FIXED_PARITY.XOF_TO_XAF, 1.0);
});

test("WezasClient mock fetch invocation", async () => {
  let requestedUrl = "";
  let requestedBody = null;

  const mockFetch = async (url, init) => {
    requestedUrl = url;
    requestedBody = JSON.parse(init.body);
    return {
      ok: true,
      json: async () => ({
        ok: true,
        data: { valide: true, e164: "+24177123456" },
      }),
    };
  };

  const client = new WezasClient({
    baseUrl: "https://api.test.wezas.africa",
    apiKey: "wz_test_12345678901234567890123456789012",
    fetch: mockFetch,
  });

  const res = await client.validerTelephone("GA", "077123456");
  assert.equal(requestedUrl, "https://api.test.wezas.africa/api/execute");
  assert.equal(requestedBody.tool, "valider_telephone");
  assert.equal(res.ok, true);
  assert.equal(res.data?.valide, true);
});
