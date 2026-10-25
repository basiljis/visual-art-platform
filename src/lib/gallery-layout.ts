export type MenuPlacement = "top" | "side";
export type GalleryLayout = { menuPlacement: MenuPlacement };

export function normalizeGalleryLayout(value: unknown): GalleryLayout {
  const placement = value && typeof value === "object" && "menuPlacement" in value ? value.menuPlacement : undefined;
  return { menuPlacement: placement === "side" ? "side" : "top" };
}