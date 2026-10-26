import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import signatureAsset from "@/assets/signature-clean.png.asset.json";

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
    <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-6 pb-8 pt-8 md:min-h-[calc(100dvh-5rem)] md:grid-cols-[1fr_1.15fr] md:gap-12 md:px-16 lg:gap-20 lg:px-28">
      <div className="flex min-w-0 flex-col items-start md:self-stretch md:justify-end md:pb-12">
        <span aria-hidden="true" className="mb-6 block h-32 w-20 bg-sanguine md:mb-10 md:ml-16 md:h-64 md:w-36" style={{ WebkitMaskImage: `url(${signatureAsset.url})`, WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center", maskImage: `url(${signatureAsset.url})`, maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center" }} />
        <h1 className="sr-only">{lang === "ru" ? "Наталья Дикунова — живопись и графика" : "Natalia Dikunova — painting and printmaking"}</h1>
        <p data-font-block="intro" className="max-w-md text-base leading-relaxed md:text-xl md:leading-8">{lang === "ru" ? "Живопись, рисунок и печатная графика о памяти, мифе и человеческом присутствии." : "Painting, drawing and printmaking about memory, myth and human presence."}</p>
        <a href="#works" data-font-block="body" className="mt-5 inline-flex items-center gap-3 border-b border-current pb-1 text-[10px] uppercase hover:text-red-accent">{lang === "ru" ? "Все работы" : "All works"}<ArrowDown className="size-3.5" /></a>
      </div>
      <Carousel className="min-w-0" opts={{ loop: slides.length > 1 }} setApi={setApi} aria-label={lang === "ru" ? "Картины на главной" : "Featured paintings"}>
        <CarouselContent className="ml-0">
          {slides.map((slide, i) => <CarouselItem key={slide.index} className="pl-0" aria-label={`${i + 1} / ${slides.length}`}>
            <Button variant="ghost" onClick={() => onOpen(slide.index)} aria-label={slide.title} tabIndex={i === selected ? 0 : -1} className="block h-[55dvh] min-h-64 w-full cursor-zoom-in rounded-none p-0 hover:bg-transparent md:h-[calc(100dvh-10rem)] md:max-h-[54rem]">
              <img src={slide.image} alt={slide.title} className="h-full w-full object-contain" loading={i === 0 ? "eager" : "lazy"} />
            </Button>
          </CarouselItem>)}
        </CarouselContent>
        <div className="relative mt-3 flex min-h-10 items-start justify-center px-10">
          <p data-font-block="captions" aria-live="polite" className="text-center text-[10px] uppercase leading-5 text-muted-foreground">{slides[selected]?.title}{slides[selected]?.year ? ` · ${slides[selected]?.year}` : ""}</p>
          <Button variant="ghost" size="icon" disabled={slides.length < 2} onClick={() => api?.scrollPrev()} aria-label={lang === "ru" ? "Предыдущая картина" : "Previous painting"} title={lang === "ru" ? "Предыдущая картина" : "Previous painting"} className="absolute -left-2 -top-2 rounded-none hover:bg-transparent hover:text-red-accent"><ArrowLeft className="size-4" strokeWidth={1} /></Button>
          <Button variant="ghost" size="icon" disabled={slides.length < 2} onClick={() => api?.scrollNext()} aria-label={lang === "ru" ? "Следующая картина" : "Next painting"} title={lang === "ru" ? "Следующая картина" : "Next painting"} className="absolute -right-2 -top-2 rounded-none hover:bg-transparent hover:text-red-accent"><ArrowRight className="size-4" strokeWidth={1} /></Button>
        </div>
      </Carousel>
    </div>
  </section>;
}