import { EnquiryModal } from "@/components/EnquiryModal";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ArrowLeft, ArrowRight, ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
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
  "children-01": {"year": "2018", "ru": "МАРУСЯ В ЗАЗЕРКАЛЬЕ", "en": "МАРУСЯ В ЗАЗЕРКАЛЬЕ", "size": "Бумага/пастель, 100 × 70 см"},
  "children-02": {"year": "2020", "ru": "ТИША. ЛЕТО.", "en": "ТИША. ЛЕТО.", "size": "Бумага/сангина/уголь, 100 × 70 см"},
  "children-03": {"year": "2020", "ru": "GENERATION NEXT", "en": "GENERATION NEXT", "size": "Бумага/пастель, 40 × 30 см"},
  "children-04": {"year": "2020", "ru": "ФЕДЯ", "en": "ФЕДЯ", "size": "Бумага/пастель, 80 × 60 см"},
  "children-05": {"year": "2019", "ru": "МАРТА", "en": "МАРТА", "size": "Бумага/пастель, 60 × 40 см"},
  "children-06": {"year": "2018", "ru": "ТИШКА", "en": "ТИШКА", "size": "Бумага/уголь, 40 × 30 см"},
  "children-07": {"year": "2018", "ru": "ФЕДЯ", "en": "ФЕДЯ", "size": "Бумага/уголь, 50 × 30 см"},
  "children-08": {"year": "2020", "ru": "ФЕДЯ. ЛЕТО.", "en": "ФЕДЯ. ЛЕТО.", "size": "Бумага/пастель, 40 × 30 см"},
  "children-09": {"year": "2019", "ru": "АЛЕНКА", "en": "АЛЕНКА", "size": "Бумага/пастель, 60 × 30 см"},
  "children-10": {"year": "2018", "ru": "ЕВА", "en": "ЕВА", "size": "Бумага/сепия, 60 × 40 см"},
  "children-11": {"year": "2019", "ru": "НИКОЛАЙ", "en": "НИКОЛАЙ", "size": "Бумага/пастель, 40 × 30 см"},
  "children-12": {"year": "2019", "ru": "ФИЛИПП", "en": "ФИЛИПП", "size": "Бумага/пастель, 40 × 30 см"},
  "children-13": {"year": "2024", "ru": "ПУТЕШЕСТВЕННИЦА", "en": "ПУТЕШЕСТВЕННИЦА", "size": "Бумага/пастель, 100 × 70 см"},
  "children-14": {"year": "2020", "ru": "ЮННОСТЬ", "en": "ЮННОСТЬ", "size": "Бумага/сепия, 80 × 60 см"},
  "children-15": {"year": "2021", "ru": "НАТАША", "en": "НАТАША", "size": "Бумага/уголь, 100 × 70 см"},
  "china-01": {"year": "2024", "ru": "СТАРЫЙ БУДДА", "en": "СТАРЫЙ БУДДА", "size": "Бумага/сангина/уголь, 100 × 70 см"},
  "china-02": {"year": "2024", "ru": "ПОРТРЕТ АМГАЛАНА", "en": "ПОРТРЕТ АМГАЛАНА", "size": "Бумага/сангина/уголь, 110 × 70 см"},
  "china-03": {"year": "2024", "ru": "ТИБЕТСКАЯ БАБУШКА", "en": "ТИБЕТСКАЯ БАБУШКА", "size": "Бумага/акварель/сепия, 80 × 60 см"},
  "china-04": {"year": "2024", "ru": "ТИБЕТСКИЙ ПЕЙЗАЖ", "en": "ТИБЕТСКИЙ ПЕЙЗАЖ", "size": "Бумага/пастель, 80 × 60 см"},
  "china-05": {"year": "2024", "ru": "КИТАЙСКАЯ ДЕВУШКА", "en": "КИТАЙСКАЯ ДЕВУШКА", "size": "Бумага/сепия/уголь 60 × 40 см"},
  "china-06": {"year": "2023", "ru": "КИТАЙСКИЙ ПАРЕНЬ", "en": "КИТАЙСКИЙ ПАРЕНЬ", "size": "Бумага/пастель, 80 × 60 см"},
  "china-07": {"year": "2023", "ru": "РОЗОЧКА В ВАЗОЧКЕ", "en": "РОЗОЧКА В ВАЗОЧКЕ", "size": "Бумага/пастель, 80 × 60 см"},
  "china-08": {"year": "2024", "ru": "КИТАЯНКА", "en": "КИТАЯНКА", "size": "Бумага/сепия/уголь, 60 × 40 см"},
  "china-09": {"year": "2023", "ru": "КИТАЙСКИЙ ПЕЙЗАЖ", "en": "КИТАЙСКИЙ ПЕЙЗАЖ", "size": "Бумага/пастель, 80 × 60 см"},
  "china-10": {"year": "2023", "ru": "КИТАЙСКИЙ ЖЕМЧУГ", "en": "КИТАЙСКИЙ ЖЕМЧУГ", "size": "Бумага/уголь, 110 × 80 см"},
  "nu-01": {"year": "2021", "ru": "«АРТЕМИДА» из серии «женщины античного мифа»", "en": "«АРТЕМИДА» из серии «женщины античного мифа»", "size": "Бумага/сангина/уголь, 700 × 100 см"},
  "nu-02": {"year": "2021", "ru": "«АМАЗОНКА» из серии «женщины античного мифа»", "en": "«АМАЗОНКА» из серии «женщины античного мифа»", "size": "Бумага/сангина/уголь, 100 × 70 см"},
  "nu-03": {"year": "2021", "ru": "«ДАФНА» из серии «женщины античного мифа»", "en": "«ДАФНА» из серии «женщины античного мифа»", "size": "Бумага/сангина/уголь, 70 × 100 см"},
  "nu-04": {"year": "2021", "ru": "«ЛЕДИ КЕНТАВР» из серии «женщины античного мифа»", "en": "«ЛЕДИ КЕНТАВР» из серии «женщины античного мифа»", "size": "Бумага/сангина/уголь, 100 × 70 см"},
  "nu-05": {"year": "2021", "ru": "«ОГОНЬ» из серии «стихии»", "en": "«ОГОНЬ» из серии «стихии»", "size": "Бумага/сангина/уголь, 100 × 70 см"},
  "nu-06": {"year": "2023", "ru": "ДЕВУШКА С ЖЕМЧУЖНОЙ СЕРЬГОЙ", "en": "ДЕВУШКА С ЖЕМЧУЖНОЙ СЕРЬГОЙ", "size": "Бумага/сангина/уголь, 100 × 70 см"},
  "nu-07": {"year": "2024", "ru": "ЦЕРЦЕЯ", "en": "ЦЕРЦЕЯ", "size": "Бумага/пастель, 100 × 70 см"},
  "other-01": {"year": "2025", "ru": "НАТАША, ВСТАВАЙ", "en": "НАТАША, ВСТАВАЙ", "size": "Холст/масло, 100 × 70 см"},
  "other-02": {"year": "2025", "ru": "КРАСИВОЕ!", "en": "КРАСИВОЕ!", "size": "Холст/масло, 70 × 100 см"},
  "other-03": {"year": "2026", "ru": "СВЯЩЕННЫЙ ОЛЕНЬ", "en": "СВЯЩЕННЫЙ ОЛЕНЬ", "size": "Холст/масло, 100 × 100 см"},
  "portraits-01": {"year": "2025", "ru": "16 ЛЕТ", "en": "16 ЛЕТ", "size": "Бумага/сепия/уголь, 120 × 80 см"},
  "portraits-02": {"year": "2025", "ru": "АКТРИСА портрет Юлии Александровой", "en": "АКТРИСА портрет Юлии Александровой", "size": "Бумага/уголь, 115 × 80 см"},
  "portraits-03": {"year": "2025", "ru": "ПОРТРЕТ Н.В. ЗВЕРЕВОЙ", "en": "ПОРТРЕТ Н.В. ЗВЕРЕВОЙ", "size": "Бумага/сепия/уголь, 70 × 60 см"},
  "portraits-04": {"year": "2019", "ru": "ПОРТРЕТ АКТРИСЫ Ю.МЕЛЬНИКОВОЙ", "en": "ПОРТРЕТ АКТРИСЫ Ю.МЕЛЬНИКОВОЙ", "size": "Бумага/уголь, 100 × 70 см"},
  "portraits-05": {"year": "2018", "ru": "ТАНЯ из серии «красивые мамы»", "en": "ТАНЯ из серии «красивые мамы»", "size": "Бумага/пастель, 100 × 70 см"},
  "portraits-06": {"year": "2020", "ru": "ЖЕНЯ А из серии «красивые мамы»", "en": "ЖЕНЯ А из серии «красивые мамы»", "size": "Бумага/уголь, 100 × 70 см"},
  "portraits-07": {"year": "2018", "ru": "СВЕТА А из серии «красивые мамы»", "en": "СВЕТА А из серии «красивые мамы»", "size": "Бумага/пастель, 70 × 60 см"},
  "portraits-08": {"year": "2019", "ru": "ОКСАНА из серии «красивые мамы»", "en": "ОКСАНА из серии «красивые мамы»", "size": "Бумага/уголь, 100 × 70 см"},
  "portraits-09": {"year": "2019", "ru": "ПОРТРЕТ РАВШАНЫ из серии «актеры»", "en": "ПОРТРЕТ РАВШАНЫ из серии «актеры»", "size": "Бумага/уголь, 50 × 40 см"},
  "portraits-10": {"year": "2018", "ru": "МАША из серии «красивые мамы»", "en": "МАША из серии «красивые мамы»", "size": "Бумага/пастель, 100 × 70 см"},
  "portraits-11": {"year": "2015", "ru": "ЖЕНЯ из серии «красивые мамы»", "en": "ЖЕНЯ из серии «красивые мамы»", "size": "Бумага/уголь, 60 × 50 см"},
  "portraits-12": {"year": "2020", "ru": "ВЕСНА.НАТАША из серии «красивые мамы»", "en": "ВЕСНА.НАТАША из серии «красивые мамы»", "size": "Бумага/уголь, 65 × 45 см"},
  "portraits-13": {"year": "2019", "ru": "ДОКТОР А. КРИВО", "en": "ДОКТОР А. КРИВО", "size": "Бумага/сепия/уголь, 100 × 70 см"},
  "portraits-14": {"year": "2018", "ru": "АННА из серии «красивые мамы»", "en": "АННА из серии «красивые мамы»", "size": "Бумага/сангина/уголь, 80 × 60 см"},
  "portraits-15": {"year": "2019", "ru": "АНТИЧНЫЙ УЖАС 2", "en": "АНТИЧНЫЙ УЖАС 2", "size": "Бумага/пастель, 80 × 75 см"},
  "portraits-16": {"year": "2018", "ru": "МАША из серии «красивые мамы»", "en": "МАША из серии «красивые мамы»", "size": "Бумага/сепия, 100 × 70 см"},
  "portraits-17": {"year": "2018", "ru": "НАТАЛИ из серии «красивые мамы»", "en": "НАТАЛИ из серии «красивые мамы»", "size": "Бумага/уголь, 100 × 70 см"},
  "portraits-18": {"year": "2018", "ru": "ПАВЕЛ", "en": "ПАВЕЛ", "size": "Бумага/сепия, 80 × 65 см"},
  "portraits-19": {"year": "2010", "ru": "ЭЛЯ из серии «красивые мамы»", "en": "ЭЛЯ из серии «красивые мамы»", "size": "Бумага/уголь, 70 × 50 см"},
  "portraits-20": {"year": "2018", "ru": "МИХАИЛ", "en": "МИХАИЛ", "size": "Бумага/уголь, 100 × 70 см"},
  "portraits-21": {"year": "2019", "ru": "МАМА из серии «красивые мамы»", "en": "МАМА из серии «красивые мамы»", "size": "40 × 35 см"},
  "portraits-22": {"year": "2019", "ru": "КАТЯ из серии «красивые мамы»", "en": "КАТЯ из серии «красивые мамы»", "size": "100 × 70 см"},
  "portraits-23": {"year": "2019", "ru": "ВАСИЛИСА", "en": "ВАСИЛИСА", "size": "Бумага/сепия, 100 × 70 см"},
  "portraits-24": {"year": "2019", "ru": "ЛЕРА", "en": "ЛЕРА", "size": "Бумага/уголь, 60 × 45 см"},
  "portraits-25": {"year": "2019", "ru": "ВЫСТРЕЛ", "en": "ВЫСТРЕЛ", "size": "Бумага/уголь 80 × 60 см"},
  "portraits-26": {"year": "2019", "ru": "АФРИКАНКА 1", "en": "АФРИКАНКА 1", "size": "Бумага/пастель 50 × 35 см"},
  "portraits-27": {"year": "2019", "ru": "АФРИКАНКА 2", "en": "АФРИКАНКА 2", "size": "бумага/пастель 50 × 35 см"},
  "portraits-28": {"year": "2020", "ru": "МИША ХУРАНОВ", "en": "МИША ХУРАНОВ", "size": "Бумага/уголь 40 × 30 см"},
  "portraits-29": {"year": "2022", "ru": "ПОРТРЕТ АКТЕРА АЛЕКСЕЯ ФИЛИМОНОВА", "en": "ПОРТРЕТ АКТЕРА АЛЕКСЕЯ ФИЛИМОНОВА", "size": "Бумага/уголь, 100 × 70 см"},
  "portraits-30": {"year": "2019", "ru": "АНЕЧКА", "en": "АНЕЧКА", "size": "Бумага/пастель, 100 × 70 см"},
  "portraits-31": {"year": "2018", "ru": "КАЗАЧКА", "en": "КАЗАЧКА", "size": "Бумага/пастель, 100 × 70 см"},
  "portraits-32": {"year": "2011", "ru": "КУБИНКА", "en": "КУБИНКА", "size": "Бумага/пастель, 60 × 45 см"},
  "portraits-33": {"year": "2019", "ru": "АЛЕКСЕЙ В ЧАПАНЕ", "en": "АЛЕКСЕЙ В ЧАПАНЕ", "size": "Бумага/пастель, 100 × 70 см"},
  "portraits-34": {"year": "2020", "ru": "ПОРТРЕТ АКТРИСЫ ЮЛИИ МЕЛЬНИКОВОЙ", "en": "ПОРТРЕТ АКТРИСЫ ЮЛИИ МЕЛЬНИКОВОЙ", "size": "Бумага/сангина/уголь, 100 × 70 см"},
  "portraits-35": {"year": "2021", "ru": "РОМАН", "en": "РОМАН", "size": "Бумага/уголь, 65 × 50 см"},
  "portraits-36": {"year": "2021", "ru": "ЛИЗА", "en": "ЛИЗА", "size": "Бумага/уголь, 45 × 30 см"},
  "portraits-37": {"year": "2021", "ru": "НАТАША", "en": "НАТАША", "size": "Бумага/уголь, 100 × 70 см"},
  "portraits-38": {"year": "2025", "ru": "КИТАЙСКИЙ ХУДОЖНИК", "en": "КИТАЙСКИЙ ХУДОЖНИК", "size": "Бумага/сепия/уголь, 70 × 50 см"},
  "print-01": {"year": "2025", "ru": "ПОРТРЕТ ХУДОЖНИКА", "en": "ПОРТРЕТ ХУДОЖНИКА", "size": "Цв.литография, 50 × 50 см"},
  "print-02": {"year": "2025", "ru": "ПОРТРЕТ ХУДОЖНИКА", "en": "ПОРТРЕТ ХУДОЖНИКА", "size": "Цв.литография, 50 × 50 см"},
  "print-03": {"year": "2025", "ru": "ДОБРОТА", "en": "ДОБРОТА", "size": "Цв.литография, 50 × 50 см"},
  "print-04": {"year": "2025", "ru": "КРАДУЩИЙСЯ ТИГР, ЗАТАИВШИЙСЯ ДРАКОН", "en": "КРАДУЩИЙСЯ ТИГР, ЗАТАИВШИЙСЯ ДРАКОН", "size": "Цв.литография, 70 × 97 см"},
  "print-05": {"year": "2025", "ru": "И ВОТ МНЕ ПРИСНИЛОСЬ", "en": "И ВОТ МНЕ ПРИСНИЛОСЬ", "size": "Цв.ксилография"},
  "print-06": {"year": "2024", "ru": "ИДИ ВПЕРЕД", "en": "ИДИ ВПЕРЕД", "size": "Литография, 60 × 40 см"},
  "print-07": {"year": "2021", "ru": "ПОХИЩЕНИЕ ЕВРОПЫ", "en": "ПОХИЩЕНИЕ ЕВРОПЫ", "size": "цветная литография, 20 × 15 см"},
  "print-08": {"year": "", "ru": "ПРЕДЧУВСТВИЕ НОВОГО ГОДА", "en": "ПРЕДЧУВСТВИЕ НОВОГО ГОДА", "size": ""},
  "print-09": {"year": "2020", "ru": "EX LIBRIS F&amp;T", "en": "EX LIBRIS F&amp;T", "size": "Литография 8 × 12 см"},
  "print-10": {"year": "2020", "ru": "PER FELICE «С НОВЫМ ГОДОМ МЫШИ»", "en": "PER FELICE «С НОВЫМ ГОДОМ МЫШИ»", "size": "Литография"},
  "print-11": {"year": "2020", "ru": "ОК", "en": "ОК", "size": "Литография"},
  "print-12": {"year": "2020", "ru": "PER FELICE «ИГРА В СТЕКЛЯННЫЕ ШАРИКИ»", "en": "PER FELICE «ИГРА В СТЕКЛЯННЫЕ ШАРИКИ»", "size": "Литография, 18 × 12 см"},
  "print-13": {"year": "2020", "ru": "EX LIBRIS A.Z.", "en": "EX LIBRIS A.Z.", "size": "Литография 10 × 6 см"},
  "print-14": {"year": "2020", "ru": "PER FELICE «С РОЖДЕСТВОМ!»", "en": "PER FELICE «С РОЖДЕСТВОМ!»", "size": "Цветная литография, 18 × 12 см"},
  "print-15": {"year": "2021", "ru": "«МЕДЕЯ» из серии «женщины античного мифа»", "en": "«МЕДЕЯ» из серии «женщины античного мифа»", "size": "Литография/акварель, 30 × 20 см"},
  "print-16": {"year": "2021", "ru": "«МЕДУЗА» из серии «женщины античного мифа»", "en": "«МЕДУЗА» из серии «женщины античного мифа»", "size": "Литография/акварель, 30 × 20 см"},
  "print-17": {"year": "2021", "ru": "«ЕЛЕНА» из серии «женщины античного мифа»", "en": "«ЕЛЕНА» из серии «женщины античного мифа»", "size": "Литография/акварель, 30 × 20 см"},
  "print-18": {"year": "2021", "ru": "«СЕЛЕНА» из серии « женщины античного мифа»", "en": "«СЕЛЕНА» из серии « женщины античного мифа»", "size": "Литография/акварель, 30 × 20 см"},
  "print-19": {"year": "2021", "ru": "«ПЕРСЕФОНА» из серии «женщины античного мифа»", "en": "«ПЕРСЕФОНА» из серии «женщины античного мифа»", "size": "Литография/акварель, 30 × 20 см"},
  "print-20": {"year": "2021", "ru": "«ЦЕРЦЕЯ» из серии «женщины античного мифа»", "en": "«ЦЕРЦЕЯ» из серии «женщины античного мифа»", "size": "Литография/акварель, 30 × 20 см"},
  "print-21": {"year": "2021", "ru": "«КАССАНДРА» из серии «женщины античного мифа»", "en": "«КАССАНДРА» из серии «женщины античного мифа»", "size": "Литография/акварель, 30 × 20 см"},
  "print-22": {"year": "2021", "ru": "«ПАНДОРА» из серии «женщины античного мифа»", "en": "«ПАНДОРА» из серии «женщины античного мифа»", "size": "Литография/акварель, 30 × 20 см"},
  "print-23": {"year": "2022", "ru": "РУКА СКУЛЬПТОРА", "en": "РУКА СКУЛЬПТОРА", "size": "Бумага/уголь, 60 × 40 см"},
  "print-24": {"year": "2022", "ru": "EX LIBRIS A. Lytkin", "en": "EX LIBRIS A. Lytkin", "size": "Литография 10 × 10 см"},
  "print-25": {"year": "2022", "ru": "PER FELICE «ТИГРЕНОК»", "en": "PER FELICE «ТИГРЕНОК»", "size": "Литография/акварель, 30 × 25 см"},
  "print-26": {"year": "2022", "ru": "PER FELICE «ХОРОШИЙ ТИГР»", "en": "PER FELICE «ХОРОШИЙ ТИГР»", "size": "Литография/акварель, 15 × 10 см"},
  "print-27": {"year": "2021", "ru": "МОСКВА", "en": "МОСКВА", "size": "Литография, 30 × 30 см"},
  "print-28": {"year": "2021", "ru": "Ex libris biblioteca Bodio Lomnago. Dante", "en": "Ex libris biblioteca Bodio Lomnago. Dante", "size": "Литография, 18 × 12 см"},
};
const categoryNames: Record<string, { ru: string; en: string }> = { myth: { ru: "Миф артиста", en: "Artist’s myth" }, china: { ru: "Китай", en: "China" }, portraits: { ru: "Портрет", en: "Portrait" }, children: { ru: "Дети", en: "Children" }, nu: { ru: "Ню", en: "Nude" }, print: { ru: "Печатная графика", en: "Print" }, other: { ru: "Разное", en: "Miscellany" } };
const categoryOrder = ["myth", "china", "portraits", "children", "nu", "print", "other"];
const projectFiles = import.meta.glob("@/assets/projects/*.jpg", { eager: true, import: "default" }) as Record<string, string>;
const mythProjects = [
  { key: "vampire", ru: "Люблю всю. А. Ткаченко", en: "Love it all. A. Tkachenko" },
  { key: "parts", ru: "Части целого. Ю. Колокольников", en: "Parts of the whole. Yu. Kolokolnikov" },
] as const;
type ProjectKey = (typeof mythProjects)[number]["key"];
const projectMeta: Record<string, { ru: string; en: string; year: string; size: string }> = {
  "vampire-01": { ru: "АРТЁМ ТКАЧЕНКО", en: "ARTYOM TKACHENKO", year: "2025", size: "Бумага/уголь, 50 × 50 см" },
  "vampire-02": { ru: "АРТЁМ ТКАЧЕНКО", en: "ARTYOM TKACHENKO", year: "2025", size: "Бумага/уголь, 50 × 50 см" },
  "vampire-03": { ru: "АРТЁМ ТКАЧЕНКО", en: "ARTYOM TKACHENKO", year: "2025", size: "Бумага/уголь, 50 × 50 см" },
  "parts-09": { ru: "СУМКИ С ПРИНТАМИ", en: "PRINTED BAGS", year: "2025", size: "" },
};
const projectWorks = Object.entries(projectFiles).map(([path, image]) => {
  const m = path.match(/(vampire|parts)-(\d+)\.jpg$/)!; const project = m[1] as ProjectKey; const num = Number(m[2]);
  const meta = projectMeta[`${project}-${m[2]}`] ?? { ru: `КОЛОКОЛЬНИКОВ ${num}`, en: `KOLOKOLNIKOV ${num}`, year: "", size: "" };
  return { image, category: "myth" as Exclude<Category, "all">, project: project as ProjectKey | undefined, order: (project === "vampire" ? 0 : 100) + num, cover: num === 1, ...meta };
});
const works = Object.entries(workFiles)
  .map(([path, image]) => {
    const m = path.match(/(\w+)-(\d+)\.jpg$/)!; const cat = m[1]!; const num = m[2]!;
    const key = `${cat}-${num}`;
    const known = knownWorks[key];
    return { image, category: cat as Exclude<Category, "all">, order: categoryOrder.indexOf(cat) * 1000 + Number(num), year: known?.year ?? "", ru: known?.ru ?? `${categoryNames[cat]!.ru} ${Number(num)}`, en: known?.en ?? `${categoryNames[cat]!.en} ${Number(num)}`, size: known?.size ?? "", project: undefined as ProjectKey | undefined, cover: false };
  })
  .filter((w) => w.category !== "myth")
  .concat(projectWorks)
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
  ru: { artist: "НАТАЛЬЯ ДИКУНОВА", subtitle: "Художник · Москва / Воронеж", works: "Работы", about: "Об авторе", contact: "Контакты", all: "Все работы", filters: "Направления", buy: "Узнать о покупке", breadcrumb: "Главная / Работы", more: "Подробнее", close: "Закрыть", intro: "Живопись, рисунок и печатная графика о памяти, мифе и человеческом присутствии.", note: "Работы находятся в частных коллекциях России, Европы, США, Индии и Китая, а также в музеях России и Китая.", achievements: "Royal Society of British Artists · 1-е место DEG Exlibris · Guanlan Printmaking Base 2025", categories: ["Все", "Миф артиста", "Китай", "Портреты", "Дети", "Ню", "Печатная графика", "Разное"] },
  en: { artist: "NATALIA DIKUNOVA", subtitle: "Artist · Moscow / Voronezh", works: "Works", about: "About", contact: "Contact", all: "All works", filters: "Practices", buy: "Purchase enquiry", breadcrumb: "Home / Works", more: "More", close: "Close", intro: "Painting, drawing and printmaking exploring memory, myth and human presence.", note: "Works are held in private collections across Russia, Europe, the USA, India and China, as well as museums in Russia and China.", achievements: "Royal Society of British Artists · DEG Exlibris 1st prize · Guanlan Printmaking Base 2025", categories: ["All", "Artist’s myth", "China", "Portraits", "Children", "Nude", "Printmaking", "Other"] },
};
const aboutBio = {
  ru: {
    role: "artist",
    academy: "St. Petersburg academy of fine arts",
    sections: [
      { title: "Персональные выставки", items: [
        "2024 — «За три моря», персональная выставка, МСХ, Москва",
        "2019 — «Две линии», персональная выставка, РСХ, Воронеж",
      ]},
      { title: "Групповые выставки", items: [
        "2024 — «Продолжение», выставка династии скульпторов и художников Дикуновых Максима, Алексея и Натальи. Областной художественный музей им. И. Крамского, Воронеж",
        "2023 — «Международная выставка преподавателей художественных институтов», Уханьский институт дизайна и проектирования, Ухань, Китай",
        "2023–2024 — выставки печатной графики, Ченду, Китай",
        "2023 — Bicentennial Exhibition, Royal Society of British Artists, Лондон, Великобритания",
        "2023 — выставка печатной графики, Southbank Printmakers Gallery, Лондон, Великобритания",
        "2022 — «Мосты», международный проект «Минская инициатива» при поддержке фонда гуманитарного сотрудничества стран СНГ, Санкт-Петербург",
        "2022 — юбилейная выставка 90 лет МСХ, Москва",
        "2007 — юбилейная выставка «250 лет Академии художеств», ЦДХ, Москва",
      ]},
      { title: "Награды", items: [
        "2022 — 1-е место, международный конкурс экслибриса DEG, Германия",
        "2022 — 3-е место, международный конкурс экслибриса Всемирной организации экслибриса WFOEL. The 4th Hong Kong International Artists & Collectables Expo, Гонконг",
        "2021 — особая отметка жюри, конкурс экслибриса «La Divina Comedia», Biblioteca di Bodio Lomnago",
      ]},
      { title: "Преподавание", items: [
        "2023–2024 — преподаватель рисунка, живописи и композиции, Сычуаньский педагогический университет, факультет классической живописи (Sichuan Normal University), Ченду, Китай",
      ]},
      { title: "Резиденции и пленэры", items: [
        "2025 — приглашённый участник арт-резиденции The Guanlan Original Printmaking Base, Шэньчжэнь, Китай",
        "2022 — международный пленэр и выставка «Landour Plain Air», Ландур, Индия",
      ]},
    ],
  },
  en: {
    role: "artist",
    academy: "St. Petersburg academy of fine arts",
    sections: [
      { title: "Solo exhibitions", items: [
        "2024 — «Across Three Seas», solo exhibition, Moscow Union of Artists, Moscow",
        "2019 — «Two Lines», solo exhibition, Russian Union of Artists, Voronezh",
      ]},
      { title: "Group exhibitions", items: [
        "2024 — «Continuation», exhibition of the Dikunov dynasty of sculptors and artists — Maxim, Alexey and Natalia. Kramskoy Regional Art Museum, Voronezh",
        "2023 — International Exhibition of Teachers of Art Institutes, Wuhan Institute of Design and Sciences, Wuhan, China",
        "2023–2024 — printmaking exhibitions, Chengdu, China",
        "2023 — Bicentennial Exhibition, Royal Society of British Artists, London, UK",
        "2023 — printmaking exhibition, Southbank Printmakers Gallery, London, UK",
        "2022 — «Bridges», international project «Minsk Initiative» supported by the CIS Humanitarian Cooperation Fund, St. Petersburg",
        "2022 — 90th anniversary exhibition of the Moscow Union of Artists, Moscow",
        "2007 — 250th anniversary exhibition of the Academy of Arts, Central House of Artists, Moscow",
      ]},
      { title: "Awards", items: [
        "2022 — 1st place, international ex libris competition DEG, Germany",
        "2022 — 3rd place, international ex libris competition of the World Federation of Ex-libris Societies WFOEL. The 4th Hong Kong International Artists & Collectables Expo, Hong Kong",
        "2021 — special jury mention, «La Divina Comedia» ex libris competition, Biblioteca di Bodio Lomnago",
      ]},
      { title: "Teaching", items: [
        "2023–2024 — lecturer in drawing, painting and composition, Sichuan Normal University, faculty of classical painting, Chengdu, China",
      ]},
      { title: "Residencies and plein airs", items: [
        "2025 — invited resident artist, The Guanlan Original Printmaking Base, Shenzhen, China",
        "2022 — international plein air and exhibition «Landour Plain Air», Landour, India",
      ]},
    ],
  },
} as const;
const heroWorks = [16, 3, 13, 19] as const;
type Work = (typeof works)[number];
const categoryKeys: Category[] = ["all", "myth", "china", "portraits", "children", "nu", "print", "other"];

