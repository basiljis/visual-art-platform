import { useState } from "react";
import { ru, enUS } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";
import { publicationDate } from "@/lib/blog-dates";

export function BlogCalendar({ dates, selected, onSelect }: { dates: string[]; selected: Date | undefined; onSelect: (day: Date | undefined) => void }) {
  const { lang } = useLanguage();
  const en = lang === "en";
  const days = dates.map(publicationDate).filter((day): day is Date => Boolean(day));
  const latest = days.reduce<Date | undefined>((best, day) => !best || day > best ? day : best, undefined);
  const earliest = days.reduce<Date | undefined>((best, day) => !best || day < best ? day : best, undefined);
  const [month, setMonth] = useState<Date | undefined>(latest);
  return (
    <aside className="border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pl-7 lg:pt-0" aria-label={en ? "Publication calendar" : "Календарь публикаций"}>
      <h2 className="mb-4 font-display text-2xl">{en ? "Publication calendar" : "Календарь публикаций"}</h2>
      <Calendar mode="single" selected={selected} onSelect={onSelect} month={month} onMonthChange={setMonth}
        locale={en ? enUS : ru} weekStartsOn={1} captionLayout="dropdown" showOutsideDays={false}
        startMonth={earliest} endMonth={latest} modifiers={{ published: days }}
        modifiersClassNames={{ published: "blog-publication-day" }}
        className="mx-auto bg-transparent p-0 lg:mx-0"
        classNames={{ today: "", selected: "blog-selected-day" }}
        formatters={{ formatMonthDropdown: (date) => date.toLocaleDateString(en ? "en-US" : "ru-RU", { month: "long" }) }} />
      {selected && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-sm">{selected.toLocaleDateString(en ? "en-US" : "ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
        <Button variant="link" onClick={() => onSelect(undefined)} className="h-auto p-0 text-red-accent">{en ? "All dates" : "Все даты"}</Button>
      </div>}
    </aside>
  );
}