import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { normalizeTypography } from "./typography";

export const getTypography = createServerFn({ method: "GET" }).handler(async () => {
  const { publicDb } = await import("./public-db.server");
  const { data, error } = await publicDb().from("site_content").select("data").eq("key", "typography").maybeSingle();
  if (error) throw new Error("Не удалось загрузить настройки шрифтов.");
  return normalizeTypography(data?.data);
});

export const typographyQuery = queryOptions({ queryKey: ["typography"], queryFn: () => getTypography() });