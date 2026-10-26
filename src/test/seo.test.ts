import { describe, expect, it } from "vitest";
import { articleDate, articleSchema, breadcrumbs, pageUrl } from "../lib/seo";

describe("public SEO addresses and content dates", () => {
  it("uses the public domain regardless of preview origin", () => {
    expect(pageUrl("/blog/blog-005")).toBe("https://dikunova.art/blog/blog-005");
  });
  it("preserves real publication dates and omits missing or impossible dates", () => {
    expect(articleDate("02.09.2024")).toBe("2024-09-02");
    expect(articleDate("")).toBeUndefined();
    expect(articleDate("31.02.2024")).toBeUndefined();
  });
  it("uses the post's own identity in article and navigation data", () => {
    const article = articleSchema({ title: "За три моря", desc: "Выставка", slug: "blog-005", date: "02.09.2024" });
    expect(article.headline).toBe("За три моря");
    expect(article.datePublished).toBe("2024-09-02");
    expect(article.url).toBe("https://dikunova.art/blog/blog-005");
    const trail = breadcrumbs([{ name: "Главная", path: "/" }, { name: "Блог", path: "/blog" }]);
    expect(trail.itemListElement[1]).toEqual({ "@type": "ListItem", position: 2, name: "Блог", item: "https://dikunova.art/blog" });
  });
});