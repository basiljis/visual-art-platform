import { createFileRoute } from "@tanstack/react-router";

// Serves uploaded files from the private "media" bucket (public read by design, publishable key only).
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });
        // Public portfolio media: read via the public storage endpoint (bucket has a public-read policy).
        const base = process.env["SUPABASE_URL"]!;
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const range = request.headers.get("range");
        const url = `${base}/storage/v1/object/authenticated/media/${path.split("/").map(encodeURIComponent).join("/")}`;
        const res = await fetch(url, { headers: { apikey: key, ...(range ? { range } : {}) } });
        if (!res.ok && res.status !== 206) return new Response("Not found", { status: 404 });
        const headers = new Headers();
        for (const h of ["content-type", "content-length", "content-range", "accept-ranges", "etag"]) {
          const v = res.headers.get(h); if (v) headers.set(h, v);
        }
        headers.set("cache-control", "public, max-age=31536000, immutable");
        return new Response(res.body, { status: res.status, headers });
      },
    },
  },
});
