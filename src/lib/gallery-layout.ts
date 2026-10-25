export type MenuPlacement = "top" | "side";
export type HomeDesign = "portrait" | "carousel";
export type GalleryLayout = { menuPlacement: MenuPlacement; homeDesign: HomeDesign };

export function normalizeGalleryLayout(value: unknown): GalleryLayout {
  const placement = value && typeof value === "object" && "menuPlacement" in value ? value.menuPlacement : undefined;
  const design = value && typeof value === "object" && "homeDesign" in value ? value.homeDesign : undefined;
  return { menuPlacement: placement === "side" ? "side" : "top", homeDesign: design === "carousel" ? "carousel" : "portrait" };
}