/** Цветовая палитра акцентных оттенков */
export type AccentColors = {
  rose: string;
  blush: string;
  cream: string;
  peach: string;
  text: string;
  textSoft: string;
  glass: string;
  border: string;
};

/** Тайминги анимаций и частиц */
export type Timings = {
  /** Длительность плавного появления фона (мс) */
  backgroundFadeInMs: number;
  /** Задержка перед стартом частиц (мс) */
  heartsStartDelayMs: number;
  /** Задержка появления карточки после частиц (мс) */
  cardAppearDelayMs: number;
  /** Задержка сброса при повторном запуске (мс) */
  replayResetMs: number;
  /** Запускать ли конфетти при повторном показе */
  replayBurstOnReplay: boolean;
  /** Количество частиц (обычный режим) */
  particleCount: number;
  /** Количество частиц (режим уменьшенной анимации) */
  reducedParticleCount: number;
  /** Базовая скорость частиц */
  particleBaseSpeed: number;
  /** Разброс скорости частиц */
  particleSpeedVariance: number;
};

/** Корневая конфигурация сайта */
export type ValentineConfig = {
  /** Имя получателя открытки */
  recipientName: string;
  /** Короткое сообщение на карточке */
  shortMessage: string;
  /** Развёрнутое послание в модальном окне */
  longMessage: string;
  /** Цветовая палитра */
  accentColors: AccentColors;
  /** Тайминги анимаций */
  timings: Timings;
};

export const CONFIG: ValentineConfig = {
  recipientName: "Даша",
  shortMessage: "Ого, а что это за кнопка снизу?",
  longMessage:
    "Поздравляю тебя с праздником, Даша! 🎉\nВ такой день особенно хочется поблагодарить людей, рядом с которыми жизнь становится интереснее — и ты точно одна из них. Мне правда нравится с тобой общаться, и я был бы рад, если бы у нас стало больше совместных воспоминаний: хоть игра в Майн, хоть в другую не менее любимую игру \"иногородний в Ижевске пытается не потеряться\", ну или даже что-нибудь ещё.\nСпасибо тебе — ты правда классная.",

  accentColors: {
    rose: "#f36a94",
    blush: "#ffd7e3",
    cream: "#fff5ee",
    peach: "#ffe9de",
    text: "#4b2a35",
    textSoft: "#7c5b67",
    glass: "rgba(255, 255, 255, 0.52)",
    border: "rgba(255, 255, 255, 0.72)",
  },

  timings: {
    backgroundFadeInMs: 1600,
    heartsStartDelayMs: 1000,
    cardAppearDelayMs: 1100,
    replayResetMs: 260,
    replayBurstOnReplay: false,
    particleCount: 32,
    reducedParticleCount: 14,
    particleBaseSpeed: 12,
    particleSpeedVariance: 10,
  },
};
