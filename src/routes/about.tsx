import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { galleryQuery } from "@/lib/content.functions";
import { pageUrl, personSchema } from "@/lib/seo";
import { useLanguage } from "@/lib/language";
import { mediaUrl } from "@/lib/media";
import portrait from "@/assets/artist-about-photo.png.asset.json";
import { BlogShell } from "@/components/BlogShell";
import { CvDownload } from "@/components/CvDownload";
export const Route = createFileRoute("/about")({
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery),
  head: () => ({ meta: [{ title: "Об авторе — Наталья Дикунова | Биография и CV" }, { name: "description", content: "Биография художника Натальи Дикуновой: выставки, награды, преподавание и резиденции. Скачать CV в PDF." }, { property: "og:title", content: "Об авторе — Наталья Дикунова" }, { property: "og:description", content: "Биография, выставки и награды художника. CV в PDF." }, { property: "og:type", content: "profile" }, { property: "og:url", content: pageUrl("/about") }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: pageUrl("/about") }], scripts: [{ type: "application/ld+json", children: JSON.stringify(personSchema()) }] }),
  errorComponent: () => <p className="p-8">Не удалось загрузить биографию.</p>,
  notFoundComponent: () => <p className="p-8">Биография недоступна.</p>,
  component: AboutPage,
});
function AboutPage() {
  const { lang } = useLanguage(); const { data } = useSuspenseQuery(galleryQuery); const bio = data.about[lang];
  return <BlogShell back={{ to: "/", label: "Главная" }}><div className="mx-auto max-w-5xl"><div className="grid gap-10 md:grid-cols-[2fr_1fr]"><div><h1 className="font-display text-5xl md:text-7xl">{lang === "ru" ? "Наталья Дикунова" : "Natalia Dikunova"}</h1><p className="mt-5">{bio.academy}</p><p className="mt-6 whitespace-pre-line text-lg">{bio.note}</p><div className="mt-5"><CvDownload about={data.about} lang={lang} /></div></div><img src={data.about.portrait ? mediaUrl(data.about.portrait) : portrait.url} alt={lang === "ru" ? "Художник Наталья Дикунова" : "Artist Natalia Dikunova"} className="aspect-[4/5] w-full object-cover" /></div><div data-font-block="about" className="mt-16 space-y-10">{bio.sections.map((s, i) => <section key={i}><h2 className="mb-4 border-b border-border pb-3 font-display text-2xl">{s.title}</h2><ul className="space-y-3">{s.items.map((item, j) => <li key={j}>{item}</li>)}</ul></section>)}</div></div></BlogShell>;
}