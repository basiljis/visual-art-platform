import { useSuspenseQuery } from "@tanstack/react-query";
import { domToReact, htmlToDOM, Element, type DOMNode } from "html-react-parser";
import { postQuery } from "@/lib/content.functions";
import { htmlForDisplay } from "@/lib/media";
import { useLanguage } from "@/lib/language";

function videoNodes(nodes: DOMNode[]): Element[] {
  return nodes.flatMap(node => {
    if (!(node instanceof Element)) return [];
    return node.name === "video" ? [node] : videoNodes(node.children as DOMNode[]);
  });
}

export function MuralVideos() {
  const { lang } = useLanguage();
  const { data } = useSuspenseQuery(postQuery("blog-011"));
  if (!data) return null;
  const html = lang === "en" ? data.post.content_html_en || data.post.content_html : data.post.content_html;
  const videos = videoNodes(htmlToDOM(htmlForDisplay(html)));
  return <div className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-3" data-mural-videos>
    {videos.map((video, index) => <div key={index} className="min-w-0 [&_video]:aspect-video [&_video]:w-full [&_video]:object-contain">
      {domToReact([video])}
    </div>)}
  </div>;
}