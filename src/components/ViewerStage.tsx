import roomImg from "@/assets/interior-room.jpg";
import diningImg from "@/assets/interior-dining.jpg";
import consoleImg from "@/assets/interior-console.jpg";
import { Button } from "@/components/ui/button";
import { interiorGeometry, placeArtwork } from "@/lib/interior-layout";
import { useEffect, useRef, useState } from "react";

const MIN = 1, MAX = 5;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Parses "60×80", "60 x 80 см", "60х80" → { w, h } in cm (width first). */
export function parseSize(size: string): { w: number; h: number } | null {
  const m = size.replace(",", ".").match(/(\d+(?:\.\d+)?)\s*[x×хX*]\s*(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const a = Number(m[1]), b = Number(m[2]);
  if (!a || !b || a > 1000 || b > 1000) return null;
  // Russian convention: height × width
  return { h: a, w: b };
}

/** Image with wheel / pinch zoom and drag panning around the cursor. */
export function ZoomImage({ src, alt, resetKey }: { src: string; alt: string; resetKey: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ z: 1, x: 0, y: 0 });
  const tRef = useRef(t); tRef.current = t;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number; z: number } | null>(null);

  useEffect(() => setT({ z: 1, x: 0, y: 0 }), [resetKey]);

  const zoomAt = (next: number, cx: number, cy: number) => {
    const el = box.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = cx - r.left - r.width / 2, py = cy - r.top - r.height / 2;
    const cur = tRef.current; const z = clamp(next, MIN, MAX); const k = z / cur.z;
    setT(z === 1 ? { z: 1, x: 0, y: 0 } : { z, x: px - (px - cur.x) * k, y: py - (py - cur.y) * k });
  };

  useEffect(() => {
    const el = box.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      zoomAt(tRef.current.z * Math.exp(-dy * 0.002), e.clientX, e.clientY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const dist = () => { const [a, b] = [...pointers.current.values()]; return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0; };
  return (
    <div ref={box} className={`relative flex h-full w-full touch-none select-none items-center justify-center overflow-hidden ${t.z > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
      onDoubleClick={(e) => zoomAt(t.z > 1 ? 1 : 2.5, e.clientX, e.clientY)}
      onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pointers.current.size === 2) pinch.current = { d: dist(), z: tRef.current.z }; }}
      onPointerMove={(e) => {
        const prev = pointers.current.get(e.pointerId); if (!prev) return;
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.current.size === 2 && pinch.current) {
          const [a, b] = [...pointers.current.values()];
          if (a && b) zoomAt(pinch.current.z * (dist() / (pinch.current.d || 1)), (a.x + b.x) / 2, (a.y + b.y) / 2);
        } else if (tRef.current.z > 1) {
          setT((c) => ({ ...c, x: c.x + e.clientX - prev.x, y: c.y + e.clientY - prev.y }));
        }
      }}
      onPointerUp={(e) => { pointers.current.delete(e.pointerId); if (pointers.current.size < 2) pinch.current = null; }}
      onPointerCancel={(e) => { pointers.current.delete(e.pointerId); pinch.current = null; }}>
      <img src={src} alt={alt} draggable={false} style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.z})` }} className="max-h-full max-w-full animate-reveal object-contain shadow-2xl transition-transform duration-75 will-change-transform" />
    </div>
  );
}

const scenes = [
  { key: "sofa", image: roomImg, ru: "Гостиная", en: "Living room" },
  { key: "dining", image: diningImg, ru: "Столовая", en: "Dining room" },
  { key: "console", image: consoleImg, ru: "Консоль", en: "Console" },
] as const;
export function InteriorView({ src, alt, size, lang }: { src: string; alt: string; size: { w: number; h: number }; lang: "ru" | "en" }) {
  const [selected, setSelected] = useState(0);
  const [natural, setNatural] = useState<{ src: string; aspect: number } | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setBounds({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const scene = scenes[selected] ?? scenes[0];
  const geometry = interiorGeometry[scene.key];
  const box = placeArtwork(geometry, size, natural?.src === src ? natural.aspect : size.w / size.h);
  const sceneWidth = Math.min(bounds.width, bounds.height * geometry.width / geometry.height);
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3 p-2">
      <div role="group" aria-label={lang === "ru" ? "Интерьер" : "Interior"} className="flex shrink-0 flex-wrap justify-center gap-2">
        {scenes.map((item, index) => <Button key={item.key} variant="ghost" size="sm" aria-pressed={selected === index} onClick={() => setSelected(index)} className={`h-9 rounded-none border-b px-3 text-xs hover:text-red-accent ${selected === index ? "border-red-accent text-red-accent" : "border-transparent text-current"}`}>{item[lang]}</Button>)}
      </div>
      <div ref={host} className="flex min-h-0 flex-1 items-center justify-center">
      <div data-interior-scene={scene.key} className="relative max-w-full overflow-hidden" style={{ width: sceneWidth || "100%", aspectRatio: `${geometry.width}/${geometry.height}` }}>
        <img src={scene.image} alt="" loading="lazy" width={1600} height={1008} className="absolute inset-0 h-full w-full object-contain" />
        <img src={src} alt={alt} data-interior-artwork onLoad={(e) => { const img = e.currentTarget; if (img.naturalHeight) setNatural({ src, aspect: img.naturalWidth / img.naturalHeight }); }} className="absolute object-contain shadow-interior-art"
          style={{ width: pct(box.width, geometry.width), height: pct(box.height, geometry.height), left: pct(box.left, geometry.width), top: pct(box.top, geometry.height) }} />
        <p className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] bg-paper/80 px-2 py-1 text-[10px] text-ink">{size.h} × {size.w} {lang === "ru" ? "см" : "cm"}{box.scale < 0.999 ? (lang === "ru" ? " · уменьшенный масштаб" : " · reduced scale") : ""}</p>
      </div>
      </div>
      <p className="shrink-0 text-center text-xs leading-relaxed opacity-70">{lang === "ru" ? (scene.key === "sofa" ? "Ширина дивана для сравнения — около 260 см." : scene.key === "dining" ? "Ширина стола для сравнения — около 200 см." : "Ширина консоли для сравнения — около 200 см.") : (scene.key === "sofa" ? "Sofa reference width: approximately 260 cm." : scene.key === "dining" ? "Table reference width: approximately 200 cm." : "Console reference width: approximately 200 cm.")} {lang === "ru" ? "Размеры и размещение ориентировочные." : "Dimensions and placement are approximate."} {box.scale < 0.999 && (lang === "ru" ? "Картина показана в уменьшенном масштабе, чтобы поместиться на свободной стене." : "The artwork is scaled down to fit the unobstructed wall.")}</p>
    </div>
  );
}
