import { supabase } from "@/integrations/supabase/client";
import { latinSlug } from "./artwork-seo";

/** Longest side kept for uploaded photos — sharp on large screens and in the zoom viewer. */
export const MAX_IMAGE_SIDE = 2560;
const OPTIMIZABLE = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Fits width/height inside MAX_IMAGE_SIDE preserving proportions. */
export function fitSize(w: number, h: number, max = MAX_IMAGE_SIDE) {
  const scale = Math.min(1, max / Math.max(w, h));
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

/** Downscales and re-encodes photos to WebP in the browser; returns the original if not smaller. */
export async function optimizeImage(file: File): Promise<File> {
  if (!OPTIMIZABLE.has(file.type) || typeof createImageBitmap === "undefined") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = fitSize(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.86));
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

/** Uploads a file to the media bucket (admin only) and returns its stored reference. */
export async function uploadMedia(original: File): Promise<string> {
  const file = await optimizeImage(original);
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const basename = latinSlug(file.name.replace(/\.[^.]+$/, "")).slice(0, 100);
  const path = `${new Date().toISOString().slice(0, 10)}/natalia-dikunova-${basename}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return `media:${path}`;
}
