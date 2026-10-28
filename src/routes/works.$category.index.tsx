import { createFileRoute } from "@tanstack/react-router";
import { SeriesContent } from "./works.$category";
import { galleryQuery } from "@/lib/content.functions";
import { seriesMetadata } from "@/lib/artwork-seo";
import { breadcrumbs, pageUrl } from "@/lib/seo";
export const Route = createFileRoute("/works/$category/")({
  loader: async ({ context, params }) => (await context.queryClient.ensureQueryData(galleryQuery)).categories.find(c => c.key === params.category),
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Серия недоступна — Наталья Дикунова" }, { name: "robots", content: "noindex" }] };
    const { title, description } = seriesMetadata(loaderData);
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:url", content: pageUrl(`/works/${loaderData.key}`) }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: pageUrl(`/works/${loaderData.key}`) }], scripts: [{ type: "application/ld+json", children: JSON.stringify(breadcrumbs([{ name: "Главная", path: "/" }, { name: "Работы", path: "/#works" }, { name: loaderData.name_ru, path: `/works/${loaderData.key}` }])) }] };
  },
  errorComponent: () => <p className="p-8">Не удалось загрузить серию.</p>,
  notFoundComponent: () => <p className="p-8">Серия не найдена.</p>,
  component: SeriesPage,
});
function SeriesPage() { return <SeriesContent category={Route.useParams().category} />; }