import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { sendEnquiry } from "@/lib/enquiry.functions";

const copy = {
  ru: { title: "Узнать о покупке", name: "Имя", email: "Email", phone: "Телефон (необязательно)", message: "Сообщение", send: "Отправить", sending: "Отправка…", done: "Спасибо! Сообщение отправлено, художник свяжется с вами.", error: "Не удалось отправить. Попробуйте ещё раз или напишите на morrasdream@gmail.com", close: "Закрыть", work: "Работа", def: (w: string) => `Здравствуйте! Меня интересует работа «${w}».` },
  en: { title: "Purchase enquiry", name: "Name", email: "Email", phone: "Phone (optional)", message: "Message", send: "Send", sending: "Sending…", done: "Thank you! Your message has been sent; the artist will get back to you.", error: "Could not send. Please try again or write to morrasdream@gmail.com", close: "Close", work: "Work", def: (w: string) => `Hello! I am interested in the work “${w}”.` },
};

export function EnquiryModal({ artwork, lang, onClose }: { artwork: string; lang: "ru" | "en"; onClose: () => void }) {
  const c = copy[lang];
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: artwork ? c.def(artwork) : "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      const r = await sendEnquiry({ data: { ...form, artwork } });
      setState(r.ok ? "done" : "error");
    } catch { setState("error"); }
  };
  const field = "w-full border-b border-border bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground";

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-ink/70 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
      <div className="relative w-full max-w-md bg-background p-6 text-foreground md:p-8" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label={c.close} data-tip={c.close} className="absolute right-4 top-4 grid size-9 place-items-center"><X className="size-5" /></button>
        <h2 id="enquiry-title" className="font-display text-3xl">{c.title}</h2>
        {artwork && <p className="mt-2 text-xs uppercase tracking-[.16em] text-muted-foreground">{c.work}: {artwork}</p>}
        {state === "done" ? <p className="mt-8 text-sm" role="status">{c.done}</p> : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input required maxLength={100} aria-label={c.name} placeholder={c.name} className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required type="email" maxLength={254} aria-label={c.email} placeholder={c.email} className={field} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input type="tel" maxLength={40} aria-label={c.phone} placeholder={c.phone} className={field} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <textarea required maxLength={2000} rows={4} aria-label={c.message} placeholder={c.message} className={`${field} resize-none`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            {state === "error" && <p className="text-xs text-red-accent" role="alert">{c.error}</p>}
            <button type="submit" disabled={state === "sending"} className="w-full bg-foreground py-3 text-xs uppercase tracking-[.18em] text-background transition-colors hover:bg-red-accent disabled:opacity-60">{state === "sending" ? c.sending : c.send}</button>
          </form>
        )}
      </div>
    </div>
  );
}
