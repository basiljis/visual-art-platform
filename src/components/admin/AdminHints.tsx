import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const hints: Record<string, string> = {
  "Удалить": "Удалить запись после подтверждения",
  "Скрыть": "Убрать картину с сайта, сохранив её в админке",
  "Показать": "Вернуть картину в галерею на сайте",
  "Работы": "Картины, подписи, видимость и порядок внутри разделов",
  "Направления": "Разделы, подразделы, описания и их порядок",
  "Блог": "Статьи, фотографии, переводы и связанные работы",
  "Об авторе": "Биография, портрет, выставки и награды",
  "Новости": "Новости и настройки окна объявлений",
  "Заявки": "Обращения посетителей о покупке картин",
  "Подписки": "Список подписчиков блога",
  "Шрифты": "Оформление текста на страницах сайта",
  "Сохранить порядок": "Применить новый порядок к галерее на сайте",
  "Порядок": "Меньшее число располагает запись раньше в списке",
  "Опубликовано": "Показывать эту запись посетителям сайта",
  "Показывать на главном экране": "Включить работу в подборку на главной странице",
  "Обложка подраздела": "Использовать работу для представления подраздела",
  "Адрес (slug)": "Постоянный адрес статьи; изменение повлияет на прежние ссылки",
};

export function AdminHints({ children }: { children: ReactNode }) {
  const [hint, setHint] = useState<{ text: string; x: number; y: number } | null>(null);
  useEffect(() => {
    const root = document.getElementById("admin-hints");
    if (!root) return;
    const show = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest("button, a, input, select, textarea, label");
      if (!target || !root.contains(target)) { setHint(null); return; }
      const name = target.getAttribute("aria-label") || target.getAttribute("placeholder") || target.textContent?.trim() || "";
      const title = target.getAttribute("title");
      const text = hints[name] || title || (name.startsWith("Изменить порядок:") ? "Перетащите за этот значок, затем сохраните порядок" : name.startsWith("Новая") || name.startsWith("Новое") || name.startsWith("Добавить") ? name : "");
      if (!text) { setHint(null); return; }
      const rect = target.getBoundingClientRect();
      setHint({ text, x: Math.max(150, Math.min(window.innerWidth - 150, rect.x + rect.width / 2)), y: Math.min(window.innerHeight - 60, rect.bottom + 8) });
    };
    const hide = () => setHint(null);
    root.addEventListener("mouseover", show); root.addEventListener("focusin", show);
    root.addEventListener("mouseleave", hide); root.addEventListener("focusout", hide); root.addEventListener("pointerdown", hide);
    window.addEventListener("scroll", hide, true);
    return () => { root.removeEventListener("mouseover", show); root.removeEventListener("focusin", show); root.removeEventListener("mouseleave", hide); root.removeEventListener("focusout", hide); root.removeEventListener("pointerdown", hide); window.removeEventListener("scroll", hide, true); };
  }, []);
  return <div id="admin-hints">{children}{hint && createPortal(<div role="tooltip" className="pointer-events-none fixed z-[120] max-w-72 -translate-x-1/2 rounded-sm bg-ink px-3 py-2 text-xs leading-relaxed text-paper shadow-md" style={{ left: hint.x, top: hint.y }}>{hint.text}</div>, document.body)}</div>;
}