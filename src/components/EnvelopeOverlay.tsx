import { motion, AnimatePresence } from "motion/react";

type EnvelopeOverlayProps = {
    /** Показывать ли анимацию конверта */
    open: boolean;
    /** Режим уменьшенной анимации */
    reducedMotion: boolean;
    /** Вызывается после завершения анимации открытия */
    onComplete: () => void;
};

/**
 * Полноэкранный оверлей с анимацией раскрывающегося конверта.
 * Правильная многослойная SVG-структура для реалистичного эффекта «письма в кармане».
 */
export function EnvelopeOverlay({ open, reducedMotion, onComplete }: EnvelopeOverlayProps) {
    const flapDuration = reducedMotion ? 0.3 : 0.6;
    const letterDuration = reducedMotion ? 0.4 : 0.7;
    const fadeDuration = 0.4;

    const totalDuration = flapDuration + letterDuration + 0.3;

    return (
        <AnimatePresence mode="wait">
            {open ? (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: fadeDuration }}
                    onAnimationComplete={(definition) => {
                        // По завершении входной анимации запускаем таймер на transition к модалке
                        if (typeof definition === "object" && "opacity" in definition && definition.opacity === 1) {
                            const timer = window.setTimeout(onComplete, (totalDuration - 0.2) * 1000);
                            return () => window.clearTimeout(timer);
                        }
                    }}
                >
                    {/* Фон */}
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[6px]" />

                    <div className="relative w-full max-w-[320px] aspect-[4/3]">
                        <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-2xl">
                            <defs>
                                <filter id="shadow">
                                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
                                </filter>
                            </defs>

                            {/* 1. Задняя сторона конверта */}
                            <rect x="10" y="50" width="180" height="90" rx="4" fill="#fff5ee" stroke="#fbd9e5" strokeWidth="1" />

                            {/* 2. Верхний клапан (ВНУТРЕННЯЯ сторона при открытии) */}
                            <motion.path
                                d="M 10 50 L 100 10 L 190 50 Z"
                                fill="#fff0f5"
                                stroke="#fbd9e5"
                                strokeWidth="1"
                                initial={{ transformOrigin: "center 50px", rotateX: -180, opacity: 0 }}
                                animate={{ rotateX: 0, opacity: 1 }}
                                transition={{ duration: flapDuration, ease: "easeInOut" }}
                            />

                            {/* 3. Письмо (вылетает из-за передней панели) */}
                            <motion.g
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: -30, opacity: 1 }}
                                transition={{
                                    delay: flapDuration * 0.8,
                                    duration: letterDuration,
                                    ease: [0.175, 0.885, 0.32, 1.275]
                                }}
                            >
                                <rect x="25" y="55" width="150" height="90" rx="4" fill="white" filter="url(#shadow)" />
                                {/* Декор письма */}
                                <line x1="45" y1="80" x2="155" y2="80" stroke="#fce4ec" strokeWidth="2" />
                                <line x1="45" y1="95" x2="140" y2="95" stroke="#fce4ec" strokeWidth="2" />
                                <line x1="45" y1="110" x2="120" y2="110" stroke="#fce4ec" strokeWidth="2" />
                                <text x="100" y="75" textAnchor="middle" fontSize="16">💌</text>
                            </motion.g>

                            {/* 4. Передняя панель конверта (Карман) */}
                            {/* Левый клапан */}
                            <path d="M 10 50 L 100 95 L 10 140 Z" fill="#fffafb" stroke="#fbd9e5" strokeWidth="0.5" />
                            {/* Правый клапан */}
                            <path d="M 190 50 L 100 95 L 190 140 Z" fill="#fffafb" stroke="#fbd9e5" strokeWidth="0.5" />
                            {/* Нижний клапан */}
                            <path d="M 10 140 L 100 95 L 190 140 L 190 140 Z" fill="#ffeef4" stroke="#fbd9e5" strokeWidth="1" />

                            {/* 5. Верхний клапан (ВНЕШНЯЯ сторона — закрыт изначально) */}
                            <motion.path
                                d="M 10 50 L 100 95 L 190 50 Z"
                                fill="#ffebee"
                                stroke="#fbd9e5"
                                strokeWidth="1"
                                initial={{ transformOrigin: "center 50px", rotateX: 0 }}
                                animate={{ rotateX: 180, opacity: 0 }}
                                transition={{ duration: flapDuration, ease: "easeInOut" }}
                            />
                        </svg>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
