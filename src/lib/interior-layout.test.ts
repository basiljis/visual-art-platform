import { describe, expect, it } from "vitest";
import { interiorGeometry, placeArtwork } from "./interior-layout";

describe("Artwork stays on the free wall, clear of furniture", () => {
  for (const [name, scene] of Object.entries(interiorGeometry)) {
    it(`${name}: contains tall, wide and oversized paintings without cropping`, () => {
      for (const size of [{ w: 80, h: 120 }, { w: 300, h: 40 }, { w: 50, h: 400 }, { w: 1000, h: 1000 }]) {
        const box = placeArtwork(scene, size);
        expect(box.left).toBeGreaterThanOrEqual(scene.wall.x);
        expect(box.top).toBeGreaterThanOrEqual(scene.wall.y);
        expect(box.left + box.width).toBeLessThanOrEqual(scene.wall.x + scene.wall.width + 0.001);
        expect(box.top + box.height).toBeLessThanOrEqual(scene.wall.y + scene.wall.height + 0.001);
        expect(box.width / box.height).toBeCloseTo(size.w / size.h);
      }
    });
  }
  it("sofa: a 120×80 cm portrait ends above the sofa, not on its cushions", () => {
    const box = placeArtwork(interiorGeometry.sofa, { w: 80, h: 120 });
    expect(box.top + box.height).toBeLessThanOrEqual(530);
    expect(box.scale).toBeLessThan(1);
  });
  it("uses the original image proportions even when its recorded size differs", () => {
    const box = placeArtwork(interiorGeometry.sofa, { w: 80, h: 120 }, 2);
    expect(box.width / box.height).toBe(2);
  });
  for (const name of ["dining", "console"] as const) {
    it(`${name}: keeps paintings above the styled furniture and tabletop objects`, () => {
      for (const size of [{ w: 97, h: 165 }, { w: 200, h: 100 }, { w: 1000, h: 1000 }]) {
        const box = placeArtwork(interiorGeometry[name], size);
        expect(box.top + box.height).toBeLessThanOrEqual(460);
        expect(box.width / box.height).toBeCloseTo(size.w / size.h);
      }
    });
  }
});