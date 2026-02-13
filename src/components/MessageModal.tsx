import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import diamondGif from "../assets/diamond.gif";

/* ─── Типы ─── */

type MessageModalProps = {
  /** Открыто ли модальное окно */
  open: boolean;
  /** Режим уменьшенной анимации */
  reducedMotion: boolean;
  /** Текст развёрнутого послания */
  longMessage: string;
  /** Обработчик закрытия окна */
  onClose: () => void;
};

/** Скорость набора одного символа (мс) */
const CHAR_DELAY = 30;
/** Дополнительная пауза после знаков препинания */
const PUNCTUATION_DELAY = 80;
/** Набор знаков, после которых делается пауза */
const PAUSE_CHARS = new Set([".", ",", "!", "?", ":", "—", "\n"]);

/* ─── Хук typewriter ─── */

function useTypewriter(text: string, active: boolean, skip: boolean) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const timerRef = useRef<number>(0);
  const indexRef = useRef(0);

  const reset = useCallback(() => {
    window.clearTimeout(timerRef.current);
    indexRef.current = 0;
    setDisplayed("");
    setDone(false);
  }, []);

  useEffect(() => {
    if (!active) {
      reset();
      return;
    }

    if (skip) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    const tick = () => {
      const i = indexRef.current;
      if (i >= text.length) {
        setDone(true);
        return;
      }
      const char = text[i];
      indexRef.current = i + 1;
      setDisplayed(text.slice(0, i + 1));
      const delay = PAUSE_CHARS.has(char) ? CHAR_DELAY + PUNCTUATION_DELAY : CHAR_DELAY;
      timerRef.current = window.setTimeout(tick, delay);
    };

    /* Небольшая задержка перед стартом, чтобы модалка успела появиться */
    timerRef.current = window.setTimeout(tick, 350);

    return () => window.clearTimeout(timerRef.current);
  }, [active, skip, text, reset]);

  /** Клик для мгновенного показа всего текста */
  const skipToEnd = useCallback(() => {
    window.clearTimeout(timerRef.current);
    indexRef.current = text.length;
    setDisplayed(text);
    setDone(true);
  }, [text]);

  return { displayed, done, skipToEnd };
}

/* ─── Компонент ─── */

/**
 * Модальное окно с развёрнутым посланием.
 * Открывается поверх основного экрана, закрывается по Escape или клику на фон/крестик.
 */
export function MessageModal({
  open,
  reducedMotion,
  longMessage,
  onClose,
}: MessageModalProps) {
  const { displayed, done, skipToEnd } = useTypewriter(longMessage, open, reducedMotion);

  /* Закрытие по клавише Escape */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          {/* Затемнённый фон — клик закрывает окно */}
          <motion.button
            aria-label="Закрыть окно"
            className="absolute inset-0 bg-[rgba(71,40,50,0.3)] backdrop-blur-md"
            onClick={onClose}
            type="button"
          />

          {/* Карточка с посланием */}
          <motion.article
            animate={{ opacity: 1, y: 0, scale: 1 }}
            aria-modal="true"
            className="glass-card relative z-10 w-full max-w-[min(92vw,42rem)] rounded-[28px] p-6 pt-12 text-center shadow-[0_26px_80px_rgba(95,48,66,0.28)] sm:p-10 sm:pt-14"
            exit={{
              opacity: 0,
              y: reducedMotion ? 0 : 12,
              scale: reducedMotion ? 1 : 0.985,
            }}
            initial={{
              opacity: 0,
              y: reducedMotion ? 0 : 16,
              scale: reducedMotion ? 1 : 0.97,
            }}
            role="dialog"
            transition={{
              duration: reducedMotion ? 0.2 : 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Иконка конверта над карточкой */}
            <motion.div
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              className="absolute left-1/2 top-0 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/85 text-2xl shadow-[0_10px_26px_rgba(180,95,129,0.26)]"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: -6 }}
              transition={{
                duration: reducedMotion ? 0.2 : 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span aria-hidden>💌</span>
            </motion.div>

            {/* Кнопка-крестик для закрытия */}
            <button
              aria-label="Закрыть"
              className="absolute right-3.5 top-3.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/55 text-[color:var(--text-soft)] transition-colors duration-300 ease-in-out hover:bg-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--rose)] focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:right-4 sm:top-4"
              onClick={onClose}
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Заголовок послания */}
            <h2 className="mx-auto max-w-[20ch] font-['Pacifico',serif] text-[clamp(1.6rem,5vw,2.5rem)] leading-tight text-[color:var(--text-main)]">
              Спешиал месседж фром dwhie
            </h2>

            {/* Текст послания с typewriter-эффектом */}
            <p
              className="mx-auto mt-5 max-w-[52ch] whitespace-pre-line text-center font-medium text-[clamp(0.98rem,2.3vw,1.12rem)] leading-relaxed text-[color:var(--text-soft)] sm:mt-6 cursor-pointer select-none"
              onClick={!done ? skipToEnd : undefined}
              title={!done ? "Нажмите, чтобы показать сразу" : undefined}
            >
              {displayed}
              {!done && (
                <span className="inline-block w-[2px] h-[1.1em] bg-[color:var(--text-soft)] align-middle ml-[1px] animate-[blink_0.8s_step-end_infinite]" />
              )}
            </p>

            {/* Гифка алмаза — появляется после завершения набора */}
            <motion.div
              className="mt-4 flex justify-center sm:mt-5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={done ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <img
                src={diamondGif}
                alt="💎"
                className="h-12 w-12 sm:h-14 sm:w-14"
              />
            </motion.div>
          </motion.article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
