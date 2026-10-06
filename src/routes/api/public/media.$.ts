import { createFileRoute } from "@tanstack/react-router";

// Serves uploaded files from the private "media" bucket (public read by design).
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("media").createSignedUrl(path, 3600);
        if (error || !data) return new Response("Not found", { status: 404 });
        const range = request.headers.get("range");
        const res = await fetch(data.signedUrl, { headers: range ? { range } : {} });
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
