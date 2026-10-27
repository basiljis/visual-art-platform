import { mediaUrl } from "./media";

export const SITE_URL = "https://dikunova.art";

export function pageUrl(path: string) {
  return new URL(path, `${SITE_URL}/`).href;
}

/** Stored media ref -> absolute https URL suitable for og:image, or undefined if unresolvable. */
export function absoluteImage(ref: string | null | undefined): string | undefined {
  if (!ref) return undefined;
  const url = mediaUrl(ref);
  if (!url) return undefined;
  return /^https?:/.test(url) ? url : pageUrl(url);
}

export function articleDate(value: string): string | undefined {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (!match) return undefined;
  const iso = `${match[3]}-${match[2]}-${match[1]}`;
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === iso ? iso : undefined;
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: pageUrl(item.path),
    })),
  };
}

export function articleSchema(post: { title: string; desc: string; slug: string; date: string; image?: string | undefined }) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.desc,
    ...(post.image ? { image: post.image } : {}),
    url: pageUrl(`/blog/${encodeURIComponent(post.slug)}`),
    mainEntityOfPage: pageUrl(`/blog/${encodeURIComponent(post.slug)}`),
    datePublished: articleDate(post.date),
    author: { "@type": "Person", name: "Наталья Дикунова", url: pageUrl("/") },
  };
}

export function visualArtwork(work: { name: string; image?: string | undefined; technique?: string | undefined; year?: string | undefined; path?: string; size?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: work.name,
    ...(work.image ? { image: work.image } : {}),
    ...(work.technique ? { artMedium: work.technique } : {}),
    ...(work.year ? { dateCreated: work.year } : {}),
    ...(work.size ? { size: work.size } : {}),
    creator: { "@type": "Person", name: "Наталья Дикунова", url: pageUrl("/") },
    url: pageUrl(work.path ?? "/"),
  };
}

export function personSchema() {
  return {
    "@context": "https://schema.org", "@type": "Person",
    name: "Наталья Дикунова", alternateName: "Natalia Dikunova", jobTitle: "Художник",
    url: pageUrl("/about"),
    sameAs: ["https://www.instagram.com/natasha_dikunova_zipalova", "https://www.facebook.com/share/15dxi5pfo6/", "https://t.me/Natasha_Dikunova_Zipalova"],
  };
}