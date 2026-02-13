import { useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import catImage from "../assets/cat.png";

type LoadingScreenProps = {
  open: boolean;
  reducedMotion: boolean;
  /** Длительность загрузочной анимации в миллисекундах */
  durationMs: number;
};

/**
 * Экран загрузки с анимированной датой «14.02.2026».
 * Текст заливается градиентом слева направо, затем экран плавно исчезает.
 */
export function LoadingScreen({ open, reducedMotion, durationMs }: LoadingScreenProps) {
  const uid = useId().replace(/:/g, "");

  /* Уникальные ID для SVG-элементов, чтобы избежать коллизий */
  const maskId = `date-mask-${uid}`;
  const gradientId = `date-gradient-${uid}`;
  const filterId = `liquid-filter-${uid}`;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1, filter: "blur(0px)" }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          exit={{ opacity: 0, filter: "blur(8px)" }}
          initial={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: reducedMotion ? 0.4 : 0.85, ease: "easeOut" }}
        >
          {/* Фоновый градиент загрузочного экрана */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,240,246,0.95),rgba(255,246,240,0.92)_45%,rgba(255,250,248,0.94))]" />
          {/* Точечный паттерн поверх фона */}
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.75)_0.55px,transparent_0.55px)] [background-size:26px_26px]" />

          <div className="relative z-10 flex flex-col items-center w-[min(90vw,980px)] px-4">
            {/* Изображение кота над датой */}
            <motion.img
              src={catImage}
              alt="Кот"
              className="mb-4 h-28 w-auto sm:h-36 md:h-44"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.3 : 0.7, ease: "easeOut" }}
            />
            <svg aria-hidden className="h-auto w-full" viewBox="0 0 1200 300">
              <defs>
                {/* Горизонтальный градиент заливки текста */}
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f36a94" />
                  <stop offset="55%" stopColor="#f58db1" />
                  <stop offset="100%" stopColor="#ffd6e3" />
                </linearGradient>

                {/* Маска с текстом даты */}
                <mask id={maskId}>
                  <rect width="1200" height="300" fill="black" />
                  <text
                    x="600"
                    y="165"
                    textAnchor="middle"
                    fill="white"
                    fontSize="170"
                    fontWeight="700"
                    fontFamily="'Times New Roman', serif"
                    letterSpacing="4"
                  >
                    14.02.2026
                  </text>
                </mask>

                {/* Фильтр «жидкого» искажения текста (отключён при prefers-reduced-motion) */}
                {!reducedMotion ? (
                  <filter id={filterId} x="-5%" y="-8%" width="110%" height="116%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.008 0.12" numOctaves="1" seed="7" result="noise">
                      <animate
                        attributeName="baseFrequency"
                        dur="4s"
                        values="0.008 0.12;0.012 0.18;0.008 0.12"
                        repeatCount="indefinite"
                      />
                    </feTurbulence>
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                ) : null}
              </defs>

              {/* Полупрозрачный «теневой» текст под основным */}
              <text
                x="600"
                y="165"
                textAnchor="middle"
                fill="rgba(243,106,148,0.22)"
                fontSize="170"
                fontWeight="700"
                fontFamily="'Times New Roman', serif"
                letterSpacing="4"
              >
                14.02.2026
              </text>

              {/* Маскированный текст с анимацией заливки */}
              <g mask={`url(#${maskId})`}>
                <rect width="1200" height="300" fill="rgba(255,255,255,0.2)" />
                <motion.rect
                  x="0"
                  y="0"
                  width="1200"
                  height="300"
                  fill={`url(#${gradientId})`}
                  filter={reducedMotion ? undefined : `url(#${filterId})`}
                  initial={{ width: 0 }}
                  animate={{ width: 1200 }}
                  transition={{
                    duration: durationMs / 1000,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                />
              </g>
            </svg>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
