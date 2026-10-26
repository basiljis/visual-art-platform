import signatureAsset from "@/assets/signature-clean.png.asset.json";
import { useLanguage } from "@/lib/language";

export function SitePreloader() {
  const { lang } = useLanguage();
  return <div className="site-preloader pointer-events-none fixed inset-0 z-[100] flex animate-preloader flex-col items-center justify-center overflow-hidden bg-ink text-paper" aria-hidden="true">
    <div className="paper-grain absolute inset-0" />
    <svg viewBox="0 0 400 800" className="relative h-56 w-56 md:h-72 md:w-72">
      <defs><mask id="preloader-sign-mask" maskUnits="userSpaceOnUse"><g fill="none" stroke="currentColor" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round">
        <path className="sign-stroke" pathLength={1} d="M28 310 L185 196 L72 368 L170 240 L122 380 L198 236 L155 392 L225 255 L192 476 L245 290 L270 200 L304 102 L282 170 L270 230 C285 280 300 285 332 300 L270 375 C255 400 262 408 300 412 C320 418 310 470 302 520 C300 580 360 640 368 720 L366 775 L356 762" />
        <circle className="sign-dot" pathLength={1} cx="270" cy="318" r="10" />
      </g></mask></defs>
      <image href={signatureAsset.url} width="400" height="800" mask="url(#preloader-sign-mask)" />
    </svg>
    <p data-font-block="preloader" className="relative mt-6 font-display text-lg">{lang === "ru" ? "НАТАЛЬЯ ДИКУНОВА" : "NATALIA DIKUNOVA"} <span className="font-sans text-red-accent">/</span> <span className="font-sans text-xs lowercase opacity-60">artist</span></p>
  </div>;
}