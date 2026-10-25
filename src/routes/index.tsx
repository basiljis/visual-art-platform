import { EnquiryModal } from "@/components/EnquiryModal";
import { LegalModal } from "@/components/LegalModal";
import { Button } from "@/components/ui/button";
import { legalDocuments, type LegalKind } from "@/lib/legal";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { galleryQuery, postsQuery, type CategoryRow, type WorkRow } from "@/lib/content.functions";
import { mediaUrl } from "@/lib/media";
import { ArrowDown, ArrowUp, ArrowLeft, ArrowRight, ArrowUpRight, Menu, Moon, Settings, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import signatureAsset from "@/assets/signature-clean.png.asset.json";
import type { AboutContent } from "@/lib/about";
import portraitAsset from "@/assets/artist-about-photo.png.asset.json";
import { ZoomImage, InteriorView, parseSize } from "@/components/ViewerStage";
import { absoluteImage, breadcrumbs, pageUrl, visualArtwork } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: ({ loaderData }: { loaderData?: { ogImage?: string | undefined; artwork?: { name: string; image?: string | undefined; technique?: string | undefined; year?: string | undefined } | undefined } | undefined }) => ({ meta: [
    { title: "Наталья Дикунова — живопись и графика" },
    { name: "description", content: "Галерея живописи и печатной графики художника Натальи Дикуновой." },
    { property: "og:title", content: "Наталья Дикунова — живопись и графика" },
    { property: "og:description", content: "Галерея живописи и печатной графики художника Натальи Дикуновой." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: pageUrl("/") },
    { name: "twitter:card", content: "summary_large_image" },
    ...(loaderData?.ogImage ? [{ property: "og:image", content: loaderData.ogImage }, { name: "twitter:image", content: loaderData.ogImage }] : []),
  ],
    links: [{ rel: "canonical", href: pageUrl("/") }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(breadcrumbs([
        { name: "Главная", path: "/" }, { name: "Работы", path: "/#works" },
      ])) },
      ...(loaderData?.artwork ? [{ type: "application/ld+json", children: JSON.stringify(visualArtwork(loaderData.artwork)) }] : []),
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { category?: string | undefined } => ({ category: typeof s["category"] === "string" && s["category"] ? s["category"] : undefined }),
  loader: async ({ context }) => {
    const [gallery] = await Promise.all([context.queryClient.ensureQueryData(galleryQuery), context.queryClient.ensureQueryData(postsQuery)]);
    const g = gallery as { works: WorkRow[] };
    // Превью для соцсетей: автопортрет тушью (первая картина карусели), иначе главная работа, иначе первая
    const best = g.works.find((w) => /АВТОПОРТРЕТ|SELF-PORTRAIT/i.test(w.title_ru)) ?? g.works.find((w) => w.hero) ?? g.works[0];
    const ogImage = absoluteImage(best?.image);
    return {
      ogImage,
      artwork: best ? { name: best.title_ru, image: ogImage, technique: best.technique || undefined, year: best.year || undefined } : undefined,
    };
  },
  errorComponent: () => <div className="grid min-h-screen place-items-center p-8 text-sm">Не удалось загрузить галерею. Обновите страницу.</div>,
  component: Index,
});

type Lang = "ru" | "en";
type Category = string;
type Work = { id: string; image: string; category: string; project: string | undefined; cover: boolean; hero: boolean; ru: string; en: string; year: string; size: string; technique: string; status: string };
type Cat = { key: string; ru: string; en: string; noteRu: string; noteEn: string; children: { key: string; ru: string; en: string }[] };
const statusLabels: Record<Lang, Record<string, string>> = {
  ru: { available: "В продаже", "for-sale": "В продаже", sold: "Продана", private: "В частной коллекции", "on-request": "По запросу" },
  en: { available: "For sale", "for-sale": "For sale", sold: "Sold", private: "Private collection", "on-request": "On request" },
};
const statusLabel = (status: string, lang: Lang) => statusLabels[lang][status] ?? "";
function buildGallery(data: { categories: CategoryRow[]; works: WorkRow[] }) {
  const top = data.categories.filter((c) => !c.parent_key);
  const cats: Cat[] = top.map((c) => ({ key: c.key, ru: c.name_ru, en: c.name_en, noteRu: c.description_ru, noteEn: c.description_en, children: data.categories.filter((s) => s.parent_key === c.key).map((s) => ({ key: s.key, ru: s.name_ru, en: s.name_en })) }));
  const works: Work[] = data.works.map((w) => ({ id: w.id, image: mediaUrl(w.image), category: w.category_key, project: w.project_key ?? undefined, cover: w.cover, hero: w.hero, ru: w.title_ru, en: w.title_en || w.title_ru, year: w.year, size: w.size, technique: w.technique ?? "", status: w.status ?? "" }));
  return { cats, works };
}
const copy = {
  ru: { artist: "НАТАЛЬЯ ДИКУНОВА", subtitle: "Художник · Москва / Воронеж", works: "Работы", about: "Об авторе", contact: "Контакты", all: "Все работы", filters: "Направления", buy: "Узнать о покупке", breadcrumb: "Главная / Работы", more: "Подробнее", close: "Закрыть", intro: "Живопись, рисунок и печатная графика о мифе и реальности.", note: "Работы находятся в частных коллекциях России, Европы, США, Индии и Китая, а также в музеях России и Китая.", achievements: "Royal Society of British Artists · 1-е место DEG Exlibris · Guanlan Printmaking Base 2025", categories: ["Все", "Миф артиста", "Китай", "Портреты", "Дети", "Ню", "Печатная графика", "Разное"] },
  en: { artist: "NATALIA DIKUNOVA", subtitle: "Artist · Moscow / Voronezh", works: "Works", about: "About", contact: "Contact", all: "All works", filters: "Practices", buy: "Purchase enquiry", breadcrumb: "Home / Works", more: "More", close: "Close", intro: "Painting, drawing and printmaking about myth and reality.", note: "Works are held in private collections across Russia, Europe, the USA, India and China, as well as museums in Russia and China.", achievements: "Royal Society of British Artists · DEG Exlibris 1st prize · Guanlan Printmaking Base 2025", categories: ["All", "Artist’s myth", "China", "Portraits", "Children", "Nude", "Printmaking", "Other"] },
};


function Index() {
  const [lang, setLang] = useState<Lang>("ru");
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerNameVisible, setHeaderNameVisible] = useState(false);
  const search = Route.useSearch();
  const [category, setCategory] = useState<Category>(search.category ?? "all");
  const [query, setQuery] = useState("");
  const [project, setProject] = useState<string>("all");
  const [ready, setReady] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState<LegalKind | null>(null);
  const [descOpen, setDescOpen] = useState(false);
  const [curatorOpen, setCuratorOpen] = useState(false);
  const [enquiry, setEnquiry] = useState<string | null>(null);
  const { data: gallery } = useSuspenseQuery(galleryQuery);
  const { data: posts } = useSuspenseQuery(postsQuery);
  const { cats, works } = buildGallery(gallery);
  const heroWorks = works.map((w, i) => (w.hero ? i : -1)).filter((i) => i >= 0);
  if (!heroWorks.length && works.length) heroWorks.push(0);
  // Автопортрет тушью всегда первый в сменяющихся картинах
  const selfIdx = works.findIndex((w) => /АВТОПОРТРЕТ|SELF-PORTRAIT/i.test(w.ru));
  if (selfIdx >= 0) {
    const at = heroWorks.indexOf(selfIdx);
    if (at > 0) heroWorks.splice(at, 1);
    if (at !== 0) heroWorks.unshift(selfIdx);
  }
  const heroIndex = heroWorks[0] ?? 0;
  const heroWork: Work | undefined = works[heroIndex] ?? works[0];
  const parentOf = (key: string) => cats.find((c) => c.key === key);
  const hasSub = (key: string) => (parentOf(key)?.children.length ?? 0) > 0;
  const [markInView, setMarkInView] = useState(false);
  useEffect(() => {
    const updateHeaderName = () => setHeaderNameVisible(window.scrollY > 20);
    updateHeaderName();
    window.addEventListener("scroll", updateHeaderName, { passive: true });
    return () => window.removeEventListener("scroll", updateHeaderName);
  }, []);
  useEffect(() => {
    const el = document.getElementById("footer-mark");
    if (!el) return;
    const io = new IntersectionObserver((entries) => setMarkInView(!!entries[0]?.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const savedLang = window.localStorage.getItem("dikunova-lang");
    const savedTheme = window.localStorage.getItem("dikunova-theme");
    if (savedLang === "ru" || savedLang === "en") setLang(savedLang);
    setDark(savedTheme === "dark");
    setReady(true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    if (ready) window.localStorage.setItem("dikunova-theme", dark ? "dark" : "light");
  }, [dark, ready]);
  useEffect(() => { if (ready) window.localStorage.setItem("dikunova-lang", lang); }, [lang, ready]);
  // Переход из блога по тематике: /?category=key
  useEffect(() => {
    if (!search.category) return;
    setCategory(search.category);
    setProject("all");
    requestAnimationFrame(() => document.getElementById("works")?.scrollIntoView());
  }, [search.category]);

  const t = copy[lang];
  const filtered = category === "all" ? works : works.filter((work) => work.category === category && (!hasSub(category) || (project === "all" ? (work.cover || !works.some((x) => x.category === category && x.cover)) : work.project === project)));
  const q = query.trim().toLowerCase();
  const featured = [...works.filter((w) => w.hero), ...works.filter((w) => !w.hero && (!hasSub(w.category) || w.cover))].slice(0, 12);
  const rowOf = (key: string) => gallery.categories.find((r) => r.key === key);
  const L = (r: CategoryRow | undefined, f: "curator" | "exhibited") => (r ? (lang === "ru" ? r[`${f}_ru`] : r[`${f}_en`]) ?? "" : "");
  const visible = q ? works.filter((w) => `${w.ru} ${w.en}`.toLowerCase().includes(q)) : category === "all" ? featured : filtered;
  const openProject = (parent: string, key: string) => { setCategory(parent); setProject(key); document.getElementById("works")?.scrollIntoView({ behavior: "smooth" }); };
  const relatedPosts = category !== "all" && !q ? posts.filter((p) => (p.topic_keys ?? []).includes(category)) : [];

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="site-preloader pointer-events-none fixed inset-0 z-[100] flex animate-preloader flex-col items-center justify-center overflow-hidden bg-ink text-paper" aria-hidden="true">
        <div className="paper-grain absolute inset-0" />
        {/* Signature drawn stroke by stroke: an animated pen path reveals the original ink image */}
        <svg viewBox="0 0 400 800" className="relative h-56 w-56 md:h-72 md:w-72">
          <defs>
            <mask id="preloader-sign-mask" maskUnits="userSpaceOnUse">
              <g fill="none" stroke="#fff" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round">
                <path className="sign-stroke" pathLength={1} d="M28 310 L185 196 L72 368 L170 240 L122 380 L198 236 L155 392 L225 255 L192 476 L245 290 L270 200 L304 102 L282 170 L270 230 C285 280 300 285 332 300 L270 375 C255 400 262 408 300 412 C320 418 310 470 302 520 C300 580 360 640 368 720 L366 775 L356 762" />
                <circle className="sign-dot" pathLength={1} cx="270" cy="318" r="10" />
              </g>
            </mask>
          </defs>
          <image href={signatureAsset.url} width="400" height="800" mask="url(#preloader-sign-mask)" />
        </svg>
        <p data-font-block="preloader" className="relative mt-6 font-display text-lg tracking-[.18em]">{t.artist} <span className="font-sans font-light text-red-accent">/</span> <span className="font-sans text-xs lowercase tracking-[.24em] opacity-60">artist</span></p>
      </div>

      <header className="fixed inset-x-0 top-0 z-50 grid h-20 grid-cols-[1fr_auto_1fr] items-center border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-8">
        <div className="flex items-center gap-4"><button aria-label={lang==="ru"?"Меню":"Menu"} data-tip={lang==="ru"?"Меню":"Menu"} onClick={() => setMenuOpen(true)} className="flex w-fit items-center gap-2 text-xs uppercase tracking-[.18em]"><Menu className="size-5"/><span className="hidden sm:inline">Menu</span></button></div>
        <a href="#top" data-font-block="header" aria-hidden={!headerNameVisible} tabIndex={headerNameVisible ? 0 : -1} className={`whitespace-nowrap text-center font-display [-webkit-text-stroke:0.4px_currentColor] sm:[-webkit-text-stroke:0] text-[15px] tracking-[.1em] sm:text-lg sm:tracking-[.18em] transition-opacity duration-300 motion-reduce:transition-none ${headerNameVisible ? "visible opacity-100" : "invisible pointer-events-none opacity-0"}`}>{t.artist}<span className="hidden sm:inline"> <span className="font-sans font-light text-red-accent">/</span> <span className="font-sans text-xs lowercase tracking-[.2em] opacity-60">artist</span></span></a>
        <div className="flex justify-end gap-1">
          <button onClick={() => setLang(lang === "ru" ? "en" : "ru")} className="h-9 w-10 text-xs font-semibold uppercase" aria-label={lang==="ru"?"Switch to English":"Переключить на русский"} data-tip={lang==="ru"?"Switch to English":"Переключить на русский"}>{lang}</button>
          <button onClick={() => setDark(!dark)} className="grid size-9 place-items-center" aria-label={lang==="ru"?(dark?"Светлая тема":"Тёмная тема"):(dark?"Light theme":"Dark theme")} data-tip={lang==="ru"?(dark?"Светлая тема":"Тёмная тема"):(dark?"Light theme":"Dark theme")}>{dark ? <Sun className="size-4"/> : <Moon className="size-4"/>}</button>
        </div>
      </header>

      <div className={`fixed inset-0 z-[80] bg-ink text-paper transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)] ${menuOpen ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-paper/20 px-5 md:px-8"><span className="text-xs uppercase tracking-[.2em]">Navigation</span><button onClick={() => setMenuOpen(false)} aria-label={lang==="ru"?"Закрыть меню":"Close menu"} data-tip={lang==="ru"?"Закрыть меню":"Close menu"} className="transition-colors duration-300 hover:text-red-accent"><X className="size-7"/></button></div>
        <nav className="flex h-[calc(100%-5rem)] flex-col justify-between px-5 py-8 md:px-10">
          <div data-font-block="navigation" className="flex flex-col">
            {[t.works,t.about,t.contact].map((item, i) => <a key={item} href={i===0?"#works":i===1?"#about":"#contact"} onClick={() => setMenuOpen(false)} className="group flex items-center justify-between border-b border-paper/25 py-3 font-display text-[clamp(2.5rem,8vw,7.5rem)] leading-none transition-colors duration-300 hover:border-red-accent hover:text-red-accent"><span>{item}</span><ArrowUpRight className="size-8 text-red-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:size-14"/></a>)}
            <Link to="/blog" onClick={() => setMenuOpen(false)} className="group flex items-center justify-between border-b border-paper/25 py-3 font-display text-[clamp(2.5rem,8vw,7.5rem)] leading-none transition-colors duration-300 hover:border-red-accent hover:text-red-accent"><span>{lang==="ru"?"Блог":"Blog"}</span><ArrowUpRight className="size-8 text-red-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:size-14"/></Link>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] uppercase tracking-[.18em]"><span>© 2026</span><span className="flex gap-4"><a href="https://www.instagram.com/natasha_dikunova_zipalova" target="_blank" rel="noreferrer" className="transition-colors duration-300 hover:text-red-accent">Instagram</a><a href="https://www.facebook.com/share/15dxi5pfo6/" target="_blank" rel="noreferrer" className="transition-colors duration-300 hover:text-red-accent">Facebook</a><a href="https://t.me/Natasha_Dikunova_Zipalova" target="_blank" rel="noreferrer" className="transition-colors duration-300 hover:text-red-accent">Telegram</a></span></div>
        </nav>
      </div>

      <section id="top" className="relative bg-portrait-paper pt-20 text-ink">
        <div className="relative grid min-h-[calc(100dvh-5rem)] grid-cols-[30%_70%] md:grid-cols-[28%_72%]">
          <div className="relative overflow-hidden">
            {heroWork && <a href="#works" onClick={(e) => { e.preventDefault(); setViewer(heroIndex); }} aria-label={heroWork[lang]} className="absolute inset-0 block">
              <img src={heroWork.image} alt={heroWork[lang]} className="intro-portrait h-full w-full object-cover object-[65%_center]" />
            </a>}
          </div>
          <div className="relative flex min-w-0 flex-col justify-center px-5 py-10 md:px-16 md:py-12 lg:px-24">
            <div className="mb-6">
              <span aria-hidden className="mb-5 block h-40 w-24 bg-sanguine md:h-56 md:w-36" style={{ WebkitMaskImage: `url(${signatureAsset.url})`, WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center", maskImage: `url(${signatureAsset.url})`, maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center" }} />
              <h1 data-font-block="header" className="mb-5 font-sans text-3xl font-light leading-tight md:text-6xl">{lang === "ru" ? <>Наташа<br />Дикунова</> : <>Natasha<br />Dikunova</>}</h1>
              <p data-font-block="intro" className="max-w-lg text-base leading-relaxed md:text-2xl">{t.intro}</p>
            </div>
            <a href="#works" data-font-block="body" onClick={(e) => { const el = document.getElementById("works"); if (!el) return; e.preventDefault(); const y = el.getBoundingClientRect().top + window.scrollY - 64; if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) window.scrollTo(0, y); else slowScroll(y); }} className="flex w-fit items-center gap-3 border-b border-current pb-1 text-xs uppercase tracking-[.18em] hover:text-red-accent">{t.all}<ArrowDown className="size-4"/></a>
          </div>
        </div>
      </section>

      <section id="works" className="border-t border-border px-5 pb-20 pt-8 md:px-8 md:pb-28 md:pt-10">
        <div className="mb-14 flex items-end justify-between gap-6"><div><p data-font-block="body" className="mb-4 text-[10px] uppercase tracking-[.18em] text-muted-foreground">{t.breadcrumb}</p><h1 className="font-display text-5xl md:text-8xl">{t.works}</h1></div><span className="text-sm tabular-nums">{String(visible.length).padStart(2,"0")}</span></div>
        <div data-font-block="filters" className="mb-16 border-y border-border py-5">
          <p className="mb-4 text-[11px] uppercase tracking-[.18em] text-muted-foreground">{t.filters}</p>
          <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-3">{[{ key: "all", ru: "Все", en: "All", children: [] as Cat["children"] }, ...cats].map((cat)=>{const key=cat.key; const btn=<button key={key} onClick={()=>{setCategory(key); setProject("all");}} className={`text-sm transition-opacity ${category===key?"opacity-100 underline underline-offset-8":"opacity-70 hover:opacity-100"}`}>{cat[lang]}</button>; return !cat.children.length?btn:(
            <div key={key} className="group/sub relative">{btn}
              <div className="invisible absolute left-0 top-full z-30 pt-3 [@media(hover:none)]:hidden opacity-0 transition-opacity duration-200 group-hover/sub:visible group-hover/sub:opacity-100 group-focus-within/sub:visible group-focus-within/sub:opacity-100">
                <div className="flex w-max flex-col gap-1 border border-border bg-background p-3 shadow-sm">{cat.children.map((p)=><button key={p.key} onClick={()=>openProject(key, p.key)} className="text-left text-xs uppercase tracking-[.12em] opacity-70 transition-colors hover:text-red-accent hover:opacity-100"><span className="text-red-accent">/ </span>{p[lang]}</button>)}</div>
              </div>
            </div>);})}</div>
            <label data-font-block="body" className="flex w-full items-center gap-2 border-b border-border pb-1 transition-colors focus-within:border-red-accent sm:w-64">
              <span className="text-xs text-red-accent">/</span>
              <input type="search" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={lang==="ru"?"Поиск по названию":"Search by title"} aria-label={lang==="ru"?"Поиск по названию работы":"Search by work title"} className="w-full bg-transparent text-xs uppercase tracking-[.12em] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground" />
              {query && <button type="button" onClick={()=>setQuery("")} aria-label={lang==="ru"?"Очистить":"Clear"} data-tip={lang==="ru"?"Очистить":"Clear"} className="text-xs opacity-50 hover:opacity-100">✕</button>}
            </label>
          </div>
          {hasSub(category) && (
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-4">
              <span className="text-[10px] uppercase tracking-[.18em] text-red-accent">/</span>
              {[{ key: "all", ru: "Все проекты", en: "All projects" }, ...(parentOf(category)?.children ?? [])].map((p) => (
                <button key={p.key} onClick={() => setProject(p.key)} className={`text-xs uppercase tracking-[.12em] transition-opacity ${project === p.key ? "opacity-100 underline underline-offset-8" : "opacity-70 hover:opacity-100"}`}>{p[lang]}</button>
              ))}
            </div>
          )}
        </div>
        {q && visible.length === 0 && (
          <div className="mx-auto max-w-md border-y border-border py-14 text-center">
            <p className="font-display text-3xl">{lang==="ru"?"Ничего не найдено":"Nothing found"}</p>
            <p className="mt-3 text-sm text-muted-foreground">{lang==="ru"?`Нет работ с названием «${query.trim()}». Попробуйте другое слово.`:`No works titled “${query.trim()}”. Try another word.`}</p>
            <button type="button" onClick={()=>setQuery("")} className="mt-6 inline-flex items-center gap-2 border-b border-current pb-1 text-xs uppercase tracking-[.18em] transition-colors hover:text-red-accent"><X className="size-3.5"/>{lang==="ru"?"Очистить поиск":"Clear search"}</button>
          </div>
        )}
        {category === "all" && !q && (
          <div className="mb-28">
            <p className="mb-8 text-[11px] uppercase tracking-[.18em] text-muted-foreground"><span className="text-red-accent">/ </span>{lang === "ru" ? "Серии" : "Series"}</p>
            <div className="grid gap-x-6 gap-y-16 md:grid-cols-2">
              {cats.map((c, i) => {
                const cw = works.filter((w) => w.category === c.key);
                const cov = cw.find((w) => w.hero) ?? cw.find((w) => w.cover) ?? cw[0];
                if (!cov) return null;
                const phrase = ((lang === "ru" ? c.noteRu : c.noteEn) || "").replace(/^[^—]*—\s*/, "").split(/(?<=[.!?])\s/)[0];
                return (
                  <button key={c.key} type="button" onClick={() => { setCategory(c.key); setProject("all"); document.getElementById("works")?.scrollIntoView({ behavior: "smooth" }); }} className="group text-left">
                    <div className="aspect-[4/3] overflow-hidden bg-muted"><img src={cov.image} alt={c[lang]} loading="lazy" className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.025]" /></div>
                    <div data-font-block="captions" className="mt-5 flex items-baseline justify-between gap-4 border-t border-border pt-4"><h2 className="font-display text-3xl transition-colors group-hover:text-red-accent md:text-4xl">{c[lang]}</h2><span className="text-xs tabular-nums text-muted-foreground">{String(cw.length).padStart(2, "0")}</span></div>
                    {phrase && <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{phrase}</p>}
                  </button>
                );
              })}
            </div>
            <p className="mb-10 mt-28 text-[11px] uppercase tracking-[.18em] text-muted-foreground"><span className="text-red-accent">/ </span>{lang === "ru" ? "Избранные работы" : "Selected works"}</p>
          </div>
        )}
        {category !== "all" && !q && (() => {
          const note = (lang === "ru" ? parentOf(category)?.noteRu : parentOf(category)?.noteEn) ?? "";
          if (!note) return null;
          const long = note.length > 220;
          return (
            <div className="mb-14 max-w-3xl">
              <p data-font-block="body" className={`text-base leading-relaxed text-muted-foreground md:text-lg ${long && !descOpen ? "line-clamp-3" : ""}`}>{note}</p>
              {long && <button type="button" onClick={() => setDescOpen((v) => !v)} className="mt-3 border-b border-current pb-0.5 text-[11px] uppercase tracking-[.16em] transition-colors hover:text-red-accent">{descOpen ? (lang === "ru" ? "Свернуть" : "Less") : (lang === "ru" ? "Подробнее" : "More")}</button>}
            </div>
          );
        })()}
        {category !== "all" && !q && (() => {
          const own = rowOf(project !== "all" ? project : category);
          const src = L(own, "curator") ? own : rowOf(category);
          const text = L(src, "curator");
          const shows = L(src, "exhibited").split("\n").map((x) => x.trim()).filter(Boolean);
          const photos = src?.process_images ?? [];
          if (!text && !shows.length && !photos.length) return null;
          return (
            <div className="mb-14 grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-16">
              {text && <div><button type="button" onClick={() => setCuratorOpen((v) => !v)} aria-expanded={curatorOpen} className="flex items-center gap-2 border-b border-current pb-0.5 text-[11px] uppercase tracking-[.18em] transition-colors hover:text-red-accent"><span className="text-red-accent">/</span>{lang === "ru" ? "Текст куратора" : "Curator’s note"}<span>{curatorOpen ? "−" : "+"}</span></button>{curatorOpen && <p data-font-block="about" className="mt-5 animate-reveal text-lg leading-relaxed md:text-xl">{text}</p>}</div>}
              <div className="space-y-8">
                {shows.length > 0 && <div><p className="mb-3 text-[11px] uppercase tracking-[.18em] text-muted-foreground">{lang === "ru" ? "Где выставлялась" : "Exhibited"}</p><ul className="space-y-2 text-sm">{shows.map((x, i) => <li key={i} className="border-b border-border pb-2">{x}</li>)}</ul></div>}
                {photos.length > 0 && <div><p className="mb-3 text-[11px] uppercase tracking-[.18em] text-muted-foreground">{lang === "ru" ? "Процесс" : "Process"}</p><div className="grid grid-cols-3 gap-2">{photos.map((ref) => <img key={ref} src={mediaUrl(ref)} alt="" loading="lazy" className="aspect-square w-full object-cover" />)}</div></div>}
              </div>
            </div>
          );
        })()}
        <div className="grid grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((work,i)=><article key={`${work.image}-${i}`} >
            <div className="group relative aspect-[4/5] overflow-hidden bg-muted"><button onClick={() => setViewer(works.indexOf(work))} className="block h-full w-full cursor-zoom-in" aria-label={work[lang]}><img src={work.image} alt={work[lang]} className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.025]"/></button><button type="button" onClick={() => setEnquiry(work[lang])} className="absolute bottom-3 right-3 grid size-11 place-items-center bg-background/90 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-red-accent hover:text-background" aria-label={t.buy} data-tip={t.buy}><ArrowUpRight className="size-5"/></button></div>
            <div data-font-block="captions" className="mt-4 grid grid-cols-[1fr_auto] gap-3 border-t border-border pt-3"><div>{work.cover && project === "all" && work.project && <p className="mb-1 text-[11px] uppercase tracking-[.16em] text-muted-foreground"><span className="text-red-accent">/ </span>{parentOf(work.category)?.children.find((p)=>p.key===work.project)?.[lang]}</p>}<h2 className="text-base font-medium">{work[lang]}</h2>{work.technique && <p className="mt-1 text-xs text-muted-foreground">{work.technique}</p>}{work.size && <p className="mt-1 text-xs text-muted-foreground">{work.size}</p>}{work.status && <p className={`mt-1 text-[11px] uppercase tracking-[.14em] ${(work.status === "for-sale" || work.status === "available") ? "text-red-accent" : "text-muted-foreground"}`}>{statusLabel(work.status, lang)}</p>}{work.cover && project === "all" && work.project && <button onClick={()=>openProject(work.category, work.project!)} className="mt-4 inline-flex items-center gap-2 border border-foreground px-3 py-2 text-left text-[11px] font-medium uppercase tracking-[.14em] transition-colors hover:border-red-accent hover:bg-red-accent hover:text-background"><span className="text-red-accent">/</span>{t.more}<ArrowUpRight className="size-3.5 shrink-0"/></button>}</div><span className="text-xs text-muted-foreground">{work.year}</span></div>
          </article>)}
        </div>
        {relatedPosts.length > 0 && (
          <div className="mx-auto mt-20 max-w-2xl">
            <p className="text-[10px] uppercase tracking-[.18em] text-muted-foreground">{lang === "ru" ? "Статьи по теме" : "Related articles"}</p>
            <div className="mt-5 flex flex-col gap-3">
              {relatedPosts.map((p) => (
                <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="group flex items-center justify-between gap-4 border-b border-border pb-3 transition-colors hover:border-red-accent hover:text-red-accent">
                  <span className="font-display text-xl md:text-2xl">{p.title}</span>
                  <ArrowUpRight className="size-4 shrink-0 opacity-40 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section id="about" className="border-t border-border px-5 py-24 md:px-8 md:py-36">
        <div className="grid gap-12 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-20">
          <img src={gallery.about.portrait ? mediaUrl(gallery.about.portrait) : portraitAsset.url} alt={t.artist} loading="lazy" className="aspect-[4/5] w-full max-w-md object-cover" />
          <div data-font-block="about">
            <h2 className="font-display text-5xl md:text-7xl">{t.about}</h2>
            <p className="mt-8 max-w-xl whitespace-pre-line text-xl leading-relaxed md:text-2xl">{gallery.about[lang].note}</p>
            <p className="mt-14 text-[11px] uppercase tracking-[.18em] text-muted-foreground"><span className="text-red-accent">/ </span>{lang === "ru" ? "Выставки, награды, коллекции" : "Exhibitions, awards, collections"}</p>
            <div className="mt-6 space-y-8">
              {gallery.about[lang].sections.slice(0, 3).map((sec, si) => (
                <div key={si}>
                  <h3 className="mb-2 text-xs uppercase tracking-[.16em]">{sec.title}</h3>
                  <ul>{sec.items.slice(0, 4).map((item, i) => { const m = item.match(/^([\d–-]{4,9})\s*—\s*(.*)$/); return <li key={i} className="grid grid-cols-[5.5rem_1fr] gap-3 border-b border-border py-2 text-sm leading-relaxed"><span className="tabular-nums text-muted-foreground">{m ? m[1] : ""}</span><span>{m ? m[2] : item}</span></li>; })}</ul>
                </div>
              ))}
            </div>
            <button onClick={() => setAboutOpen(true)} className="mt-10 flex w-fit items-center gap-2 border-b border-foreground pb-1 text-xs uppercase tracking-[.18em] transition-colors hover:text-red-accent">{lang === "ru" ? "Полная биография" : "Full CV"}<ArrowUpRight className="size-4"/></button>
          </div>
        </div>
      </section>

      <footer id="contact" data-font-block="footer" className="relative overflow-hidden bg-ink px-5 pb-5 pt-20 text-paper md:px-8 md:pt-28">
        <div className="grid gap-14 md:grid-cols-2"><div className="flex min-w-0 flex-wrap items-center gap-4 md:gap-6"><h2 className="font-display text-4xl sm:text-5xl md:text-6xl xl:text-7xl">{t.contact}</h2><img src={signatureAsset.url} alt="Наталья Дикунова" className="h-14 w-14 shrink-0 object-contain md:h-20 md:w-20 xl:h-28 xl:w-28" /></div><div className="space-y-3 text-lg"><a className="block border-b border-paper/30 pb-3" href="mailto:morrasdream@gmail.com">morrasdream@gmail.com</a><a className="block border-b border-paper/30 pb-3" href="tel:+79268215342">+7 926 821-53-42</a><div className="flex flex-wrap gap-x-6 gap-y-3 pt-3 text-xs uppercase tracking-[.18em]"><a href="https://www.instagram.com/natasha_dikunova_zipalova" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-red-accent">Instagram<ArrowUpRight className="size-3"/></a><a href="https://www.facebook.com/share/15dxi5pfo6/" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-red-accent">Facebook<ArrowUpRight className="size-3"/></a><a href="https://t.me/Natasha_Dikunova_Zipalova" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-red-accent">Telegram<ArrowUpRight className="size-3"/></a></div></div></div>
        <div className="mt-20 flex flex-col items-start gap-4 sm:flex-row sm:justify-between sm:gap-6"><p data-font-block="body" className="max-w-4xl text-[10px] uppercase leading-5 tracking-[.18em] opacity-60">{t.achievements}</p><Link to="/admin" aria-label={lang==="ru"?"Администрирование":"Admin"} data-tip={lang==="ru"?"Администрирование":"Admin"} className="shrink-0 opacity-30 transition-opacity hover:text-red-accent hover:opacity-100"><Settings className="size-3.5" /></Link></div>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-paper/25 pt-5">
          {(["privacy", "terms"] as const).map((kind) => <Button key={kind} variant="link" onClick={() => setLegalOpen(kind)} className="h-auto whitespace-normal p-0 text-left text-xs text-paper/80 hover:text-red-accent">{legalDocuments[lang][kind].title}</Button>)}
        </div>
        <div id="footer-mark" className="-mx-5 mt-10 h-[8.2vw] overflow-hidden md:-mx-8"><button type="button" onClick={() => slowScroll(0)} aria-label={lang==="ru"?"В начало":"To top"} data-tip={lang==="ru"?"В начало":"To top"} data-tip-pos="left" className="block w-full cursor-pointer transition-colors hover:text-red-accent"><svg data-font-block="footerLogo" viewBox="0 0 1000 164" preserveAspectRatio="none" aria-hidden="true" focusable="false" className="block h-auto w-full font-display"><text x="500" y="154" textAnchor="middle" textLength="992" lengthAdjust="spacingAndGlyphs" fill="currentColor" style={{ fontSize: "200px" }}>DIKUNOVA</text></svg></button></div>
      </footer>
      <div className={`fixed bottom-4 right-3 z-40 flex flex-col gap-1.5 transition-opacity duration-300 md:bottom-5 md:right-5 md:gap-2 ${markInView ? "pointer-events-none opacity-0" : "opacity-100"}`}><button onClick={() => slowScroll(0)} aria-label={lang==="ru"?"В начало":"To top"} data-tip={lang==="ru"?"В начало":"To top"} data-tip-pos="left" className="grid size-9 place-items-center border border-border bg-background/80 md:size-11 text-foreground backdrop-blur-md transition-colors hover:border-red-accent hover:text-red-accent"><ArrowUp className="size-4"/></button><button onClick={() => slowScroll(document.documentElement.scrollHeight - window.innerHeight)} aria-label={lang==="ru"?"В конец":"To bottom"} data-tip={lang==="ru"?"В конец":"To bottom"} data-tip-pos="left" className="grid size-9 place-items-center border border-border bg-background/80 md:size-11 text-foreground backdrop-blur-md transition-colors hover:border-red-accent hover:text-red-accent"><ArrowDown className="size-4"/></button></div>
      {viewer !== null && <Viewer works={works} index={viewer} lang={lang} onChange={setViewer} onClose={() => setViewer(null)} onEnquire={setEnquiry} />}
      {enquiry !== null && <EnquiryModal artwork={enquiry} lang={lang} onClose={() => setEnquiry(null)} />}
      {aboutOpen && <AboutModal about={gallery.about} lang={lang} onClose={() => setAboutOpen(false)} />}
      {legalOpen && <LegalModal kind={legalOpen} lang={lang} onClose={() => setLegalOpen(null)} />}
    </main>
  );
}

const viewerCopy = {
  ru: { bg: "Фон", close: "Закрыть", prev: "Предыдущая", next: "Следующая", buy: "Узнать о покупке", desc: (w: Work) => `${[w.ru, w.year, w.size].filter(Boolean).join(", ")}. Оригинальная работа Натальи Дикуновой.` },
  en: { bg: "Background", close: "Close", prev: "Previous", next: "Next", buy: "Purchase enquiry", desc: (w: Work) => `${[w.en, w.year, w.size.replace("см", "cm")].filter(Boolean).join(", ")}. Original work by Natalia Dikunova.` },
};
const backgrounds = [
  { key: "dark", cls: "bg-ink text-paper" },
  { key: "light", cls: "bg-paper text-ink" },
  { key: "muted", cls: "bg-[oklch(0.9_0_0)] text-ink" },
] as const;

function slowScroll(target: number) {
  const html = document.documentElement;
  const start = window.scrollY, dist = target - start;
  const duration = Math.min(2600, 1200 + Math.abs(dist) / 8);
  const t0 = performance.now();
  html.style.scrollBehavior = "auto";
  const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / duration);
    window.scrollTo(0, start + dist * ease(p));
    if (p < 1) requestAnimationFrame(step); else html.style.scrollBehavior = "";
  };
  requestAnimationFrame(step);
}

function Viewer({ works, index, lang, onChange, onClose, onEnquire }: { works: Work[]; index: number; lang: Lang; onChange: (i: number) => void; onClose: () => void; onEnquire: (w: string) => void }) {
  const [bg, setBg] = useState(0);
  const [interior, setInterior] = useState(false);
  const w: Work = works[index] ?? works[0]!;
  const c = viewerCopy[lang];
  const dims = parseSize(w.size);
  const go = (d: number) => onChange((index + d + works.length) % works.length);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  });
  return (
    <div role="dialog" aria-modal="true" aria-label={w[lang]} className={`fixed inset-0 z-[90] flex flex-col transition-colors duration-500 ${backgrounds[bg]?.cls ?? ""}`}>
      <div className="flex h-16 items-center justify-between px-5 md:px-8">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.18em]"><span className="mr-2 opacity-60">{c.bg}</span>{backgrounds.map((b, i) => <button key={b.key} onClick={() => setBg(i)} aria-label={`${c.bg} ${b.key}`} data-tip={`${c.bg} ${b.key}`} className={`size-5 rounded-full border border-current ${b.cls} ${bg === i ? "ring-2 ring-current ring-offset-2 ring-offset-transparent" : ""}`} />)}</div>
        <div className="flex items-center gap-5">{dims && <button type="button" onClick={() => setInterior((v) => !v)} aria-pressed={interior} className={`border-b pb-0.5 text-[11px] uppercase tracking-[.16em] transition-colors hover:text-red-accent ${interior ? "border-red-accent text-red-accent" : "border-current"}`}>{lang === "ru" ? "В интерьере" : "In interior"}</button>}<button onClick={onClose} aria-label={c.close} data-tip={c.close}><X className="size-7" /></button></div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-24">
        <button onClick={() => go(-1)} aria-label={c.prev} data-tip={c.prev} className="absolute left-1 z-10 grid size-11 bg-current/0 place-items-center md:left-8"><ArrowLeft className="size-6" /></button>
        {interior && dims ? <InteriorView src={w.image} alt={w[lang]} size={dims} lang={lang} /> : <ZoomImage src={w.image} alt={w[lang]} resetKey={w.image} />}
        <button onClick={() => go(1)} aria-label={c.next} data-tip={c.next} className="absolute right-1 z-10 grid size-11 place-items-center md:right-8"><ArrowRight className="size-6" /></button>
      </div>
      <div className="grid gap-4 px-5 py-5 md:grid-cols-[1fr_auto] md:items-end md:px-8">
        <div data-font-block="captions"><h2 className="text-base font-medium md:text-lg">{w[lang]}</h2><p className="mt-1 max-w-xl text-xs opacity-70">{c.desc(w)}</p>{w.technique && <p className="mt-1 text-xs opacity-70">{w.technique}</p>}{w.status && <p className={`mt-1 text-[11px] uppercase tracking-[.14em] ${(w.status === "for-sale" || w.status === "available") ? "text-red-accent" : "opacity-70"}`}>{statusLabel(w.status, lang)}</p>}</div>
        <button type="button" onClick={() => onEnquire(w[lang])} className="flex w-fit items-center gap-2 border-b border-current pb-1 text-xs uppercase tracking-[.18em]">{c.buy}<ArrowUpRight className="size-4" /></button>
      </div>
    </div>
  );
}

function AboutModal({ about, lang, onClose }: { about: AboutContent; lang: Lang; onClose: () => void }) {
  const t = copy[lang];
  const bio = about[lang];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  });
  return (
    <div role="dialog" aria-modal="true" aria-label={t.about} className="fixed inset-0 z-[90] flex flex-col bg-background/95 backdrop-blur-sm animate-reveal" onClick={onClose}>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5 md:px-8">
        <span className="text-[10px] uppercase tracking-[.18em] text-muted-foreground">{t.about}</span>
        <button onClick={onClose} aria-label={t.close} data-tip={t.close}><X className="size-7" /></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-20">
          <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-16">
            <div>
              <h2 className="font-display text-4xl md:text-6xl">{t.artist}</h2>
              <p data-font-block="about" className="mt-3 font-sans text-sm lowercase italic tracking-[.24em] text-muted-foreground">{bio.role}</p>
              <p data-font-block="about" className="mt-1 text-xs uppercase tracking-[.18em] text-muted-foreground">{bio.academy}</p>
            </div>
            <img src={about.portrait ? mediaUrl(about.portrait) : portraitAsset.url} alt={t.artist} className="aspect-[4/5] w-full max-w-[16rem] object-cover md:justify-self-end" />
          </div>
          <div data-font-block="about" className="mt-14 space-y-10 md:mt-20">
            {bio.sections.map((section, si) => (
              <section key={si}>
                <h3 className="mb-4 border-b border-border pb-2 text-xs uppercase tracking-[.2em] text-muted-foreground">{section.title}</h3>
                <ul className="space-y-2">{section.items.map((item, i) => <li key={i} className="text-sm leading-relaxed">{item}</li>)}</ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
