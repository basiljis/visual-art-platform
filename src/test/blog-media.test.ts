import { describe, expect, it } from "vitest";
import { htmlForDisplay, mediaUrl } from "../lib/media";
import manifest from "./blog-source-manifest.json";

describe("original blog media coverage", () => {
  it("resolves all 59 original photos across all 11 articles", () => {
    expect(manifest).toHaveLength(11);
    expect(manifest.flatMap((post) => post.photos)).toHaveLength(59);
    for (const post of manifest) {
      for (const photo of post.photos) {
        expect(mediaUrl(photo.ref), photo.ref).not.toBe("");
      }
    }
  });

  it.each([1, 2])("provides MP4 and WebM sources for mural video %i", (number) => {
    const ref = `asset:blog/mural-video-${number}.mp4`;
    const output = htmlForDisplay(`<video src="${ref}" controls></video>`);
    expect(output).toContain(`src="${mediaUrl(ref)}" type="video/mp4"`);
    const fallback = mediaUrl(`asset:blog/mural-video-${number}.webm`);
    expect(fallback).not.toBe("");
    expect(output).toContain(`src="${fallback}" type="video/webm"`);
  });
});