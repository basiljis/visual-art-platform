import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import signatureAsset from "@/assets/signature-clean.png.asset.json";
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
  component: Index,
});

type Lang = "ru" | "en";
type Category = "all" | "myth" | "china" | "portraits" | "children" | "nu" | "print" | "other";

const workFiles = import.meta.glob("@/assets/works/site/*.jpg", { eager: true, import: "default" }) as Record<string, string>;
const knownWorks: Record<string, { year: string; ru: string; en: string; size: string }> = {
  "myth-01": { year: "2025", ru: "Вампир", en: "Vampire", size: "60 × 80 см" },
  "myth-02": { year: "2025", ru: "Миф", en: "Myth", size: "60 × 80 см" },
  "portraits-01": { year: "2021", ru: "Роман", en: "Roman", size: "60 × 80 см" },
  "china-01": { year: "2024", ru: "Дневник Китая I", en: "China Diary I", size: "70 × 50 см" },
  "print-01": { year: "2021", ru: "Маленькая история", en: "A Little Story", size: "23 × 30 см" },
  "children-01": { year: "2022", ru: "Лето", en: "Summer", size: "65 × 80 см" },
  "nu-01": { year: "2021", ru: "Огонь", en: "Fire", size: "50 × 70 см" },
  "other-01": { year: "2023", ru: "Расстояние", en: "Distance", size: "40 × 55 см" },
  "portraits-02": { year: "2021", ru: "Лиза", en: "Lisa", size: "60 × 80 см" },
  "portraits-03": { year: "2021", ru: "Вера", en: "Vera", size: "60 × 80 см" },
  "china-02": { year: "2024", ru: "Дневник Китая II", en: "China Diary II", size: "70 × 50 см" },
  "china-03": { year: "2024", ru: "Дневник Китая III", en: "China Diary III", size: "70 × 50 см" },
  "print-02": { year: "2022", ru: "Письмо", en: "The Letter", size: "30 × 40 см" },
  "print-03": { year: "2021", ru: "Путь", en: "The Path", size: "23 × 30 см" },
  "children-02": { year: "2020", ru: "Юность", en: "Youth", size: "80 × 65 см" },
  "children-03": { year: "2022", ru: "Дочь", en: "Daughter", size: "65 × 80 см" },
  "nu-02": { year: "2021", ru: "Фигура", en: "Figure", size: "50 × 70 см" },
  "nu-03": { year: "2021", ru: "Танец", en: "Dance", size: "50 × 70 см" },
  "other-02": { year: "2023", ru: "Диссонанс", en: "Dissonance", size: "40 × 55 см" },
  "other-03": { year: "2023", ru: "Тишина", en: "Silence", size: "40 × 55 см" },
};
const categoryNames: Record<string, { ru: string; en: string }> = { myth: { ru: "Миф артиста", en: "Artist’s myth" }, china: { ru: "Китай", en: "China" }, portraits: { ru: "Портрет", en: "Portrait" }, children: { ru: "Дети", en: "Children" }, nu: { ru: "Ню", en: "Nude" }, print: { ru: "Печатная графика", en: "Print" }, other: { ru: "Разное", en: "Miscellany" } };
const categoryOrder = ["myth", "china", "portraits", "children", "nu", "print", "other"];
const works = Object.entries(workFiles)
  .map(([path, image]) => {
    const m = path.match(/(\w+)-(\d+)\.jpg$/)!; const cat = m[1]!; const num = m[2]!;
    const key = `${cat}-${num}`;
    const known = knownWorks[key];
    return { image, category: cat as Exclude<Category, "all">, order: categoryOrder.indexOf(cat) * 1000 + Number(num), year: known?.year ?? "", ru: known?.ru ?? `${categoryNames[cat]!.ru} ${Number(num)}`, en: known?.en ?? `${categoryNames[cat]!.en} ${Number(num)}`, size: known?.size ?? "" };
  })
  .sort((a, b) => a.order - b.order);

