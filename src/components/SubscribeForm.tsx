import { useServerFn } from "@tanstack/react-start";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { subscribeToBlog } from "@/lib/subscribe.functions";

export function SubscribeForm() {
  const subscribe = useServerFn(subscribeToBlog);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      const res = await subscribe({ data: { email } });
      setState(res.ok ? "done" : "error");
      if (res.ok) setEmail("");
    } catch {
      setState("error");
    }
  };

  return (
    <section className="mt-20 border-t border-border pt-10">
      <p className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">Подписка</p>
      <h2 className="mt-3 font-display text-3xl md:text-4xl">Подписаться на блог</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">Оставьте почту, чтобы узнавать о новых публикациях, выставках и проектах.</p>
      {state === "done" ? (
        <p className="mt-6 text-base">Спасибо! Вы подписаны.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 flex max-w-lg items-end gap-3 border-b border-foreground">
          <label className="sr-only" htmlFor="subscribe-email">E-mail</label>
          <input id="subscribe-email" type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground" />
          <button type="submit" disabled={state === "sending"} aria-label="Подписаться" className="flex shrink-0 items-center gap-2 py-3 text-xs uppercase tracking-[.18em] transition-colors hover:text-red-accent disabled:opacity-50">{state === "sending" ? "…" : "Подписаться"}<ArrowRight className="size-4" /></button>
        </form>
      )}
      {state === "error" && <p className="mt-3 text-sm text-red-accent">Не удалось подписаться. Проверьте адрес и попробуйте ещё раз.</p>}
    </section>
  );
}
