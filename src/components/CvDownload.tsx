import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { Button } from "./ui/button";
import { downloadCv } from "@/lib/cv-download";
import type { AboutContent } from "@/lib/about";

export function CvDownload({ about, lang }: { about: AboutContent; lang: "ru" | "en" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  return <div>
    <Button variant="link" disabled={busy} className="h-auto px-0 text-foreground hover:text-red-accent" onClick={async () => {
      setBusy(true); setError(false);
      try { await downloadCv(about, lang); } catch { setError(true); } finally { setBusy(false); }
    }}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}{lang === "ru" ? "Скачать CV (PDF)" : "Download CV (PDF)"}</Button>
    {error && <p role="alert" className="text-sm text-red-accent">{lang === "ru" ? "Не удалось скачать CV. Попробуйте ещё раз." : "Could not download CV. Please try again."}</p>}
  </div>;
}