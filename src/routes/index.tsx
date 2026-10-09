import { EnquiryModal } from "@/components/EnquiryModal";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { galleryQuery, type CategoryRow, type WorkRow } from "@/lib/content.functions";
import { mediaUrl } from "@/lib/media";
import { ArrowDown, ArrowUp, ArrowLeft, ArrowRight, ArrowUpRight, Menu, Moon, Settings, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import signatureAsset from "@/assets/signature-clean.png.asset.json";
import type { AboutContent } from "@/lib/about";
import portraitAsset from "@/assets/artist-portrait.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Наталья Дикунова — живопись и графика" },
    { name: "description", content: "Галерея живописи и печатной графики художника Натальи Дикуновой." },
    { property: "og:title", content: "Наталья Дикунова — живопись и графика" },
    { property: "og:description", content: "Галерея живописи и печатной графики художника Натальи Дикуновой." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery),
  errorComponent: () => <div className="grid min-h-screen place-items-center p-8 text-sm">Не удалось загрузить галерею. Обновите страницу.</div>,
  component: Index,
});

type Lang = "ru" | "en";
type Category = string;
type Work = { id: string; image: string; category: string; project: string | undefined; cover: boolean; hero: boolean; ru: string; en: string; year: string; size: string };
type Cat = { key: string; ru: string; en: string; noteRu: string; noteEn: string; children: { key: string; ru: string; en: string }[] };
function buildGallery(data: { categories: CategoryRow[]; works: WorkRow[] }) {
  const top = data.categories.filter((c) => !c.parent_key);
  const cats: Cat[] = top.map((c) => ({ key: c.key, ru: c.name_ru, en: c.name_en, noteRu: c.description_ru, noteEn: c.description_en, children: data.categories.filter((s) => s.parent_key === c.key).map((s) => ({ key: s.key, ru: s.name_ru, en: s.name_en })) }));
  const works: Work[] = data.works.map((w) => ({ id: w.id, image: mediaUrl(w.image), category: w.category_key, project: w.project_key ?? undefined, cover: w.cover, hero: w.hero, ru: w.title_ru, en: w.title_en || w.title_ru, year: w.year, size: w.size }));
  return { cats, works };
}
const copy = {
  ru: { artist: "НАТАЛЬЯ ДИКУНОВА", subtitle: "Художник · Москва / Воронеж", works: "Работы", about: "Об авторе", contact: "Контакты", all: "Все работы", filters: "Направления", buy: "Узнать о покупке", breadcrumb: "Главная / Работы", more: "Подробнее", close: "Закрыть", intro: "Живопись, рисунок и печатная графика о памяти, мифе и человеческом присутствии.", note: "Работы находятся в частных коллекциях России, Европы, США, Индии и Китая, а также в музеях России и Китая.", achievements: "Royal Society of British Artists · 1-е место DEG Exlibris · Guanlan Printmaking Base 2025", categories: ["Все", "Миф артиста", "Китай", "Портреты", "Дети", "Ню", "Печатная графика", "Разное"] },
  en: { artist: "NATALIA DIKUNOVA", subtitle: "Artist · Moscow / Voronezh", works: "Works", about: "About", contact: "Contact", all: "All works", filters: "Practices", buy: "Purchase enquiry", breadcrumb: "Home / Works", more: "More", close: "Close", intro: "Painting, drawing and printmaking exploring memory, myth and human presence.", note: "Works are held in private collections across Russia, Europe, the USA, India and China, as well as museums in Russia and China.", achievements: "Royal Society of British Artists · DEG Exlibris 1st prize · Guanlan Printmaking Base 2025", categories: ["All", "Artist’s myth", "China", "Portraits", "Children", "Nude", "Printmaking", "Other"] },
};


