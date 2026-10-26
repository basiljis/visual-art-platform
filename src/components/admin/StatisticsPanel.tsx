import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { VisitStatistics } from "@/lib/visit-statistics";

export function StatisticsPanel() {
  const [days, setDays] = useState(30);
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-visit-statistics", days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_visit_statistics", { _days: days });
      if (error) throw new Error("Не удалось загрузить статистику");
      return data as unknown as VisitStatistics;
    },
  });
  return <section aria-label="Статистика посещений" className="space-y-8">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 className="font-display text-3xl">Статистика посещений</h2>
      <div className="flex items-center gap-3">
        <div className="flex border-b border-border" aria-label="Период статистики">
          {[7, 30, 90].map((period) => <Button key={period} variant="ghost" size="sm" aria-pressed={days === period} onClick={() => setDays(period)} className={`rounded-none hover:bg-transparent hover:text-red-accent ${days === period ? "border-b border-red-accent text-red-accent" : "text-muted-foreground"}`}>{period} дней</Button>)}
        </div>
        <Button variant="ghost" size="icon" aria-label="Обновить статистику" title="Обновить статистику" disabled={isFetching} onClick={() => refetch()}><RefreshCw className={isFetching ? "animate-spin" : ""} /></Button>
      </div>
    </div>
    {isPending && <p className="text-sm text-muted-foreground">Загрузка…</p>}
    {isError && <p role="alert" className="text-sm text-red-accent">Не удалось загрузить статистику. Попробуйте обновить.</p>}
    {data && <>
      <div className="grid grid-cols-1 gap-6 border-y border-border py-6 sm:grid-cols-3">
        {[["Посещения", data.visits], ["Просмотры страниц", data.pageViews], ["Просмотры статей", data.blogViews]].map(([name, value]) => <div key={name}><p className="text-xs text-muted-foreground">{name}</p><p className="mt-3 text-4xl tabular-nums">{Number(value).toLocaleString("ru-RU")}</p></div>)}
      </div>
      <p className="text-xs text-muted-foreground">{data.startedAt ? `Учёт с ${new Date(data.startedAt).toLocaleDateString("ru-RU", { timeZone: "Europe/Moscow" })}. ` : "Статистика появится после первых посещений. "}Посещение — одна сессия браузера; повторное открытие страницы в ней не увеличивает счётчик. Даты — по Москве.</p>
      <div className="grid gap-10 md:grid-cols-2">
        <div><h2 className="mb-4 font-display text-2xl">По дням</h2><div className="max-h-96 overflow-auto"><table className="w-full text-left text-sm"><thead className="text-xs text-muted-foreground"><tr><th className="pb-3 font-normal">Дата</th><th className="pb-3 text-right font-normal">Посещения</th><th className="pb-3 text-right font-normal">Просмотры</th></tr></thead><tbody>{data.daily.map((day) => <tr key={day.day} className="border-t border-border"><td className="py-3">{day.day.split("-").reverse().join(".")}</td><td className="text-right tabular-nums">{day.visits}</td><td className="text-right tabular-nums">{day.views}</td></tr>)}</tbody></table></div></div>
        <div><h2 className="mb-4 font-display text-2xl">Публикации</h2><ul>{data.posts.map((post) => <li key={post.slug} className="flex items-start justify-between gap-4 border-t border-border py-3 text-sm"><span className="min-w-0 break-words">{post.title}</span><span className="shrink-0 text-muted-foreground tabular-nums">{post.views}</span></li>)}</ul></div>
      </div>
    </>}
  </section>;
}