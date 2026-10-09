import { useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { RotateCcw, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defaultTypography, fontOptions, typographyBlocks, type FontId } from "@/lib/typography";
import { typographyQuery } from "@/lib/typography.functions";

export function TypographyPanel() {
  const { data } = useSuspenseQuery(typographyQuery);
  const [draft, setDraft] = useState({ ...data });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const qc = useQueryClient();
  const save = async () => {
    setBusy(true); setMessage("");
    try {
      const { error } = await supabase.from("site_content").upsert({ key: "typography", data: draft, updated_at: new Date().toISOString() });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: typographyQuery.queryKey });
      setMessage("Шрифты сохранены");
    } catch { setMessage("Не удалось сохранить шрифты. Попробуйте снова."); }
    finally { setBusy(false); }
  };
  return <div>
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h2 className="font-display text-3xl">Шрифты</h2>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" disabled={busy} onClick={() => { setDraft({ ...defaultTypography }); setMessage(""); }} className="hover:text-red-accent"><RotateCcw />Исходные шрифты</Button>
        <Button disabled={busy} onClick={save} className="bg-foreground text-background hover:bg-foreground/90"><Save />{busy ? "Сохранение…" : "Сохранить"}</Button>
      </div>
    </div>
    {message && <p role="status" className="mb-6 text-sm text-red-accent">{message}</p>}
    <div className="divide-y divide-border border-y border-border">
      {typographyBlocks.map(block => <section key={block.key} className="grid min-w-0 gap-5 py-7 md:grid-cols-[minmax(0,1fr)_16rem] md:items-center">
        <div className="min-w-0">
          <label htmlFor={`font-${block.key}`} className="text-xs uppercase tracking-[.12em] text-muted-foreground">{block.label}</label>
          <p data-font-preview={draft[block.key]} className="mt-3 break-words text-xl leading-relaxed">{block.sample}</p>
        </div>
        <Select value={draft[block.key]} disabled={busy} onValueChange={(value: FontId) => { setDraft(current => ({ ...current, [block.key]: value })); setMessage(""); }}>
          <SelectTrigger id={`font-${block.key}`} aria-label={block.label}><SelectValue /></SelectTrigger>
          <SelectContent>{fontOptions.map(font => <SelectItem key={font.id} value={font.id}><span data-font-preview={font.id}>{font.name}</span></SelectItem>)}</SelectContent>
        </Select>
      </section>)}
    </div>
  </div>;
}