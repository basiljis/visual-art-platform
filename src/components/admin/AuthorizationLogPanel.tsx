import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Log = {
  total: number;
  hasAuditHistory: boolean;
  entries: { id: string; occurredAt: string; account: string; action: string; source: string }[];
};
const actions: Record<string, string> = {
  login: "Вход", logout: "Выход", user_signedup: "Регистрация",
  user_recovery_requested: "Запрос восстановления пароля", user_password_updated: "Изменение пароля",
  token_revoked: "Отзыв сессии", user_repeated_signup: "Повторная регистрация",
};

export function AuthorizationLogPanel() {
  const [days, setDays] = useState(30);
  const [offset, setOffset] = useState(0);
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-authorization-log", days, offset],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_authorization_log", { _days: days, _offset: offset });
      if (error) throw new Error("Не удалось загрузить журнал");
      return data as unknown as Log;
    },
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
  return <section aria-label="Журнал авторизации" className="space-y-6">
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
      <h2 className="min-w-0 font-display text-2xl sm:text-3xl">Журнал авторизации</h2>
      <Button variant="ghost" size="icon" className="shrink-0" aria-label="Обновить журнал" title="Обновить журнал" disabled={isFetching} onClick={() => refetch()}><RefreshCw className={isFetching ? "animate-spin" : ""} /></Button>
    </div>
    <div className="flex gap-3 border-b border-border" aria-label="Период журнала">
      {[7, 30, 90].map(period => <Button key={period} variant="ghost" size="sm" aria-pressed={days === period} onClick={() => { setDays(period); setOffset(0); }} className={`rounded-none hover:bg-transparent hover:text-red-accent ${days === period ? "border-b border-red-accent text-red-accent" : "text-muted-foreground"}`}>{period} дней</Button>)}
    </div>
    {isPending && <p className="text-sm text-muted-foreground">Загрузка…</p>}
    {isError && <p role="alert" className="text-sm text-red-accent">Не удалось загрузить журнал. Попробуйте обновить.</p>}
    {data && <>
      {!data.hasAuditHistory && <p role="status" className="text-sm text-muted-foreground">История событий авторизации недоступна. Показан последний успешный вход каждой учётной записи; неудачные попытки и предыдущие входы не включены.</p>}
      {data.entries.length === 0 ? <p className="text-sm text-muted-foreground">За выбранный период записей нет.</p> : <ul className="divide-y divide-border border-y border-border">
        {data.entries.map(entry => <li key={entry.id} className="grid min-w-0 gap-2 py-4 sm:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1fr)] sm:gap-5">
          <time dateTime={entry.occurredAt} className="text-sm tabular-nums text-muted-foreground">{new Date(entry.occurredAt).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}</time>
          <span className="min-w-0 break-all text-sm">{entry.account}</span>
          <span className="min-w-0 text-sm">{entry.source === "last_sign_in" ? "Последний успешный вход" : actions[entry.action] ?? "Событие авторизации"}</span>
        </li>)}
      </ul>}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <p className="text-xs text-muted-foreground">{data.total > 0 ? `${offset + 1}–${Math.min(offset + 50, data.total)} из ${data.total} · Москва` : "0 записей · Москва"}</p>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="icon" aria-label="Предыдущие записи" title="Предыдущие записи" disabled={offset === 0 || isFetching} onClick={() => setOffset(value => Math.max(0, value - 50))}><ChevronLeft /></Button>
          <Button variant="ghost" size="icon" aria-label="Следующие записи" title="Следующие записи" disabled={offset + 50 >= data.total || isFetching} onClick={() => setOffset(value => value + 50)}><ChevronRight /></Button>
        </div>
      </div>
    </>}
  </section>;
}