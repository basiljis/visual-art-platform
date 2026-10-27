import { Pointer } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";

/** Animated finger that shows which way to scroll; hides after the first scroll. */
export function ScrollHint({ direction, label, target }: { direction: "x" | "y"; label: string; target?: RefObject<HTMLElement | null> }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const el: HTMLElement | Window = target?.current ?? window;
    const hide = () => { const pos = el instanceof Window ? window.scrollY : el.scrollLeft; if (pos > 30) setShow(false); };
    el.addEventListener("scroll", hide, { passive: true });
    return () => el.removeEventListener("scroll", hide);
  }, [target]);
  if (!show) return null;
  return <div aria-hidden className="pointer-events-none flex items-center gap-2 pl-6 text-[10px] uppercase tracking-[.18em] text-muted-foreground sm:hidden">
    <Pointer strokeWidth={1.4} className={`size-6 text-red-accent ${direction === "x" ? "animate-swipe-hint" : "animate-scroll-hint"}`} />
    <span>{label}</span>
  </div>;
}
