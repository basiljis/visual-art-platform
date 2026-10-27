import { describe, expect, it } from "vitest";
import { artworkAlt, artworkPath, artworkSlug, seriesMetadata } from "./artwork-seo";
import { visualArtwork, personSchema } from "./seo";

describe("artwork SEO rules", () => {
  const work = { id: "123", title_ru: "Портрет Амгалана", title_en: "Portrait of Amgalan", category_key: "portraits", technique: "бумага, сангина, уголь", size: "110х70 см", year: "2024" };
  it("describes title, medium, dimensions, year and artist in the artwork alt", () => {
    expect(artworkAlt(work)).toBe("Портрет Амгалана, бумага, сангина, уголь, 110х70 см, 2024, художник Наталья Дикунова");
  });
  it("provides a Latin URL under the series and disambiguates duplicate titles", () => {
    expect(artworkPath(work)).toBe("/works/portraits/portret-amgalana-2024-123");
    expect(artworkSlug({ ...work, id: "456" })).not.toBe(artworkSlug(work));
  });
  it("provides the requested portrait search snippet even if editorial copy is hidden", () => {
    const meta = seriesMetadata({ key: "portraits", name_ru: "Портреты", description_ru: "", description_hidden: true });
    expect(meta.title).toBe("Портреты — Живопись и графика Натальи Дикуновой | Купить картину");
    expect(meta.description).toBe("Серия портретных работ Натальи Дикуновой. Бумага, сангина, уголь, акварель. Информация о доступных для покупки работах и выставках.");
  });
  it("attributes structured artwork to its own page without inventing prices", () => {
    const schema = visualArtwork({ name: work.title_ru, technique: work.technique, year: work.year, path: artworkPath(work) });
    expect(schema.url).toBe("https://dikunova.art/works/portraits/portret-amgalana-2024-123");
    expect(schema.artMedium).toBe("бумага, сангина, уголь");
    expect(schema.dateCreated).toBe("2024");
    expect(schema).not.toHaveProperty("offers");
    expect(personSchema().sameAs).toContain("https://t.me/Natasha_Dikunova_Zipalova");
  });
});