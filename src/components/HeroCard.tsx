import { motion, type Transition, type Variants } from "motion/react";

/* ─── Типы ─── */

type HeroCardProps = {
  /** Имя получателя */
  recipientName: string;
  /** Короткое сообщение под заголовком */
  shortMessage: string;
  /** Показана ли карточка */
  visible: boolean;
  /** Режим уменьшенной анимации */
  reducedMotion: boolean;
  /** Обработчик клика «Открыть послание» */
  onOpenMessage: () => void;
};

/* ─── Анимация карточки ─── */

/** Пружинный переход для появления карточки */
const cardTransition: Transition = {
  type: "spring",
  stiffness: 125,
  damping: 22,
  mass: 0.92,
};

/** Варианты анимации контейнера карточки */
const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.988,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      ...cardTransition,
      when: "beforeChildren",
      staggerChildren: 0.1,
      delayChildren: 0.03,
    },
  },
};

/** Варианты анимации дочерних элементов (каскадное проявление) */
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.56, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ─── Компонент ─── */

/**
 * Главная карточка-открытка с заголовком, сообщением и кнопкой.
 * Появляется с пружинной анимацией и каскадным проявлением элементов.
 */
export function HeroCard({
  recipientName,
  shortMessage,
  visible,
  reducedMotion,
  onOpenMessage,
}: HeroCardProps) {
  /** Параметры hover/tap анимации кнопки (отключаютсяпри reducedMotion) */
  const buttonMotion = reducedMotion
    ? {}
    : {
      whileHover: { y: -1.4, scale: 1.012 },
      whileTap: { scale: 0.986 },
    };

  return (
    <motion.section
      animate={visible ? "visible" : "hidden"}
      aria-label="Поздравительная карточка"
      className="glass-card relative z-20 mx-auto w-full max-w-4xl overflow-hidden rounded-[30px] px-6 py-9 shadow-[0_25px_80px_rgba(169,87,118,0.22)] sm:px-9 sm:py-11 md:px-12 md:py-12"
      initial="hidden"
      variants={cardVariants}
    >
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Подзаголовок */}
        <motion.p
          className="font-semibold font-['Manrope','Segoe_UI',sans-serif] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-soft)] sm:text-xs"
          variants={itemVariants}
        >
          It's Valentine&apos;s Day уроо! 🎉
        </motion.p>

        {/* Заголовок с именем получателя */}
        <motion.h1
          className="mt-3 text-balance text-center font-['Pacifico',serif] text-[clamp(1.6rem,6.2vw,4.4rem)] leading-[1.1] text-[color:var(--text-main)]"
          variants={itemVariants}
        >
          {`С Днём Святого Валентина, ${recipientName}`}
          <motion.span
            aria-hidden
            className="ml-2 inline-block text-[0.78em] leading-none align-baseline"
            initial={{
              opacity: 0,
              y: reducedMotion ? 0 : 4,
              scale: reducedMotion ? 1 : 0.92,
            }}
            variants={itemVariants}
          >
            💐
          </motion.span>
        </motion.h1>

        {/* Короткое сообщение */}
        <motion.p
          className="mt-4 max-w-2xl text-center font-medium text-[clamp(1.03rem,2.3vw,1.65rem)] leading-snug text-[color:var(--text-soft)]"
          variants={itemVariants}
        >
          {shortMessage}
        </motion.p>

        {/* CTA-кнопка «Открыть послание» */}
        <motion.div
          className="mt-7 flex w-full justify-center sm:mt-8"
          variants={itemVariants}
        >
          <motion.button
            className="cta-button rounded-full bg-[linear-gradient(135deg,var(--rose),#f58db1)] px-7 py-3 text-base font-semibold text-white shadow-[0_14px_30px_rgba(230,90,140,0.28)] transition-[box-shadow,filter,transform] duration-400 ease-in-out hover:shadow-[0_22px_38px_rgba(230,90,140,0.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--rose)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            onClick={onOpenMessage}
            transition={{ type: "spring", stiffness: 230, damping: 20, mass: 0.65 }}
            type="button"
            {...buttonMotion}
          >
            Открыть послание
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
}
