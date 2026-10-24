import { createServerFn } from "@tanstack/react-start";

export type NewsType = "exhibition" | "news" | "event" | "blog";
export const NEWS_TYPES: { value: NewsType; label_ru: string; label_en: string }[] = [
  { value: "exhibition", label_ru: "Ближайшие выставки", label_en: "Upcoming exhibitions" },
  { value: "news", label_ru: "Новости", label_en: "News" },
  { value: "event", label_ru: "Мероприятия", label_en: "Events" },
  { value: "blog", label_ru: "Блог", label_en: "Blog" },
];
export type NewsRow = { id: string; type: NewsType; title_ru: string; title_en: string; body_ru: string; body_en: string; event_date: string; address_ru: string; address_en: string; link: string | null; image: string | null; published: boolean; sort: number };
export type NewsSettings = { enabled: boolean; delay: number };
export const defaultNewsSettings: NewsSettings = { enabled: true, delay: 10 };

export const getNews = createServerFn({ method: "GET" }).handler(async () => {
  const { publicDb } = await import("./public-db.server");
  const sb = publicDb();
  const [n, s] = await Promise.all([
    sb.from("news").select("*").eq("published", true).order("sort"),
    sb.from("site_content").select("data").eq("key", "news_settings").maybeSingle(),
  ]);
  if (n.error) throw new Error(n.error.message);
  const settings = { ...defaultNewsSettings, ...((s.data?.data as Partial<NewsSettings> | undefined) ?? {}) };
  return { news: n.data as NewsRow[], settings };
});
