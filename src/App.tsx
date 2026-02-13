import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import confetti from "canvas-confetti";
import { useReducedMotion } from "motion/react";
import { CONFIG } from "./config";
import { HeartCanvas } from "./components/HeartCanvas";
import { HeroCard } from "./components/HeroCard";
import { LoadingScreen } from "./components/LoadingScreen";
import { MessageModal } from "./components/MessageModal";
import { EnvelopeOverlay } from "./components/EnvelopeOverlay";

/* ─── Форма сердца для конфетти ─── */

const HEART_SHAPE = confetti.shapeFromPath({
  path: "M167 72c-19-39-84-36-84 13 0 31 31 54 84 96 53-42 84-65 84-96 0-49-65-52-84-13z",
});

/* ─── Типы ─── */

/** Состояние каскадного входа (фон → частицы → карточка) */
type IntroState = {
  backgroundVisible: boolean;
  heartsVisible: boolean;
  cardVisible: boolean;
};

/** Параметры одного «залпа» конфетти */
type ConfettiSalvo = {
  delayMs: number;
  particleCount: number;
  spread: number;
  velocity: number;
  originX: number;
  scalar: number;
};

/** Начальное состояние — всё скрыто */
const INTRO_HIDDEN: IntroState = {
  backgroundVisible: false,
  heartsVisible: false,
  cardVisible: false,
};

/* ─── Корневой компонент ─── */

/**
 * Главный компонент приложения.
 * Управляет последовательностью: загрузка → фон → частицы → карточка → конверт → модалка.
 */
