import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BlogShell } from "@/components/BlogShell";
import { blogImage, blogPosts } from "@/lib/blog";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = blogPosts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { slug: post.slug };
  },
  head: ({ loaderData }) => {
    const post = blogPosts.find((p) => p.slug === loaderData?.slug);
    if (!post) return { meta: [{ title: "Запись не найдена" }, { name: "robots", content: "noindex" }] };
    const desc = post.excerpt || (post.blocks.find((b) => "p" in b) as { p: string } | undefined)?.p.slice(0, 150) || post.title;
    return {
      meta: [
        { title: `${post.title} — Блог Натальи Дикуновой` },
        { name: "description", content: desc },
        { property: "og:title", content: post.title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: PostNotFound,
  component: PostPage,
});

function PostNotFound() {
  return <BlogShell back={{ to: "/blog", label: "Блог" }}><p className="text-lg">Запись не найдена. <Link to="/blog" className="underline">Все записи</Link></p></BlogShell>;
}

function PostPage() {
  const { slug } = Route.useLoaderData();
  const i = blogPosts.findIndex((p) => p.slug === slug);
  const post = blogPosts[i]!;
  const next = blogPosts[i + 1];
  return (
    <BlogShell back={{ to: "/blog", label: "Блог" }}>
      <article className="mx-auto max-w-3xl">
        <p className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">Блог / {post.date}</p>
        <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">{post.title}</h1>
        <div className="mt-10 space-y-6 text-base leading-relaxed md:text-lg">
          {post.blocks.map((b, k) => "img" in b
            ? <img key={k} src={blogImage(b.img)} alt={post.title} loading="lazy" className="w-full bg-muted" />
            : <p key={k}>{b.p}</p>)}
        </div>
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