const categoryNotes: Record<Exclude<Category, "all">, { ru: string; en: string }> = {
  myth: { ru: "Миф артиста — серия о художнике как о мифологическом герое: между автопортретом и легендой, личной историей и сценой.", en: "Artist’s myth — a series on the artist as a mythic figure: between self-portrait and legend, private story and stage." },
  china: { ru: "Китай — дневник поездок: работы, написанные и отпечатанные в пути, где пейзаж и городская сцена становятся записью впечатления.", en: "China — a travel diary: works painted and printed on the road, where landscape and street become a record of impressions." },
  portraits: { ru: "Портреты — встречи с конкретными людьми; каждая работа — попытка удержать присутствие человека за короткое время сеанса.", en: "Portraits — encounters with particular people; each work is an attempt to hold a person’s presence within a short sitting." },
  children: { ru: "Дети — мир ранней памяти и игры, где взгляд ребёнка задаёт масштаб и интонацию картины.", en: "Children — a world of early memory and play, where a child’s gaze sets the scale and tone of the picture." },
  nu: { ru: "Ню — пластические этюды тела: линия, свет и движение без сюжета, ради самого состояния формы.", en: "Nude — plastic studies of the body: line, light and movement without narrative, for the state of form itself." },
  print: { ru: "Печатная графика — офорты, линогравюры и экслибрисы; тираж как способ говорить точнее и лаконичнее.", en: "Printmaking — etchings, linocuts and bookplates; the edition as a way to speak more precisely and more briefly." },
  other: { ru: "Разное — эксперименты вне серий: работы, в которых рождаются темы и приёмы будущих проектов.", en: "Miscellany — experiments outside the series: works where the themes and techniques of future projects are born." },
};
const copy = {
  ru: { artist: "НАТАЛЬЯ ДИКУНОВА", subtitle: "Художник · Москва / Воронеж", works: "Работы", about: "Об авторе", contact: "Контакты", all: "Все работы", filters: "Направления", buy: "Узнать о покупке", breadcrumb: "Главная / Работы", intro: "Живопись, рисунок и печатная графика о памяти, мифе и человеческом присутствии.", note: "Работы находятся в частных коллекциях России, Европы, США, Индии и Китая, а также в музеях России и Китая.", achievements: "Royal Society of British Artists · 1-е место DEG Exlibris · Guanlan Printmaking Base 2025", categories: ["Все", "Миф артиста", "Китай", "Портреты", "Дети", "Ню", "Печатная графика", "Разное"] },
  en: { artist: "NATALIA DIKUNOVA", subtitle: "Artist · Moscow / Voronezh", works: "Works", about: "About", contact: "Contact", all: "All works", filters: "Practices", buy: "Purchase enquiry", breadcrumb: "Home / Works", intro: "Painting, drawing and printmaking exploring memory, myth and human presence.", note: "Works are held in private collections across Russia, Europe, the USA, India and China, as well as museums in Russia and China.", achievements: "Royal Society of British Artists · DEG Exlibris 1st prize · Guanlan Printmaking Base 2025", categories: ["All", "Artist’s myth", "China", "Portraits", "Children", "Nude", "Printmaking", "Other"] },
};
const heroWorks = [6, 1, 3, 9] as const;
type Work = (typeof works)[number];
const categoryKeys: Category[] = ["all", "myth", "china", "portraits", "children", "nu", "print", "other"];