export default function App() {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = Boolean(prefersReducedMotion);

  /* Основные состояния экранов */
  const [introState, setIntroState] = useState<IntroState>(INTRO_HIDDEN);
  const [isLoadingVisible, setIsLoadingVisible] = useState(true);
  const [showEnvelope, setShowEnvelope] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  /* Ссылки на таймеры для корректной очистки */
  const timerIdsRef = useRef<number[]>([]);
  const confettiTimerIdsRef = useRef<number[]>([]);

  /* ─── CSS-переменные из конфига ─── */

  const appStyle = useMemo(
    () =>
      ({
        "--rose": CONFIG.accentColors.rose,
        "--blush": CONFIG.accentColors.blush,
        "--cream": CONFIG.accentColors.cream,
        "--peach": CONFIG.accentColors.peach,
        "--text-main": CONFIG.accentColors.text,
        "--text-soft": CONFIG.accentColors.textSoft,
        "--glass": CONFIG.accentColors.glass,
        "--glass-border": CONFIG.accentColors.border,
      }) as CSSProperties,
    []
  );

  /** Цвета для canvas-частиц */
  const heartColors = useMemo(
    () =>
      [CONFIG.accentColors.rose, CONFIG.accentColors.blush, CONFIG.accentColors.peach, "#fff8fb"] as const,
    []
  );

  /** Длительность загрузочного экрана, синхронизированная с таймингами intro */
  const loadingDurationMs = useMemo(() => {
    const introToCard =
      CONFIG.timings.heartsStartDelayMs + CONFIG.timings.cardAppearDelayMs - 180;
    const normalized = Math.max(900, Math.min(1800, introToCard));
    return reducedMotion ? 900 : normalized;
  }, [reducedMotion]);

  /* ─── Очистка таймеров ─── */

  const clearIntroTimers = useCallback(() => {
    for (const id of timerIdsRef.current) window.clearTimeout(id);
    timerIdsRef.current = [];
  }, []);

  const clearConfettiTimers = useCallback(() => {
    for (const id of confettiTimerIdsRef.current) window.clearTimeout(id);
    confettiTimerIdsRef.current = [];
  }, []);

  /* ─── Залп конфетти ─── */

  const launchConfettiBurst = useCallback(() => {
    clearConfettiTimers();

    const salvos: ConfettiSalvo[] = reducedMotion
      ? [
        { delayMs: 0, particleCount: 34, spread: 56, velocity: 18, originX: 0.5, scalar: 0.84 },
        { delayMs: 120, particleCount: 24, spread: 50, velocity: 16, originX: 0.52, scalar: 0.78 },
      ]
      : [
        { delayMs: 0, particleCount: 80, spread: 76, velocity: 28, originX: 0.5, scalar: 1 },
        { delayMs: 130, particleCount: 60, spread: 66, velocity: 24, originX: 0.43, scalar: 0.95 },
        { delayMs: 250, particleCount: 50, spread: 62, velocity: 22, originX: 0.57, scalar: 0.9 },
      ];

    for (const salvo of salvos) {
      const id = window.setTimeout(() => {
        confetti({
          particleCount: salvo.particleCount,
          spread: salvo.spread,
          startVelocity: salvo.velocity,
          gravity: 0.95,
          ticks: reducedMotion ? 120 : 170,
          scalar: salvo.scalar,
          origin: { x: salvo.originX, y: 0.4 },
          drift: 0,
          colors: [CONFIG.accentColors.rose, "#f9a8c2", "#ffd6e3", "#ffe9de"],
          shapes: [HEART_SHAPE],
        });
      }, salvo.delayMs);

      confettiTimerIdsRef.current.push(id);
    }
  }, [clearConfettiTimers, reducedMotion]);

  /* ─── Каскадный вход ─── */

  const startIntro = useCallback(() => {
    clearIntroTimers();
    setIntroState({ backgroundVisible: true, heartsVisible: false, cardVisible: false });

    const heartsTimer = window.setTimeout(() => {
      setIntroState((prev) => ({ ...prev, heartsVisible: true }));
    }, CONFIG.timings.heartsStartDelayMs);

    const cardTimer = window.setTimeout(() => {
      setIntroState((prev) => ({ ...prev, cardVisible: true }));
    }, CONFIG.timings.heartsStartDelayMs + CONFIG.timings.cardAppearDelayMs);

    timerIdsRef.current.push(heartsTimer, cardTimer);
  }, [clearIntroTimers]);

  /* ─── Обработчики открытия/закрытия ─── */

  /** Клик по «Открыть послание» → показываем анимацию конверта */
  const handleOpenMessage = useCallback(() => {
    setShowEnvelope(true);
  }, []);

  /** Конверт раскрылся → показываем модалку + конфетти */
  const handleEnvelopeComplete = useCallback(() => {
    setShowEnvelope(false);
    setIsMessageOpen(true);
    launchConfettiBurst();
  }, [launchConfettiBurst]);

  /** Закрытие модалки */
  const handleCloseMessage = useCallback(() => {
    setIsMessageOpen(false);
  }, []);

  /* ─── Побочные эффекты ─── */

  /** Запуск intro-последовательности при монтировании */
  useEffect(() => {
    startIntro();

    const loadingTimer = window.setTimeout(() => {
      setIsLoadingVisible(false);
    }, loadingDurationMs);

    timerIdsRef.current.push(loadingTimer);

    return () => {
      clearIntroTimers();
      clearConfettiTimers();
    };
  }, [clearConfettiTimers, clearIntroTimers, loadingDurationMs, startIntro]);

  /** Блокировка прокрутки при открытом модальном окне */
  useEffect(() => {
    if (!isMessageOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMessageOpen]);

  /* ─── Рендер ─── */

  return (
    <main className="relative min-h-screen overflow-hidden" style={appStyle}>
      {/* Фоновый градиент */}
      <div className="background-layer">
        <div
          className="gradient-surface"
          style={{
            opacity: introState.backgroundVisible ? 1 : 0,
            transitionDuration: `${CONFIG.timings.backgroundFadeInMs}ms`,
          }}
        />
      </div>

      {/* Canvas-частицы (сердца и мишки) */}
      <HeartCanvas
        active={introState.heartsVisible}
        colors={heartColors}
        reducedMotion={reducedMotion}
        timings={{
          particleCount: CONFIG.timings.particleCount,
          reducedParticleCount: CONFIG.timings.reducedParticleCount,
          particleBaseSpeed: CONFIG.timings.particleBaseSpeed,
          particleSpeedVariance: CONFIG.timings.particleSpeedVariance,
        }}
      />

      {/* Центральная карточка */}
      <section className="relative z-20 flex min-h-screen items-center justify-center px-4 py-10 sm:px-7 sm:py-12 md:px-10">
        <HeroCard
          onOpenMessage={handleOpenMessage}
          recipientName={CONFIG.recipientName}
          reducedMotion={reducedMotion}
          shortMessage={CONFIG.shortMessage}
          visible={introState.cardVisible}
        />
      </section>

      {/* Анимация раскрытия конверта */}
      <EnvelopeOverlay
        open={showEnvelope}
        reducedMotion={reducedMotion}
        onComplete={handleEnvelopeComplete}
      />

      {/* Модальное окно с посланием */}
      <MessageModal
        longMessage={CONFIG.longMessage}
        onClose={handleCloseMessage}
        open={isMessageOpen}
        reducedMotion={reducedMotion}
      />

      {/* Экран загрузки */}
      <LoadingScreen
        durationMs={loadingDurationMs}
        open={isLoadingVisible}
        reducedMotion={reducedMotion}
      />
    </main>
  );
}
