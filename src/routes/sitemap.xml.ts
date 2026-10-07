import { createFileRoute } from "@tanstack/react-router";

const BASE = "https://dikunova.art";

function urlEntry(loc: string, lastmod?: string) {
  return `  <url>\n    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n  </url>`;
}

export const Route = createFileRoute("/sitemap/xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [urlEntry(`${BASE}/`), urlEntry(`${BASE}/blog`)];
        try {
          const { publicDb } = await import("@/lib/public-db.server");
          const { data } = await publicDb()
            .from("blog_posts")
            .select("slug, created_at")
            .eq("published", true)
            .order("sort");
          for (const p of data ?? []) {
            const lastmod = p.created_at ? new Date(p.created_at).toISOString().slice(0, 10) : undefined;
            entries.push(urlEntry(`${BASE}/blog/${encodeURIComponent(p.slug)}`, lastmod));
          }
        } catch (e) {
          console.error("sitemap: blog posts unavailable", e);
        }
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
        return new Response(xml, {
          headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});
