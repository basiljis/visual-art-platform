import { describe, expect, it } from "vitest";
import { defaultAbout } from "./about";
import { latestYear, PROFILE_LIMITS, profileSections, selectedPortfolioWorks } from "./artist-profile";
import type { WorkRow } from "./content.functions";

describe("professional biography guidelines", () => {
  it("sorts date ranges by their latest year, newest first", () => {
    const bio = { ...defaultAbout.ru, sections: [{ title: "Групповые выставки", items: ["2019 — A", "2023–2024 — B", "2025 — C"] }] };
    expect(profileSections(bio, "ru")[1]?.items).toEqual(["2025 — C", "2023–2024 — B", "2019 — A"]);
    expect(latestYear("2023–2024")).toBe(2024);
  });
  it("limits a single PDF to 20 pages", () => { expect(PROFILE_LIMITS.pages).toBe(20); });
  it("limits a single PDF to 20 MB", () => { expect(PROFILE_LIMITS.bytes).toBe(20 * 1024 * 1024); });
  it("selects at most eight visible works instead of the complete collection", () => {
    const works = Array.from({ length: 15 }, (_, i) => ({ id: String(i), category_key: "myth", image: "image.jpg", year: "2026", sort: i, hidden: i === 0 } as WorkRow));
    const selected = selectedPortfolioWorks(works, []);
    expect(selected).toHaveLength(8);
    expect(selected.some(w => w.id === "0")).toBe(false);
  });
});