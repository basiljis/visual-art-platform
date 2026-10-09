export const fontOptions = [
  { id: "prata", name: "Prata", family: '"Prata", serif', google: "Prata" },
  { id: "manrope", name: "Manrope", family: '"Manrope", sans-serif', google: "Manrope:wght@400;500;600" },
  { id: "lora", name: "Lora", family: '"Lora", serif', google: "Lora:wght@400;500;600" },
  { id: "pt-serif", name: "PT Serif", family: '"PT Serif", serif', google: "PT+Serif:wght@400;700" },
  { id: "pt-sans", name: "PT Sans", family: '"PT Sans", sans-serif', google: "PT+Sans:wght@400;700" },
  { id: "montserrat", name: "Montserrat", family: '"Montserrat", sans-serif', google: "Montserrat:wght@400;500;600" },
] as const;

export type FontId = typeof fontOptions[number]["id"];
export const typographyBlocks = [
  { key: "header", label: "Шапка — имя художника", sample: "НАТАЛЬЯ ДИКУНОВА / artist", defaultFont: "prata" },
  { key: "headings", label: "Заголовки разделов и окон", sample: "Работы · Об авторе · Блог", defaultFont: "prata" },
  { key: "body", label: "Основной текст и кнопки", sample: "Живопись, рисунок и печатная графика", defaultFont: "manrope" },
  { key: "intro", label: "Текст рядом с подписью", sample: "О памяти, мифе и человеческом присутствии.", defaultFont: "manrope" },
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
export type TypographySettings = Record<TypographyBlock, FontId>;

export const defaultTypography = Object.fromEntries(typographyBlocks.map(b => [b.key, b.defaultFont])) as TypographySettings;

export function normalizeTypography(value: unknown): TypographySettings {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return Object.fromEntries(typographyBlocks.map(b => [b.key,
    fontOptions.some(f => f.id === source[b.key]) ? source[b.key] : b.defaultFont,
  ])) as TypographySettings;
}

export function typographyCss(settings: TypographySettings) {
  const family = (key: TypographyBlock) => fontOptions.find(f => f.id === settings[key])?.family ?? '"Manrope", sans-serif';
  const base = `.site-typography { --site-body-font: ${family("body")}; --site-heading-font: ${family("headings")}; font-family: var(--site-body-font); }
    .site-typography .font-sans { font-family: var(--site-body-font); }
    .site-typography .font-display, .site-typography .post-body :is(h2,h3) { font-family: var(--site-heading-font); }
    .site-typography .post-body { font-family: ${family("blog")}; }`;
  const scopes = typographyBlocks.filter(b => !["body", "headings", "blog"].includes(b.key)).map(b => {
    const selector = `.site-typography [data-font-block="${b.key}"]`;
    return `${selector} { font-family: ${family(b.key)}; }
      ${selector} .font-sans, ${selector} .font-display { font-family: inherit; }`;
  });
  return [base, ...scopes, ...fontOptions.map(f => `[data-font-preview="${f.id}"] { font-family: ${f.family}; }`)].join("\n");
}