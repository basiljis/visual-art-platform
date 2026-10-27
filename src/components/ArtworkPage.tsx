import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ZoomIn } from "lucide-react";
import { BlogShell } from "./BlogShell";
import { Button } from "./ui/button";
import { EnquiryModal } from "./EnquiryModal";
import { ZoomImage } from "./ViewerStage";
import type { WorkRow, CategoryRow } from "@/lib/content.functions";
import { useLanguage, localized, localizedSize } from "@/lib/language";
import { mediaUrl } from "@/lib/media";
import { artworkAlt, artworkSlug } from "@/lib/artwork-seo";
import { canEnquire, hasRedDot } from "@/lib/artwork-availability";

export function ArtworkPage({ work, category, next }: { work: WorkRow; category: CategoryRow; next?: WorkRow | undefined }) {
  const { lang } = useLanguage();
  const [enquiry, setEnquiry] = useState(false);
  const [zoom, setZoom] = useState(false);
  const title = localized(work.title_ru, work.title_en, lang);
  return <BlogShell back={{ to: "/", label: "Главная" }}>
    <nav className="mb-8"><Link to="/works/$category" params={{ category: category.key }} className="inline-flex items-center gap-2 text-sm hover:text-red-accent"><ArrowLeft className="size-4" />{lang === "ru" ? "Вернуться к серии" : "Back to series"} · {localized(category.name_ru, category.name_en, lang)}</Link></nav>
    <article className="grid items-start gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-16">
      <div className="relative">
        <Button variant="ghost" onClick={() => setZoom(true)} aria-label={lang === "ru" ? "Увеличить картину" : "Enlarge artwork"} className="block h-auto w-full rounded-none p-0 hover:bg-transparent"><img src={mediaUrl(work.image)} alt={artworkAlt(work, lang)} className="max-h-[75dvh] w-full object-contain" /><ZoomIn className="absolute bottom-3 right-3 size-5" /></Button>
        {hasRedDot(work.status) && <span aria-hidden className="pointer-events-none absolute right-3 top-3 size-3.5 rounded-full bg-red-accent ring-2 ring-background" />}
      </div>
      <div data-font-block="captions"><h1 className="font-display text-3xl md:text-5xl">{hasRedDot(work.status) && <span role="img" aria-label={lang === "ru" ? "Продана" : "Sold"} className="mr-3 inline-block size-3 rounded-full bg-red-accent align-middle" />}{title}</h1>
        <p className="mt-5 text-muted-foreground">{[localized(work.technique, work.technique_en, lang), localizedSize(work.size, lang), work.year].filter(Boolean).join(" · ")}</p>
        {work.status === "private" && <p className="mt-4 text-sm text-muted-foreground">{lang === "ru" ? "В частной коллекции" : "Private collection"}</p>}
        {canEnquire(work.status) && <Button variant="outline" className="mt-8" onClick={() => setEnquiry(true)}>{lang === "ru" ? "Узнать о покупке" : "Purchase enquiry"}</Button>}
        {next && <Link to="/works/$category/$slug" params={{ category: next.category_key, slug: artworkSlug(next) }} className="mt-12 flex items-center gap-3 border-t border-border pt-5 hover:text-red-accent"><span>{lang === "ru" ? "Следующая работа" : "Next artwork"}<span className="mt-1 block text-sm text-muted-foreground">{localized(next.title_ru, next.title_en, lang)}</span></span><ArrowRight className="size-5 shrink-0" /></Link>}
      </div>
    </article>
    {enquiry && <EnquiryModal artwork={title} lang={lang} onClose={() => setEnquiry(false)} />}
    {zoom && <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[90] flex flex-col bg-background p-5"><Button variant="ghost" className="mb-5 self-end" onClick={() => setZoom(false)}>{lang === "ru" ? "Закрыть" : "Close"}</Button><div className="min-h-0 flex-1"><ZoomImage src={mediaUrl(work.image)} alt={artworkAlt(work, lang)} resetKey={work.id} sold={hasRedDot(work.status)} soldLabel={lang === "ru" ? "Продана" : "Sold"} /></div></div>}
  </BlogShell>;
}