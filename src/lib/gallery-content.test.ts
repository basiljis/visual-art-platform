import { describe, expect, it } from "vitest";
import { loadEnv } from "vite";

const env = loadEnv("test", process.cwd(), "VITE_");
async function publicRows<T>(table: string, query: string): Promise<T[]> {
  const url = env['VITE_SUPABASE_URL'];
  const key = env['VITE_SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error("Public gallery configuration missing");
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, { headers: { apikey: key } });
  if (!response.ok) throw new Error(`Gallery read failed: ${response.status}`);
  return response.json();
}

describe("saved gallery directions", () => {
  it("orders the populated directions as requested after All", async () => {
    const rows = await publicRows<{ key: string }>("categories", "select=key&parent_key=is.null&key=neq.new&order=sort.asc");
    expect(rows.map(row => row.key)).toEqual(["myth", "china", "nu", "print", "portraits", "other"]);
  });
  it("renames Nude to Antiquity in both languages", async () => {
    const rows = await publicRows<{ name_ru: string; name_en: string }>("categories", "select=name_ru,name_en&key=eq.nu");
    expect(rows[0]).toEqual({ name_ru: "Античность", name_en: "Antiquity" });
  });
  it("includes every woman of ancient myth in Antiquity", async () => {
    const rows = await publicRows<{ category_key: string }>("works", "select=category_key&title_en=ilike.*women%20of%20ancient%20myth*");
    expect(rows.length).toBeGreaterThan(8);
    expect(rows.every(row => row.category_key === "nu")).toBe(true);
  });
  it("opens Portraits with 16 years old", async () => {
    const rows = await publicRows<{ title_ru: string }>("works", "select=title_ru&category_key=eq.portraits&hidden=eq.false&order=sort.asc&limit=1");
    expect(rows[0]?.title_ru).toBe("16 ЛЕТ");
  });
});