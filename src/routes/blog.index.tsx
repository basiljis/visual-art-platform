import { createFileRoute, Link } from "@tanstack/react-router";
import { BlogShell } from "@/components/BlogShell";
import { useSuspenseQuery } from "@tanstack/react-query";
import { postsQuery } from "@/lib/content.functions";
import { mediaUrl } from "@/lib/media";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { SubscribeForm } from "@/components/SubscribeForm";
import { useLanguage, localized, localizedDate } from "@/lib/language";
import { breadcrumbs, pageUrl } from "@/lib/seo";
import { BlogCalendar } from "@/components/BlogCalendar";
import { Button } from "@/components/ui/button";
import { samePublicationDay } from "@/lib/blog-dates";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Блог — Наталья Дикунова" },
      { name: "description", content: "Выставки, проекты, преподавание в Китае и новости художника Натальи Дикуновой." },
      { property: "og:title", content: "Блог — Наталья Дикунова" },
      { property: "og:description", content: "Выставки, проекты, преподавание в Китае и новости художника Натальи Дикуновой." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: pageUrl("/blog") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: pageUrl("/blog") }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(breadcrumbs([
      { name: "Главная", path: "/" }, { name: "Блог", path: "/blog" },
    ])) }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  errorComponent: BlogError,
  component: BlogIndex,
});

function BlogError() {
  const { lang } = useLanguage();
  return <BlogShell back={{ to: "/", label: "Главная" }}><p>{lang === "en" ? "Could not load the blog." : "Не удалось загрузить блог."}</p></BlogShell>;
}

function BlogIndex() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const { data: allPosts } = useSuspenseQuery(postsQuery);
  const [q, setQ] = useState("");
  const [day, setDay] = useState<Date | undefined>();
  const needle = q.trim().toLowerCase();
  const searchedPosts = needle ? allPosts.filter((p) => `${localized(p.title, p.title_en, lang)} ${localized(p.excerpt, p.excerpt_en, lang)} ${localizedDate(p.date, lang)}`.toLowerCase().includes(needle)) : allPosts;
  const blogPosts = day ? searchedPosts.filter((post) => samePublicationDay(post.date, day)) : searchedPosts;
  return (
    <BlogShell back={{ to: "/", label: "Главная" }}>
      <p className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">{en ? "Home / Blog" : "Главная / Блог"}</p>
      <div className="mt-4 flex items-end justify-between border-b border-border pb-8">
        <h1 className="font-display text-5xl md:text-8xl">{en ? "Blog" : "Блог"}</h1>
        <span className="text-sm text-muted-foreground">{blogPosts.length}</span>
      </div>
      <label className="mt-8 flex max-w-sm items-center gap-3 border-b border-border pb-2 focus-within:border-foreground">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={en ? "Search the blog" : "Поиск по блогу"} aria-label={en ? "Search the blog" : "Поиск по блогу"} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        {q && <Button variant="ghost" size="icon" onClick={() => setQ("")} aria-label={en ? "Clear search" : "Очистить поиск"} className="size-7 shrink-0 hover:bg-transparent hover:text-red-accent"><X className="size-4" /></Button>}
      </label>
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="order-2 min-w-0 lg:order-1">
      {!blogPosts.length && <div className="py-16 text-center"><p className="text-sm text-muted-foreground">{en ? "Nothing found" : "Ничего не найдено"}</p><Button variant="link" onClick={() => { setQ(""); setDay(undefined); }} className="mt-4 text-red-accent">{en ? "Reset filters" : "Сбросить фильтры"}</Button></div>}
      <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
        {blogPosts.map((p) => (
          <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="group block">
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              {p.cover ? <img src={mediaUrl(p.cover)} alt={localized(p.title, p.title_en, lang)} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]" /> : <div className="grid h-full place-items-center font-display text-3xl text-muted-foreground">{en ? "ND" : "ДН"}</div>}
            </div>
            <p className="mt-4 text-[10px] uppercase tracking-[.2em] text-muted-foreground">{localizedDate(p.date, lang)}</p>
            <h2 className="mt-2 text-base font-medium md:text-lg">{localized(p.title, p.title_en, lang)}</h2>
            {p.excerpt && <p className="mt-1 text-sm text-muted-foreground">{localized(p.excerpt, p.excerpt_en, lang)}</p>}
          </Link>
        ))}
      </div>
      </div>
      <div className="order-1 min-w-0 lg:order-2"><BlogCalendar dates={searchedPosts.map((post) => post.date)} selected={day} onSelect={setDay} /></div>
      </div>
      <div className="mx-auto max-w-3xl"><SubscribeForm /></div>
    </BlogShell>
  );
}