function Index() {
  const [lang, setLang] = useState<Lang>("ru");
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState<Category>("all");
  const [ready, setReady] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null);
  const [heroIndex, setHeroIndex] = useState<number>(heroWorks[0]);
  const heroWork: Work = works[heroIndex] ?? works[0]!;
  useEffect(() => {
    const id = window.setInterval(() => setHeroIndex((cur) => heroWorks[(heroWorks.indexOf(cur as (typeof heroWorks)[number]) + 1) % heroWorks.length] ?? heroWorks[0]), 6000);
    return () => window.clearInterval(id);
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

  const t = copy[lang];
  const filtered = category === "all" ? works : works.filter((work) => work.category === category);

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 z-[100] flex animate-preloader flex-col items-center justify-center overflow-hidden bg-foreground text-background" aria-hidden="true">
        <img src={signatureAsset.url} alt="" className="h-36 w-36 object-contain dark:invert" />
        <p className="mt-6 font-sans text-base font-medium uppercase tracking-[.28em]">{t.artist}</p>
        <p className="mt-2 font-sans text-[11px] lowercase italic tracking-[.14em] opacity-70">artist</p>
      </div>

      <header className="fixed inset-x-0 top-0 z-50 grid h-20 grid-cols-[1fr_auto_1fr] items-center border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-8">
        <div className="flex items-center gap-4"><button aria-label="Menu" onClick={() => setMenuOpen(true)} className="flex w-fit items-center gap-2 text-xs uppercase tracking-[.18em]"><Menu className="size-5"/><span className="hidden sm:inline">Menu</span></button></div>
        <a href="#top" className="text-center font-display text-sm tracking-[.18em] sm:text-lg">{t.artist} <span className="font-sans font-light text-red-accent">/</span> <span className="font-sans text-xs lowercase tracking-[.24em] opacity-60">artist</span></a>
        <div className="flex justify-end gap-1">
          <button onClick={() => setLang(lang === "ru" ? "en" : "ru")} className="h-9 w-10 text-xs font-semibold uppercase" aria-label="Language">{lang}</button>
          <button onClick={() => setDark(!dark)} className="grid size-9 place-items-center" aria-label="Theme">{dark ? <Sun className="size-4"/> : <Moon className="size-4"/>}</button>
        </div>
      </header>

      <div className={`fixed inset-0 z-[80] bg-foreground text-background transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)] ${menuOpen ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-background/20 px-5 md:px-8"><span className="text-xs uppercase tracking-[.2em]">Navigation</span><button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X className="size-7"/></button></div>
        <nav className="flex h-[calc(100%-5rem)] flex-col justify-between px-5 py-8 md:px-10">
          <div className="flex flex-col">
            {[t.works,t.about,t.contact].map((item, i) => <a key={item} href={i===0?"#works":i===1?"#about":"#contact"} onClick={() => setMenuOpen(false)} className="group flex items-center justify-between border-b border-background/25 py-3 font-display text-[clamp(2.5rem,8vw,7.5rem)] leading-none"><span>{item}</span><ArrowUpRight className="size-8 opacity-0 transition-opacity group-hover:opacity-100 md:size-14"/></a>)}
          </div>
          <div className="flex justify-between text-[10px] uppercase tracking-[.18em]"><span>© 2026</span><span>Instagram · Facebook</span></div>
        </nav>
      </div>

      <section id="top" className="relative min-h-[92vh] pt-20">
        <div className="relative grid min-h-[calc(92vh-5rem)] grid-cols-1 md:grid-cols-[42%_58%]">
          <div className="relative flex flex-col justify-end px-5 pb-12 pt-16 md:px-8 md:pb-16">
            <img src={signatureAsset.url} alt="" className="mb-4 h-42 w-42 object-contain invert transition-[filter] duration-500 dark:invert-0 md:h-48 md:w-48" />
            <p className="mb-5 max-w-md animate-reveal text-lg leading-relaxed md:text-2xl">{t.intro}</p>
            <a href="#works" className="flex w-fit items-center gap-3 border-b border-foreground pb-1 text-xs uppercase tracking-[.18em]">{t.all}<ArrowDown className="size-4"/></a>
          </div>
          <div className="flex min-h-[58vh] items-center justify-center px-5 py-10 md:px-12">
            <button onClick={() => setViewer(heroIndex)} className="relative aspect-[4/5] w-[min(78vw,26rem)] overflow-hidden bg-muted shadow-2xl" aria-label={heroWork[lang]}>
              {heroWorks.map((idx) => <img key={idx} src={works[idx]!.image} alt={works[idx]![lang]} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${idx === heroIndex ? "opacity-100" : "opacity-0"}`} />)}
            </button>
            <span className="absolute bottom-6 right-6 hidden text-[10px] uppercase tracking-[.16em] text-muted-foreground md:block">{heroWork[lang]} · {heroWork.year}</span>
          </div>
        </div>
      </section>

      <section id="works" className="border-t border-border px-5 py-20 md:px-8 md:py-28">
        <div className="mb-14 flex items-end justify-between gap-6"><div><p className="mb-4 text-[10px] uppercase tracking-[.18em] text-muted-foreground">{t.breadcrumb}</p><h1 className="font-display text-5xl md:text-8xl">{t.works}</h1></div><span className="text-sm tabular-nums">{String(filtered.length).padStart(2,"0")}</span></div>
        <div className="mb-16 border-y border-border py-5">
          <p className="mb-4 text-[10px] uppercase tracking-[.18em] text-muted-foreground">{t.filters}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3">{categoryKeys.map((key,i)=><button key={key} onClick={()=>setCategory(key)} className={`text-sm transition-opacity ${category===key?"opacity-100 underline underline-offset-8":"opacity-45 hover:opacity-100"}`}>{t.categories[i]}</button>)}</div>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((work,i)=><article key={`${work.image}-${i}`} className={i%3===1?"lg:pt-24":""}>
            <div className="group relative aspect-[4/5] overflow-hidden bg-muted"><button onClick={() => setViewer(works.indexOf(work))} className="block h-full w-full cursor-zoom-in" aria-label={work[lang]}><img src={work.image} alt={work[lang]} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"/></button><a href={`mailto:morrasdream@gmail.com?subject=${encodeURIComponent(`${t.buy}: ${work[lang]}`)}`} className="absolute bottom-3 right-3 grid size-11 translate-y-16 place-items-center bg-background text-foreground transition-transform duration-300 group-hover:translate-y-0" aria-label={t.buy}><ArrowUpRight className="size-5"/></a></div>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-3 border-t border-border pt-3"><div><h2 className="text-base font-medium">{work[lang]}</h2><p className="mt-1 text-xs text-muted-foreground">{work.size}</p></div><span className="text-xs text-muted-foreground">{work.year}</span></div>
          </article>)}
        </div>
        {category !== "all" && (
          <p className="mx-auto mt-20 max-w-2xl border-t border-border pt-6 text-center text-sm leading-relaxed text-muted-foreground">{categoryNotes[category][lang]}</p>
        )}
      </section>

      <section id="about" className="grid border-t border-border px-5 py-24 md:grid-cols-2 md:px-8 md:py-36">
        <h2 className="font-display text-5xl md:text-7xl">{t.about}</h2><div className="mt-10 md:mt-0"><p className="max-w-xl text-xl leading-relaxed md:text-3xl">{t.note}</p><p className="mt-10 text-xs uppercase leading-7 tracking-[.12em] text-muted-foreground">St. Petersburg Academy of Fine Arts<br/>2024 — «За три моря», МСХ, Москва<br/>2023 — Royal Society of British Artists, London<br/>2022 — DEG Exlibris, Germany — 1st prize</p></div>
      </section>

      <footer id="contact" className="relative overflow-hidden bg-foreground px-5 pb-0 pt-20 text-background md:px-8 md:pt-28">
        <div className="grid gap-14 md:grid-cols-2"><h2 className="font-display text-5xl md:text-7xl">{t.contact}</h2><div className="space-y-3 text-lg"><a className="block border-b border-background/30 pb-3" href="mailto:morrasdream@gmail.com">morrasdream@gmail.com</a><a className="block border-b border-background/30 pb-3" href="tel:+79268215342">+7 926 821-53-42</a></div></div>
        <p className="mt-20 max-w-4xl text-[10px] uppercase leading-5 tracking-[.18em] opacity-60">{t.achievements}</p>
        <img src={signatureAsset.url} alt="Наталья Дикунова" className="mt-8 h-16 w-16 object-contain invert" />
        <div className="h-[clamp(5rem,13vw,12rem)] overflow-hidden"><p className="translate-y-[18%] whitespace-nowrap font-display text-[clamp(5rem,17vw,16rem)] leading-none">DIKUNOVA</p></div>
      </footer>
      {viewer !== null && <Viewer index={viewer} lang={lang} onChange={setViewer} onClose={() => setViewer(null)} />}
    </main>
  );
}

