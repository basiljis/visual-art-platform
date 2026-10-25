import { describe, expect, it } from "vitest";
import { reorderScope } from "./gallery-order";

describe("gallery drag ordering", () => {
  const rows = [
    { id: "a", sort: 0, category: "portraits" },
    { id: "x", sort: 0, category: "china" },
    { id: "b", sort: 0, category: "portraits" },
    { id: "c", sort: 3, category: "portraits" },
  ];
  it("reorders paintings within a section without moving other sections", () => {
    const result = reorderScope(rows, ["a", "b", "c"], "c", "a");
    expect(result.map((r) => r.id)).toEqual(["c", "x", "a", "b"]);
    expect(result.map((r) => r.sort)).toEqual([1, 2, 3, 4]);
    expect(rows[0]?.id).toBe("a");
  });
  it("reorders parent sections without changing subsection order", () => {
    const categories = [{ id: "first", sort: 1 }, { id: "child", sort: 2 }, { id: "second", sort: 3 }];
    expect(reorderScope(categories, ["first", "second"], "second", "first").map((r) => r.id)).toEqual(["second", "child", "first"]);
  });
  it("ignores drops outside the selected section", () => {
    expect(reorderScope(rows, ["a", "b", "c"], "a", "x")).toBe(rows);
  });
});