import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { normalizeGalleryLayout } from "./gallery-layout";

export const getGalleryLayout = createServerFn({ method: "GET" }).handler(async () => {
  const { publicDb } = await import("./public-db.server");
  const { data, error } = await publicDb().from("site_content").select("data").eq("key", "gallery_layout").maybeSingle();
  if (error) throw new Error("Не удалось загрузить оформление галереи.");
  return normalizeGalleryLayout(data?.data);
});

export const galleryLayoutQuery = queryOptions({ queryKey: ["gallery-layout"], queryFn: () => getGalleryLayout() });