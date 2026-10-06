import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import signatureAsset from "@/assets/signature-mark.png.asset.json";
import china1 from "@/assets/china-1.jpg.asset.json";
import china2 from "@/assets/china-2.jpg.asset.json";
import portraits1 from "@/assets/portraits-1.jpg.asset.json";
import portraits2 from "@/assets/portraits-2.jpg.asset.json";
import children1 from "@/assets/children-1.jpg.asset.json";
import children2 from "@/assets/children-2.jpg.asset.json";
import nu1 from "@/assets/nu-1.jpg.asset.json";
import nu2 from "@/assets/nu-2.jpg.asset.json";
import print1 from "@/assets/print-1.jpg.asset.json";
import print2 from "@/assets/print-2.jpg.asset.json";
import other1 from "@/assets/other-1.jpg.asset.json";
import other2 from "@/assets/other-2.jpg.asset.json";

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

const works = [
  { image: portraits1.url, category: "portraits", year: "2021", ru: "Роман", en: "Roman", size: "60 × 80 см" },
  { image: china1.url, category: "china", year: "2024", ru: "Дневник Китая I", en: "China Diary I", size: "70 × 50 см" },
  { image: print1.url, category: "print", year: "2021", ru: "Маленькая история", en: "A Little Story", size: "23 × 30 см" },
  { image: children1.url, category: "children", year: "2022", ru: "Лето", en: "Summer", size: "65 × 80 см" },
  { image: nu1.url, category: "nu", year: "2021", ru: "Огонь", en: "Fire", size: "50 × 70 см" },
  { image: other1.url, category: "other", year: "2023", ru: "Расстояние", en: "Distance", size: "40 × 55 см" },
  { image: portraits2.url, category: "portraits", year: "2021", ru: "Лиза", en: "Lisa", size: "60 × 80 см" },
  { image: china2.url, category: "china", year: "2024", ru: "Дневник Китая II", en: "China Diary II", size: "70 × 50 см" },
  { image: print2.url, category: "print", year: "2022", ru: "Письмо", en: "The Letter", size: "30 × 40 см" },
  { image: children2.url, category: "children", year: "2020", ru: "Юность", en: "Youth", size: "80 × 65 см" },
  { image: nu2.url, category: "nu", year: "2021", ru: "Фигура", en: "Figure", size: "50 × 70 см" },
  { image: other2.url, category: "other", year: "2023", ru: "Диссонанс", en: "Dissonance", size: "40 × 55 см" },
] as const;

const copy = {
  ru: { artist: "НАТАЛЬЯ ДИКУНОВА", subtitle: "Художник · Москва / Воронеж", works: "Работы", about: "Об авторе", contact: "Контакты", all: "Все работы", filters: "Направления", buy: "Узнать о покупке", breadcrumb: "Главная / Работы", intro: "Живопись, рисунок и печатная графика о памяти, мифе и человеческом присутствии.", note: "Работы находятся в частных коллекциях России, Европы, США, Индии и Китая, а также в музеях России и Китая.", achievements: "Royal Society of British Artists · 1-е место DEG Exlibris · Guanlan Printmaking Base 2025", categories: ["Все", "Миф артиста", "Китай", "Портреты", "Дети", "Ню", "Печатная графика", "Разное"] },
  en: { artist: "NATALIA DIKUNOVA", subtitle: "Artist · Moscow / Voronezh", works: "Works", about: "About", contact: "Contact", all: "All works", filters: "Practices", buy: "Purchase enquiry", breadcrumb: "Home / Works", intro: "Painting, drawing and printmaking exploring memory, myth and human presence.", note: "Works are held in private collections across Russia, Europe, the USA, India and China, as well as museums in Russia and China.", achievements: "Royal Society of British Artists · DEG Exlibris 1st prize · Guanlan Printmaking Base 2025", categories: ["All", "Artist’s myth", "China", "Portraits", "Children", "Nude", "Printmaking", "Other"] },
};
const categoryKeys: Category[] = ["all", "myth", "china", "portraits", "children", "nu", "print", "other"];

