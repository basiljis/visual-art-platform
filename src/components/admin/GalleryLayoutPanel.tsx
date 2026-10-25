import { useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { GalleryHorizontal, Image, PanelLeft, PanelTop, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { galleryLayoutQuery } from "@/lib/gallery-layout.functions";
import type { HomeDesign, MenuPlacement } from "@/lib/gallery-layout";

export function GalleryLayoutPanel() {
  const { data } = useSuspenseQuery(galleryLayoutQuery);
  const [placement, setPlacement] = useState<MenuPlacement>(data.menuPlacement);
  const [homeDesign, setHomeDesign] = useState<HomeDesign>(data.homeDesign);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const qc = useQueryClient();
  const save = async () => {
    setBusy(true); setMessage("");
    try {
      const { error } = await supabase.from("site_content").upsert({ key: "gallery_layout", data: { menuPlacement: placement, homeDesign }, updated_at: new Date().toISOString() });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: galleryLayoutQuery.queryKey });
      setMessage("Оформление сохранено");
    } catch { setMessage("Не удалось сохранить положение меню. Попробуйте снова."); }
    finally { setBusy(false); }
  };
  return <section className="mb-10 border-b border-border pb-8">
    <h2 className="mb-5 font-display text-2xl">Главная страница</h2>
    <div role="group" aria-label="Оформление главной страницы" className="mb-8 flex flex-wrap gap-2">
      {([{ key: "portrait", label: "Автопортрет", Icon: Image }, { key: "carousel", label: "Переключаемые картины", Icon: GalleryHorizontal }] as const).map(({ key, label, Icon }) => <Button key={key} variant="outline" disabled={busy} aria-pressed={homeDesign === key} onClick={() => { setHomeDesign(key); setMessage(""); }} className={homeDesign === key ? "border-red-accent text-red-accent hover:text-red-accent" : "hover:text-red-accent"}><Icon />{label}</Button>)}
    </div>
    <h2 className="mb-5 font-display text-2xl">Меню направлений</h2>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div role="group" aria-label="Положение меню направлений" className="flex flex-wrap gap-2">
        {([{ key: "top", label: "Сверху", Icon: PanelTop }, { key: "side", label: "Сбоку", Icon: PanelLeft }] as const).map(({ key, label, Icon }) => <Button key={key} variant="outline" disabled={busy} aria-pressed={placement === key} title={key === "side" ? "Меню слева от картин; на телефоне — над ними" : "Меню над картинами"} onClick={() => { setPlacement(key); setMessage(""); }} className={placement === key ? "border-red-accent text-red-accent hover:text-red-accent" : "hover:text-red-accent"}><Icon />{label}</Button>)}
      </div>
      <Button onClick={save} disabled={busy} className="bg-foreground text-background hover:bg-foreground/90"><Save />{busy ? "Сохранение…" : "Сохранить оформление"}</Button>
    </div>
    {message && <p role="status" className="mt-4 text-sm text-red-accent">{message}</p>}
  </section>;
}