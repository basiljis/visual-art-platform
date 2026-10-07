import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Upload, X, Star, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { CategoryRow, WorkRow, PostRow } from "@/lib/content.functions";
import { mediaUrl, htmlForDisplay, htmlForStorage } from "@/lib/media";
import { uploadMedia } from "@/lib/admin-media";
import { defaultAbout, type AboutContent, type AboutLang } from "@/lib/about";
import { RichEditor } from "./RichEditor";

export const field = "w-full border-b border-border bg-transparent py-2 text-sm outline-none transition-colors focus:border-red-accent";
export const label = "block text-[10px] uppercase tracking-[.18em] text-muted-foreground";
export const primaryBtn = "inline-flex items-center gap-2 bg-foreground px-5 py-3 text-xs uppercase tracking-[.18em] text-background transition-opacity hover:opacity-80 disabled:opacity-40";
const ghostBtn = "inline-flex items-center gap-2 border-b border-current pb-0.5 text-xs uppercase tracking-[.16em] transition-colors hover:text-red-accent";

function useRows<T>(table: "categories" | "works" | "blog_posts", order: string) {
  const [rows, setRows] = useState<T[] | null>(null);
  const load = async () => {
    const { data, error } = await supabase.from(table).select("*").order(order);
    if (error) alert(error.message); else setRows(data as T[]);
  };
  useEffect(() => { load(); }, []);
  return { rows, reload: load };
}
function useInvalidate() {
  const qc = useQueryClient();
  return () => { qc.invalidateQueries({ queryKey: ["gallery"] }); qc.invalidateQueries({ queryKey: ["posts"] }); qc.invalidateQueries({ queryKey: ["post"] }); };
}
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9а-яё]+/gi, "-").replace(/^-|-$/g, "") || `item-${Date.now()}`;

function F({ l, children, className = "" }: { l: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><label className={label}>{l}</label>{children}</div>;
}
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-auto my-6 w-[min(100%-1.5rem,56rem)] bg-background p-5 shadow-2xl md:my-12 md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between gap-4"><h2 className="font-display text-3xl">{title}</h2><button onClick={onClose} aria-label="Закрыть" className="hover:text-red-accent"><X className="size-5" /></button></div>
        {children}
      </div>
    </div>
  );
}
function ImagePick({ value, onChange, accept = "image/*" }: { value: string | null; onChange: (ref: string) => void; accept?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-end gap-4">
      <div className="aspect-[4/5] w-28 shrink-0 overflow-hidden bg-muted">{value && <img src={mediaUrl(value)} alt="" className="h-full w-full object-cover" />}</div>
      <label className={`${ghostBtn} cursor-pointer`}><Upload className="size-3.5" />{busy ? "Загрузка…" : value ? "Заменить" : "Загрузить"}
        <input type="file" accept={accept} hidden onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setBusy(true); try { onChange(await uploadMedia(f)); } catch (err) { alert(err instanceof Error ? err.message : "Ошибка"); } setBusy(false); e.target.value = ""; }} />
      </label>
    </div>
  );
}

