import { Suspense } from "react";
import { GalleryLayoutPanel } from "./GalleryLayoutPanel";
import { TypographyPanel } from "./TypographyPanel";
import { StatisticsPanel } from "./StatisticsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsPanel() {
  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl">Настройки</h1>
      <Tabs defaultValue="layout">
        <TabsList aria-label="Разделы настроек" className="mb-8 flex h-auto w-full flex-wrap justify-start gap-x-6 gap-y-2 rounded-none border-b border-border bg-transparent p-0">
          {([["layout", "Главная и меню"], ["typography", "Шрифты"], ["statistics", "Статистика"]] as const).map(([key, name]) => (
            <TabsTrigger key={key} value={key} className="-mb-px rounded-none border-b border-transparent px-0 pb-3 text-sm hover:text-red-accent data-[state=active]:border-red-accent data-[state=active]:bg-transparent data-[state=active]:text-red-accent data-[state=active]:shadow-none">{name}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="layout" forceMount className="data-[state=inactive]:hidden">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Загрузка…</p>}><GalleryLayoutPanel /></Suspense>
        </TabsContent>
        <TabsContent value="typography" forceMount className="data-[state=inactive]:hidden">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Загрузка…</p>}><TypographyPanel /></Suspense>
        </TabsContent>
        <TabsContent value="statistics"><StatisticsPanel /></TabsContent>
      </Tabs>
    </div>
  );
}