import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
export type Language = "ru" | "en";
const LanguageContext = createContext<{ lang: Language; setLang: (lang: Language) => void }>({ lang: "ru", setLang: () => {} });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, update] = useState<Language>("ru");
  useEffect(() => { update(localStorage.getItem("dikunova-lang") === "en" ? "en" : "ru"); }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (value: Language) => { update(value); localStorage.setItem("dikunova-lang", value); };
  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);
export const localized = (ru: string, en: string | undefined, lang: Language) => lang === "en" ? en || ru : ru;
export const localizedSize = (value: string, lang: Language) => {
  if (lang === "ru") return value;
  const media: Record<string, string> = { "цветная литография": "Colour lithograph", "цв.литография": "Colour lithograph", "цв.ксилография": "Colour woodcut", литография: "Lithograph", бумага: "Paper", акварель: "Watercolour", пастель: "Pastel", сангина: "Sanguine", уголь: "Charcoal", сепия: "Sepia", холст: "Canvas", масло: "Oil", тушь: "Ink", см: "cm", мм: "mm" };
  return value.replace(/цветная литография|цв\.литография|цв\.ксилография|литография|бумага|акварель|пастель|сангина|уголь|сепия|холст|масло|тушь|см|мм/gi, (word) => media[word.toLowerCase()] ?? word);
};
export function localizedDate(value: string, lang: Language) {
  if (lang === "ru") return value;
  const months: Record<string, string> = { января: "January", февраля: "February", марта: "March", апреля: "April", мая: "May", июня: "June", июля: "July", августа: "August", сентября: "September", октября: "October", ноября: "November", декабря: "December" };
  return value.replace(/января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря/gi, (month) => months[month.toLowerCase()] ?? month).replace(/\s*г\.?$/, "");
}