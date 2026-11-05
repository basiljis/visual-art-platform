import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { normalizeTypography } from "./typography";

export const getTypography = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { publicDb } = await import("./public-db.server");
    const { data, error } = await publicDb().from("site_content").select("data").eq("key", "typography").maybeSingle();
    if (error) {
      console.error("Typography settings load failed; using defaults:", error.message);
      return normalizeTypography(undefined);
    }
    return normalizeTypography(data?.data);
  } catch (err) {
    console.error("Typography settings load failed; using defaults:", err);
    return normalizeTypography(undefined);
  }
});

export const typographyQuery = queryOptions({ queryKey: ["typography"], queryFn: () => getTypography() });