const viewerCopy = {
  ru: { bg: "Фон", close: "Закрыть", prev: "Предыдущая", next: "Следующая", buy: "Узнать о покупке", desc: (w: (typeof works)[number]) => `${[w.ru, w.year, w.size].filter(Boolean).join(", ")}. Оригинальная работа Натальи Дикуновой.` },
  en: { bg: "Background", close: "Close", prev: "Previous", next: "Next", buy: "Purchase enquiry", desc: (w: (typeof works)[number]) => `${[w.en, w.year, w.size.replace("см", "cm")].filter(Boolean).join(", ")}. Original work by Natalia Dikunova.` },
};
const backgrounds = [
  { key: "dark", cls: "bg-foreground text-background" },
  { key: "light", cls: "bg-background text-foreground" },
  { key: "muted", cls: "bg-muted text-foreground" },
] as const;

function Viewer({ index, lang, onChange, onClose }: { index: number; lang: Lang; onChange: (i: number) => void; onClose: () => void }) {
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
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.18em]"><span className="mr-2 opacity-60">{c.bg}</span>{backgrounds.map((b, i) => <button key={b.key} onClick={() => setBg(i)} aria-label={`${c.bg} ${b.key}`} className={`size-5 rounded-full border border-current ${b.cls} ${bg === i ? "ring-2 ring-current ring-offset-2 ring-offset-transparent" : ""}`} />)}</div>
        <button onClick={onClose} aria-label={c.close}><X className="size-7" /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 md:px-24">
        <button onClick={() => go(-1)} aria-label={c.prev} className="absolute left-3 grid size-11 place-items-center md:left-8"><ArrowLeft className="size-6" /></button>
        <img key={w.image} src={w.image} alt={w[lang]} className="max-h-full max-w-full animate-reveal object-contain shadow-2xl" />
        <button onClick={() => go(1)} aria-label={c.next} className="absolute right-3 grid size-11 place-items-center md:right-8"><ArrowRight className="size-6" /></button>
      </div>
      <div className="grid gap-4 px-5 py-5 md:grid-cols-[1fr_auto] md:items-end md:px-8">
        <div><h2 className="text-base font-medium md:text-lg">{w[lang]}</h2><p className="mt-1 max-w-xl text-xs opacity-70">{c.desc(w)}</p></div>
        <a href={`mailto:morrasdream@gmail.com?subject=${encodeURIComponent(`${c.buy}: ${w[lang]}`)}`} className="flex w-fit items-center gap-2 border-b border-current pb-1 text-xs uppercase tracking-[.18em]">{c.buy}<ArrowUpRight className="size-4" /></a>
      </div>
    </div>
  );
}
