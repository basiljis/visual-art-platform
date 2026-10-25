import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
  const current = categories.find(c => c.key === category);
  const label = lang === "ru" ? "Направления" : "Practices";
  const items: Category[] = [{ key: "all", ru: "Все", en: "All", children: [] }, ...categories];
  const control = "h-auto min-h-8 whitespace-normal rounded-none p-0 text-left font-normal leading-relaxed hover:bg-transparent hover:text-red-accent";
  const toggleLabel = lang === "ru" ? (collapsed ? "Развернуть меню направлений" : "Свернуть меню направлений") : (collapsed ? "Expand practices menu" : "Collapse practices menu");
  return <nav aria-label={label} data-font-block="filters" className={side ? `mb-10 min-w-0 border-y border-border py-5 md:sticky md:top-24 md:mb-0 md:max-h-[calc(100dvh-7rem)] md:overflow-y-auto md:border-y-0 md:py-0 ${collapsed ? "" : "md:border-r md:pr-6"}` : "mb-16 border-y border-border py-5"}>
    <div className={`flex items-center justify-between gap-2 ${side ? "md:h-4" : ""} ${side && collapsed ? "" : "mb-4"}`}>
      {(!side || !collapsed) && <p className="text-[11px] uppercase tracking-[.18em] text-muted-foreground">{label}</p>}
      {side && <Button variant="ghost" size="icon" onClick={onToggle} aria-label={toggleLabel} title={toggleLabel} aria-expanded={!collapsed} aria-controls="gallery-navigation-controls" className="size-8 shrink-0 rounded-none text-muted-foreground hover:bg-transparent hover:text-red-accent">{collapsed ? <ChevronRight strokeWidth={1} /> : <ChevronLeft strokeWidth={1} />}</Button>}
      {side && collapsed && <span className="text-[11px] uppercase text-muted-foreground md:hidden">{label}</span>}
    </div>
    <div id="gallery-navigation-controls" hidden={side && collapsed}>
    <div className={side ? "flex flex-col gap-6" : "flex flex-wrap items-center justify-between gap-4"}>
      <div className={side ? "flex flex-wrap gap-x-6 gap-y-2 md:flex-col md:items-stretch md:gap-1" : "flex flex-wrap gap-x-6 gap-y-3"}>
        {items.map(cat => <div key={cat.key} className={side ? "group/sub relative min-w-0" : "group/sub relative"}>
          <Button variant="ghost" aria-pressed={category === cat.key} onClick={() => onCategory(cat.key)} className={`${control} justify-start text-sm ${side ? "md:w-full" : ""} ${category === cat.key ? "text-red-accent" : "text-foreground/70"}`}>{cat[lang]}</Button>
          {!side && cat.children.length > 0 && <div className="invisible absolute left-0 top-full z-30 pt-3 opacity-0 transition-opacity duration-200 group-hover/sub:visible group-hover/sub:opacity-100 group-focus-within/sub:visible group-focus-within/sub:opacity-100 [@media(hover:none)]:hidden"><div className="flex w-max max-w-80 flex-col gap-1 border border-border bg-background p-3 shadow-sm">{cat.children.map(p => <Button key={p.key} variant="ghost" onClick={() => onProject(cat.key, p.key)} className={`${control} justify-start text-xs`}><span className="text-red-accent">/</span>{p[lang]}</Button>)}</div></div>}
          {side && category === cat.key && cat.children.length > 0 && <div className="hidden flex-col items-stretch gap-1 border-l border-border pl-3 md:my-2 md:flex">{[{ key: "all", ru: "Все проекты", en: "All projects" }, ...cat.children].map(p => <Button key={p.key} variant="ghost" aria-pressed={project === p.key} onClick={() => onProject(cat.key, p.key)} className={`${control} justify-start text-xs ${project === p.key ? "text-red-accent" : "text-muted-foreground"}`}>{p[lang]}</Button>)}</div>}
        </div>)}
      </div>
      <label data-font-block="body" className={`flex w-full items-center gap-2 border-b border-border pb-1 focus-within:border-red-accent ${side ? "" : "sm:w-64"}`}>
        <span className="text-xs text-red-accent">/</span><input type="search" value={query} onChange={e => onQuery(e.target.value)} placeholder={lang === "ru" ? "Поиск по названию" : "Search by title"} aria-label={lang === "ru" ? "Поиск по названию работы" : "Search by work title"} className="min-w-0 w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
        {query && <Button variant="ghost" size="icon" onClick={() => onQuery("")} aria-label={lang === "ru" ? "Очистить" : "Clear"} className="size-6 shrink-0 hover:bg-transparent hover:text-red-accent"><X /></Button>}
      </label>
    </div>
    {!!current?.children.length && <div className={`mt-5 flex flex-wrap gap-x-5 gap-y-3 border-t border-border pt-4 ${side ? "md:hidden" : ""}`}>{[{ key: "all", ru: "Все проекты", en: "All projects" }, ...current.children].map(p => <Button key={p.key} variant="ghost" aria-pressed={project === p.key} onClick={() => onProject(category, p.key)} className={`${control} text-xs ${project === p.key ? "text-red-accent" : "text-muted-foreground"}`}>{p[lang]}</Button>)}</div>}
    </div>
  </nav>;
}