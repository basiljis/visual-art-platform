import { describe, expect, it } from "vitest";
import { trackedPath } from "./visit-statistics";

describe("visitor statistics scope", () => {
  it("counts site and blog pages", () => {
    expect(trackedPath("/")).toBe("/");
    expect(trackedPath("/blog/")).toBe("/blog");
    expect(trackedPath("/blog/blog-005")).toBe("/blog/blog-005");
  });
  it("excludes administrative and non-content pages", () => {
    expect(trackedPath("/admin")).toBeNull();
    expect(trackedPath("/reset-password")).toBeNull();
    expect(trackedPath("/api/public/media/image.jpg")).toBeNull();
  });
});