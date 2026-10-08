import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { CalendarDays, MapPin, X } from "lucide-react";
import { getNews, type NewsRow } from "@/lib/news.functions";
import { mediaUrl } from "@/lib/media";

const SEEN_KEY = "dikunova-news-seen";

/** Shows published news (upcoming exhibitions) in a modal after a configurable delay, once per browser session. */
export function NewsPopup() {
  const { pathname } = useLocation();
  const [news, setNews] = useState<NewsRow[] | null>(null);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const skip = pathname.startsWith("/admin") || pathname.startsWith("/reset-password");

  useEffect(() => {
    if (skip || sessionStorage.getItem(SEEN_KEY)) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    getNews().then(({ news, settings }) => {
      if (cancelled || !settings.enabled || news.length === 0) return;
      setNews(news);
      timer = setTimeout(() => {
        setLang(localStorage.getItem("dikunova-lang") === "en" ? "en" : "ru");
        setOpen(true);
        sessionStorage.setItem(SEEN_KEY, "1");
      }, Math.max(0, settings.delay) * 1000);
    }).catch(() => {});
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [skip]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open || !news || skip) return null;
  const en = lang === "en";
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-foreground/40 p-3 backdrop-blur-sm animate-in fade-in" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label={en ? "News" : "Новости"}>
      <div className="relative max-h-[90vh] w-[min(100%,36rem)] overflow-y-auto bg-background p-6 text-foreground shadow-2xl md:p-10" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setOpen(false)} aria-label={en ? "Close" : "Закрыть"} className="absolute right-4 top-4 hover:text-red-accent"><X className="size-5" /></button>
        <p className="text-[10px] uppercase tracking-[.22em] text-red-accent">{en ? "Upcoming exhibitions" : "Ближайшие выставки"}</p>
        <div className="mt-6 space-y-10">
          {news.map((n) => {
            const title = (en && n.title_en) || n.title_ru;
            const body = (en && n.body_en) || n.body_ru;
            const addr = (en && n.address_en) || n.address_ru;
            return (
              <article key={n.id}>
                {n.image && <img src={mediaUrl(n.image)} alt="" className="mb-5 max-h-64 w-full object-cover" />}
                <h2 className="font-display text-3xl leading-tight">{title}</h2>
                <div className="mt-4 space-y-2 text-sm">
                  {n.event_date && <p className="flex items-start gap-2"><CalendarDays className="mt-0.5 size-4 shrink-0 text-red-accent" />{n.event_date}</p>}
                  {addr && <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-red-accent" />{addr}</p>}
                </div>
                {body && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{body}</p>}
                {n.link && <a href={n.link} target="_blank" rel="noreferrer" className="mt-4 inline-block border-b border-current pb-0.5 text-xs uppercase tracking-[.16em] hover:text-red-accent">{en ? "Learn more" : "Подробнее"}</a>}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
