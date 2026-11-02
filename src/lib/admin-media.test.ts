import { describe, expect, it } from "vitest";
import { fitSize } from "./admin-media";

describe("fitSize", () => {
  it("caps the longest side at 2560 px keeping proportions", () => {
    expect(fitSize(6000, 4000)).toEqual({ width: 2560, height: 1707 });
  });
  it("never upscales small photos", () => {
    expect(fitSize(1200, 800)).toEqual({ width: 1200, height: 800 });
  });
});
