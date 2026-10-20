import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BlogShell } from "@/components/BlogShell";
import { SubscribeForm } from "@/components/SubscribeForm";
import { postQuery } from "@/lib/content.functions";
import { htmlForDisplay, mediaUrl } from "@/lib/media";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!res) throw notFound();
    return { title: res.post.title, desc: res.post.excerpt || res.post.content_html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 150) || res.post.title };
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
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => <BlogShell back={{ to: "/blog", label: "Блог" }}><p>Не удалось загрузить запись.</p></BlogShell>,
  notFoundComponent: PostNotFound,
  component: PostPage,
});

function PostNotFound() {
  return <BlogShell back={{ to: "/blog", label: "Блог" }}><p className="text-lg">Запись не найдена. <Link to="/blog" className="underline">Все записи</Link></p></BlogShell>;
}

function PostPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(postQuery(slug));
  if (!data) return <PostNotFound />;
  const { post, next, relatedWorks, relatedTopics, relatedPosts } = data;
  return (
    <BlogShell back={{ to: "/blog", label: "Блог" }}>
      <article className="mx-auto max-w-3xl">
        <p className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">Блог / {post.date}</p>
        <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">{post.title}</h1>
        <div className="post-body mt-10" dangerouslySetInnerHTML={{ __html: htmlForDisplay(post.content_html) }} />
        {(relatedTopics.length > 0 || relatedWorks.length > 0) && (
          <section className="mt-16 border-t border-border pt-10">
            {relatedTopics.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">Тематики</span>
                {relatedTopics.map((t) => (
                  <Link key={t.key} to="/" search={{ category: t.key }} hash="works" className="flex items-center gap-1 border-b border-current pb-0.5 text-xs uppercase tracking-[.14em] transition-colors hover:border-red-accent hover:text-red-accent">
                    <span className="text-red-accent">/ </span>{t.name_ru}
                  </Link>
                ))}
              </div>
            )}
            {relatedWorks.length > 0 && (
              <div className="mt-10">
                <h2 className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">Связанные работы</h2>
                <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">
                  {relatedWorks.map((w) => (
                    <Link key={w.id} to="/" search={{ category: w.category_key }} hash="works" className="group block">
                      <span className="block aspect-[4/5] overflow-hidden bg-muted">
                        <img src={mediaUrl(w.image)} alt={w.title_ru} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
                      </span>
                      <span className="mt-3 block border-t border-border pt-2 transition-colors group-hover:border-red-accent">
                        <span className="block text-sm font-medium transition-colors group-hover:text-red-accent">{w.title_ru}</span>
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
            <h2 className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">Ещё по теме</h2>
            <div className="mt-5 flex flex-col gap-3">
              {relatedPosts.map((p) => (
                <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="border-b border-border pb-3 font-display text-xl transition-colors hover:border-red-accent hover:text-red-accent md:text-2xl">{p.title}</Link>
              ))}
            </div>
          </section>
        )}
        <SubscribeForm />
        {next && (
          <Link to="/blog/$slug" params={{ slug: next.slug }} className="mt-20 block border-t border-border pt-8">
            <span className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">Следующая запись</span>
            <span className="mt-2 block font-display text-2xl md:text-3xl">{next.title}</span>
          </Link>
        )}
      </article>
    </BlogShell>
  );
}
