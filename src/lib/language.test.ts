import { describe, expect, it } from "vitest";
import { localized, localizedSize, localizedDate } from "./language";

describe("Complete RU/EN visitor language", () => {
  it("uses English artwork names when English is selected", () => {
    expect(localized("СТАРЫЙ БУДДА", "OLD BUDDHA", "en")).toBe("OLD BUDDHA");
  });
  it("retains the original Russian name when Russian is selected", () => {
    expect(localized("СТАРЫЙ БУДДА", "OLD BUDDHA", "ru")).toBe("СТАРЫЙ БУДДА");
  });
  it("translates materials and units without changing dimensions", () => {
    expect(localizedSize("Бумага/сангина/уголь, 120 × 80 см", "en")).toBe("Paper/Sanguine/Charcoal, 120 × 80 cm");
  });
  it("translates Russian month names while retaining dates", () => {
    expect(localizedDate("25 октября 2026 г.", "en")).toBe("25 October 2026");
  });
});