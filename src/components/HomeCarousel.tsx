import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

type Slide = { image: string; title: string; year: string; index: number };
export function HomeCarousel({ slides, lang, onOpen }: { slides: Slide[]; lang: "ru" | "en"; onOpen: (index: number) => void }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    if (!api) return;
    const update = () => setSelected(api.selectedScrollSnap());
    update(); api.on("select", update);
    return () => { api.off("select", update); };
  }, [api]);
  return <section id="top" data-home-design="carousel" className="bg-background pt-20 text-foreground">
    <Carousel opts={{ loop: slides.length > 1 }} setApi={setApi} aria-label={lang === "ru" ? "Картины на главной" : "Featured paintings"}>
      <CarouselContent className="ml-0">
        {slides.map((slide, i) => <CarouselItem key={slide.index} className="pl-0" aria-label={`${i + 1} / ${slides.length}`}>
          <Button variant="ghost" onClick={() => onOpen(slide.index)} aria-label={slide.title} tabIndex={i === selected ? 0 : -1} className="block h-[calc(100dvh-13rem)] min-h-64 w-full cursor-zoom-in rounded-none p-5 hover:bg-transparent md:px-20 md:py-6">
            <img src={slide.image} alt={slide.title} className="h-full w-full object-contain" loading={i === 0 ? "eager" : "lazy"} />
          </Button>
        </CarouselItem>)}
      </CarouselContent>
      <div className="grid min-h-28 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-border px-5 py-5 md:px-8">
        <div data-font-block="captions" className="min-w-0"><h1 className="text-base font-medium md:text-xl">{slides[selected]?.title}</h1><p className="mt-1 text-xs text-muted-foreground">{slides[selected]?.year}</p></div>
        <div className="flex shrink-0 items-center gap-2"><Button variant="ghost" size="icon" disabled={slides.length < 2} onClick={() => api?.scrollPrev()} aria-label={lang === "ru" ? "Предыдущая картина" : "Previous painting"} className="rounded-none hover:bg-transparent hover:text-red-accent"><ArrowLeft strokeWidth={1} /></Button><span className="text-xs tabular-nums text-muted-foreground">{selected + 1} / {slides.length}</span><Button variant="ghost" size="icon" disabled={slides.length < 2} onClick={() => api?.scrollNext()} aria-label={lang === "ru" ? "Следующая картина" : "Next painting"} className="rounded-none hover:bg-transparent hover:text-red-accent"><ArrowRight strokeWidth={1} /></Button></div>
      </div>
    </Carousel>
    <a href="#works" className="mx-5 mb-6 inline-flex items-center gap-3 border-b border-current pb-1 text-xs uppercase hover:text-red-accent md:mx-8">{lang === "ru" ? "Все работы" : "All works"}<ArrowDown className="size-4" /></a>
  </section>;
}