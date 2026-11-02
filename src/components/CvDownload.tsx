import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { Button } from "./ui/button";
import { createCvPdf } from "@/lib/cv-download";
import type { AboutContent } from "@/lib/about";
import type { CategoryRow, WorkRow } from "@/lib/content.functions";

export function CvDownload({ about, lang, works = [], categories = [] }: { about: AboutContent; lang: "ru" | "en"; works?: WorkRow[]; categories?: CategoryRow[] }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState<{ blob: Blob; source: AboutContent; lang: string } | null>(null);
  const file = ready?.source === about && ready.lang === lang ? ready.blob : null;
  return <div>
    <Button variant="link" disabled={busy} className="h-auto px-0 text-foreground hover:text-red-accent" onClick={async () => {
      if (file) {
        const filename = `natalia-dikunova-cv-portfolio-${lang}.pdf`;
        const shareFile = new File([file], filename, { type: "application/pdf" });
        if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [shareFile] })) {
          try { await navigator.share({ files: [shareFile] }); return; } catch (e) { if ((e as DOMException).name === "AbortError") return; }
        }
        const url = URL.createObjectURL(file); const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000); return;
      }
      setBusy(true); setError(false);
      try { setReady({ blob: await createCvPdf(about, lang, works, categories), source: about, lang }); } catch { setError(true); } finally { setBusy(false); }
    }}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}{busy ? (lang === "ru" ? "Подготовка PDF…" : "Preparing PDF…") : file ? (lang === "ru" ? "Скачать готовый PDF" : "Download prepared PDF") : (lang === "ru" ? "CV и портфолио (PDF)" : "CV & portfolio (PDF)")}</Button>
    {error && <p role="alert" className="text-sm text-red-accent">{lang === "ru" ? "Не удалось скачать CV. Попробуйте ещё раз." : "Could not download CV. Please try again."}</p>}
  </div>;
}