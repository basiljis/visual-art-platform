import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

export const recordPageView = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ sessionId: z.string().uuid(), path: z.string().min(1).max(220) }).parse(input))
  .handler(async ({ data }) => {
    const { publicDb } = await import("./public-db.server");
    const { error } = await publicDb().rpc("record_page_view", { _session_id: data.sessionId, _path: data.path });
    return { ok: !error };
  });

export const getBlogViews = createServerFn({ method: "GET" }).handler(async () => {
  const { publicDb } = await import("./public-db.server");
  const { data, error } = await publicDb().rpc("blog_view_counts");
  if (error) throw new Error("Could not load view counts");
  return (data ?? []) as { slug: string; views: number }[];
});

export const blogViewsQuery = queryOptions({ queryKey: ["blog-views"], queryFn: () => getBlogViews(), staleTime: 0 });