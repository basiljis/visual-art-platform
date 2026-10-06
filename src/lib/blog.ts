import posts from "./blog-posts.json";

const images = import.meta.glob("@/assets/blog/*.jpg", { eager: true, import: "default" }) as Record<string, string>;
const byName: Record<string, string> = {};
for (const [path, url] of Object.entries(images)) byName[path.split("/").pop()!] = url;

const videos = import.meta.glob("@/assets/blog/*.mp4.asset.json", { eager: true, import: "default" }) as Record<string, { url: string }>;
const videoByName: Record<string, string> = {};
for (const [path, v] of Object.entries(videos)) videoByName[path.split("/").pop()!.replace(".asset.json", "")] = v.url;
export const blogVideo = (name: string) => videoByName[name] ?? "";

export type BlogBlock = { p: string; href?: string } | { img: string } | { video: string };
export type BlogPost = { slug: string; title: string; excerpt: string; date: string; blocks: BlogBlock[] };

export const blogPosts = (posts as BlogPost[]).map((p) => {
  const firstImg = p.blocks.find((b): b is { img: string } => "img" in b);
  return { ...p, cover: firstImg ? byName[firstImg.img] : undefined };
});

export const blogImage = (name: string) => byName[name] ?? "";
