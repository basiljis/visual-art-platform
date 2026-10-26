import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { blogViewsQuery } from "@/lib/visit-statistics.functions";
import { useLanguage } from "@/lib/language";

export function BlogViewCount({ slug }: { slug: string }) {
  const { data } = useQuery(blogViewsQuery);
  const { lang } = useLanguage();
  const count = data?.find((post) => post.slug === slug)?.views;
  if (count === undefined) return null;
  const label = lang === "en" ? `Views: ${count}` : `Просмотры: ${count}`;
  return <span className="inline-flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground tabular-nums" title={label} aria-label={label}><Eye className="size-3" aria-hidden="true" />{count.toLocaleString(lang === "en" ? "en-US" : "ru-RU")}</span>;
}