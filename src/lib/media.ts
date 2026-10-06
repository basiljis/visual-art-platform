// Resolves stored media references to URLs.
// "site/x.jpg", "projects/x.jpg", "asset:blog/x.jpg" -> bundled assets
// "media:path" -> uploaded files served by /api/public/media/*
const imgs = import.meta.glob(["@/assets/works/site/*.jpg", "@/assets/projects/*.jpg", "@/assets/blog/*.jpg"], { eager: true, import: "default" }) as Record<string, string>;
const vids = import.meta.glob("@/assets/blog/*.mp4.asset.json", { eager: true, import: "default" }) as Record<string, { url: string }>;

const byRef: Record<string, string> = {};
for (const [path, url] of Object.entries(imgs)) {
  const m = path.match(/(works\/site|projects|blog)\/([^/]+)$/)!;
  byRef[`${m[1] === "works/site" ? "site" : m[1]}/${m[2]}`] = url;
}
for (const [path, v] of Object.entries(vids)) byRef[`blog/${path.split("/").pop()!.replace(".asset.json", "")}`] = v.url;
const byUrl: Record<string, string> = {};
for (const [ref, url] of Object.entries(byRef)) byUrl[url] = `asset:${ref}`;

export function mediaUrl(ref: string | null | undefined): string {
  if (!ref) return "";
  if (ref.startsWith("media:")) return `/api/public/media/${ref.slice(6)}`;
  if (ref.startsWith("asset:")) return byRef[ref.slice(6)] ?? "";
  if (/^(https?:|\/|data:|blob:)/.test(ref)) return ref;
  return byRef[ref] ?? "";
}

/** Stored HTML -> displayable HTML */
export function htmlForDisplay(html: string): string {
  return html.replace(/src="((?:asset|media):[^"]+)"/g, (_, r: string) => `src="${mediaUrl(r)}"`);
}

/** Displayed (editor) HTML -> stored HTML */
export function htmlForStorage(html: string): string {
  return html.replace(/src="([^"]+)"/g, (all, u: string) => {
    if (byUrl[u]) return `src="${byUrl[u]}"`;
    const m = u.match(/^\/api\/public\/media\/(.+)$/);
    return m ? `src="media:${m[1]}"` : all;
  });
}