/* ---------------- Categories ---------------- */
export function CategoriesPanel() {
  const { rows, reload } = useRows<CategoryRow>("categories", "sort");
  const inv = useInvalidate();
  const [edit, setEdit] = useState<Partial<CategoryRow> | null>(null);
  if (!rows) return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  const top = rows.filter((r) => !r.parent_key);
  const save = async () => {
    if (!edit?.name_ru) { alert("Укажите название"); return; }
    const payload = { key: edit.key || slugify(edit.name_en || edit.name_ru), parent_key: edit.parent_key || null, name_ru: edit.name_ru, name_en: edit.name_en || edit.name_ru, description_ru: edit.description_ru ?? "", description_en: edit.description_en ?? "", sort: Number(edit.sort ?? rows.length + 1) };
    const { error } = edit.id ? await supabase.from("categories").update(payload).eq("id", edit.id) : await supabase.from("categories").insert(payload);
    if (error) { alert(error.message); return; }
    setEdit(null); reload(); inv();
  };
  const remove = async (c: CategoryRow) => {
    const { count } = await supabase.from("works").select("id", { count: "exact", head: true }).or(`category_key.eq.${c.key},project_key.eq.${c.key}`);
    if (count) { alert(`В направлении ${count} работ. Сначала перенесите или удалите их.`); return; }
    if (rows.some((r) => r.parent_key === c.key)) { alert("Сначала удалите подразделы."); return; }
    if (!confirm(`Удалить «${c.name_ru}»?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) alert(error.message); else { reload(); inv(); }
  };
  const Row = ({ c, sub }: { c: CategoryRow; sub?: boolean }) => (
    <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border py-4 ${sub ? "pl-6" : ""}`}>
      <button onClick={() => setEdit(c)} className="min-w-0 text-left">
        <p className={sub ? "text-sm" : "font-display text-2xl"}>{sub && <span className="text-red-accent">/ </span>}{c.name_ru} <span className="text-xs text-muted-foreground">· {c.name_en}</span></p>
        {c.description_ru && <p className="mt-1 truncate text-xs text-muted-foreground">{c.description_ru}</p>}
      </button>
      <div className="flex items-center gap-4">
        {!sub && <button onClick={() => setEdit({ parent_key: c.key, sort: rows.filter((r) => r.parent_key === c.key).length + 1 })} className={ghostBtn}><Plus className="size-3" />Подраздел</button>}
        <button onClick={() => remove(c)} aria-label="Удалить" className="hover:text-red-accent"><Trash2 className="size-4" /></button>
      </div>
    </div>
  );
  return (
    <div>
      <div className="mb-6 flex justify-end"><button onClick={() => setEdit({ sort: top.length + 1 })} className={primaryBtn}><Plus className="size-4" />Новое направление</button></div>
      {top.map((c) => <div key={c.id}><Row c={c} />{rows.filter((s) => s.parent_key === c.key).map((s) => <Row key={s.id} c={s} sub />)}</div>)}
      {edit && (
        <Modal title={edit.id ? "Направление" : edit.parent_key ? "Новый подраздел" : "Новое направление"} onClose={() => setEdit(null)}>
          <div className="grid gap-6 md:grid-cols-2">
            <F l="Название (RU)"><input className={field} value={edit.name_ru ?? ""} onChange={(e) => setEdit({ ...edit, name_ru: e.target.value })} /></F>
            <F l="Название (EN)"><input className={field} value={edit.name_en ?? ""} onChange={(e) => setEdit({ ...edit, name_en: e.target.value })} /></F>
            <F l="Описание (RU)" className="md:col-span-2"><textarea rows={3} className={field} value={edit.description_ru ?? ""} onChange={(e) => setEdit({ ...edit, description_ru: e.target.value })} /></F>
            <F l="Описание (EN)" className="md:col-span-2"><textarea rows={3} className={field} value={edit.description_en ?? ""} onChange={(e) => setEdit({ ...edit, description_en: e.target.value })} /></F>
            <F l="Входит в направление"><select className={field} value={edit.parent_key ?? ""} onChange={(e) => setEdit({ ...edit, parent_key: e.target.value || null })}><option value="">— самостоятельное —</option>{top.filter((t) => t.key !== edit.key).map((t) => <option key={t.key} value={t.key}>{t.name_ru}</option>)}</select></F>
            <F l="Порядок"><input type="number" className={field} value={edit.sort ?? 0} onChange={(e) => setEdit({ ...edit, sort: Number(e.target.value) })} /></F>
          </div>
          <div className="mt-8"><button onClick={save} className={primaryBtn}>Сохранить</button></div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Works ---------------- */
export function WorksPanel() {
  const cats = useRows<CategoryRow>("categories", "sort");
  const { rows, reload } = useRows<WorkRow>("works", "sort");
  const inv = useInvalidate();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Partial<WorkRow> | null>(null);
  const top = (cats.rows ?? []).filter((c) => !c.parent_key);
  const list = useMemo(() => (rows ?? []).filter((w) => (filter === "all" || w.category_key === filter) && (!q || `${w.title_ru} ${w.title_en}`.toLowerCase().includes(q.toLowerCase()))), [rows, filter, q]);
  if (!rows || !cats.rows) return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  const subs = (key?: string) => cats.rows!.filter((c) => c.parent_key === key);
  const save = async () => {
    if (!edit?.image) { alert("Загрузите изображение"); return; }
    if (!edit.category_key) { alert("Выберите направление"); return; }
    const payload = { category_key: edit.category_key, project_key: edit.project_key || null, title_ru: edit.title_ru ?? "", title_en: edit.title_en ?? "", year: edit.year ?? "", size: edit.size ?? "", image: edit.image, cover: !!edit.cover, hero: !!edit.hero, sort: Number(edit.sort ?? 0) };
    const { error } = edit.id ? await supabase.from("works").update(payload).eq("id", edit.id) : await supabase.from("works").insert(payload);
    if (error) { alert(error.message); return; }
    setEdit(null); reload(); inv();
  };
  const remove = async (w: WorkRow) => {
    if (!confirm(`Удалить «${w.title_ru}»?`)) return;
    const { error } = await supabase.from("works").delete().eq("id", w.id);
    if (error) alert(error.message); else { reload(); inv(); }
  };
  const nextSort = Math.max(0, ...rows.map((r) => r.sort)) + 1;
  return (
    <div>
      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_16rem_auto] md:items-end">
        <div className="flex flex-wrap gap-x-5 gap-y-2">{[{ key: "all", name_ru: "Все" }, ...top].map((c) => <button key={c.key} onClick={() => setFilter(c.key)} className={`text-sm ${filter === c.key ? "underline underline-offset-8" : "opacity-45 hover:opacity-100"}`}>{c.name_ru}</button>)}</div>
        <input placeholder="Поиск по названию" value={q} onChange={(e) => setQ(e.target.value)} className={field} />
        <button onClick={() => setEdit({ category_key: filter !== "all" ? filter : (top[0]?.key ?? ""), sort: nextSort })} className={primaryBtn}><Plus className="size-4" />Новая работа</button>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">{list.length} работ</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((w) => (
          <div key={w.id} className="group">
            <button onClick={() => setEdit(w)} className="relative block aspect-[4/5] w-full overflow-hidden bg-muted">
              <img src={mediaUrl(w.image)} alt={w.title_ru} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              <span className="absolute left-2 top-2 flex gap-1">{w.hero && <span className="bg-background px-1.5 py-0.5 text-[9px] uppercase tracking-wider">главная</span>}{w.cover && <span className="bg-background px-1.5 py-0.5 text-[9px] uppercase tracking-wider">обложка</span>}</span>
            </button>
            <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <div className="min-w-0"><p className="truncate text-sm">{w.title_ru || "Без названия"}</p><p className="truncate text-[11px] text-muted-foreground">{[w.year, w.size].filter(Boolean).join(" · ")}</p></div>
              <button onClick={() => remove(w)} aria-label="Удалить" className="opacity-40 hover:text-red-accent hover:opacity-100"><Trash2 className="size-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      {edit && (
        <Modal title={edit.id ? "Работа" : "Новая работа"} onClose={() => setEdit(null)}>
          <div className="grid gap-6 md:grid-cols-2">
            <F l="Изображение" className="md:col-span-2"><div className="mt-2"><ImagePick value={edit.image ?? null} onChange={(image) => setEdit({ ...edit, image })} /></div></F>
            <F l="Название (RU)"><input className={field} value={edit.title_ru ?? ""} onChange={(e) => setEdit({ ...edit, title_ru: e.target.value })} /></F>
            <F l="Название (EN)"><input className={field} value={edit.title_en ?? ""} onChange={(e) => setEdit({ ...edit, title_en: e.target.value })} /></F>
            <F l="Год"><input className={field} value={edit.year ?? ""} onChange={(e) => setEdit({ ...edit, year: e.target.value })} /></F>
            <F l="Техника и размер"><input className={field} placeholder="Бумага/уголь, 100 × 70 см" value={edit.size ?? ""} onChange={(e) => setEdit({ ...edit, size: e.target.value })} /></F>
            <F l="Направление"><select className={field} value={edit.category_key ?? ""} onChange={(e) => setEdit({ ...edit, category_key: e.target.value, project_key: null })}>{top.map((c) => <option key={c.key} value={c.key}>{c.name_ru}</option>)}</select></F>
            {subs(edit.category_key).length > 0 && <F l="Подраздел"><select className={field} value={edit.project_key ?? ""} onChange={(e) => setEdit({ ...edit, project_key: e.target.value || null })}><option value="">—</option>{subs(edit.category_key).map((c) => <option key={c.key} value={c.key}>{c.name_ru}</option>)}</select></F>}
            <F l="Порядок"><input type="number" className={field} value={edit.sort ?? 0} onChange={(e) => setEdit({ ...edit, sort: Number(e.target.value) })} /></F>
            <div className="flex flex-wrap gap-6 md:col-span-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!edit.hero} onChange={(e) => setEdit({ ...edit, hero: e.target.checked })} className="accent-red-accent" /><Star className="size-3.5" />Показывать на главном экране</label>
              {subs(edit.category_key).length > 0 && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!edit.cover} onChange={(e) => setEdit({ ...edit, cover: e.target.checked })} className="accent-red-accent" />Обложка подраздела</label>}
            </div>
          </div>
          <div className="mt-8"><button onClick={save} className={primaryBtn}>Сохранить</button></div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Blog ---------------- */
export function BlogPanel() {
  const { rows, reload } = useRows<PostRow>("blog_posts", "sort");
  const inv = useInvalidate();
  const [edit, setEdit] = useState<Partial<PostRow> | null>(null);
  if (!rows) return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  const today = new Date().toLocaleDateString("ru-RU");
  const save = async () => {
    if (!edit?.title) { alert("Укажите заголовок"); return; }
    const html = htmlForStorage(edit.content_html ?? "");
    const firstImg = html.match(/<img[^>]+src="([^"]+)"/)?.[1] ?? null;
    const payload = { title: edit.title, slug: edit.slug || slugify(edit.title).slice(0, 80), excerpt: edit.excerpt ?? "", date: edit.date || today, cover: edit.cover || firstImg, content_html: html, published: edit.published ?? true, sort: Number(edit.sort ?? 0) };
    const { error } = edit.id ? await supabase.from("blog_posts").update(payload).eq("id", edit.id) : await supabase.from("blog_posts").insert(payload);
    if (error) { alert(error.message.includes("duplicate") ? "Такой адрес записи уже есть" : error.message); return; }
    setEdit(null); reload(); inv();
  };
  const remove = async (p: PostRow) => {
    if (!confirm(`Удалить запись «${p.title}»?`)) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", p.id);
    if (error) alert(error.message); else { reload(); inv(); }
  };
  const minSort = Math.min(1, ...rows.map((r) => r.sort)) - 1;
  if (edit) return (
    <div>
      <div className="mb-6 flex items-center justify-between"><button onClick={() => setEdit(null)} className={ghostBtn}>← Все записи</button><button onClick={save} className={primaryBtn}>Сохранить</button></div>
      <input placeholder="Заголовок" value={edit.title ?? ""} onChange={(e) => setEdit({ ...edit, title: e.target.value })} className="w-full border-b border-border bg-transparent pb-3 font-display text-3xl outline-none focus:border-red-accent md:text-5xl" />
      <div className="mt-6 grid gap-6 md:grid-cols-4">
        <F l="Дата"><input className={field} value={edit.date ?? ""} placeholder={today} onChange={(e) => setEdit({ ...edit, date: e.target.value })} /></F>
        <F l="Адрес (slug)"><input className={field} value={edit.slug ?? ""} placeholder="авто" onChange={(e) => setEdit({ ...edit, slug: e.target.value })} /></F>
        <F l="Краткое описание" className="md:col-span-2"><input className={field} value={edit.excerpt ?? ""} onChange={(e) => setEdit({ ...edit, excerpt: e.target.value })} /></F>
        <F l="Обложка (иначе — первое фото)" className="md:col-span-2"><div className="mt-2"><ImagePick value={edit.cover ?? null} onChange={(cover) => setEdit({ ...edit, cover })} /></div></F>
        <div className="flex items-end md:col-span-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.published ?? true} onChange={(e) => setEdit({ ...edit, published: e.target.checked })} className="accent-red-accent" />Опубликовано</label></div>
      </div>
      <div className="mt-8"><RichEditor value={htmlForDisplay(edit.content_html ?? "")} onChange={(content_html) => setEdit((cur) => cur && { ...cur, content_html })} /></div>
    </div>
  );
  return (
    <div>
      <div className="mb-6 flex justify-end"><button onClick={() => setEdit({ sort: minSort, published: true, date: today, content_html: "" })} className={primaryBtn}><Plus className="size-4" />Новая запись</button></div>
      {rows.map((p) => (
        <div key={p.id} className="grid grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-border py-4">
          <div className="aspect-square overflow-hidden bg-muted">{p.cover && <img src={mediaUrl(p.cover)} alt="" className="h-full w-full object-cover" />}</div>
          <button onClick={() => setEdit(p)} className="min-w-0 text-left"><p className="text-[10px] uppercase tracking-[.18em] text-muted-foreground">{p.date}</p><p className="truncate text-base">{p.title}</p></button>
          <div className="flex items-center gap-3">{p.published ? <Eye className="size-4 opacity-40" aria-label="Опубликовано" /> : <EyeOff className="size-4 text-red-accent" aria-label="Черновик" />}<button onClick={() => remove(p)} aria-label="Удалить" className="hover:text-red-accent"><Trash2 className="size-4" /></button></div>
        </div>
      ))}
    </div>
  );
}

type Enquiry = { id: string; name: string; email: string; phone: string | null; message: string; artwork: string | null; created_at: string };
type Subscriber = { id: string; email: string; created_at: string };
const fmtDate = (s: string) => new Date(s).toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" });

function useLeads<T>(table: "purchase_enquiries" | "blog_subscribers") {
  const [rows, setRows] = useState<T[] | null>(null);
  const load = async () => {
    const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
    if (error) alert(error.message); else setRows(data as T[]);
  };
  useEffect(() => { void load(); }, []);
  const remove = async (id: string) => {
    if (!confirm("Удалить запись?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) alert(error.message); else void load();
  };
  return { rows, remove };
}

export function EnquiriesPanel() {
  const { rows, remove } = useLeads<Enquiry>("purchase_enquiries");
  if (!rows) return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  if (!rows.length) return <p className="text-sm text-muted-foreground">Заявок пока нет.</p>;
  return <div className="divide-y divide-border border-y border-border">{rows.map((r) => (
    <article key={r.id} className="grid gap-2 py-5 md:grid-cols-[12rem_1fr_auto] md:gap-6">
      <div className="text-xs text-muted-foreground">{fmtDate(r.created_at)}</div>
      <div className="space-y-1 text-sm">
        {r.artwork && <p className={label}>{r.artwork}</p>}
        <p className="font-medium">{r.name} · <a className="underline" href={`mailto:${r.email}`}>{r.email}</a>{r.phone && <> · <a className="underline" href={`tel:${r.phone}`}>{r.phone}</a></>}</p>
        <p className="whitespace-pre-wrap text-muted-foreground">{r.message}</p>
      </div>
      <button onClick={() => remove(r.id)} aria-label="Удалить" className="self-start opacity-50 hover:text-red-accent hover:opacity-100"><Trash2 className="size-4" /></button>
    </article>))}</div>;
}

export function SubscribersPanel() {
  const { rows, remove } = useLeads<Subscriber>("blog_subscribers");
  if (!rows) return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  if (!rows.length) return <p className="text-sm text-muted-foreground">Подписчиков пока нет.</p>;
  return <div>
    <div className="mb-4 flex items-center justify-between text-sm"><span>Всего: {rows.length}</span>
      <button className={ghostBtn} onClick={() => navigator.clipboard.writeText(rows.map((r) => r.email).join(", "))}>Скопировать все адреса</button></div>
    <div className="divide-y divide-border border-y border-border">{rows.map((r) => (
      <div key={r.id} className="flex items-center justify-between gap-4 py-3 text-sm">
        <a className="underline-offset-4 hover:underline" href={`mailto:${r.email}`}>{r.email}</a>
        <span className="ml-auto text-xs text-muted-foreground">{fmtDate(r.created_at)}</span>
        <button onClick={() => remove(r.id)} aria-label="Удалить" className="opacity-50 hover:text-red-accent hover:opacity-100"><Trash2 className="size-4" /></button>
      </div>))}</div>
  </div>;
}

/* ---------------- About ---------------- */
export function AboutPanel() {
  const [data, setData] = useState<AboutContent | null>(null);
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [saving, setSaving] = useState(false);
  const invalidate = useInvalidate();
  useEffect(() => { void (async () => {
    const { data: row, error } = await supabase.from("site_content").select("data").eq("key", "about").maybeSingle();
    if (error) alert(error.message);
    setData((row?.data as unknown as AboutContent) ?? defaultAbout);
  })(); }, []);
  if (!data) return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  const L = data[lang];
  const setL = (patch: Partial<AboutLang>) => setData({ ...data, [lang]: { ...L, ...patch } });
  const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_content").upsert({ key: "about", data: data as never, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) alert(error.message); else { invalidate(); alert("Сохранено"); }
  };
  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex gap-4 text-xs uppercase tracking-[.18em]">{(["ru", "en"] as const).map((k) => <button key={k} onClick={() => setLang(k)} className={lang === k ? "underline underline-offset-8" : "opacity-45"}>{k === "ru" ? "Русский" : "English"}</button>)}</div>
      <F l="Портрет"><ImagePick value={data.portrait} onChange={(portrait) => setData({ ...data, portrait })} /></F>
      <F l="Текст блока на главной"><textarea rows={3} className={field} value={L.note} onChange={(e) => setL({ note: e.target.value })} /></F>
      <F l="Короткий список под текстом (каждый пункт с новой строки)"><textarea rows={4} className={field} defaultValue={L.highlights.join("\n")} key={lang + "h"} onBlur={(e) => setL({ highlights: lines(e.target.value) })} /></F>
      <div className="grid gap-6 md:grid-cols-2">
        <F l="Подпись (role)"><input className={field} value={L.role} onChange={(e) => setL({ role: e.target.value })} /></F>
        <F l="Образование"><input className={field} value={L.academy} onChange={(e) => setL({ academy: e.target.value })} /></F>
      </div>
      <div className="space-y-6">
        <p className={label}>Разделы окна «Подробнее»</p>
        {L.sections.map((sec, i) => (
          <div key={lang + i} className="space-y-3 border border-border p-4">
            <div className="flex items-center gap-3">
              <input className={field} value={sec.title} placeholder="Заголовок раздела" onChange={(e) => setL({ sections: L.sections.map((s, j) => j === i ? { ...s, title: e.target.value } : s) })} />
              <button aria-label="Удалить раздел" onClick={() => confirm("Удалить раздел?") && setL({ sections: L.sections.filter((_, j) => j !== i) })} className="opacity-50 hover:text-red-accent hover:opacity-100"><Trash2 className="size-4" /></button>
            </div>
            <textarea rows={Math.max(3, sec.items.length + 1)} className={field} placeholder="Каждый пункт с новой строки" defaultValue={sec.items.join("\n")} onBlur={(e) => setL({ sections: L.sections.map((s, j) => j === i ? { ...s, items: lines(e.target.value) } : s) })} />
          </div>
        ))}
        <button className={ghostBtn} onClick={() => setL({ sections: [...L.sections, { title: "", items: [] }] })}><Plus className="size-3.5" />Добавить раздел</button>
      </div>
      <button className={primaryBtn} disabled={saving} onClick={save}>{saving ? "Сохранение…" : "Сохранить"}</button>
    </div>
  );
}
