import { describe, expect, it } from "vitest";
import { canEnquire, isSold } from "./artwork-availability";

describe("artwork availability", () => {
  it("hides purchase enquiries for sold paintings", () => {
    expect(canEnquire("sold")).toBe(false);
  });
  it("hides purchase enquiries for private collections", () => {
    expect(canEnquire("private")).toBe(false);
  });
  it("keeps enquiries available for works for sale and on request", () => {
    expect(canEnquire("for-sale")).toBe(true);
    expect(canEnquire("on-request")).toBe(true);
    expect(canEnquire("")).toBe(true);
  });
  it("identifies sold paintings for the red dot", () => {
    expect(isSold("sold")).toBe(true);
    expect(isSold("for-sale")).toBe(false);
    expect(isSold("private")).toBe(false);
  });
});