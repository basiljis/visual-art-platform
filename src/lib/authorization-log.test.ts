import { expect, it } from "vitest";
import { loadEnv } from "vite";

it("does not expose the admin authorization log to anonymous visitors", async () => {
  const env = loadEnv("test", process.cwd(), "VITE_");
  const url = env["VITE_SUPABASE_URL"];
  const key = env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Missing public configuration");
  const response = await fetch(`${url}/rest/v1/rpc/admin_authorization_log`, {
    method: "POST", headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ _days: 30, _offset: 0 }),
  });
  expect(response.ok).toBe(false);
  expect([401, 403]).toContain(response.status);
  const body = await response.json();
  expect(body.code).toBe("42501");
});