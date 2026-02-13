import { useEffect, useRef } from "react";

/* ─── Типы ─── */

type HeartCanvasProps = {
  /** Активен ли рендеринг частиц */
  active: boolean;
  /** Режим уменьшенной анимации */
  reducedMotion: boolean;
  /** Палитра цветов частиц */
  colors: readonly string[];
  /** Параметры генерации частиц */
  timings: {
    particleCount: number;
    reducedParticleCount: number;
    particleBaseSpeed: number;
    particleSpeedVariance: number;
  };
};

/** Вид частицы: сердце или мишка */
type ParticleKind = "heart" | "teddy";

/** Описание одной частицы */
type Particle = {
  kind: ParticleKind;
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  phase: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
};

/* ─── Константы ─── */

/** Доля сердец среди всех частиц (0.5 = поровну с мишками) */
const HEART_RATIO = 0.5;

/* ─── SVG-пути и геометрия частиц ─── */

/** Контур сердца */
const HEART_PATH = new Path2D(
  "M19 34 C17 32 4 23 4 12 C4 6 8 2 14 2 C17.2 2 20.1 3.7 22 6.9 C23.9 3.7 26.8 2 30 2 C36 2 40 6 40 12 C40 23 27 32 25 34 C23.2 35.8 20.8 35.8 19 34 Z"
);

/** Тело мишки */
const TEDDY_BODY = new Path2D();
TEDDY_BODY.roundRect(9, 19, 22, 19, 10);

/** Голова мишки */
const TEDDY_HEAD = new Path2D();
TEDDY_HEAD.arc(20, 15, 9, 0, Math.PI * 2);

/** Левое ухо мишки */
const TEDDY_LEFT_EAR = new Path2D();
TEDDY_LEFT_EAR.arc(13.5, 8, 4.1, 0, Math.PI * 2);

/** Правое ухо мишки */
const TEDDY_RIGHT_EAR = new Path2D();
TEDDY_RIGHT_EAR.arc(26.5, 8, 4.1, 0, Math.PI * 2);

/** Мордочка мишки */
const TEDDY_MUZZLE = new Path2D();
TEDDY_MUZZLE.arc(20, 17.5, 4.4, 0, Math.PI * 2);

/** Левая лапа мишки */
const TEDDY_PAW_LEFT = new Path2D();
TEDDY_PAW_LEFT.arc(13.3, 31, 3.9, 0, Math.PI * 2);

/** Правая лапа мишки */
const TEDDY_PAW_RIGHT = new Path2D();
TEDDY_PAW_RIGHT.arc(26.7, 31, 3.9, 0, Math.PI * 2);

/* ─── Вспомогательные функции ─── */

/** Линейная интерполяция */
const lerp = (from: number, to: number, alpha: number) => from + (to - from) * alpha;

/** Случайное число в диапазоне [min, max) */
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

/** Случайный цвет из палитры */
const pickColor = (colors: readonly string[]) =>
  colors[Math.floor(Math.random() * colors.length)] ?? "#f7a3bf";

/* ─── Функции отрисовки ─── */

/** Рисует сердце на canvas */
function drawHeart(ctx: CanvasRenderingContext2D, particle: Particle, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(particle.rotation);

  const scale = particle.size / 38;
  ctx.scale(scale, scale);

  ctx.globalAlpha = particle.opacity;
  ctx.fillStyle = particle.color;
  ctx.shadowColor = "rgba(255, 255, 255, 0.2)";
  ctx.shadowBlur = 4;
  ctx.fill(HEART_PATH);

  ctx.restore();
}

