import type { AboutContent } from "./about";
import type { CategoryRow, WorkRow } from "./content.functions";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { artistContacts, PROFILE_LIMITS, profileSections, selectedPortfolioWorks, workProject } from "./artist-profile";
import { artworkPath } from "./artwork-seo";
import { mediaUrl } from "./media";

async function compressedImage(ref: string) {
  const response = await fetch(mediaUrl(ref));
  if (!response.ok) throw new Error("Image unavailable");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image(); img.src = url; await img.decode();
    const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas"); canvas.width = Math.round(img.naturalWidth * scale); canvas.height = Math.round(img.naturalHeight * scale);
    const context = canvas.getContext("2d"); if (!context) throw new Error("Image unavailable");
    context.fillStyle = "white"; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally { URL.revokeObjectURL(url); }
}

export async function createCvPdf(about: AboutContent, lang: "ru" | "en", works: WorkRow[] = [], categories: CategoryRow[] = []) {
  const [{ default: pdfMake }, { default: fonts }] = await Promise.all([import("pdfmake/build/pdfmake"), import("pdfmake/build/vfs_fonts")]);
  pdfMake.addVirtualFileSystem(fonts);
  const bio = about[lang];
  const selected = selectedPortfolioWorks(works, categories);
  const photos = await Promise.all(selected.map(w => compressedImage(w.image)));
  const name = lang === "ru" ? "Наталья Дикунова" : "Natalia Dikunova";
  let pages = 0;
  const content: Content[] = [
    { text: name, fontSize: 28, margin: [0, 0, 0, 10] },
    { text: lang === "ru" ? "Профессиональная биография / CV" : "Professional biography / CV", fontSize: 13, margin: [0, 0, 0, 20] },
    { text: bio.note, margin: [0, 0, 0, 16] },
    ...profileSections(bio, lang).map(section => ({ stack: [
      { text: section.title, fontSize: 13, bold: true, margin: [0, 14, 0, 7] },
      ...section.items.map(text => ({ text, margin: [0, 0, 0, 6] })),
    ] } as Content)),
    { stack: [{ text: lang === "ru" ? "Контакты" : "Contacts", fontSize: 13, bold: true, margin: [0, 14, 0, 7] }, ...artistContacts.map(c => ({ text: c.label, link: c.url, margin: [0, 0, 0, 5] }))] } as Content,
    ...selected.map((work, i): Content => {
      const project = workProject(work, categories, lang);
      const photo = photos[i];
      if (!photo) throw new Error("Image unavailable");
      return { pageBreak: "before", stack: [
        { text: lang === "ru" ? "Избранные работы" : "Selected works", fontSize: 10, margin: [0, 0, 0, 8] },
        { text: name, fontSize: 12, margin: [0, 0, 0, 12] },
        { text: `«${lang === "ru" ? work.title_ru : work.title_en || work.title_ru}»`, fontSize: 20, margin: [0, 0, 0, 6] },
        { text: [lang === "ru" ? work.technique : work.technique_en || work.technique, lang === "ru" ? work.size : work.size.replace(/см/g, "cm"), work.year].filter(Boolean).join(" · "), margin: [0, 0, 0, 16] },
        { image: photo, fit: [510, 400], alignment: "center", margin: [0, 0, 0, 18] },
        { text: project.name ? `«${project.name}»` : "", bold: true, margin: [0, 0, 0, 7] },
        { text: project.description.length > 650 ? `${project.description.slice(0, 647).trim()}…` : project.description, margin: [0, 0, 0, 10] },
        { text: lang === "ru" ? "Работа на dikunova.art →" : "View artwork on dikunova.art →", link: `https://dikunova.art${artworkPath(work)}`, margin: [0, 0, 0, 5] },
        { text: lang === "ru" ? "Проект и полное описание →" : "Project and full description →", link: `https://dikunova.art/works/${encodeURIComponent(work.category_key)}` },
      ] };
    }),
  ];
  const definition: TDocumentDefinitions = {
    pageSize: "A4", pageMargins: [42, 42, 42, 48],
    info: { title: `${name} — CV & Portfolio`, author: name },
    defaultStyle: { font: "Roboto", fontSize: 10, lineHeight: 1.2 },
    footer: (current, total) => { pages = total; return { text: `${name} · dikunova.art     ${current} / ${total}`, alignment: "center", fontSize: 8, margin: [0, 15, 0, 0] }; },
    content,
  };
  // Installed pdfmake 0.2 uses callbacks; its published 0.3 declarations use promises.
  const pdf = pdfMake.createPdf(definition) as unknown as { getBlob: (callback: (blob: Blob) => void) => void };
  const blob = await new Promise<Blob>(resolve => pdf.getBlob(resolve));
  if (pages > PROFILE_LIMITS.pages || blob.size > PROFILE_LIMITS.bytes) throw new Error("Portfolio exceeds limits");
  return blob;
}