export const fontOptions = [
  { id: "prata", name: "Prata", family: '"Prata", serif', google: "Prata" },
  { id: "manrope", name: "Manrope", family: '"Manrope", sans-serif', google: "Manrope:wght@300;400;500;600;700;800" },
  { id: "lora", name: "Lora", family: '"Lora", serif', google: "Lora:wght@400;500;600;700" },
  { id: "pt-serif", name: "PT Serif", family: '"PT Serif", serif', google: "PT+Serif:wght@400;700" },
  { id: "pt-sans", name: "PT Sans", family: '"PT Sans", sans-serif', google: "PT+Sans:wght@400;700" },
  { id: "montserrat", name: "Montserrat", family: '"Montserrat", sans-serif', google: "Montserrat:wght@300;400;500;600;700" },
  { id: "futura", name: "Futura (Jost)", family: '"Jost", "Futura", sans-serif', google: "Jost:wght@300;400;500;600;700" },
] as const;

export type FontId = typeof fontOptions[number]["id"];
/** Per-block style: font family plus optional size (zoom scale), weight and line-height overrides. 0 means "keep default". */
export type BlockStyle = { font: FontId; size: number; weight: number; lineHeight: number };
export const typographyBlocks = [
  { key: "header", label: "Шапка — имя художника", sample: "НАТАЛЬЯ ДИКУНОВА / artist", defaultFont: "prata" },
  { key: "headings", label: "Заголовки разделов и окон", sample: "Работы · Об авторе · Блог", defaultFont: "prata" },
  { key: "body", label: "Основной текст и кнопки", sample: "Живопись, рисунок и печатная графика", defaultFont: "manrope" },
  { key: "intro", label: "Текст рядом с подписью", sample: "О мифе и реальности.", defaultFont: "manrope" },
  { key: "about", label: "Об авторе — текст биографии", sample: "Работы находятся в частных коллекциях", defaultFont: "manrope" },
  { key: "navigation", label: "Полноэкранное меню", sample: "Работы · Об авторе · Контакты", defaultFont: "prata" },
  { key: "filters", label: "Направления — фильтры работ", sample: "Все · Портреты · Печатная графика", defaultFont: "manrope" },
  { key: "captions", label: "Подписи к работам", sample: "КИТАЙСКИЙ ЖЕМЧУГ · 2025 · 60 × 80 см", defaultFont: "manrope" },
  { key: "footer", label: "Подвал — контакты и ссылки", sample: "Контакты · Instagram · Telegram", defaultFont: "manrope" },
  { key: "footerLogo", label: "Подвал — надпись DIKUNOVA", sample: "DIKUNOVA", defaultFont: "prata" },
  { key: "preloader", label: "Экран загрузки — имя", sample: "НАТАЛЬЯ ДИКУНОВА / artist", defaultFont: "prata" },
  { key: "blog", label: "Блог — текст публикаций", sample: "Выставки, проекты и заметки художника", defaultFont: "manrope" },
  { key: "news", label: "Новости — текст выставок", sample: "Открытие выставки · Дата · Адрес", defaultFont: "manrope" },
] as const;
export type TypographyBlock = typeof typographyBlocks[number]["key"];
export type TypographySettings = Record<TypographyBlock, BlockStyle>;

const SIZES = [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.4, 1.5];
const WEIGHTS = [0, 300, 400, 500, 600, 700];
const LINE_HEIGHTS = [0, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 2];

function pick(value: unknown, allowed: readonly number[], fallback: number) {
  return typeof value === "number" && allowed.includes(value) ? value : fallback;
}

export const defaultTypography = Object.fromEntries(
  typographyBlocks.map(b => [b.key, { font: b.defaultFont, size: 1, weight: 0, lineHeight: 0 }]),
) as TypographySettings;

/** Accepts the current format ({ block: { font, size, weight, lineHeight } }) and the legacy flat format ({ block: fontId }). */
export function normalizeTypography(value: unknown): TypographySettings {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return Object.fromEntries(typographyBlocks.map(b => {
    const raw = source[b.key];
    if (typeof raw === "string" && fontOptions.some(f => f.id === raw)) {
      return [b.key, { font: raw, size: 1, weight: 0, lineHeight: 0 }];
    }
    const obj = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
    return [b.key, {
      font: fontOptions.some(f => f.id === obj["font"]) ? obj["font"] as FontId : b.defaultFont,
      size: pick(obj["size"], SIZES, 1),
      weight: pick(obj["weight"], WEIGHTS, 0),
      lineHeight: pick(obj["lineHeight"], LINE_HEIGHTS, 0),
    }];
  })) as TypographySettings;
}

export function typographyCss(settings: TypographySettings) {
  const family = (key: TypographyBlock) => fontOptions.find(f => f.id === settings[key].font)?.family ?? '"Manrope", sans-serif';
  const extra = (key: TypographyBlock) => {
    const s = settings[key];
    const decls: string[] = [];
    if (s.weight) decls.push(`font-weight: ${s.weight}`);
    if (s.lineHeight) decls.push(`line-height: ${s.lineHeight}`);
    if (s.size !== 1) decls.push(`zoom: ${s.size}`);
    return decls.length ? ` ${decls.join("; ")}` : "";
  };
  const base = `.site-typography { --site-body-font: ${family("body")}; --site-heading-font: ${family("headings")}; font-family: var(--site-body-font); }
    .site-typography .font-sans { font-family: var(--site-body-font); }
    .site-typography .font-display, .site-typography .post-body :is(h2,h3) { font-family: var(--site-heading-font);${extra("headings")} }
    .site-typography .post-body { font-family: ${family("blog")};${extra("blog")} }`;
  const scopes = typographyBlocks.filter(b => !["headings", "blog"].includes(b.key)).map(b => {
    const selector = `.site-typography [data-font-block="${b.key}"]`;
    const decls = [`font-family: ${family(b.key)}`];
    const s = settings[b.key];
    if (s.weight) decls.push(`font-weight: ${s.weight}`);
    if (s.lineHeight) decls.push(`line-height: ${s.lineHeight}`);
    if (s.size !== 1) decls.push(`zoom: ${s.size}`);
    const children = ["header", "navigation", "preloader"].includes(b.key)
      ? `${selector} .font-sans, ${selector} .font-display { font-family: inherit; }` : "";
    return `${selector} { ${decls.join("; ")}; } ${children}`;
  });
  return [base, ...scopes, ...fontOptions.map(f => `[data-font-preview="${f.id}"] { font-family: ${f.family}; }`)].join("\n");
}