/** Рисует мишку на canvas */
function drawTeddy(ctx: CanvasRenderingContext2D, particle: Particle, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(particle.rotation * 0.6);

  const scale = particle.size / 36;
  ctx.scale(scale, scale);

  ctx.globalAlpha = particle.opacity;
  ctx.shadowColor = "rgba(130, 80, 66, 0.16)";
  ctx.shadowBlur = 3;

  /* Основной цвет тела */
  ctx.fillStyle = "#d8ab87";
  ctx.fill(TEDDY_LEFT_EAR);
  ctx.fill(TEDDY_RIGHT_EAR);
  ctx.fill(TEDDY_HEAD);
  ctx.fill(TEDDY_BODY);

  /* Мордочка — чуть светлее */
  ctx.fillStyle = "#e8c3a8";
  ctx.fill(TEDDY_MUZZLE);

  /* Лапы — чуть темнее */
  ctx.fillStyle = "#cea07d";
  ctx.fill(TEDDY_PAW_LEFT);
  ctx.fill(TEDDY_PAW_RIGHT);

  /* Глаза */
  ctx.fillStyle = "rgba(72, 43, 36, 0.7)";
  ctx.beginPath();
  ctx.arc(17, 14.8, 0.95, 0, Math.PI * 2);
  ctx.arc(23, 14.8, 0.95, 0, Math.PI * 2);
  ctx.fill();

  /* Нос */
  ctx.beginPath();
  ctx.arc(20, 18, 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* ─── Компонент ─── */

/**
 * Полноэкранный canvas с плавающими частицами (сердца и мишки).
 * Поддерживает параллакс-эффект при движении мыши.
 */
export function HeartCanvas({ active, reducedMotion, colors, timings }: HeartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    /* Если canvas неактивен — очищаем и выходим */
    if (!active) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let rafId = 0;
    let width = 0;
    let height = 0;

    const particleCount = reducedMotion ? timings.reducedParticleCount : timings.particleCount;
    const particles: Particle[] = [];

    /* Параллакс: мягкое смещение частиц за курсором */
    const parallax = { x: 0, y: 0 };
    const parallaxTarget = { x: 0, y: 0 };
    const parallaxEnabled = !reducedMotion && window.matchMedia("(pointer:fine)").matches;

    /** Создание одной частицы */
    const createParticle = (spawnAtBottom: boolean): Particle => {
      const kind: ParticleKind = Math.random() < HEART_RATIO ? "heart" : "teddy";
      const isTeddy = kind === "teddy";

      const speedBase = timings.particleBaseSpeed * (reducedMotion ? 0.65 : 1);
      const speedVariance = timings.particleSpeedVariance * (isTeddy ? 0.4 : 1);
      const speed = speedBase * (isTeddy ? 0.62 : 1) + randomBetween(0, speedVariance);

      return {
        kind,
        x: randomBetween(-20, width + 20),
        y: spawnAtBottom
          ? height + randomBetween(5, height * 0.45)
          : randomBetween(0, height + 20),
        size: isTeddy
          ? randomBetween(reducedMotion ? 21 : 22, reducedMotion ? 31 : 35)
          : randomBetween(reducedMotion ? 12 : 13, reducedMotion ? 22 : 28),
        speed,
        drift: randomBetween(isTeddy ? -3.2 : -5.2, isTeddy ? 3.2 : 5.2),
        phase: randomBetween(0, Math.PI * 2),
        opacity: randomBetween(isTeddy ? 0.1 : 0.13, isTeddy ? 0.19 : 0.3),
        rotation: randomBetween(-0.24, 0.24),
        rotationSpeed: randomBetween(isTeddy ? -0.18 : -0.26, isTeddy ? 0.18 : 0.26),
        color: pickColor(colors),
      };
    };

    /** Пересоздание всех частиц (при ресайзе) */
    const resetParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i += 1) {
        particles.push(createParticle(false));
      }
    };

    /** Обработка изменения размера окна */
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      resetParticles();
    };

    /** Обработка движения мыши для параллакса */
    const handleMouseMove = (event: MouseEvent) => {
      if (width === 0 || height === 0) return;

      const nx = event.clientX / width - 0.5;
      const ny = event.clientY / height - 0.5;

      parallaxTarget.x = nx * 12;
      parallaxTarget.y = ny * 8;
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);
    if (parallaxEnabled) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    let lastFrame = performance.now();

    /** Основной цикл рендеринга */
    const render = (timestamp: number) => {
      const dt = Math.min(0.033, (timestamp - lastFrame) / 1000);
      lastFrame = timestamp;

      context.clearRect(0, 0, width, height);

      /* Плавное следование параллакса за курсором */
      if (parallaxEnabled) {
        parallax.x = lerp(parallax.x, parallaxTarget.x, 0.045);
        parallax.y = lerp(parallax.y, parallaxTarget.y, 0.045);
      }

      const parallaxX = parallax.x;
      const parallaxY = parallax.y;
      const swayStrength = reducedMotion ? 4.8 : 12.2;

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];

        /* Движение частицы: вверх + покачивание + дрейф */
        const swayFactor = particle.kind === "teddy" ? 0.6 : 1;
        particle.y -= particle.speed * dt;
        particle.x +=
          (Math.sin(timestamp * 0.00055 + particle.phase) * swayStrength * swayFactor +
            particle.drift) *
          dt;
        particle.rotation += particle.rotationSpeed * dt;

        /* Проверка выхода за границы экрана */
        const outOfBounds =
          particle.y < -particle.size * 2 ||
          particle.x < -particle.size * 2 ||
          particle.x > width + particle.size * 2;

        if (outOfBounds) {
          particles[i] = createParticle(true);
          continue;
        }

        /* Вычисление позиции с учётом параллакса */
        const drawX = particle.x + parallaxX * (particle.kind === "teddy" ? 0.16 : 0.24);
        const drawY = particle.y + parallaxY * (particle.kind === "teddy" ? 0.12 : 0.19);

        /* Отрисовка частицы */
        if (particle.kind === "teddy") {
          drawTeddy(context, particle, drawX, drawY);
        } else {
          drawHeart(context, particle, drawX, drawY);
        }
      }

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    /* Очистка при размонтировании */
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeCanvas);
      if (parallaxEnabled) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active, colors, reducedMotion, timings]);

  return (
    <canvas
      aria-hidden
      className="pointer-events-none fixed inset-0 z-10 h-full w-full"
      ref={canvasRef}
    />
  );
}
