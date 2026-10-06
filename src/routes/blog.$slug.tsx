import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BlogShell } from "@/components/BlogShell";
import { SubscribeForm } from "@/components/SubscribeForm";
import { postQuery } from "@/lib/content.functions";
import { htmlForDisplay } from "@/lib/media";

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
  const { post, next } = data;
  return (
    <BlogShell back={{ to: "/blog", label: "Блог" }}>
      <article className="mx-auto max-w-3xl">
        <p className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">Блог / {post.date}</p>
        <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">{post.title}</h1>
        <div className="post-body mt-10" dangerouslySetInnerHTML={{ __html: htmlForDisplay(post.content_html) }} />
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
