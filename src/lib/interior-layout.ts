export type WallScene = { width: number; height: number; pixelsPerCm: number; wall: { x: number; y: number; width: number; height: number } };

/** Fit the whole painting inside the unobstructed wall, never over furniture. */
export function placeArtwork(scene: WallScene, size: { w: number; h: number }, aspect = size.w / size.h) {
  const ratio = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const wantedWidth = Math.max(1, size.w) * scene.pixelsPerCm;
  const wantedHeight = wantedWidth / ratio;
  const scale = Math.min(1, scene.wall.width / wantedWidth, scene.wall.height / wantedHeight);
  const width = wantedWidth * scale;
  const height = wantedHeight * scale;
  return { width, height, left: scene.wall.x + (scene.wall.width - width) / 2, top: scene.wall.y + (scene.wall.height - height) / 2, scale };
}

export const interiorGeometry = {
  sofa: { width: 1600, height: 1008, pixelsPerCm: 1275 / 260, wall: { x: 380, y: 70, width: 900, height: 460 } },
  dining: { width: 1600, height: 1008, pixelsPerCm: 1040 / 200, wall: { x: 330, y: 70, width: 950, height: 460 } },
  console: { width: 1600, height: 1008, pixelsPerCm: 1050 / 200, wall: { x: 330, y: 70, width: 950, height: 490 } },
} satisfies Record<string, WallScene>;