import { useMemo, useState } from "react";
import { domToReact, htmlToDOM, Element, type DOMNode, type HTMLReactParserOptions } from "html-react-parser";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";

type Photo = { src: string; alt: string; caption: string };

function textOf(node: DOMNode): string {
  if (node.type === "text") return node.data;
  return node instanceof Element ? node.children.map((child) => textOf(child as DOMNode)).join("") : "";
}

function photosIn(node: DOMNode): Photo[] {
  if (!(node instanceof Element)) return [];
  const src = node.attribs["src"];
  if (node.name === "img" && src) {
    const figure = node.parent instanceof Element && node.parent.name === "figure" ? node.parent : null;
    const caption = figure?.children.find((child) => child instanceof Element && child.name === "figcaption");
    return [{ src, alt: node.attribs["alt"] || "", caption: caption ? textOf(caption as DOMNode).trim() : "" }];
  }
  return node.children.flatMap((child) => photosIn(child as DOMNode));
}

function isPhotoBlock(node: DOMNode): boolean {
  if (node.type === "text") return !node.data.trim();
  if (!(node instanceof Element)) return false;
  if (node.name === "img" || node.name === "br" || node.name === "figcaption") return true;
  return ["p", "div", "figure", "a", "span", "picture"].includes(node.name)
    && node.children.every((child) => isPhotoBlock(child as DOMNode));
}

export function BlogArticleBody({ html }: { html: string }) {
  const { lang } = useLanguage();
  const en = lang === "en";
  const nodes = useMemo(() => htmlToDOM(html), [html]);
  const photos = useMemo(() => nodes.flatMap(photosIn), [nodes]);
  const [selected, setSelected] = useState<number | null>(null);
  const current = selected === null ? undefined : photos[selected];
  const move = (step: number) => setSelected((index) => index === null ? null : (index + step + photos.length) % photos.length);
  const openPhoto = (photo: Photo) => setSelected(photos.indexOf(photo) >= 0 ? photos.indexOf(photo) : photos.findIndex((item) => item.src === photo.src));
  const renderGallery = (items: Photo[], key: number | string) => (
    <span key={key} className={`not-prose my-8 grid gap-3 ${items.length > 1 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`} data-blog-gallery>
      {items.map((photo, index) => (
        <span key={`${photo.src}-${index}`} className="block min-w-0">
          <Button variant="ghost" onClick={() => openPhoto(photo)} aria-label={`${en ? "Open photo" : "Открыть фотографию"} ${photos.findIndex((item) => item.src === photo.src) + 1}`}
            className={`group relative block h-auto w-full overflow-hidden rounded-none bg-muted p-0 hover:bg-muted focus-visible:ring-red-accent ${items.length > 1 ? "aspect-[4/5]" : ""}`}>
            <img src={photo.src} alt={photo.alt} loading="lazy" className={`w-full transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.025] ${items.length > 1 ? "h-full object-cover" : "max-h-[640px] object-contain"}`} />
            <span className="absolute bottom-2 right-2 grid size-8 place-items-center bg-paper text-ink transition-colors group-hover:text-red-accent"><Maximize2 /></span>
          </Button>
          {photo.caption && <span className="mt-2 block text-sm text-muted-foreground">{photo.caption}</span>}
        </span>
      ))}
    </span>
  );
  const options: HTMLReactParserOptions = {
    replace: (node) => {
      if (node instanceof Element && node.name === "img") return renderGallery(photosIn(node), node.attribs["src"] || "photo");
      return undefined;
    },
  };
  const content = [];
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (!node) continue;
    if (isPhotoBlock(node) && photosIn(node).length > 0) {
      const group = photosIn(node);
      let next = nodes[index + 1];
      while (next && isPhotoBlock(next)) {
        index++;
        group.push(...photosIn(next));
        next = nodes[index + 1];
      }
      content.push(renderGallery(group, index));
    } else {
      content.push(<span key={index} className="contents">{domToReact([node], options)}</span>);
    }
  }
  return (
    <>
      <div className="post-body mt-10">{content}</div>
      <Dialog.Root open={Boolean(current)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-paper" />
          <Dialog.Content aria-describedby={undefined} className="fixed inset-0 z-[101] flex flex-col bg-paper text-ink outline-none"
            onKeyDown={(event) => { if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); } if (event.key === "ArrowRight") { event.preventDefault(); move(1); } }}>
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink/15 px-4 sm:px-8">
              <Dialog.Title className="text-sm">{en ? "Photo gallery" : "Фотогалерея"} <span className="ml-3 tabular-nums">{selected === null ? 0 : selected + 1} / {photos.length}</span></Dialog.Title>
              <Dialog.Close asChild><Button variant="ghost" size="icon" aria-label={en ? "Close" : "Закрыть"} title={en ? "Close" : "Закрыть"} className="hover:bg-transparent hover:text-red-accent"><X /></Button></Dialog.Close>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-12 py-4 sm:px-20"
              onTouchStart={(event) => { event.currentTarget.dataset["touchStart"] = String(event.touches[0]?.clientX ?? 0); }}
              onTouchEnd={(event) => { const delta = (event.changedTouches[0]?.clientX ?? 0) - Number(event.currentTarget.dataset["touchStart"]); if (Math.abs(delta) > 50) move(delta < 0 ? 1 : -1); }}>
              {current && <img src={current.src} alt={current.alt} className="h-full w-full object-contain" />}
              {photos.length > 1 && <>
                <Button variant="ghost" size="icon" onClick={() => move(-1)} aria-label={en ? "Previous photo" : "Предыдущая фотография"} title={en ? "Previous photo" : "Предыдущая фотография"} className="absolute left-1 sm:left-5 hover:bg-transparent hover:text-red-accent"><ArrowLeft /></Button>
                <Button variant="ghost" size="icon" onClick={() => move(1)} aria-label={en ? "Next photo" : "Следующая фотография"} title={en ? "Next photo" : "Следующая фотография"} className="absolute right-1 sm:right-5 hover:bg-transparent hover:text-red-accent"><ArrowRight /></Button>
              </>}
            </div>
            {current?.caption && <p className="shrink-0 px-6 pb-4 text-center text-sm">{current.caption}</p>}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}