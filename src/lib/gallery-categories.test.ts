import { describe, expect, it } from "vitest";
import { visibleGalleryCategories } from "./gallery-categories";

describe("gallery direction visibility", () => {
  it("shows the newly saved Мурал direction even without artworks", () => {
    expect(visibleGalleryCategories([{ key: "мурал", parent_key: null }], []).map(row => row.key)).toEqual(["мурал"]);
  });
  it("continues to hide Новое when it has no public artworks", () => {
    expect(visibleGalleryCategories([{ key: "new", parent_key: null }], [])).toEqual([]);
  });
  it("shows Новое when it has a public artwork", () => {
    expect(visibleGalleryCategories([{ key: "new", parent_key: null }], [{ category_key: "new" }]).map(row => row.key)).toEqual(["new"]);
  });
  it("preserves saved direction order and keeps subprojects out of the top level", () => {
    const categories = [{ key: "myth", parent_key: null }, { key: "fire", parent_key: "myth" }, { key: "мурал", parent_key: null }];
    expect(visibleGalleryCategories(categories, []).map(row => row.key)).toEqual(["myth", "мурал"]);
  });
});