function Index() {
  const [lang, setLang] = useState<Lang>("ru");
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const [project, setProject] = useState<string>("all");
  const [ready, setReady] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [enquiry, setEnquiry] = useState<string | null>(null);
  const { data: gallery } = useSuspenseQuery(galleryQuery);
  const { cats, works } = buildGallery(gallery);
  const heroWorks = works.map((w, i) => (w.hero ? i : -1)).filter((i) => i >= 0);
  if (!heroWorks.length && works.length) heroWorks.push(0);
  const [heroIndex, setHeroIndex] = useState<number>(heroWorks[0] ?? 0);
  const heroWork: Work | undefined = works[heroIndex] ?? works[0];
  const parentOf = (key: string) => cats.find((c) => c.key === key);
  const hasSub = (key: string) => (parentOf(key)?.children.length ?? 0) > 0;
  useEffect(() => {
    const id = window.setInterval(() => setHeroIndex((cur) => heroWorks[(heroWorks.indexOf(cur) + 1) % heroWorks.length] ?? heroWorks[0] ?? 0), 6000);
    return () => window.clearInterval(id);
  }, [heroWorks.join(",")]);

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

  const t = copy[lang];
  const filtered = category === "all" ? works : works.filter((work) => work.category === category && (!hasSub(category) || (project === "all" ? work.cover : work.project === project)));
  const q = query.trim().toLowerCase();
  const visible = q ? works.filter((w) => `${w.ru} ${w.en}`.toLowerCase().includes(q)) : category === "all" ? works.filter((w) => !hasSub(w.category) || w.cover) : filtered;
  const openProject = (parent: string, key: string) => { setCategory(parent); setProject(key); document.getElementById("works")?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 z-[100] flex animate-preloader flex-col items-center justify-center overflow-hidden bg-ink text-paper" aria-hidden="true">
        <div className="paper-grain absolute inset-0" />
        <img src={signatureAsset.url} alt="" className="relative h-56 w-56 object-contain md:h-72 md:w-72" />
        <p className="relative mt-6 font-display text-lg tracking-[.18em]">{t.artist} <span className="font-sans font-light text-red-accent">/</span> <span className="font-sans text-xs lowercase tracking-[.24em] opacity-60">artist</span></p>
      </div>

      <header className="fixed inset-x-0 top-0 z-50 grid h-20 grid-cols-[1fr_auto_1fr] items-center border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-8">
        <div className="flex items-center gap-4"><button aria-label={lang==="ru"?"Меню":"Menu"} data-tip={lang==="ru"?"Меню":"Menu"} onClick={() => setMenuOpen(true)} className="flex w-fit items-center gap-2 text-xs uppercase tracking-[.18em]"><Menu className="size-5"/><span className="hidden sm:inline">Menu</span></button></div>
        <a href="#top" className="whitespace-nowrap text-center font-display [-webkit-text-stroke:0.4px_currentColor] sm:[-webkit-text-stroke:0] text-[15px] tracking-[.1em] sm:text-lg sm:tracking-[.18em]">{t.artist}<span className="hidden sm:inline"> <span className="font-sans font-light text-red-accent">/</span> <span className="font-sans text-xs lowercase tracking-[.2em] opacity-60">artist</span></span></a>
        <div className="flex justify-end gap-1">
          <button onClick={() => setLang(lang === "ru" ? "en" : "ru")} className="h-9 w-10 text-xs font-semibold uppercase" aria-label={lang==="ru"?"Switch to English":"Переключить на русский"} data-tip={lang==="ru"?"Switch to English":"Переключить на русский"}>{lang}</button>
          <button onClick={() => setDark(!dark)} className="grid size-9 place-items-center" aria-label={lang==="ru"?(dark?"Светлая тема":"Тёмная тема"):(dark?"Light theme":"Dark theme")} data-tip={lang==="ru"?(dark?"Светлая тема":"Тёмная тема"):(dark?"Light theme":"Dark theme")}>{dark ? <Sun className="size-4"/> : <Moon className="size-4"/>}</button>
        </div>
      </header>

      <div className={`fixed inset-0 z-[80] bg-ink text-paper transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)] ${menuOpen ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-paper/20 px-5 md:px-8"><span className="text-xs uppercase tracking-[.2em]">Navigation</span><button onClick={() => setMenuOpen(false)} aria-label={lang==="ru"?"Закрыть меню":"Close menu"} data-tip={lang==="ru"?"Закрыть меню":"Close menu"} className="transition-colors duration-300 hover:text-red-accent"><X className="size-7"/></button></div>
        <nav className="flex h-[calc(100%-5rem)] flex-col justify-between px-5 py-8 md:px-10">
          <div className="flex flex-col">
            {[t.works,t.about,t.contact].map((item, i) => <a key={item} href={i===0?"#works":i===1?"#about":"#contact"} onClick={() => setMenuOpen(false)} className="group flex items-center justify-between border-b border-paper/25 py-3 font-display text-[clamp(2.5rem,8vw,7.5rem)] leading-none transition-colors duration-300 hover:border-red-accent hover:text-red-accent"><span>{item}</span><ArrowUpRight className="size-8 text-red-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:size-14"/></a>)}
            <Link to="/blog" onClick={() => setMenuOpen(false)} className="group flex items-center justify-between border-b border-paper/25 py-3 font-display text-[clamp(2.5rem,8vw,7.5rem)] leading-none transition-colors duration-300 hover:border-red-accent hover:text-red-accent"><span>{lang==="ru"?"Блог":"Blog"}</span><ArrowUpRight className="size-8 text-red-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:size-14"/></Link>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] uppercase tracking-[.18em]"><span>© 2026</span><span className="flex gap-4"><a href="https://www.instagram.com/natasha_dikunova_zipalova" target="_blank" rel="noreferrer" className="transition-colors duration-300 hover:text-red-accent">Instagram</a><a href="https://www.facebook.com/share/15dxi5pfo6/" target="_blank" rel="noreferrer" className="transition-colors duration-300 hover:text-red-accent">Facebook</a><a href="https://t.me/Natasha_Dikunova_Zipalova" target="_blank" rel="noreferrer" className="transition-colors duration-300 hover:text-red-accent">Telegram</a></span></div>
        </nav>
      </div>

      <section id="top" className="relative min-h-[92vh] pt-20">
        <div className="relative grid min-h-[calc(92vh-5rem)] grid-cols-1 md:grid-cols-[42%_58%]">
          <div className="relative flex flex-col justify-end px-5 pb-12 pt-8 md:px-8 md:pb-16 md:pt-16">
            <div className="mb-6 grid grid-cols-[auto_minmax(0,1fr)] items-end gap-4 md:mb-5 md:block">
              <img src={signatureAsset.url} alt="" className="h-36 w-28 object-contain invert transition-[filter] duration-500 dark:invert-0 sm:h-60 sm:w-60 md:mb-4 md:h-72 md:w-72" />
              <p className="max-w-md animate-reveal border-l border-border pb-1 pl-4 text-[15px] leading-snug md:border-0 md:pb-0 md:pl-0 md:text-2xl md:leading-relaxed"><span className="mb-2 block text-[10px] uppercase tracking-[.2em] text-red-accent md:hidden">/ artist</span>{t.intro}</p>
            </div>
            <a href="#works" onClick={(e) => { const el = document.getElementById("works"); if (!el) return; e.preventDefault(); const y = el.getBoundingClientRect().top + window.scrollY - 64; if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) window.scrollTo(0, y); else slowScroll(y); }} className="flex w-fit items-center gap-3 border-b border-foreground pb-1 text-xs uppercase tracking-[.18em]">{t.all}<ArrowDown className="size-4"/></a>
          </div>
          <div className="order-first flex min-h-[58vh] items-center justify-center px-5 pb-4 pt-10 md:order-none md:px-12 md:py-10">
            <button onClick={() => setViewer(heroIndex)} className="relative aspect-[4/5] w-[min(78vw,26rem)] overflow-hidden bg-muted shadow-2xl" aria-label={heroWork?.[lang]}>
              {heroWorks.map((idx) => <img key={idx} src={works[idx]!.image} alt={works[idx]![lang]} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${idx === heroIndex ? "opacity-100" : "opacity-0"}`} />)}
            </button>
            <span className="absolute bottom-6 right-6 hidden text-[10px] uppercase tracking-[.16em] text-muted-foreground md:block">{heroWork?.[lang]} · {heroWork?.year}</span>
          </div>
        </div>
      </section>

      <section id="works" className="border-t border-border px-5 py-20 md:px-8 md:py-28">
        <div className="mb-14 flex items-end justify-between gap-6"><div><p className="mb-4 text-[10px] uppercase tracking-[.18em] text-muted-foreground">{t.breadcrumb}</p><h1 className="font-display text-5xl md:text-8xl">{t.works}</h1></div><span className="text-sm tabular-nums">{String(visible.length).padStart(2,"0")}</span></div>
        <div className="mb-16 border-y border-border py-5">
          <p className="mb-4 text-[10px] uppercase tracking-[.18em] text-muted-foreground">{t.filters}</p>
          <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-3">{[{ key: "all", ru: "Все", en: "All", children: [] as Cat["children"] }, ...cats].map((cat)=>{const key=cat.key; const btn=<button key={key} onClick={()=>{setCategory(key); setProject("all");}} className={`text-sm transition-opacity ${category===key?"opacity-100 underline underline-offset-8":"opacity-45 hover:opacity-100"}`}>{cat[lang]}</button>; return !cat.children.length?btn:(
            <div key={key} className="group/sub relative">{btn}
              <div className="invisible absolute left-0 top-full z-30 pt-3 [@media(hover:none)]:hidden opacity-0 transition-opacity duration-200 group-hover/sub:visible group-hover/sub:opacity-100 group-focus-within/sub:visible group-focus-within/sub:opacity-100">
                <div className="flex w-max flex-col gap-1 border border-border bg-background p-3 shadow-sm">{cat.children.map((p)=><button key={p.key} onClick={()=>openProject(key, p.key)} className="text-left text-xs uppercase tracking-[.12em] opacity-70 transition-colors hover:text-red-accent hover:opacity-100"><span className="text-red-accent">/ </span>{p[lang]}</button>)}</div>
              </div>
            </div>);})}</div>
            <label className="flex w-full items-center gap-2 border-b border-border pb-1 transition-colors focus-within:border-red-accent sm:w-64">
              <span className="text-xs text-red-accent">/</span>
              <input type="search" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={lang==="ru"?"Поиск по названию":"Search by title"} aria-label={lang==="ru"?"Поиск по названию работы":"Search by work title"} className="w-full bg-transparent text-xs uppercase tracking-[.12em] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground" />
              {query && <button type="button" onClick={()=>setQuery("")} aria-label={lang==="ru"?"Очистить":"Clear"} data-tip={lang==="ru"?"Очистить":"Clear"} className="text-xs opacity-50 hover:opacity-100">✕</button>}
            </label>
          </div>
          {hasSub(category) && (
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-4">
              <span className="text-[10px] uppercase tracking-[.18em] text-red-accent">/</span>
              {[{ key: "all", ru: "Все проекты", en: "All projects" }, ...(parentOf(category)?.children ?? [])].map((p) => (
                <button key={p.key} onClick={() => setProject(p.key)} className={`text-xs uppercase tracking-[.12em] transition-opacity ${project === p.key ? "opacity-100 underline underline-offset-8" : "opacity-45 hover:opacity-100"}`}>{p[lang]}</button>
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
        <div className="grid grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((work,i)=><article key={`${work.image}-${i}`} className={i%3===1?"lg:pt-24":""}>
            <div className="group relative aspect-[4/5] overflow-hidden bg-muted"><button onClick={() => setViewer(works.indexOf(work))} className="block h-full w-full cursor-zoom-in" aria-label={work[lang]}><img src={work.image} alt={work[lang]} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"/></button><button type="button" onClick={() => setEnquiry(work[lang])} className="absolute bottom-3 right-3 grid size-11 translate-y-16 place-items-center bg-background text-foreground transition-transform duration-300 group-hover:translate-y-0" aria-label={t.buy} data-tip={t.buy}><ArrowUpRight className="size-5"/></button></div>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-3 border-t border-border pt-3"><div><h2 className="text-base font-medium">{work[lang]}</h2><p className="mt-1 text-xs text-muted-foreground">{work.size}</p>{work.cover && project === "all" && work.project && <button onClick={()=>openProject(work.category, work.project!)} className="mt-3 flex items-center gap-1 text-[11px] uppercase tracking-[.16em] transition-colors hover:text-red-accent">{t.more} · {parentOf(work.category)?.children.find((p)=>p.key===work.project)?.[lang]}<ArrowUpRight className="size-3"/></button>}</div><span className="text-xs text-muted-foreground">{work.year}</span></div>
          </article>)}
        </div>
        {category !== "all" && (
          <p className="mx-auto mt-20 max-w-2xl border-t border-border pt-6 text-center text-sm leading-relaxed text-muted-foreground">{lang === "ru" ? parentOf(category)?.noteRu : parentOf(category)?.noteEn}</p>
        )}
      </section>

      <section id="about" className="grid border-t border-border px-5 py-24 md:grid-cols-2 md:px-8 md:py-36">
        <h2 className="font-display text-5xl md:text-7xl">{t.about}</h2><div className="mt-10 md:mt-0"><p className="max-w-xl whitespace-pre-line text-xl leading-relaxed md:text-3xl">{gallery.about[lang].note}</p><p className="mt-10 text-xs uppercase leading-7 tracking-[.12em] text-muted-foreground">{gallery.about[lang].highlights.map((h, i) => <span key={i} className="block">{h}</span>)}</p><button onClick={() => setAboutOpen(true)} className="mt-10 flex w-fit items-center gap-2 border-b border-foreground pb-1 text-xs uppercase tracking-[.18em]">{t.more}<ArrowUpRight className="size-4"/></button></div>
      </section>

      <footer id="contact" className="relative overflow-hidden bg-ink px-5 pb-0 pt-20 text-paper md:px-8 md:pt-28">
        <div className="grid gap-14 md:grid-cols-2"><div className="flex min-w-0 flex-wrap items-center gap-4 md:gap-6"><h2 className="font-display text-4xl sm:text-5xl md:text-6xl xl:text-7xl">{t.contact}</h2><img src={signatureAsset.url} alt="Наталья Дикунова" className="h-14 w-14 shrink-0 object-contain md:h-20 md:w-20 xl:h-28 xl:w-28" /></div><div className="space-y-3 text-lg"><a className="block border-b border-paper/30 pb-3" href="mailto:morrasdream@gmail.com">morrasdream@gmail.com</a><a className="block border-b border-paper/30 pb-3" href="tel:+79268215342">+7 926 821-53-42</a><div className="flex flex-wrap gap-x-6 gap-y-3 pt-3 text-xs uppercase tracking-[.18em]"><a href="https://www.instagram.com/natasha_dikunova_zipalova" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-red-accent">Instagram<ArrowUpRight className="size-3"/></a><a href="https://www.facebook.com/share/15dxi5pfo6/" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-red-accent">Facebook<ArrowUpRight className="size-3"/></a><a href="https://t.me/Natasha_Dikunova_Zipalova" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-red-accent">Telegram<ArrowUpRight className="size-3"/></a></div></div></div>
        <div className="mt-20 flex flex-col items-start gap-4 sm:flex-row sm:justify-between sm:gap-6"><p className="max-w-4xl text-[10px] uppercase leading-5 tracking-[.18em] opacity-60">{t.achievements}</p><Link to="/admin" aria-label={lang==="ru"?"Администрирование":"Admin"} data-tip={lang==="ru"?"Администрирование":"Admin"} className="shrink-0 opacity-30 transition-opacity hover:text-red-accent hover:opacity-100"><Settings className="size-3.5" /></Link></div>
        <div className="h-[min(12rem,calc((100vw-2.5rem)/7.6))] overflow-hidden"><button type="button" onClick={() => slowScroll(0)} aria-label={lang==="ru"?"В начало":"To top"} data-tip={lang==="ru"?"В начало":"To top"} data-tip-pos="left" className="block translate-y-[18%] cursor-pointer whitespace-nowrap font-display text-[min(16rem,calc((100vw-2.5rem)/5.9))] leading-none transition-colors hover:text-red-accent">DIKUNOVA</button></div>
      </footer>
      <div className="fixed bottom-4 right-3 z-40 flex flex-col gap-1.5 md:bottom-5 md:right-5 md:gap-2"><button onClick={() => slowScroll(0)} aria-label={lang==="ru"?"В начало":"To top"} data-tip={lang==="ru"?"В начало":"To top"} data-tip-pos="left" className="grid size-9 place-items-center border border-border bg-background/80 md:size-11 text-foreground backdrop-blur-md transition-colors hover:border-red-accent hover:text-red-accent"><ArrowUp className="size-4"/></button><button onClick={() => slowScroll(document.documentElement.scrollHeight - window.innerHeight)} aria-label={lang==="ru"?"В конец":"To bottom"} data-tip={lang==="ru"?"В конец":"To bottom"} data-tip-pos="left" className="grid size-9 place-items-center border border-border bg-background/80 md:size-11 text-foreground backdrop-blur-md transition-colors hover:border-red-accent hover:text-red-accent"><ArrowDown className="size-4"/></button></div>
      {viewer !== null && <Viewer works={works} index={viewer} lang={lang} onChange={setViewer} onClose={() => setViewer(null)} onEnquire={setEnquiry} />}
      {enquiry !== null && <EnquiryModal artwork={enquiry} lang={lang} onClose={() => setEnquiry(null)} />}
      {aboutOpen && <AboutModal about={gallery.about} lang={lang} onClose={() => setAboutOpen(false)} />}
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
  const w: Work = works[index] ?? works[0]!;
  const c = viewerCopy[lang];
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
        <button onClick={onClose} aria-label={c.close} data-tip={c.close}><X className="size-7" /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-24">
        <button onClick={() => go(-1)} aria-label={c.prev} data-tip={c.prev} className="absolute left-1 z-10 grid size-11 bg-current/0 place-items-center md:left-8"><ArrowLeft className="size-6" /></button>
        <img key={w.image} src={w.image} alt={w[lang]} className="max-h-full max-w-full animate-reveal object-contain shadow-2xl" />
        <button onClick={() => go(1)} aria-label={c.next} data-tip={c.next} className="absolute right-1 z-10 grid size-11 place-items-center md:right-8"><ArrowRight className="size-6" /></button>
      </div>
      <div className="grid gap-4 px-5 py-5 md:grid-cols-[1fr_auto] md:items-end md:px-8">
        <div><h2 className="text-base font-medium md:text-lg">{w[lang]}</h2><p className="mt-1 max-w-xl text-xs opacity-70">{c.desc(w)}</p></div>
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
              <p className="mt-3 font-sans text-sm lowercase italic tracking-[.24em] text-muted-foreground">{bio.role}</p>
              <p className="mt-1 text-xs uppercase tracking-[.18em] text-muted-foreground">{bio.academy}</p>
            </div>
            <img src={about.portrait ? mediaUrl(about.portrait) : portraitAsset.url} alt={t.artist} className="aspect-[4/5] w-full max-w-[16rem] object-cover shadow-2xl md:justify-self-end" />
          </div>
          <div className="mt-14 space-y-10 md:mt-20">
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
