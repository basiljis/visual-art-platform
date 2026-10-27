import { createFileRoute } from "@tanstack/react-router";
import { publicDb } from "@/lib/public-db.server";
import { SITE_URL, articleDate } from "@/lib/seo";
import { artworkPath } from "@/lib/artwork-seo";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const origin = SITE_URL;
        const urls: { loc: string; lastmod: string | undefined }[] = [
          { loc: `${origin}/`, lastmod: undefined },
          { loc: `${origin}/blog`, lastmod: undefined },
          { loc: `${origin}/about`, lastmod: undefined },
        ];
        try {
          const db = publicDb();
          const pageSize = 500;
          for (let offset = 0; ; offset += pageSize) {
            const { data, error } = await db.from("categories").select("key").order("sort").order("id").range(offset, offset + pageSize - 1);
            if (error) throw new Error(error.message);
            if (!data) throw new Error("Missing sitemap category response");
            for (const c of data) urls.push({ loc: `${origin}/works/${encodeURIComponent(c.key)}`, lastmod: undefined });
            if (data.length < pageSize) break;
          }
          for (let offset = 0; ; offset += pageSize) {
            const { data, error } = await db.from("works").select("id,title_ru,year,category_key").eq("hidden", false).order("sort").order("id").range(offset, offset + pageSize - 1);
            if (error) throw new Error(error.message);
            if (!data) throw new Error("Missing sitemap artwork response");
            for (const w of data) urls.push({ loc: `${origin}${artworkPath(w)}`, lastmod: undefined });
            if (data.length < pageSize) break;
          }
          for (let offset = 0; ; offset += pageSize) {
            const { data, error } = await db.from("blog_posts")
              .select("slug,date").eq("published", true)
              .order("sort").order("id").range(offset, offset + pageSize - 1);
            if (error) throw new Error(error.message);
            if (!data) throw new Error("Missing sitemap content response");
            for (const p of data) {
              // Retain only the existing page-specific publication dates, never generation time.
              urls.push({ loc: `${origin}/blog/${encodeURIComponent(p.slug)}`, lastmod: articleDate(p.date ?? "") });
            }
            if (data.length < pageSize) break;
          }
        } catch (error) {
          console.error("Sitemap content could not be loaded", error);
          return new Response("Sitemap temporarily unavailable", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
          });
        }
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map(
            (u) =>
              `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${esc(u.lastmod)}</lastmod>` : ""}</url>`,
          )
          .join("\n")}\n</urlset>\n`;
        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
