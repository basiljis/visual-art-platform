import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useLanguage } from "@/lib/language";
import { Button } from "@/components/ui/button";
import { LegalModal } from "@/components/LegalModal";
import { legalDocuments, type LegalKind } from "@/lib/legal";
import { ScrollHint } from "@/components/ScrollHint";

const smooth = (top: number) => window.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

export function BlogShell({ children, back }: { children: ReactNode; back: { to: "/" | "/blog"; label: string } }) {
  const { lang, setLang } = useLanguage();
  const ru = lang === "ru";
  const [legal, setLegal] = useState<LegalKind | null>(null);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", window.localStorage.getItem("dikunova-theme") === "dark");
  }, []);
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 grid h-20 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:grid-cols-[1fr_auto_1fr] md:px-8">
        <Link to={back.to} aria-label={ru ? back.label : back.to === "/" ? "Home" : "Blog"} className="flex w-fit items-center gap-2 text-xs uppercase tracking-[.18em] hover:text-red-accent"><ArrowLeft className="size-4" /><span className="hidden sm:inline">{ru ? back.label : back.to === "/" ? "Home" : "Blog"}</span></Link>
        <Link to="/" className="min-w-0 truncate whitespace-nowrap text-center"><span data-font-block="header" className="font-display text-[17px] tracking-[.1em] sm:text-2xl sm:tracking-[.16em]">{ru ? "НАТАЛЬЯ ДИКУНОВА" : "NATALIA DIKUNOVA"}</span> <span className="font-sans font-light text-red-accent">/</span> <span data-font-block="headerArtist" className="font-sans text-xs lowercase tracking-[.2em] opacity-60 sm:text-sm">artist</span></Link>
        <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => setLang(ru ? "en" : "ru")} aria-label={ru ? "Switch to English" : "Переключить на русский"}>{lang.toUpperCase()}</Button></div>
      </header>
      <div className="px-5 pb-24 pt-32 md:px-8">
        <div className="mb-6"><ScrollHint direction="y" label={ru ? "Прокрутите вниз" : "Scroll down"} /></div>
        {children}
      </div>
      <footer data-font-block="footer" className="relative overflow-hidden bg-ink px-5 pt-16 text-paper md:px-8 md:pt-24">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="font-display text-4xl md:text-6xl">{ru ? "Контакты" : "Contact"}</h2>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[.18em]">
              <Link to="/" className="hover:text-red-accent">{ru ? "Главная" : "Home"}</Link>
              <Link to="/about" className="hover:text-red-accent">{ru ? "Об авторе" : "About"}</Link>
              <Link to="/blog" className="hover:text-red-accent">{ru ? "Блог" : "Blog"}</Link>
            </nav>
          </div>
          <div className="space-y-3 text-lg">
            <a className="block border-b border-paper/30 pb-3 hover:text-red-accent" href="mailto:morrasdream@gmail.com">morrasdream@gmail.com</a>
            <a className="block border-b border-paper/30 pb-3 hover:text-red-accent" href="tel:+79268215342">+7 926 821-53-42</a>
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-3 text-xs uppercase tracking-[.18em]">
              <a href="https://www.instagram.com/natasha_dikunova_zipalova" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-red-accent">Instagram<ArrowUpRight className="size-3" /></a>
              <a href="https://www.facebook.com/share/15dxi5pfo6/" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-red-accent">Facebook<ArrowUpRight className="size-3" /></a>
              <a href="https://t.me/Natasha_Dikunova_Zipalova" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-red-accent">Telegram<ArrowUpRight className="size-3" /></a>
            </div>
          </div>
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-paper/25 pt-5 text-xs">
          <span>© 2026 {ru ? "Наталья Дикунова" : "Natalia Dikunova"}</span>
          <span className="flex flex-wrap gap-x-6 gap-y-2">{(["privacy", "terms"] as const).map((kind) => <Button key={kind} variant="link" onClick={() => setLegal(kind)} className="h-auto whitespace-normal p-0 text-left text-xs text-paper/80 hover:text-red-accent">{legalDocuments[lang][kind].title}</Button>)}</span>
        </div>
        <button type="button" onClick={() => smooth(0)} aria-label={ru ? "В начало" : "To top"} className="-mx-5 mt-8 block w-[calc(100%+2.5rem)] overflow-hidden transition-colors hover:text-red-accent md:-mx-8 md:w-[calc(100%+4rem)]">
          <svg data-font-block="footerLogo" viewBox="0 0 1000 164" preserveAspectRatio="none" aria-hidden="true" className="block h-auto w-full font-display"><text x="500" y="154" textAnchor="middle" textLength="992" lengthAdjust="spacingAndGlyphs" fill="currentColor" style={{ fontSize: "200px" }}>DIKUNOVA</text></svg>
        </button>
      </footer>
      <div className="fixed bottom-4 right-3 z-40 flex flex-col gap-1.5 md:bottom-5 md:right-5 md:gap-2">
        <button onClick={() => smooth(0)} aria-label={ru ? "В начало" : "To top"} className="grid size-9 place-items-center border border-border bg-background/80 text-foreground backdrop-blur-md transition-colors hover:border-red-accent hover:text-red-accent md:size-11"><ArrowUp className="size-4" /></button>
        <button onClick={() => smooth(document.documentElement.scrollHeight)} aria-label={ru ? "В конец" : "To bottom"} className="grid size-9 place-items-center border border-border bg-background/80 text-foreground backdrop-blur-md transition-colors hover:border-red-accent hover:text-red-accent md:size-11"><ArrowDown className="size-4" /></button>
      </div>
      {legal && <LegalModal kind={legal} lang={lang} onClose={() => setLegal(null)} />}
    </main>
  );
}