function Index() {
  const [lang, setLang] = useState<Lang>("ru");
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState<Category>("all");
  const [ready, setReady] = useState(false);

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
  const filtered = category === "all" || category === "myth" ? works : works.filter((work) => work.category === category);

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 z-[100] flex animate-preloader flex-col items-center justify-center overflow-hidden bg-foreground text-background" aria-hidden="true">
        <img src={signatureAsset.url} alt="" className="absolute h-[115%] w-full object-cover opacity-[.07]" />
        <img src={signatureAsset.url} alt="" className="relative h-40 w-40 object-contain" />
        <p className="relative mt-5 text-[11px] font-medium uppercase tracking-[.28em]">{t.artist}</p>
      </div>

      <header className="fixed inset-x-0 top-0 z-50 grid h-20 grid-cols-[1fr_auto_1fr] items-center border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-8">
        <button aria-label="Menu" onClick={() => setMenuOpen(true)} className="flex w-fit items-center gap-2 text-xs uppercase tracking-[.18em]"><Menu className="size-5"/><span className="hidden sm:inline">Menu</span></button>
        <a href="#top" className="text-center text-xs font-semibold uppercase tracking-[.2em] sm:text-sm">{t.artist}</a>
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
        <div className="grid min-h-[calc(92vh-5rem)] grid-cols-1 md:grid-cols-[42%_58%]">
          <div className="relative flex flex-col justify-end px-5 pb-12 pt-16 md:px-8 md:pb-16">
            <img src={signatureAsset.url} alt="Подпись Натальи Дикуновой" className="absolute left-5 top-10 h-40 w-32 object-contain opacity-80 invert dark:invert-0 md:left-8 md:h-52 md:w-44" />
            <p className="mb-5 max-w-md animate-reveal text-lg leading-relaxed md:text-2xl">{t.intro}</p>
            <a href="#works" className="flex w-fit items-center gap-3 border-b border-foreground pb-1 text-xs uppercase tracking-[.18em]">{t.all}<ArrowDown className="size-4"/></a>
          </div>
          <div className="relative min-h-[58vh] overflow-hidden bg-muted">
            <img src={portraits2.url} alt="Работа Натальи Дикуновой" className="h-full w-full animate-slow-zoom object-cover object-center grayscale-[.12]" />
            <span className="absolute bottom-5 right-5 text-[10px] uppercase tracking-[.16em] text-primary-foreground">Portraits · 2021</span>
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
            <div className="group relative aspect-[4/5] overflow-hidden bg-muted"><img src={work.image} alt={work[lang]} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"/><a href={`mailto:morrasdream@gmail.com?subject=${encodeURIComponent(`${t.buy}: ${work[lang]}`)}`} className="absolute bottom-3 right-3 grid size-11 translate-y-16 place-items-center bg-background text-foreground transition-transform duration-300 group-hover:translate-y-0" aria-label={t.buy}><ArrowUpRight className="size-5"/></a></div>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-3 border-t border-border pt-3"><div><h2 className="text-base font-medium">{work[lang]}</h2><p className="mt-1 text-xs text-muted-foreground">{work.size}</p></div><span className="text-xs text-muted-foreground">{work.year}</span></div>
          </article>)}
        </div>
      </section>

      <section id="about" className="grid border-t border-border px-5 py-24 md:grid-cols-2 md:px-8 md:py-36">
        <h2 className="font-display text-5xl md:text-7xl">{t.about}</h2><div className="mt-10 md:mt-0"><p className="max-w-xl text-xl leading-relaxed md:text-3xl">{t.note}</p><p className="mt-10 text-xs uppercase leading-7 tracking-[.12em] text-muted-foreground">St. Petersburg Academy of Fine Arts<br/>2024 — «За три моря», МСХ, Москва<br/>2023 — Royal Society of British Artists, London<br/>2022 — DEG Exlibris, Germany — 1st prize</p></div>
      </section>

      <footer id="contact" className="relative overflow-hidden bg-foreground px-5 pb-0 pt-20 text-background md:px-8 md:pt-28">
        <div className="grid gap-14 md:grid-cols-2"><h2 className="font-display text-5xl md:text-7xl">{t.contact}</h2><div className="space-y-3 text-lg"><a className="block border-b border-background/30 pb-3" href="mailto:morrasdream@gmail.com">morrasdream@gmail.com</a><a className="block border-b border-background/30 pb-3" href="tel:+79268215342">+7 926 821-53-42</a></div></div>
        <p className="mt-20 max-w-4xl text-[10px] uppercase leading-5 tracking-[.18em] opacity-60">{t.achievements}</p>
        <div className="h-[clamp(5rem,13vw,12rem)] overflow-hidden"><p className="translate-y-[18%] whitespace-nowrap font-display text-[clamp(5rem,17vw,16rem)] leading-none">DIKUNOVA</p></div>
      </footer>
    </main>
  );
}
