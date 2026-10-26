import { Suspense } from "react";
import { GalleryLayoutPanel } from "./GalleryLayoutPanel";
import { TypographyPanel } from "./TypographyPanel";
import { StatisticsPanel } from "./StatisticsPanel";

export function SettingsPanel() {
  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl">Настройки</h1>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Загрузка…</p>}>
        <GalleryLayoutPanel />
      </Suspense>
      <section aria-label="Настройки шрифтов" className="border-b border-border pb-10">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Загрузка…</p>}>
          <TypographyPanel />
        </Suspense>
      </section>
      <StatisticsPanel />
    </div>
  );
}