import { useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";

const ID = 113831441;
type Ym = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };

export function YandexMetrika() {
  const { pathname, searchStr } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    const w = window as unknown as { ym?: Ym };
    if (w.ym) return;
    const ym: Ym = (...args) => { (ym.a = ym.a || []).push(args); };
    ym.l = Date.now();
    w.ym = ym;
    const src = `https://mc.yandex.ru/metrika/tag.js?id=${ID}`;
    const s = document.createElement("script");
    s.async = true; s.src = src;
    document.head.appendChild(s);
    ym(ID, "init", { ssr: true, webvisor: true, clickmap: true, ecommerce: "dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce: true, trackLinks: true });
  }, []);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    (window as unknown as { ym?: Ym }).ym?.(ID, "hit", location.href);
  }, [pathname, searchStr]);
  return null;
}
