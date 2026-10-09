import { describe, expect, it } from "vitest";
import { defaultTypography, normalizeTypography } from "@/lib/typography";

describe("Typography settings", () => {
  it("changes header independently from main text", () => {
    const settings = normalizeTypography({ ...defaultTypography, header: "montserrat" });
    expect(settings.header).toBe("montserrat");
    expect(settings.body).toBe("manrope");
  });
  it("accepts a separate font for each block", () => {
    const settings = normalizeTypography({ header: "pt-sans", body: "lora", footer: "pt-serif", preloader: "montserrat" });
    expect(settings.header).toBe("pt-sans");
    expect(settings.body).toBe("lora");
    expect(settings.footer).toBe("pt-serif");
    expect(settings.preloader).toBe("montserrat");
  });
  it("rejects unknown font values and preserves initial defaults", () => {
    expect(normalizeTypography({ header: "invalid" })).toEqual(defaultTypography);
  });
});