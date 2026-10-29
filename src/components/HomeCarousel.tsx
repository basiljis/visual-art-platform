import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import signatureAsset from "@/assets/signature-clean.png.asset.json";

type Slide = { image: string; title: string; year: string; index: number; alt?: string };
export function HomeCarousel({ slides, lang, onOpen }: { slides: Slide[]; lang: "ru" | "en"; onOpen: (index: number) => void }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!api) return;
    const update = () => setSelected(api.selectedScrollSnap());
    update(); api.on("select", update);
    return () => { api.off("select", update); };
  }, [api]);
  useEffect(() => {
    if (!api || slides.length < 2 || paused) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      if (!document.hidden && !motion.matches) api.scrollNext();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [api, slides.length, paused, selected]);
  return <section id="top" data-home-design="carousel" className="bg-background pt-20 text-foreground">
    <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-6 pb-8 pt-8 md:min-h-[calc(100dvh-5rem)] md:grid-cols-2 md:gap-12 md:px-16 lg:gap-20 lg:px-28">
      <div className="order-2 flex min-w-0 flex-col items-start md:order-1 md:justify-center md:pt-24">
        <span aria-hidden="true" className="mb-7 block h-40 w-24 bg-sanguine md:mb-8 md:ml-16 md:h-[min(42dvh,22rem)] md:w-52" style={{ WebkitMaskImage: `url(${signatureAsset.url})`, WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center", maskImage: `url(${signatureAsset.url})`, maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center" }} />
        <h1 className="sr-only">{lang === "ru" ? "Наталья Дикунова — Живопись и графика" : "Natalia Dikunova — Painting and graphics"}</h1>
        <p data-font-block="intro" className="max-w-md text-lg leading-relaxed md:text-[22px] md:leading-9">{lang === "ru" ? "Живопись, рисунок и печатная графика\n о мифе и реальности." : "Painting, drawing and printmaking about myth and reality."}</p>
        <a href="#works" data-font-block="heroLink" className="mt-6 inline-flex items-center gap-3 border-b border-current pb-1 text-xs uppercase hover:text-red-accent">{lang === "ru" ? "Все работы" : "All works"}<ArrowDown className="size-3.5" /></a>
      </div>
      <Carousel className="order-1 min-w-0 md:order-2" opts={{ loop: slides.length > 1 }} setApi={setApi} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }} aria-label={lang === "ru" ? "Картины на главной" : "Featured paintings"}>
        <CarouselContent className="ml-0">
          {slides.map((slide, i) => <CarouselItem key={slide.index} className="pl-0" aria-label={`${i + 1} / ${slides.length}`}>
            <Button variant="ghost" onClick={() => onOpen(slide.index)} aria-label={slide.title} tabIndex={i === selected ? 0 : -1} className="block h-[44dvh] min-h-56 w-full cursor-zoom-in rounded-none p-0 hover:bg-transparent md:h-[min(72dvh,44rem)]">
              <img src={slide.image} alt={slide.alt || slide.title} className="h-full w-full object-contain" loading={i === 0 ? "eager" : "lazy"} />
            </Button>
          </CarouselItem>)}
        </CarouselContent>
        <div className="relative mt-3 flex min-h-10 items-start justify-center px-10">
          <p data-font-block="captions" aria-live="polite" className="text-center text-[10px] uppercase leading-5 text-muted-foreground">{slides[selected]?.title}{slides[selected]?.year ? ` · ${slides[selected]?.year}` : ""}</p>
        </div>
      </Carousel>
    </div>
  </section>;
}