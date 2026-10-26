
describe("text case setting", () => {
  it("defaults the preloader name to capitals and lets it be switched off", async () => {
    const { normalizeTypography, typographyCss } = await import("./typography");
    const s = normalizeTypography({});
    expect(s.preloader.textCase).toBe("upper");
    expect(typographyCss(s)).toMatch(/data-font-block="preloader"\] \{[^}]*text-transform: uppercase/);
    const off = normalizeTypography({ preloader: { font: "futura-pt", size: 1.2, textCase: "none" } });
    const css = typographyCss(off);
    expect(css).not.toMatch(/data-font-block="preloader"\] \{[^}]*text-transform/);
    expect(css).toMatch(/data-font-block="preloader"\] \{[^}]*zoom: 1.2/);
  });
});
