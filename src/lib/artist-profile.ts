import type { AboutLang } from "./about";
import type { CategoryRow, WorkRow } from "./content.functions";

export const PROFILE_LIMITS = { pages: 20, bytes: 20 * 1024 * 1024, works: 8 };
export const artistContacts = [
  { label: "dikunova.art", url: "https://dikunova.art" },
  { label: "morrasdream@gmail.com", url: "mailto:morrasdream@gmail.com" },
  { label: "Instagram", url: "https://www.instagram.com/natasha_dikunova_zipalova" },
  { label: "Telegram", url: "https://t.me/Natasha_Dikunova_Zipalova" },
  { label: "Facebook", url: "https://www.facebook.com/share/15dxi5pfo6/" },
];

export function latestYear(text: string) {
  return Math.max(0, ...(text.match(/\b(?:19|20)\d{2}\b/g) ?? []).map(Number));
}

export function profileSections(bio: AboutLang, lang: "ru" | "en") {
  const priority = [/образован|education/i, /персональ|solo/i, /группов|group/i, /резиден|лаборатор|residen|laborator/i, /грант|grant/i, /ярмарк|fair/i, /наград|award/i, /преподав|teaching/i];
  const sections = bio.sections.filter(s => s.items.some(i => i.trim())).map(s => ({ ...s, items: s.items.filter(i => i.trim()).sort((a, b) => latestYear(b) - latestYear(a)) }));
  if (bio.academy.trim() && !sections.some(s => /образован|education/i.test(s.title))) sections.push({ title: lang === "ru" ? "Образование" : "Education", items: [bio.academy] });
  const rank = (title: string) => { const index = priority.findIndex(p => p.test(title)); return index < 0 ? priority.length : index; };
  return sections.sort((a, b) => rank(a.title) - rank(b.title));
}

export function selectedPortfolioWorks(works: WorkRow[], categories: CategoryRow[]) {
  const eligible = works.filter(w => !w.hidden && w.image);
  const complete = (work: WorkRow) => Number(Boolean(work.technique && work.size && work.year));
  const ordered = [...eligible].sort((a, b) => complete(b) - complete(a) || Number(b.hero) - Number(a.hero) || Number(b.cover) - Number(a.cover) || latestYear(b.year) - latestYear(a.year) || a.sort - b.sort);
  const selected: WorkRow[] = [];
  for (const category of [...categories].filter(c => !c.parent_key).sort((a, b) => a.sort - b.sort)) {
    const work = ordered.find(w => w.category_key === category.key);
    if (work) selected.push(work);
  }
  for (const work of ordered) if (!selected.some(w => w.id === work.id)) selected.push(work);
  return selected.slice(0, PROFILE_LIMITS.works);
}

export function workProject(work: WorkRow, categories: CategoryRow[], lang: "ru" | "en") {
  const project = categories.find(c => c.key === work.project_key) ?? categories.find(c => c.key === work.category_key);
  return { name: project ? (lang === "ru" ? project.name_ru : project.name_en || project.name_ru) : "", description: project && !project.description_hidden ? (lang === "ru" ? project.description_ru : project.description_en) : "" };
}

export function quotedTitle(title: string) {
  return title.startsWith("«") && title.endsWith("»") ? title : `«${title}»`;
}