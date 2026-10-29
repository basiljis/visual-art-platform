import { useState } from "react";
import { Send, X } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import { SITE_URL } from "@/lib/seo";

/** Email sending is switched on once the dikunova.art mail domain is connected. */
export const EMAIL_SENDING_ENABLED = false;

export type BroadcastItem = { kind: "news" | "blog" | "exhibition"; title: string; text?: string | null; image?: string | null; link?: string | null; meta?: string | null };

const KIND_LABEL = { news: "Новость", blog: "Новая запись в блоге", exhibition: "Выставка" } as const;

function absolute(link?: string | null) {
  if (!link) return SITE_URL;
  return link.startsWith("http") ? link : `${SITE_URL}${link.startsWith("/") ? "" : "/"}${link}`;
}

export function BroadcastButton({ item }: { item: BroadcastItem }) {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const url = absolute(item.link);
  const plain = (item.text ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);
  return (
    <>
      <button onClick={() => { setOpen(true); setConfirmed(false); }} title="Разослать подписчикам" aria-label="Разослать подписчикам" className="hover:text-red-accent"><Send className="size-4" /></button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Рассылка подписчикам" className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 p-4" onClick={() => setOpen(false)}>
          <div className="max-h-[90dvh] w-full max-w-xl overflow-auto bg-background p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-2xl">Разослать подписчикам</h3><button onClick={() => setOpen(false)} aria-label="Закрыть" className="hover:text-red-accent"><X className="size-5" /></button></div>
            <p className="mb-2 text-[10px] uppercase tracking-[.18em] text-muted-foreground">Предпросмотр письма</p>
            <div className="border border-border p-5">
              <p className="text-xs text-muted-foreground">От: Наталья Дикунова · Тема: {KIND_LABEL[item.kind]}: {item.title}</p>
              <hr className="my-4 border-border" />
              <p className="text-[10px] uppercase tracking-[.18em] text-red-accent">{KIND_LABEL[item.kind]}</p>
              <h4 className="mt-1 font-display text-xl">{item.title}</h4>
              {item.meta && <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>}
              {item.image && <img src={mediaUrl(item.image)} alt="" className="mt-4 max-h-64 w-full object-cover" />}
              {plain && <p className="mt-4 text-sm leading-relaxed">{plain}{(item.text ?? "").length > 400 ? "…" : ""}</p>}
              <p className="mt-4 text-sm"><span className="border-b border-current">Читать на сайте</span> <span className="text-xs text-muted-foreground">{url}</span></p>
              <p className="mt-6 text-[11px] text-muted-foreground">© 2026 Наталья Дикунова · dikunova.art · Отписаться от рассылки</p>
            </div>
            {EMAIL_SENDING_ENABLED ? (
              <label className="mt-5 flex items-center gap-3 text-sm"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />Подтверждаю отправку всем подписчикам</label>
            ) : (
              <p className="mt-5 border border-red-accent p-3 text-sm text-red-accent">Отправка станет доступна после подключения почтового домена dikunova.art.</p>
            )}
            <div className="mt-5 flex justify-end gap-4">
              <button onClick={() => setOpen(false)} className="text-xs uppercase tracking-[.16em] hover:text-red-accent">Отмена</button>
              <button disabled={!EMAIL_SENDING_ENABLED || !confirmed} className="inline-flex items-center gap-2 bg-foreground px-5 py-2 text-xs uppercase tracking-[.16em] text-background disabled:cursor-not-allowed disabled:opacity-40"><Send className="size-4" />Отправить</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
