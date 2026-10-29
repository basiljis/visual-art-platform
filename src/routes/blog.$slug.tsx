import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BlogShell } from "@/components/BlogShell";
import { BlogArticleBody } from "@/components/BlogArticleBody";
import { SubscribeForm } from "@/components/SubscribeForm";
import { postQuery } from "@/lib/content.functions";
import { htmlForDisplay, mediaUrl } from "@/lib/media";
import { useLanguage, localized, localizedDate } from "@/lib/language";
import { absoluteImage, articleSchema, breadcrumbs, pageUrl } from "@/lib/seo";
import { artworkSlug } from "@/lib/artwork-seo";
import { BlogViewCount } from "@/components/BlogViewCount";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!res) throw notFound();
    return { title: res.post.title, slug: res.post.slug, date: res.post.date, image: absoluteImage(res.post.cover), desc: res.post.excerpt || res.post.content_html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 150) || res.post.title };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Запись не найдена" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${loaderData.title} — Блог Натальи Дикуновой` },
        { name: "description", content: loaderData.desc },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: pageUrl(`/blog/${encodeURIComponent(loaderData.slug)}`) },
        { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData.image ? [{ property: "og:image", content: loaderData.image }, { name: "twitter:image", content: loaderData.image }] : []),
      ],
      links: [{ rel: "canonical", href: pageUrl(`/blog/${encodeURIComponent(loaderData.slug)}`) }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(articleSchema(loaderData)) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbs([
          { name: "Главная", path: "/" }, { name: "Блог", path: "/blog" },
          { name: loaderData.title, path: `/blog/${encodeURIComponent(loaderData.slug)}` },
        ])) },
      ],
    };
  },
  errorComponent: PostError,
  notFoundComponent: PostNotFound,
  component: PostPage,
});

function PostError() {
  const { lang } = useLanguage();
  return <BlogShell back={{ to: "/blog", label: "Блог" }}><p>{lang === "en" ? "Could not load the post." : "Не удалось загрузить запись."}</p></BlogShell>;
}

function PostNotFound() {
  const { lang } = useLanguage();
  return <BlogShell back={{ to: "/blog", label: "Блог" }}><p className="text-lg">{lang === "en" ? "Post not found. " : "Запись не найдена. "}<Link to="/blog" className="underline">{lang === "en" ? "All posts" : "Все записи"}</Link></p></BlogShell>;
}

function PostPage() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(postQuery(slug));
  if (!data) return <PostNotFound />;
  const { post, next, relatedWorks, relatedTopics, relatedPosts } = data;
  return (
    <BlogShell back={{ to: "/blog", label: "Блог" }}>
      <article className="mx-auto max-w-3xl">
        <nav aria-label={en ? "Breadcrumbs" : "Хлебные крошки"} className="mb-3 flex flex-wrap items-center gap-x-2 text-[11px] uppercase tracking-[.18em] text-muted-foreground">
          <Link to="/" className="py-1 transition-colors hover:text-red-accent">{en ? "Home" : "Главная"}</Link>
          <span aria-hidden="true" className="text-red-accent">/</span>
          <Link to="/blog" className="py-1 transition-colors hover:text-red-accent">{en ? "Blog" : "Блог"}</Link>
          <span aria-hidden="true" className="text-red-accent">/</span>
          <span aria-current="page" className="min-w-0 max-w-[12rem] truncate sm:max-w-none" title={localized(post.title, post.title_en, lang)}>{localized(post.title, post.title_en, lang)}</span>
        </nav>
        <Button asChild variant="link" className="mb-3 h-9 px-0 text-red-accent">
          <Link to="/blog"><ArrowLeft aria-hidden="true" />{en ? "Back to blog" : "Назад к блогу"}</Link>
        </Button>
        <div className="flex items-center justify-between gap-3"><p className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">{en ? "Blog" : "Блог"} / {localizedDate(post.date, lang)}</p><BlogViewCount slug={slug} /></div>
        <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">{localized(post.title, post.title_en, lang)}</h1>
        <BlogArticleBody key={`${slug}-${lang}`} html={htmlForDisplay(localized(post.content_html, post.content_html_en, lang))} />
        {(relatedTopics.length > 0 || relatedWorks.length > 0) && (
          <section className="mt-16 border-t border-border pt-10">
            {relatedTopics.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">{en ? "Topics" : "Тематики"}</span>
                {relatedTopics.map((t) => (
                  <Link key={t.key} to="/works/$category" params={{ category: t.key }} className="flex items-center gap-1 border-b border-current pb-0.5 text-xs uppercase tracking-[.14em] transition-colors hover:border-red-accent hover:text-red-accent">
                    <span className="text-red-accent">/ </span>{localized(t.name_ru, t.name_en, lang)}
                  </Link>
                ))}
              </div>
            )}
            {relatedWorks.length > 0 && (
              <div className="mt-10">
                <h2 className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">{en ? "Related works" : "Связанные работы"}</h2>
                <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">
                  {relatedWorks.map((w) => (
                    <Link key={w.id} to="/works/$category/$slug" params={{ category: w.category_key, slug: artworkSlug(w) }} className="group block">
                      <span className="block aspect-[4/5] overflow-hidden bg-muted">
                        <img src={mediaUrl(w.image)} alt={localized(w.title_ru, w.title_en, lang)} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
                      </span>
                      <span className="mt-3 block border-t border-border pt-2 transition-colors group-hover:border-red-accent">
                        <span className="block text-sm font-medium transition-colors group-hover:text-red-accent">{localized(w.title_ru, w.title_en, lang)}</span>
                        {w.year && <span className="mt-0.5 block text-xs text-muted-foreground">{w.year}</span>}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
        {relatedPosts.length > 0 && (
          <section className="mt-16 border-t border-border pt-10">
            <h2 className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">{en ? "More on this topic" : "Ещё по теме"}</h2>
            <div className="mt-5 flex flex-col gap-3">
              {relatedPosts.map((p) => (
                <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="border-b border-border pb-3 font-display text-xl transition-colors hover:border-red-accent hover:text-red-accent md:text-2xl">{localized(p.title, p.title_en, lang)}</Link>
              ))}
            </div>
          </section>
        )}
        <SubscribeForm />
        {next && (
          <Link to="/blog/$slug" params={{ slug: next.slug }} className="mt-20 block border-t border-border pt-8">
            <span className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">{en ? "Next post" : "Следующая запись"}</span>
            <span className="mt-2 block font-display text-2xl md:text-3xl">{localized(next.title, next.title_en, lang)}</span>
          </Link>
        )}
      </article>
    </BlogShell>
  );
}