function Index() {
  const [lang, setLang] = useState<Lang>("ru");
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const [project, setProject] = useState<ProjectKey | "all">("all");
  const [ready, setReady] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [enquiry, setEnquiry] = useState<string | null>(null);
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
  const filtered = category === "all" ? works : works.filter((work) => work.category === category && (category !== "myth" || (project === "all" ? work.cover : work.project === project)));
  const q = query.trim().toLowerCase();
  const visible = q ? works.filter((w) => `${w.ru} ${w.en}`.toLowerCase().includes(q)) : category === "all" ? works.filter((w) => w.category !== "myth" || w.cover) : filtered;
  const openProject = (key: ProjectKey) => { setCategory("myth"); setProject(key); document.getElementById("works")?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 z-[100] flex animate-preloader flex-col items-center justify-center overflow-hidden bg-ink text-paper" aria-hidden="true">
        <img src={signatureAsset.url} alt="" className="h-56 w-56 object-contain md:h-72 md:w-72" />
        <p className="mt-6 font-display text-lg tracking-[.18em]">{t.artist} <span className="font-sans font-light text-red-accent">/</span> <span className="font-sans text-xs lowercase tracking-[.24em] opacity-60">artist</span></p>
      </div>

      <header className="fixed inset-x-0 top-0 z-50 grid h-20 grid-cols-[1fr_auto_1fr] items-center border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-8">
        <div className="flex items-center gap-4"><button aria-label={lang==="ru"?"Меню":"Menu"} data-tip={lang==="ru"?"Меню":"Menu"} onClick={() => setMenuOpen(true)} className="flex w-fit items-center gap-2 text-xs uppercase tracking-[.18em]"><Menu className="size-5"/><span className="hidden sm:inline">Menu</span></button></div>
        <a href="#top" className="whitespace-nowrap text-center font-display text-[11px] tracking-[.12em] sm:text-lg sm:tracking-[.18em]">{t.artist} <span className="font-sans font-light text-red-accent">/</span> <span className="font-sans text-[10px] lowercase tracking-[.2em] opacity-60 sm:text-xs">artist</span></a>
        <div className="flex justify-end gap-1">
          <button onClick={() => setLang(lang === "ru" ? "en" : "ru")} className="h-9 w-10 text-xs font-semibold uppercase" aria-label={lang==="ru"?"Switch to English":"Переключить на русский"} data-tip={lang==="ru"?"Switch to English":"Переключить на русский"}>{lang}</button>
          <button onClick={() => setDark(!dark)} className="grid size-9 place-items-center" aria-label={lang==="ru"?(dark?"Светлая тема":"Тёмная тема"):(dark?"Light theme":"Dark theme")} data-tip={lang==="ru"?(dark?"Светлая тема":"Тёмная тема"):(dark?"Light theme":"Dark theme")}>{dark ? <Sun className="size-4"/> : <Moon className="size-4"/>}</button>
        </div>
      </header>

      <div className={`fixed inset-0 z-[80] bg-ink text-paper transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)] ${menuOpen ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-paper/20 px-5 md:px-8"><span className="text-xs uppercase tracking-[.2em]">Navigation</span><button onClick={() => setMenuOpen(false)} aria-label={lang==="ru"?"Закрыть меню":"Close menu"} data-tip={lang==="ru"?"Закрыть меню":"Close menu"}><X className="size-7"/></button></div>
        <nav className="flex h-[calc(100%-5rem)] flex-col justify-between px-5 py-8 md:px-10">
          <div className="flex flex-col">
            {[t.works,t.about,t.contact].map((item, i) => <a key={item} href={i===0?"#works":i===1?"#about":"#contact"} onClick={() => setMenuOpen(false)} className="group flex items-center justify-between border-b border-paper/25 py-3 font-display text-[clamp(2.5rem,8vw,7.5rem)] leading-none"><span>{item}</span><ArrowUpRight className="size-8 opacity-0 transition-opacity group-hover:opacity-100 md:size-14"/></a>)}
            <Link to="/blog" onClick={() => setMenuOpen(false)} className="group flex items-center justify-between border-b border-paper/25 py-3 font-display text-[clamp(2.5rem,8vw,7.5rem)] leading-none"><span>{lang==="ru"?"Блог":"Blog"}</span><ArrowUpRight className="size-8 opacity-0 transition-opacity group-hover:opacity-100 md:size-14"/></Link>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] uppercase tracking-[.18em]"><span>© 2026</span><span className="flex gap-4"><a href="https://www.instagram.com/natasha_dikunova_zipalova" target="_blank" rel="noreferrer" className="hover:text-red-accent">Instagram</a><a href="https://www.facebook.com/share/15dxi5pfo6/" target="_blank" rel="noreferrer" className="hover:text-red-accent">Facebook</a><a href="https://t.me/Natasha_Dikunova_Zipalova" target="_blank" rel="noreferrer" className="hover:text-red-accent">Telegram</a></span></div>
        </nav>
      </div>

      <section id="top" className="relative min-h-[92vh] pt-20">
        <div className="relative grid min-h-[calc(92vh-5rem)] grid-cols-1 md:grid-cols-[42%_58%]">
          <div className="relative flex flex-col justify-end px-5 pb-12 pt-16 md:px-8 md:pb-16">
            <img src={signatureAsset.url} alt="" className="mb-4 h-44 w-44 sm:h-60 sm:w-60 object-contain invert transition-[filter] duration-500 dark:invert-0 md:h-72 md:w-72" />
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
        <div className="mb-14 flex items-end justify-between gap-6"><div><p className="mb-4 text-[10px] uppercase tracking-[.18em] text-muted-foreground">{t.breadcrumb}</p><h1 className="font-display text-5xl md:text-8xl">{t.works}</h1></div><span className="text-sm tabular-nums">{String(visible.length).padStart(2,"0")}</span></div>
        <div className="mb-16 border-y border-border py-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[.18em] text-muted-foreground">{t.filters}</p>
            <label className="group/search flex w-full items-center gap-2 border-b border-border pb-1 transition-colors focus-within:border-red-accent sm:w-64">
              <span className="text-xs text-red-accent">/</span>
              <input type="search" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={lang==="ru"?"Поиск по названию":"Search by title"} aria-label={lang==="ru"?"Поиск по названию работы":"Search by work title"} className="w-full bg-transparent text-xs uppercase tracking-[.12em] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground" />
              {query && <button type="button" onClick={()=>setQuery("")} aria-label={lang==="ru"?"Очистить":"Clear"} data-tip={lang==="ru"?"Очистить":"Clear"} className="text-xs opacity-50 hover:opacity-100">✕</button>}
            </label>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">{categoryKeys.map((key,i)=>{const btn=<button key={key} onClick={()=>{setCategory(key); setProject("all");}} className={`text-sm transition-opacity ${category===key?"opacity-100 underline underline-offset-8":"opacity-45 hover:opacity-100"}`}>{t.categories[i]}</button>; return key!=="myth"?btn:(
            <div key={key} className="group/sub relative">{btn}
              <div className="invisible absolute left-0 top-full z-30 pt-3 [@media(hover:none)]:hidden opacity-0 transition-opacity duration-200 group-hover/sub:visible group-hover/sub:opacity-100 group-focus-within/sub:visible group-focus-within/sub:opacity-100">
                <div className="flex w-max flex-col gap-1 border border-border bg-background p-3 shadow-sm">{mythProjects.map((p)=><button key={p.key} onClick={()=>openProject(p.key)} className="text-left text-xs uppercase tracking-[.12em] opacity-70 transition-colors hover:text-red-accent hover:opacity-100"><span className="text-red-accent">/ </span>{p[lang]}</button>)}</div>
              </div>
            </div>);})}</div>
          {category === "myth" && (
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-4">
              <span className="text-[10px] uppercase tracking-[.18em] text-red-accent">/</span>
              {([{ key: "all", ru: "Все проекты", en: "All projects" }, ...mythProjects] as const).map((p) => (
                <button key={p.key} onClick={() => setProject(p.key)} className={`text-xs uppercase tracking-[.12em] transition-opacity ${project === p.key ? "opacity-100 underline underline-offset-8" : "opacity-45 hover:opacity-100"}`}>{p[lang]}</button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((work,i)=><article key={`${work.image}-${i}`} className={i%3===1?"lg:pt-24":""}>
            <div className="group relative aspect-[4/5] overflow-hidden bg-muted"><button onClick={() => setViewer(works.indexOf(work))} className="block h-full w-full cursor-zoom-in" aria-label={work[lang]}><img src={work.image} alt={work[lang]} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"/></button><button type="button" onClick={() => setEnquiry(work[lang])} className="absolute bottom-3 right-3 grid size-11 translate-y-16 place-items-center bg-background text-foreground transition-transform duration-300 group-hover:translate-y-0" aria-label={t.buy} data-tip={t.buy}><ArrowUpRight className="size-5"/></button></div>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-3 border-t border-border pt-3"><div><h2 className="text-base font-medium">{work[lang]}</h2><p className="mt-1 text-xs text-muted-foreground">{work.size}</p>{work.cover && project === "all" && work.project && <button onClick={()=>openProject(work.project!)} className="mt-3 flex items-center gap-1 text-[11px] uppercase tracking-[.16em] transition-colors hover:text-red-accent">{t.more} · {mythProjects.find((p)=>p.key===work.project)![lang]}<ArrowUpRight className="size-3"/></button>}</div><span className="text-xs text-muted-foreground">{work.year}</span></div>
          </article>)}
        </div>
        {category !== "all" && (
          <p className="mx-auto mt-20 max-w-2xl border-t border-border pt-6 text-center text-sm leading-relaxed text-muted-foreground">{categoryNotes[category][lang]}</p>
        )}
      </section>

      <section id="about" className="grid border-t border-border px-5 py-24 md:grid-cols-2 md:px-8 md:py-36">
        <h2 className="font-display text-5xl md:text-7xl">{t.about}</h2><div className="mt-10 md:mt-0"><p className="max-w-xl text-xl leading-relaxed md:text-3xl">{t.note}</p><p className="mt-10 text-xs uppercase leading-7 tracking-[.12em] text-muted-foreground">St. Petersburg Academy of Fine Arts<br/>2024 — «За три моря», МСХ, Москва<br/>2023 — Royal Society of British Artists, London<br/>2022 — DEG Exlibris, Germany — 1st prize</p><button onClick={() => setAboutOpen(true)} className="mt-10 flex w-fit items-center gap-2 border-b border-foreground pb-1 text-xs uppercase tracking-[.18em]">{t.more}<ArrowUpRight className="size-4"/></button></div>
      </section>

      <footer id="contact" className="relative overflow-hidden bg-ink px-5 pb-0 pt-20 text-paper md:px-8 md:pt-28">
        <div className="grid gap-14 md:grid-cols-2"><div className="flex items-center gap-6"><h2 className="font-display text-4xl sm:text-5xl md:text-7xl">{t.contact}</h2><img src={signatureAsset.url} alt="Наталья Дикунова" className="h-14 w-14 shrink-0 object-contain md:h-28 md:w-28" /></div><div className="space-y-3 text-lg"><a className="block border-b border-paper/30 pb-3" href="mailto:morrasdream@gmail.com">morrasdream@gmail.com</a><a className="block border-b border-paper/30 pb-3" href="tel:+79268215342">+7 926 821-53-42</a><div className="flex flex-wrap gap-x-6 gap-y-3 pt-3 text-xs uppercase tracking-[.18em]"><a href="https://www.instagram.com/natasha_dikunova_zipalova" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-red-accent">Instagram<ArrowUpRight className="size-3"/></a><a href="https://www.facebook.com/share/15dxi5pfo6/" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-red-accent">Facebook<ArrowUpRight className="size-3"/></a><a href="https://t.me/Natasha_Dikunova_Zipalova" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-red-accent">Telegram<ArrowUpRight className="size-3"/></a></div></div></div>
        <p className="mt-20 max-w-4xl text-[10px] uppercase leading-5 tracking-[.18em] opacity-60">{t.achievements}</p>
        <div className="h-[clamp(5rem,13vw,12rem)] overflow-hidden"><button type="button" onClick={() => slowScroll(0)} aria-label={lang==="ru"?"В начало":"To top"} data-tip={lang==="ru"?"В начало":"To top"} data-tip-pos="left" className="block translate-y-[18%] cursor-pointer whitespace-nowrap font-display text-[clamp(5rem,17vw,16rem)] leading-none transition-colors hover:text-red-accent">DIKUNOVA</button></div>
      </footer>
      <div className="fixed bottom-4 right-3 z-40 flex flex-col gap-1.5 md:bottom-5 md:right-5 md:gap-2"><button onClick={() => slowScroll(0)} aria-label={lang==="ru"?"В начало":"To top"} data-tip={lang==="ru"?"В начало":"To top"} data-tip-pos="left" className="grid size-9 place-items-center border border-border bg-background/80 md:size-11 text-foreground backdrop-blur-md transition-colors hover:border-red-accent hover:text-red-accent"><ArrowUp className="size-4"/></button><button onClick={() => slowScroll(document.documentElement.scrollHeight - window.innerHeight)} aria-label={lang==="ru"?"В конец":"To bottom"} data-tip={lang==="ru"?"В конец":"To bottom"} data-tip-pos="left" className="grid size-9 place-items-center border border-border bg-background/80 md:size-11 text-foreground backdrop-blur-md transition-colors hover:border-red-accent hover:text-red-accent"><ArrowDown className="size-4"/></button></div>
      {viewer !== null && <Viewer index={viewer} lang={lang} onChange={setViewer} onClose={() => setViewer(null)} onEnquire={setEnquiry} />}
      {enquiry !== null && <EnquiryModal artwork={enquiry} lang={lang} onClose={() => setEnquiry(null)} />}
      {aboutOpen && <AboutModal lang={lang} onClose={() => setAboutOpen(false)} />}
    </main>
  );
}

const viewerCopy = {
  ru: { bg: "Фон", close: "Закрыть", prev: "Предыдущая", next: "Следующая", buy: "Узнать о покупке", desc: (w: (typeof works)[number]) => `${[w.ru, w.year, w.size].filter(Boolean).join(", ")}. Оригинальная работа Натальи Дикуновой.` },
  en: { bg: "Background", close: "Close", prev: "Previous", next: "Next", buy: "Purchase enquiry", desc: (w: (typeof works)[number]) => `${[w.en, w.year, w.size.replace("см", "cm")].filter(Boolean).join(", ")}. Original work by Natalia Dikunova.` },
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

function Viewer({ index, lang, onChange, onClose, onEnquire }: { index: number; lang: Lang; onChange: (i: number) => void; onClose: () => void; onEnquire: (w: string) => void }) {
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

function AboutModal({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const t = copy[lang];
  const bio = aboutBio[lang];
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
            <img src={portraitAsset.url} alt={t.artist} className="aspect-[4/5] w-full max-w-[16rem] object-cover shadow-2xl md:justify-self-end" />
          </div>
          <div className="mt-14 space-y-10 md:mt-20">
            {bio.sections.map((section) => (
              <section key={section.title}>
                <h3 className="mb-4 border-b border-border pb-2 text-xs uppercase tracking-[.2em] text-muted-foreground">{section.title}</h3>
                <ul className="space-y-2">{section.items.map((item) => <li key={item} className="text-sm leading-relaxed">{item}</li>)}</ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
