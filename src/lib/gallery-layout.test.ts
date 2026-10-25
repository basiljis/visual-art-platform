import { describe, expect, it } from "vitest";
import { normalizeGalleryLayout } from "./gallery-layout";

describe("gallery menu placement", () => {
  it("preserves the top menu option", () => {
    expect(normalizeGalleryLayout({ menuPlacement: "top" }).menuPlacement).toBe("top");
  });
  it("preserves the side menu option", () => {
    expect(normalizeGalleryLayout({ menuPlacement: "side" }).menuPlacement).toBe("side");
  });
  it("keeps the existing top layout when no valid setting exists", () => {
    expect(normalizeGalleryLayout(null).menuPlacement).toBe("top");
    expect(normalizeGalleryLayout({ menuPlacement: "invalid" }).menuPlacement).toBe("top");
  });
});