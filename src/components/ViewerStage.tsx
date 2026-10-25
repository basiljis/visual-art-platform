import roomImg from "@/assets/interior-room.jpg";
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
          zoomAt(pinch.current.z * (dist() / (pinch.current.d || 1)), (a!.x + b!.x) / 2, (a!.y + b!.y) / 2);
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

/** The work hung over a 260 cm sofa in a real room photo, to scale. */
const IMG_W = 1600, IMG_H = 1008, PX_PER_CM = 1275 / 260, SOFA_TOP = 585, SOFA_CX = 832;
export function InteriorView({ src, alt, size, lang }: { src: string; alt: string; size: { w: number; h: number }; lang: "ru" | "en" }) {
  const w = size.w * PX_PER_CM, h = size.h * PX_PER_CM;
  const bottom = Math.max(SOFA_TOP - 20 * PX_PER_CM, Math.min(SOFA_TOP + 40, h + 30));
  const top = bottom - h;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  return (
    <div className="flex h-full w-full items-center justify-center p-2">
      <div className="relative w-[min(100%,calc((100vh-14rem)*1600/1008))] overflow-hidden shadow-2xl" style={{ aspectRatio: `${IMG_W}/${IMG_H}` }}>
        <img src={roomImg} alt="" width={IMG_W} height={IMG_H} className="absolute inset-0 h-full w-full object-cover" />
        <img src={src} alt={alt} className="absolute object-cover shadow-[4px_10px_18px_-6px_color-mix(in_oklab,var(--color-ink)_55%,transparent)]"
          style={{ width: pct(w, IMG_W), height: pct(h, IMG_H), left: pct(SOFA_CX - w / 2, IMG_W), top: pct(top, IMG_H) }} />
        <p className="absolute left-3 top-3 bg-paper/80 px-2 py-1 text-[11px] uppercase tracking-[.16em] text-ink">{size.h} × {size.w} {lang === "ru" ? "см · диван 260 см" : "cm · sofa 260 cm"}</p>
      </div>
    </div>
  );
}
