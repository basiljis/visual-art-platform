import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { legalDocuments, type LegalKind } from "@/lib/legal";

export function LegalModal({ kind, lang, onClose }: { kind: LegalKind; lang: "ru" | "en"; onClose: () => void }) {
  const document = legalDocuments[lang][kind];
  return <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[90] bg-ink/80" />
      <Dialog.Content aria-describedby={undefined} className="site-typography fixed left-1/2 top-1/2 z-[91] flex max-h-[85svh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden border border-border bg-background text-foreground">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 md:px-8">
          <Dialog.Title className="font-sans font-light text-xl uppercase leading-tight tracking-[.14em] md:text-2xl">{document.title}</Dialog.Title>
          <Dialog.Close asChild><Button variant="ghost" size="icon" aria-label={lang === "ru" ? "Закрыть документ" : "Close document"} className="shrink-0 hover:bg-transparent hover:text-red-accent"><X /></Button></Dialog.Close>
        </div>
        <div className="overflow-y-auto overscroll-contain px-5 py-6 md:px-8" tabIndex={0}>
          {document.sections.map((section) => <section key={section.title} className="mb-7 last:mb-0">
            <h3 className="mb-3 font-sans font-normal text-sm uppercase tracking-[.14em]">{section.title}</h3>
            {section.paragraphs.map((paragraph) => <p key={paragraph} className="mb-3 text-sm leading-7 last:mb-0">{paragraph}</p>)}
          </section>)}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}