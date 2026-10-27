import type { WorkRow, CategoryRow } from "./content.functions";

const letters: Record<string, string> = { а:"a", б:"b", в:"v", г:"g", д:"d", е:"e", ё:"yo", ж:"zh", з:"z", и:"i", й:"y", к:"k", л:"l", м:"m", н:"n", о:"o", п:"p", р:"r", с:"s", т:"t", у:"u", ф:"f", х:"kh", ц:"ts", ч:"ch", ш:"sh", щ:"shch", ъ:"", ы:"y", ь:"", э:"e", ю:"yu", я:"ya" };
export function latinSlug(value: string) {
  return [...value.toLowerCase()].map(c => letters[c] ?? c).join("").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "artwork";
}
export function artworkSlug(work: Pick<WorkRow, "id" | "title_ru" | "year">) {
  return `${latinSlug(work.title_ru)}${work.year ? `-${latinSlug(work.year)}` : ""}-${work.id}`;
}
export function artworkPath(work: Pick<WorkRow, "id" | "title_ru" | "year" | "category_key">) {
  return `/works/${encodeURIComponent(work.category_key)}/${artworkSlug(work)}`;
}
export function artworkAlt(work: Pick<WorkRow, "title_ru" | "title_en" | "technique" | "technique_en" | "size" | "year">, lang: "ru" | "en" = "ru") {
  return [lang === "ru" ? work.title_ru : work.title_en || work.title_ru, lang === "ru" ? work.technique : work.technique_en || work.technique, lang === "en" ? work.size.replace(/см/g, "cm") : work.size, work.year, lang === "ru" ? "художник Наталья Дикунова" : "artist Natalia Dikunova"].filter(Boolean).join(", ");
}
export function seriesMetadata(category: Pick<CategoryRow, "key" | "name_ru" | "description_ru" | "description_hidden">) {
  const portraits = category.key === "portraits" || category.name_ru.toLowerCase() === "портреты";
  return {
    title: `${category.name_ru} — Живопись и графика Натальи Дикуновой | Купить картину`,
    description: portraits ? "Серия портретных работ Натальи Дикуновой. Бумага, сангина, уголь, акварель. Информация о доступных для покупки работах и выставках." : (!category.description_hidden && category.description_ru ? category.description_ru : `${category.name_ru}: работы Натальи Дикуновой. Живопись и графика, материалы, размеры и информация о доступности картин.`),
  };
}