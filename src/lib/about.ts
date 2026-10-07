export type AboutLang = { note: string; highlights: string[]; role: string; academy: string; sections: { title: string; items: string[] }[] };
export type AboutContent = { portrait: string | null; ru: AboutLang; en: AboutLang };

export const defaultAbout: AboutContent = {
  portrait: null,
  ru: {
    note: "Работы находятся в частных коллекциях России, Европы, США, Индии и Китая, а также в музеях России и Китая.",
    role: "artist",
    academy: "St. Petersburg academy of fine arts",
    highlights: ["St. Petersburg Academy of Fine Arts", "2024 — «За три моря», МСХ, Москва", "2023 — Royal Society of British Artists, London", "2022 — DEG Exlibris, Germany — 1st prize"],
    sections: [
      { title: "Персональные выставки", items: [
        "2024 — «За три моря», персональная выставка, МСХ, Москва",
        "2019 — «Две линии», персональная выставка, РСХ, Воронеж",
      ]},
      { title: "Групповые выставки", items: [
        "2024 — «Продолжение», выставка династии скульпторов и художников Дикуновых Максима, Алексея и Натальи. Областной художественный музей им. И. Крамского, Воронеж",
        "2023 — «Международная выставка преподавателей художественных институтов», Уханьский институт дизайна и проектирования, Ухань, Китай",
        "2023–2024 — выставки печатной графики, Ченду, Китай",
        "2023 — Bicentennial Exhibition, Royal Society of British Artists, Лондон, Великобритания",
        "2023 — выставка печатной графики, Southbank Printmakers Gallery, Лондон, Великобритания",
        "2022 — «Мосты», международный проект «Минская инициатива» при поддержке фонда гуманитарного сотрудничества стран СНГ, Санкт-Петербург",
        "2022 — юбилейная выставка 90 лет МСХ, Москва",
        "2007 — юбилейная выставка «250 лет Академии художеств», ЦДХ, Москва",
      ]},
      { title: "Награды", items: [
        "2022 — 1-е место, международный конкурс экслибриса DEG, Германия",
        "2022 — 3-е место, международный конкурс экслибриса Всемирной организации экслибриса WFOEL. The 4th Hong Kong International Artists & Collectables Expo, Гонконг",
        "2021 — особая отметка жюри, конкурс экслибриса «La Divina Comedia», Biblioteca di Bodio Lomnago",
      ]},
      { title: "Преподавание", items: [
        "2023–2024 — преподаватель рисунка, живописи и композиции, Сычуаньский педагогический университет, факультет классической живописи (Sichuan Normal University), Ченду, Китай",
      ]},
      { title: "Резиденции и пленэры", items: [
        "2025 — приглашённый участник арт-резиденции The Guanlan Original Printmaking Base, Шэньчжэнь, Китай",
        "2022 — международный пленэр и выставка «Landour Plain Air», Ландур, Индия",
      ]},
    ],
  },
  en: {
    note: "Works are held in private collections across Russia, Europe, the USA, India and China, as well as museums in Russia and China.",
    role: "artist",
    academy: "St. Petersburg academy of fine arts",
    highlights: ["St. Petersburg Academy of Fine Arts", "2024 — «За три моря», МСХ, Москва", "2023 — Royal Society of British Artists, London", "2022 — DEG Exlibris, Germany — 1st prize"],
    sections: [
      { title: "Solo exhibitions", items: [
        "2024 — «Across Three Seas», solo exhibition, Moscow Union of Artists, Moscow",
        "2019 — «Two Lines», solo exhibition, Russian Union of Artists, Voronezh",
      ]},
      { title: "Group exhibitions", items: [
        "2024 — «Continuation», exhibition of the Dikunov dynasty of sculptors and artists — Maxim, Alexey and Natalia. Kramskoy Regional Art Museum, Voronezh",
        "2023 — International Exhibition of Teachers of Art Institutes, Wuhan Institute of Design and Sciences, Wuhan, China",
        "2023–2024 — printmaking exhibitions, Chengdu, China",
        "2023 — Bicentennial Exhibition, Royal Society of British Artists, London, UK",
        "2023 — printmaking exhibition, Southbank Printmakers Gallery, London, UK",
        "2022 — «Bridges», international project «Minsk Initiative» supported by the CIS Humanitarian Cooperation Fund, St. Petersburg",
        "2022 — 90th anniversary exhibition of the Moscow Union of Artists, Moscow",
        "2007 — 250th anniversary exhibition of the Academy of Arts, Central House of Artists, Moscow",
      ]},
      { title: "Awards", items: [
        "2022 — 1st place, international ex libris competition DEG, Germany",
        "2022 — 3rd place, international ex libris competition of the World Federation of Ex-libris Societies WFOEL. The 4th Hong Kong International Artists & Collectables Expo, Hong Kong",
        "2021 — special jury mention, «La Divina Comedia» ex libris competition, Biblioteca di Bodio Lomnago",
      ]},
      { title: "Teaching", items: [
        "2023–2024 — lecturer in drawing, painting and composition, Sichuan Normal University, faculty of classical painting, Chengdu, China",
      ]},
      { title: "Residencies and plein airs", items: [
        "2025 — invited resident artist, The Guanlan Original Printmaking Base, Shenzhen, China",
        "2022 — international plein air and exhibition «Landour Plain Air», Landour, India",
      ]},
    ],
  },
};
