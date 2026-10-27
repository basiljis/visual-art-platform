import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { galleryQuery } from "@/lib/content.functions";
import { artworkSlug, artworkPath, artworkAlt } from "@/lib/artwork-seo";
import { absoluteImage, breadcrumbs, pageUrl, visualArtwork } from "@/lib/seo";
import { ArtworkPage } from "@/components/ArtworkPage";

export const Route = createFileRoute("/works/$category/$slug")({
  loader: async ({ context, params }) => {
    const gallery = await context.queryClient.ensureQueryData(galleryQuery);
    const work = gallery.works.find(w => w.category_key === params.category && artworkSlug(w) === params.slug);
    const category = gallery.categories.find(c => c.key === params.category);
    if (!work || !category) throw notFound();
    return { work, category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Работа недоступна — Наталья Дикунова" }, { name: "robots", content: "noindex" }] };
    const { work, category } = loaderData;
    const title = `${work.title_ru} — Наталья Дикунова | ${category.name_ru}`;
    const description = artworkAlt(work);
    const image = absoluteImage(work.image);
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:url", content: pageUrl(artworkPath(work)) }, { name: "twitter:card", content: "summary_large_image" }, ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : [])], links: [{ rel: "canonical", href: pageUrl(artworkPath(work)) }], scripts: [{ type: "application/ld+json", children: JSON.stringify(visualArtwork({ name: work.title_ru, image, technique: work.technique, year: work.year, size: work.size, path: artworkPath(work) })) }, { type: "application/ld+json", children: JSON.stringify(breadcrumbs([{ name: "Главная", path: "/" }, { name: category.name_ru, path: `/works/${category.key}` }, { name: work.title_ru, path: artworkPath(work) }])) }] };
  },
  errorComponent: () => <p className="p-8">Не удалось загрузить работу. Обновите страницу.</p>,
  notFoundComponent: () => <p className="p-8">Работа не найдена.</p>,
  component: WorkPage,
});
function WorkPage() {
  const { category, slug } = Route.useParams();
  const { data } = useSuspenseQuery(galleryQuery);
  const works = data.works.filter(w => w.category_key === category);
  const index = works.findIndex(w => artworkSlug(w) === slug);
  const work = works[index];
  const row = data.categories.find(c => c.key === category);
  if (!work || !row) return null;
  return <ArtworkPage key={work.id} work={work} category={row} next={works.length > 1 ? works[(index + 1) % works.length] : undefined} />;
}