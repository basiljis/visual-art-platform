import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

async function publicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const h = new Headers(init?.headers);
      if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
      h.set("apikey", key);
      return fetch(input, { ...init, headers: h });
    } },
  });
}

export type CategoryRow = { id: string; key: string; parent_key: string | null; name_ru: string; name_en: string; description_ru: string; description_en: string; sort: number };
export type WorkRow = { id: string; category_key: string; project_key: string | null; title_ru: string; title_en: string; year: string; size: string; image: string; cover: boolean; hero: boolean; sort: number };
export type PostRow = { id: string; slug: string; title: string; excerpt: string; date: string; cover: string | null; content_html: string; published: boolean; sort: number };

export const getGallery = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await publicClient();
  const [c, w] = await Promise.all([
    sb.from("categories").select("*").order("sort"),
    sb.from("works").select("*").order("sort"),
  ]);
  if (c.error) throw new Error(c.error.message);
  if (w.error) throw new Error(w.error.message);
  return { categories: c.data as CategoryRow[], works: w.data as WorkRow[] };
});

export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await publicClient();
  const { data, error } = await sb.from("blog_posts").select("id,slug,title,excerpt,date,cover,sort,published").eq("published", true).order("sort", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Omit<PostRow, "content_html">[];
});

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const { data: rows, error } = await sb.from("blog_posts").select("*").eq("published", true).order("sort", { ascending: false });
    if (error) throw new Error(error.message);
    const list = rows as PostRow[];
    const i = list.findIndex((p) => p.slug === data.slug);
    if (i < 0) return null;
    const next = list[i + 1];
    return { post: list[i]!, next: next ? { slug: next.slug, title: next.title } : null };
  });

export const galleryQuery = queryOptions({ queryKey: ["gallery"], queryFn: () => getGallery() });
export const postsQuery = queryOptions({ queryKey: ["posts"], queryFn: () => getPosts() });
export const postQuery = (slug: string) => queryOptions({ queryKey: ["post", slug], queryFn: () => getPost({ data: { slug } }) });
