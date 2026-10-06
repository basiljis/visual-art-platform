import { createFileRoute, Link } from "@tanstack/react-router";
import { BlogShell } from "@/components/BlogShell";
import { useSuspenseQuery } from "@tanstack/react-query";
import { postsQuery } from "@/lib/content.functions";
import { mediaUrl } from "@/lib/media";
import { SubscribeForm } from "@/components/SubscribeForm";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Блог — Наталья Дикунова" },
      { name: "description", content: "Выставки, проекты, преподавание в Китае и новости художника Натальи Дикуновой." },
      { property: "og:title", content: "Блог — Наталья Дикунова" },
      { property: "og:description", content: "Выставки, проекты, преподавание в Китае и новости художника Натальи Дикуновой." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  errorComponent: () => <BlogShell back={{ to: "/", label: "Главная" }}><p>Не удалось загрузить блог.</p></BlogShell>,
  component: BlogIndex,
});

function BlogIndex() {
  const { data: blogPosts } = useSuspenseQuery(postsQuery);
  return (
    <BlogShell back={{ to: "/", label: "Главная" }}>
      <p className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">Главная / Блог</p>
      <div className="mt-4 flex items-end justify-between border-b border-border pb-8">
        <h1 className="font-display text-5xl md:text-8xl">Блог</h1>
        <span className="text-sm text-muted-foreground">{blogPosts.length}</span>
      </div>
      <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((p) => (
          <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="group block">
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              {p.cover ? <img src={mediaUrl(p.cover)} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]" /> : <div className="grid h-full place-items-center font-display text-3xl text-muted-foreground">ДН</div>}
            </div>
            <p className="mt-4 text-[10px] uppercase tracking-[.2em] text-muted-foreground">{p.date}</p>
            <h2 className="mt-2 text-base font-medium md:text-lg">{p.title}</h2>
            {p.excerpt && <p className="mt-1 text-sm text-muted-foreground">{p.excerpt}</p>}
          </Link>
        ))}
      </div>
      <div className="mx-auto max-w-3xl"><SubscribeForm /></div>
    </BlogShell>
  );
}
