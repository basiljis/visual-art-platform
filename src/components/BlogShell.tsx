import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function BlogShell({ children, back }: { children: ReactNode; back: { to: "/" | "/blog"; label: string } }) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", window.localStorage.getItem("dikunova-theme") === "dark");
  }, []);
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 grid h-20 grid-cols-[1fr_auto_1fr] items-center border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-8">
        <Link to={back.to} className="flex w-fit items-center gap-2 text-xs uppercase tracking-[.18em]"><ArrowLeft className="size-4" /><span className="hidden sm:inline">{back.label}</span></Link>
        <Link to="/" className="whitespace-nowrap text-center font-display text-[11px] tracking-[.12em] sm:text-lg sm:tracking-[.18em]">НАТАЛЬЯ ДИКУНОВА <span className="font-sans font-light text-red-accent">/</span> <span className="font-sans text-[10px] lowercase tracking-[.2em] opacity-60 sm:text-xs">artist</span></Link>
        <span />
      </header>
      <div className="px-5 pb-24 pt-32 md:px-8">{children}</div>
      <footer className="bg-ink px-5 py-10 text-xs uppercase tracking-[.18em] text-paper md:px-8">
        <div className="flex flex-wrap justify-between gap-4"><span>© 2026 Наталья Дикунова</span><span className="flex gap-5"><a href="https://www.instagram.com/natasha_dikunova_zipalova" target="_blank" rel="noreferrer" className="hover:text-red-accent">Instagram</a><a href="https://www.facebook.com/share/15dxi5pfo6/" target="_blank" rel="noreferrer" className="hover:text-red-accent">Facebook</a><a href="https://t.me/Natasha_Dikunova_Zipalova" target="_blank" rel="noreferrer" className="hover:text-red-accent">Telegram</a></span></div>
      </footer>
    </main>
  );
}
