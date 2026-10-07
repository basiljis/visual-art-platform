import { createFileRoute } from "@tanstack/react-router";
import { publicDb } from "@/lib/public-db.server";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const urls: { loc: string; lastmod?: string }[] = [
          { loc: `${origin}/` },
          { loc: `${origin}/blog` },
        ];
        try {
          const { data } = await publicDb()
            .from("blog_posts")
            .select("slug,date")
            .eq("published", true)
            .order("sort");
          for (const p of data ?? []) {
            urls.push({ loc: `${origin}/blog/${p.slug}`, lastmod: p.date ?? undefined });
          }
        } catch {
          // DB unavailable — still serve the static routes
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
