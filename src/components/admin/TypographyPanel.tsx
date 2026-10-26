import { useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { RotateCcw, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defaultTypography, fontOptions, typographyBlocks, typographyCss, type BlockStyle } from "@/lib/typography";
import { typographyQuery } from "@/lib/typography.functions";

const weightOptions = [
  { value: "0", label: "Обычная" },
  { value: "100", label: "Тонкая 100 — старый сайт" },
  { value: "300", label: "Светлая 300" },
  { value: "400", label: "400" },
  { value: "500", label: "Средняя 500" },
  { value: "600", label: "Полужирная 600" },
  { value: "700", label: "Жирная 700" },
];
const lineHeightOptions = [
  { value: "0", label: "Авто" },
  { value: "1.2", label: "1.2" },
  { value: "1.3", label: "1.3" },
  { value: "1.4", label: "1.4" },
  { value: "1.5", label: "1.5" },
  { value: "1.6", label: "1.6" },
  { value: "1.8", label: "1.8" },
  { value: "2", label: "2.0" },
];

export function TypographyPanel() {
  const { data } = useSuspenseQuery(typographyQuery);
  const [draft, setDraft] = useState({ ...data });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const qc = useQueryClient();
  const setBlock = (key: string, patch: Partial<BlockStyle>) =>
    setDraft(current => ({ ...current, [key]: { ...current[key as keyof typeof current], ...patch } }));
  const save = async () => {
    setBusy(true); setMessage("");
    try {
      const { error } = await supabase.from("site_content").upsert({ key: "typography", data: draft, updated_at: new Date().toISOString() });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: typographyQuery.queryKey });
      setMessage("Шрифты сохранены — сайт обновится сразу");
    } catch { setMessage("Не удалось сохранить шрифты. Попробуйте снова."); }
    finally { setBusy(false); }
  };
  return <div>
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h2 className="font-display text-3xl">Шрифты</h2>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" disabled={busy} onClick={() => { setDraft({ ...defaultTypography }); setMessage(""); }} className="hover:text-red-accent"><RotateCcw />Вернуть исходные</Button>
        <Button disabled={busy} onClick={save} className="bg-foreground text-background hover:bg-foreground/90"><Save />{busy ? "Сохранение…" : "Сохранить"}</Button>
      </div>
    </div>
    {message && <p role="status" className="mb-6 text-sm text-red-accent">{message}</p>}
    {/* Живой предпросмотр: сгенерированный CSS применяется к образцам ниже так же, как на сайте */}
    <style>{typographyCss(draft)}</style>
    <div className="site-typography divide-y divide-border border-y border-border">
      {typographyBlocks.map(block => {
        const s = draft[block.key];
        return <section key={block.key} className="grid gap-5 py-7 md:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <label htmlFor={`font-${block.key}`} className="text-xs uppercase tracking-[.12em] text-muted-foreground">{block.label}</label>
            <p data-font-block={block.key} className="mt-3 break-words text-xl leading-relaxed">{block.sample}</p>
          </div>
          <div className="grid content-start gap-3">
            <Select value={s.font} disabled={busy} onValueChange={(value: BlockStyle["font"]) => setBlock(block.key, { font: value })}>
              <SelectTrigger id={`font-${block.key}`} aria-label={`Шрифт — ${block.label}`}><SelectValue /></SelectTrigger>
              <SelectContent>{fontOptions.map(font => <SelectItem key={font.id} value={font.id}><span data-font-preview={font.id}>{font.name}</span></SelectItem>)}</SelectContent>
            </Select>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground"><span>Размер</span><span className="tabular-nums">{Math.round(s.size * 100)}%</span></div>
              <input type="range" min={0.7} max={1.5} step={0.05} value={s.size} disabled={busy}
                onChange={(e) => setBlock(block.key, { size: Number(e.target.value) })}
                aria-label={`Размер шрифта — ${block.label}`} className="w-full accent-[var(--red-accent)]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={String(s.weight)} disabled={busy} onValueChange={(value) => setBlock(block.key, { weight: Number(value) })}>
                <SelectTrigger aria-label={`Насыщенность — ${block.label}`}><SelectValue /></SelectTrigger>
                <SelectContent>{weightOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={String(s.lineHeight)} disabled={busy} onValueChange={(value) => setBlock(block.key, { lineHeight: Number(value) })}>
                <SelectTrigger aria-label={`Межстрочный интервал — ${block.label}`}><SelectValue /></SelectTrigger>
                <SelectContent>{lineHeightOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </section>;
      })}
    </div>
  </div>;
}
