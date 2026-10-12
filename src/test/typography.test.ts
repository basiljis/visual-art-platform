import { describe, expect, it } from "vitest";
import { defaultTypography, normalizeTypography } from "@/lib/typography";

describe("Typography settings", () => {
  it("changes header independently from main text", () => {
    const settings = normalizeTypography({ ...defaultTypography, header: { ...defaultTypography.header, font: "montserrat" } });
    expect(settings.header.font).toBe("montserrat");
    expect(settings.body.font).toBe("manrope");
  });
  it("keeps per-block size, weight and line-height", () => {
    const settings = normalizeTypography({
      body: { font: "lora", size: 1.2, weight: 500, lineHeight: 1.5 },
    });
    expect(settings.body).toEqual({ font: "lora", size: 1.2, weight: 500, lineHeight: 1.5 });
    expect(settings.footer).toEqual(defaultTypography.footer);
  });
  it("upgrades the legacy flat font format with defaults", () => {
    const settings = normalizeTypography({ header: "pt-sans", body: "lora", footer: "pt-serif", preloader: "montserrat" });
    expect(settings.header).toEqual({ font: "pt-sans", size: 1, weight: 0, lineHeight: 0 });
    expect(settings.body.font).toBe("lora");
    expect(settings.footer.font).toBe("pt-serif");
    expect(settings.preloader.font).toBe("montserrat");
  });
  it("rejects unknown fonts and clamps out-of-range numbers", () => {
    expect(normalizeTypography({ header: "invalid" })).toEqual(defaultTypography);
    expect(normalizeTypography({ header: { font: "prata", size: 9, weight: 450, lineHeight: 7 } })).toEqual(defaultTypography);
  });
});
