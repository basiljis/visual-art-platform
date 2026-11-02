import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { galleryQuery } from "@/lib/content.functions";
import { pageUrl, personSchema } from "@/lib/seo";
import { useLanguage } from "@/lib/language";
import { mediaUrl } from "@/lib/media";
import portrait from "@/assets/artist-about-photo.png.asset.json";
import { BlogShell } from "@/components/BlogShell";
import { CvDownload } from "@/components/CvDownload";
import { artistContacts, profileSections, selectedPortfolioWorks, workProject, quotedTitle } from "@/lib/artist-profile";
import { artworkAlt, artworkSlug } from "@/lib/artwork-seo";
import { ArrowUpRight } from "lucide-react";
export const Route = createFileRoute("/about")({
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery),
  head: () => ({ meta: [{ title: "Об авторе — Наталья Дикунова | Биография и CV" }, { name: "description", content: "Биография художника Натальи Дикуновой: выставки, награды, преподавание и резиденции. Скачать CV в PDF." }, { property: "og:title", content: "Об авторе — Наталья Дикунова" }, { property: "og:description", content: "Биография, выставки и награды художника. CV в PDF." }, { property: "og:type", content: "profile" }, { property: "og:url", content: pageUrl("/about") }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: pageUrl("/about") }], scripts: [{ type: "application/ld+json", children: JSON.stringify(personSchema()) }] }),
  errorComponent: () => <p className="p-8">Не удалось загрузить биографию.</p>,
  notFoundComponent: () => <p className="p-8">Биография недоступна.</p>,
  component: AboutPage,
});
function AboutPage() {
  const { lang } = useLanguage(); const { data } = useSuspenseQuery(galleryQuery); const bio = data.about[lang];
  const ru = lang === "ru";
  const sections = profileSections(bio, lang);
  const works = selectedPortfolioWorks(data.works, data.categories);
  return <BlogShell back={{ to: "/", label: "Главная" }}>
    <article className="mx-auto max-w-6xl">
      <nav aria-label={ru ? "Хлебные крошки" : "Breadcrumbs"} className="mb-8 flex gap-3 text-xs"><Link to="/" className="hover:text-red-accent">{ru ? "Главная" : "Home"}</Link><span className="text-red-accent">/</span><span>{ru ? "Об авторе" : "About"}</span></nav>
      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-16">
        <div className="min-w-0"><p className="mb-4 text-xs text-muted-foreground">{ru ? "Об авторе / CV" : "About / CV"}</p><h1 className="break-words font-display text-4xl sm:text-5xl md:text-7xl">{ru ? "Наталья Дикунова" : "Natalia Dikunova"}</h1><div data-font-block="about" className="mt-7 whitespace-pre-line">{bio.note}</div><div className="mt-7 border-y border-border py-4"><CvDownload about={data.about} lang={lang} works={data.works} categories={data.categories} /></div></div>
        <img src={data.about.portrait ? mediaUrl(data.about.portrait) : portrait.url} alt={ru ? "Художник Наталья Дикунова" : "Artist Natalia Dikunova"} className="aspect-[4/5] max-h-[28rem] w-full object-cover" />
      </div>
      <div data-font-block="about" className="mt-12 md:mt-20">
        {sections.map((section, i) => <section key={`${section.title}-${i}`} className="grid gap-4 border-t border-border py-7 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12 md:py-9"><h2 className="flex items-baseline gap-4 font-display text-2xl"><span aria-hidden="true" className="text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>{section.title}</h2><ul className="min-w-0 space-y-4">{section.items.map((item, j) => <li key={j} className="whitespace-pre-line break-words">{item}</li>)}</ul></section>)}
        <section className="grid gap-4 border-t border-border py-7 md:grid-cols-[1fr_2fr] md:gap-12"><h2 className="font-display text-2xl">{ru ? "Контакты" : "Contacts"}</h2><div className="flex flex-wrap gap-x-6 gap-y-3">{artistContacts.map(contact => <a key={contact.url} href={contact.url} className="flex min-w-0 items-center gap-1 break-all hover:text-red-accent">{contact.label}<ArrowUpRight className="size-3 shrink-0" /></a>)}</div></section>
      </div>
      {works.length > 0 && <section className="mt-12 border-t border-border pt-8 md:mt-16"><div className="mb-8 flex flex-wrap items-baseline justify-between gap-4"><h2 className="font-display text-3xl md:text-4xl">{ru ? "Избранные работы" : "Selected works"}</h2><Link to="/" hash="works" className="flex items-center gap-2 text-xs hover:text-red-accent">{ru ? "Все работы" : "All works"}<ArrowUpRight className="size-4" /></Link></div><div className="grid gap-x-12 gap-y-14 md:grid-cols-2">{works.map(work => { const project = workProject(work, data.categories, lang); return <figure key={work.id} className="min-w-0"><Link to="/works/$category/$slug" params={{ category: work.category_key, slug: artworkSlug(work) }} className="block"><img src={mediaUrl(work.image)} alt={artworkAlt(work, lang)} loading="lazy" className="h-80 w-full object-contain md:h-96" /></Link><figcaption className="mt-5 border-t border-border pt-4"><Link to="/works/$category/$slug" params={{ category: work.category_key, slug: artworkSlug(work) }} className="font-display text-xl hover:text-red-accent">{quotedTitle(ru ? work.title_ru : work.title_en || work.title_ru)}</Link><p className="mt-2 text-sm text-muted-foreground">{[ru ? work.technique : work.technique_en || work.technique, ru ? work.size : work.size.replace(/см/g, "cm"), work.year].filter(Boolean).join(" · ")}</p><Link to="/works/$category" params={{ category: work.category_key }} className="mt-4 inline-flex items-center gap-2 text-sm hover:text-red-accent">{project.name}<ArrowUpRight className="size-3" /></Link>{project.description && <p className="mt-2 line-clamp-3 text-sm">{project.description}</p>}</figcaption></figure>; })}</div></section>}
    </article>
  </BlogShell>;
}