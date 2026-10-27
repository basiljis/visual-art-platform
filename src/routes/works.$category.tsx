import { createFileRoute, Link, notFound, Outlet, useLocation } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { galleryQuery } from "@/lib/content.functions";
import { artworkAlt, artworkSlug, seriesMetadata } from "@/lib/artwork-seo";
import { pageUrl, breadcrumbs } from "@/lib/seo";
import { useLanguage, localized } from "@/lib/language";
import { mediaUrl } from "@/lib/media";
import { BlogShell } from "@/components/BlogShell";

export const Route = createFileRoute("/works/$category")({
  loader: async ({ context, params }) => {
    const gallery = await context.queryClient.ensureQueryData(galleryQuery);
    const category = gallery.categories.find(c => c.key === params.category);
    if (!category) throw notFound();
    return category;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Серия недоступна — Наталья Дикунова" }, { name: "robots", content: "noindex" }] };
    const { title, description } = seriesMetadata(loaderData);
    const path = `/works/${loaderData.key}`;
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:url", content: pageUrl(path) }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: pageUrl(path) }], scripts: [{ type: "application/ld+json", children: JSON.stringify(breadcrumbs([{ name: "Главная", path: "/" }, { name: loaderData.name_ru, path }])) }] };
  },
  errorComponent: () => <p className="p-8">Не удалось загрузить серию.</p>,
  notFoundComponent: () => <p className="p-8">Серия не найдена.</p>,
  component: SeriesLayout,
});
function SeriesLayout() { return <Outlet />; }

export function SeriesContent({ category }: { category: string }) {
  const { lang } = useLanguage();
  const { data } = useSuspenseQuery(galleryQuery);
  const row = data.categories.find(c => c.key === category);
  if (!row) return null;
  const works = data.works.filter(w => w.category_key === category || w.project_key === category);
  return <BlogShell back={{ to: "/", label: "Главная" }}><h1 className="font-display text-5xl md:text-7xl">{localized(row.name_ru, row.name_en, lang)}</h1>{!row.description_hidden && <p className="mt-6 max-w-3xl text-lg">{localized(row.description_ru, row.description_en, lang)}</p>}<div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{works.map(w => <article key={w.id}><Link to="/works/$category/$slug" params={{ category: w.category_key, slug: artworkSlug(w) }} className="group"><div className="relative aspect-[4/5]"><img src={mediaUrl(w.image)} alt={artworkAlt(w, lang)} loading="lazy" className="h-full w-full object-contain" />{w.status === "sold" && <span aria-hidden className="absolute right-3 top-3 size-3 rounded-full bg-red-accent" />}</div><h2 data-font-block="captions" className="mt-4 border-t border-border pt-3 text-lg group-hover:text-red-accent">{w.status === "sold" && <span role="img" aria-label={lang === "ru" ? "Продана" : "Sold"} className="mr-2 inline-block size-2.5 rounded-full bg-red-accent" />}{localized(w.title_ru, w.title_en, lang)}</h2></Link><p className="mt-2 text-sm text-muted-foreground">{w.year}</p></article>)}</div></BlogShell>;
}