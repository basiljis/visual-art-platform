import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl } from "@/lib/media";
import { uploadMedia } from "@/lib/admin-media";
import { defaultNewsSettings, type NewsRow, type NewsSettings } from "@/lib/news.functions";
import { field, label, primaryBtn } from "./Panels";

const ghost = "inline-flex items-center gap-2 border-b border-current pb-0.5 text-xs uppercase tracking-[.16em] transition-colors hover:text-red-accent";
const empty: Omit<NewsRow, "id"> = { title_ru: "", title_en: "", body_ru: "", body_en: "", event_date: "", address_ru: "", address_en: "", link: null, image: null, published: true, sort: 0 };

export function NewsPanel() {
  const [rows, setRows] = useState<NewsRow[] | null>(null);
  const [edit, setEdit] = useState<(Omit<NewsRow, "id"> & { id?: string }) | null>(null);
  const [settings, setSettings] = useState<NewsSettings>(defaultNewsSettings);
  const [savedMsg, setSavedMsg] = useState("");

  const load = async () => {
    const { data, error } = await supabase.from("news").select("*").order("sort");
    if (error) alert(error.message); else setRows(data as NewsRow[]);
  };
  useEffect(() => {
    load();
    supabase.from("site_content").select("data").eq("key", "news_settings").maybeSingle().then(({ data }) => {
      if (data?.data) setSettings({ ...defaultNewsSettings, ...(data.data as Partial<NewsSettings>) });
    });
  }, []);

  const saveSettings = async () => {
    const { error } = await supabase.from("site_content").upsert({ key: "news_settings", data: settings, updated_at: new Date().toISOString() });
    setSavedMsg(error ? error.message : "Сохранено");
    setTimeout(() => setSavedMsg(""), 2500);
  };
  const save = async () => {
    if (!edit) return;
    if (!edit.title_ru.trim()) { alert("Введите заголовок"); return; }
    const { id, ...rest } = edit;
    const payload = { ...rest, link: rest.link?.trim() || null };
    const { error } = id ? await supabase.from("news").update(payload).eq("id", id) : await supabase.from("news").insert({ ...payload, sort: rows?.length ?? 0 });
    if (error) { alert(error.message); return; }
    setEdit(null); load();
  };
  const remove = async (n: NewsRow) => {
    if (!confirm(`Удалить «${n.title_ru}»?`)) return;
    const { error } = await supabase.from("news").delete().eq("id", n.id);
    if (error) alert(error.message); else load();
  };
  const toggle = async (n: NewsRow) => {
    const { error } = await supabase.from("news").update({ published: !n.published }).eq("id", n.id);
    if (error) alert(error.message); else load();
  };
  const set = (k: keyof NewsRow, v: string | boolean | null) => setEdit((e) => (e ? { ...e, [k]: v } : e));

  return (
    <div className="space-y-12">
      <section className="space-y-4 border border-border p-5">
        <h3 className="font-display text-2xl">Всплывающее окно</h3>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={settings.enabled} onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })} />Показывать новости посетителям</label>
        <div className="max-w-xs"><span className={label}>Через сколько секунд показывать</span>
          <input type="number" min={0} max={600} value={settings.delay} onChange={(e) => setSettings({ ...settings, delay: Math.max(0, Math.min(600, Number(e.target.value) || 0)) })} className={field} /></div>
        <p className="text-xs text-muted-foreground">Окно показывается один раз за посещение, если есть хотя бы одна опубликованная новость.</p>
        <div className="flex items-center gap-4"><button onClick={saveSettings} className={primaryBtn}>Сохранить настройки</button>{savedMsg && <span className="text-xs text-muted-foreground">{savedMsg}</span>}</div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between"><h3 className="font-display text-2xl">Новости</h3><button onClick={() => setEdit({ ...empty })} className={primaryBtn}><Plus className="size-4" />Новость</button></div>
        {!rows ? <p className="text-sm text-muted-foreground">Загрузка…</p> : rows.length === 0 ? <p className="text-sm text-muted-foreground">Новостей пока нет.</p> : (
          <ul className="divide-y divide-border border-y border-border">
            {rows.map((n) => (
              <li key={n.id} className="flex items-center gap-4 py-3">
                <div className="size-14 shrink-0 overflow-hidden bg-muted">{n.image && <img src={mediaUrl(n.image)} alt="" className="h-full w-full object-cover" />}</div>
                <button onClick={() => setEdit(n)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm">{n.title_ru}{!n.published && <span className="ml-2 text-[10px] uppercase tracking-[.16em] text-red-accent">скрыта</span>}</p>
                  <p className="truncate text-xs text-muted-foreground">{[n.event_date, n.address_ru].filter(Boolean).join(" · ")}</p>
                </button>
                <button onClick={() => toggle(n)} title={n.published ? "Скрыть" : "Показать"} aria-label={n.published ? "Скрыть" : "Показать"} className="hover:text-red-accent">{n.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}</button>
                <button onClick={() => remove(n)} title="Удалить" aria-label="Удалить" className="hover:text-red-accent"><Trash2 className="size-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {edit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-foreground/40 backdrop-blur-sm" onClick={() => setEdit(null)}>
          <div className="mx-auto my-6 w-[min(100%-1.5rem,48rem)] space-y-5 bg-background p-5 shadow-2xl md:my-12 md:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between"><h2 className="font-display text-3xl">{edit.id ? "Новость" : "Новая новость"}</h2><button onClick={() => setEdit(null)} aria-label="Закрыть" className="hover:text-red-accent"><X className="size-5" /></button></div>
            <div className="grid gap-5 md:grid-cols-2">
              <div><span className={label}>Заголовок (RU)</span><input value={edit.title_ru} onChange={(e) => set("title_ru", e.target.value)} className={field} /></div>
              <div><span className={label}>Заголовок (EN)</span><input value={edit.title_en} onChange={(e) => set("title_en", e.target.value)} className={field} /></div>
              <div className="md:col-span-2"><span className={label}>Дата (например, 12–30 ноября 2026)</span><input value={edit.event_date} onChange={(e) => set("event_date", e.target.value)} className={field} /></div>
              <div><span className={label}>Адрес (RU)</span><input value={edit.address_ru} onChange={(e) => set("address_ru", e.target.value)} className={field} /></div>
              <div><span className={label}>Адрес (EN)</span><input value={edit.address_en} onChange={(e) => set("address_en", e.target.value)} className={field} /></div>
              <div><span className={label}>Описание (RU)</span><textarea rows={4} value={edit.body_ru} onChange={(e) => set("body_ru", e.target.value)} className={field} /></div>
              <div><span className={label}>Описание (EN)</span><textarea rows={4} value={edit.body_en} onChange={(e) => set("body_en", e.target.value)} className={field} /></div>
              <div className="md:col-span-2"><span className={label}>Ссылка (необязательно)</span><input value={edit.link ?? ""} onChange={(e) => set("link", e.target.value)} className={field} placeholder="https://" /></div>
            </div>
            <div className="flex items-end gap-4">
              <div className="aspect-[4/3] w-32 overflow-hidden bg-muted">{edit.image && <img src={mediaUrl(edit.image)} alt="" className="h-full w-full object-cover" />}</div>
              <label className={`${ghost} cursor-pointer`}><Upload className="size-3.5" />{edit.image ? "Заменить фото" : "Фото (необязательно)"}
                <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { set("image", await uploadMedia(f)); } catch (err) { alert(err instanceof Error ? err.message : "Ошибка"); } e.target.value = ""; }} />
              </label>
              {edit.image && <button onClick={() => set("image", null)} className={ghost}>Убрать</button>}
            </div>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={edit.published} onChange={(e) => set("published", e.target.checked)} />Опубликована</label>
            <button onClick={save} className={primaryBtn}>Сохранить</button>
          </div>
        </div>
      )}
    </div>
  );
}
