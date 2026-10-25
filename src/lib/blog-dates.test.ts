import { describe, expect, it } from "vitest";
import { publicationDate, samePublicationDay } from "./blog-dates";

describe("Publication calendar", () => {
  it("matches only publications on the selected calendar date", () => {
    expect(samePublicationDay("24.07.2024", new Date(2024, 6, 24))).toBe(true);
    expect(samePublicationDay("25.07.2024", new Date(2024, 6, 24))).toBe(false);
    expect(samePublicationDay("24.07.2023", new Date(2024, 6, 24))).toBe(false);
  });
  it("supports numeric, ISO and Russian written dates without timezone shifts", () => {
    for (const value of ["24.07.2024", "2024-07-24", "24 июля 2024 г."]) {
      expect(publicationDate(value)).toEqual(new Date(2024, 6, 24));
    }
    expect(publicationDate("31.02.2024")).toBeUndefined();
    expect(publicationDate("")).toBeUndefined();
  });
});