import type { AboutContent } from "./about";

export async function downloadCv(about: AboutContent, lang: "ru" | "en") {
  const [{ default: pdfMake }, { default: fonts }] = await Promise.all([import("pdfmake/build/pdfmake"), import("pdfmake/build/vfs_fonts")]);
  pdfMake.addVirtualFileSystem(fonts);
  const bio = about[lang];
  pdfMake.createPdf({
    pageSize: "A4", pageMargins: [42, 42, 42, 42],
    info: { title: "Natalia Dikunova — CV", author: "Natalia Dikunova" },
    defaultStyle: { font: "Roboto", fontSize: 10, lineHeight: 1.3 },
    content: [
      { text: lang === "ru" ? "Наталья Дикунова" : "Natalia Dikunova", fontSize: 24, margin: [0, 0, 0, 12] },
      { text: [bio.role, bio.academy].filter(Boolean).join("\n"), margin: [0, 0, 0, 12] },
      { text: "https://dikunova.art · morrasdream@gmail.com", link: "https://dikunova.art", margin: [0, 0, 0, 18] },
      { text: bio.note, margin: [0, 0, 0, 18] },
      ...bio.sections.flatMap(section => [
        { text: section.title, fontSize: 13, bold: true, margin: [0, 14, 0, 7] as [number, number, number, number] },
        ...section.items.map(text => ({ text, margin: [0, 0, 0, 6] as [number, number, number, number] })),
      ]),
    ],
  }).download(`natalia-dikunova-cv-${lang}.pdf`);
}