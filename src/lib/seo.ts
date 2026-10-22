export const SITE_URL = "https://dikunova.headquaters.space";

export function pageUrl(path: string) {
  return new URL(path, `${SITE_URL}/`).href;
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

export function articleSchema(post: { title: string; desc: string; slug: string; date: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.desc,
    url: pageUrl(`/blog/${encodeURIComponent(post.slug)}`),
    mainEntityOfPage: pageUrl(`/blog/${encodeURIComponent(post.slug)}`),
    datePublished: articleDate(post.date),
    author: { "@type": "Person", name: "Наталья Дикунова", url: pageUrl("/") },
  };
}