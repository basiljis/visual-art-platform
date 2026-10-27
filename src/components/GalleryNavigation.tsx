import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import type { MenuPlacement } from "@/lib/gallery-layout";

type Item = { key: string; ru: string; en: string };
type Category = Item & { children: Item[] };
type Props = {
  placement: MenuPlacement; lang: "ru" | "en"; categories: Category[];
  category: string; project: string; query: string;
  collapsed: boolean; onToggle: () => void;
  onCategory: (key: string) => void; onProject: (parent: string, key: string) => void; onQuery: (value: string) => void;
};

export function GalleryNavigation({ placement, lang, categories, category, project, query, collapsed, onToggle, onCategory, onProject, onQuery }: Props) {
  const side = placement === "side";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pick = (fn: () => void) => () => { fn(); setMobileOpen(false); };
  const current = categories.find(c => c.key === category);
  const label = lang === "ru" ? "Направления" : "Practices";
  const items: Category[] = [{ key: "all", ru: "Все", en: "All", children: [] }, ...categories];
  const control = "h-auto min-h-8 whitespace-normal rounded-none p-0 text-left font-normal leading-relaxed hover:bg-transparent hover:text-red-accent";
  const toggleLabel = lang === "ru" ? (collapsed ? "Развернуть меню направлений" : "Свернуть меню направлений") : (collapsed ? "Expand practices menu" : "Collapse practices menu");
  return <nav aria-label={label} data-font-block="filters" className={side ? `mb-4 min-w-0 md:sticky md:top-24 md:mb-0 md:max-h-[calc(100dvh-7rem)] md:overflow-y-auto md:border-y-0 md:py-0 ${collapsed ? "" : "md:border-r md:pr-6"}` : "mb-4 md:mb-16 md:border-y md:border-border md:py-5"}>
    <div className="mb-2 flex gap-2 md:hidden"><Button variant="ghost" onClick={() => { setMobileOpen(v => !v); setSearchOpen(false); }} aria-expanded={mobileOpen} aria-controls="gallery-navigation-controls" className="flex h-11 min-w-0 flex-1 items-center justify-between rounded-none border border-border px-4 text-[11px] font-normal uppercase tracking-[.18em] hover:bg-transparent hover:text-red-accent md:hidden">
      <span className="flex min-w-0 items-center gap-2"><span className="font-semibold text-foreground">{label}</span><span className="truncate text-red-accent">{current ? current[lang] : (lang === "ru" ? "Все" : "All")}</span></span>
      {mobileOpen ? <X className="size-5 shrink-0" strokeWidth={2.5} /> : <Menu className="size-5 shrink-0" strokeWidth={2.5} />}
    </Button><Button variant="ghost" size="icon" onClick={() => { setSearchOpen(v => !v); setMobileOpen(false); }} aria-expanded={searchOpen || !!query} aria-label={lang === "ru" ? "Поиск по названию" : "Search by title"} className={`size-11 shrink-0 rounded-none border border-border hover:bg-transparent hover:text-red-accent ${searchOpen || query ? "text-red-accent" : ""}`}><Search className="size-4" /></Button></div>
    <div className={`hidden items-center justify-between gap-2 md:flex ${side ? "md:h-4" : ""} ${side && collapsed ? "" : "mb-4"}`}>
      {(!side || !collapsed) && <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-foreground">{label}</p>}
      {side && <Button variant="ghost" size="icon" onClick={onToggle} aria-label={toggleLabel} title={toggleLabel} aria-expanded={!collapsed} aria-controls="gallery-navigation-controls" className="size-8 shrink-0 rounded-none text-muted-foreground hover:bg-transparent hover:text-red-accent">{collapsed ? <ChevronRight strokeWidth={2.5} /> : <ChevronLeft strokeWidth={2.5} />}</Button>}
    </div>
    <div id="gallery-navigation-controls" className={side && collapsed ? "md:hidden" : ""}>
    <div className={side ? "flex flex-col gap-3 md:gap-6" : "flex flex-wrap items-center justify-between gap-3 md:gap-4"}>
      <div className={`${mobileOpen ? "" : "max-md:hidden"} max-md:w-full max-md:border max-md:border-border max-md:px-4 max-md:py-2 ` + (side ? "flex flex-wrap gap-x-5 gap-y-0 md:flex-col md:items-stretch md:gap-1" : "flex flex-wrap gap-x-5 gap-y-0 md:gap-x-6 md:gap-y-3")}>
        {items.map(cat => <div key={cat.key} className={side ? "group/sub relative min-w-0" : "group/sub relative"}>
          <Button variant="ghost" aria-pressed={category === cat.key} onClick={() => { onCategory(cat.key); if (!cat.children.length) setMobileOpen(false); }} className={`${control} justify-start text-sm ${side ? "md:w-full" : ""} ${category === cat.key ? "text-red-accent" : "text-foreground/70"}`}>{cat[lang]}</Button>
          {!side && cat.children.length > 0 && <div className="invisible absolute left-0 top-full z-30 pt-3 opacity-0 transition-opacity duration-200 group-hover/sub:visible group-hover/sub:opacity-100 group-focus-within/sub:visible group-focus-within/sub:opacity-100 [@media(hover:none)]:hidden"><div className="flex w-max max-w-80 flex-col gap-1 border border-border bg-background p-3 shadow-sm">{cat.children.map(p => <Button key={p.key} variant="ghost" onClick={() => onProject(cat.key, p.key)} className={`${control} justify-start text-xs`}><span className="text-red-accent">/</span>{p[lang]}</Button>)}</div></div>}
          {side && category === cat.key && cat.children.length > 0 && <div className="hidden flex-col items-stretch gap-1 border-l border-border pl-3 md:my-2 md:flex">{[{ key: "all", ru: "Все проекты", en: "All projects" }, ...cat.children].map(p => <Button key={p.key} variant="ghost" aria-pressed={project === p.key} onClick={() => onProject(cat.key, p.key)} className={`${control} justify-start text-xs ${project === p.key ? "text-red-accent" : "text-muted-foreground"}`}>{p[lang]}</Button>)}</div>}
        </div>)}
      </div>
      <label data-font-block="body" className={`${searchOpen || query ? "flex" : "max-md:hidden flex"} w-full items-center gap-2 border-b border-border pb-1 focus-within:border-red-accent ${side ? "" : "sm:w-64"}`}>
        <span className="text-xs text-red-accent">/</span><input type="search" autoFocus={searchOpen} value={query} onChange={e => onQuery(e.target.value)} placeholder={lang === "ru" ? "Поиск по названию" : "Search by title"} aria-label={lang === "ru" ? "Поиск по названию работы" : "Search by work title"} className="min-w-0 w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
        {query && <Button variant="ghost" size="icon" onClick={() => onQuery("")} aria-label={lang === "ru" ? "Очистить" : "Clear"} className="size-6 shrink-0 hover:bg-transparent hover:text-red-accent"><X /></Button>}
      </label>
    </div>
    {!!current?.children.length && <div className={`-mx-5 mt-3 flex snap-x gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:mt-5 md:flex-wrap md:gap-x-5 md:gap-y-3 md:overflow-visible md:border-t md:border-border md:px-0 md:pt-4 ${side ? "md:hidden" : ""}`}>{[{ key: "all", ru: "Все проекты", en: "All projects" }, ...current.children].map(p => <Button key={p.key} variant="ghost" aria-pressed={project === p.key} onClick={pick(() => onProject(category, p.key))} className={`${control} shrink-0 snap-start whitespace-nowrap text-xs max-md:min-h-9 max-md:border max-md:px-3 max-md:py-1.5 ${project === p.key ? "text-red-accent max-md:border-red-accent" : "text-muted-foreground max-md:border-border"}`}><span className="mr-1 text-red-accent md:hidden">/</span>{p[lang]}</Button>)}</div>}
    </div>
  </nav>;
}