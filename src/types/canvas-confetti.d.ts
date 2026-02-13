declare module "canvas-confetti" {
  export type Shape = string | { type?: string };

  export type ShapeFromPathOptions = {
    path: string;
    matrix?: number[];
  };

  export type ConfettiOptions = {
    particleCount?: number;
    spread?: number;
    startVelocity?: number;
    gravity?: number;
    ticks?: number;
    scalar?: number;
    drift?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: Shape[];
  };

  export interface ConfettiInstance {
    (options?: ConfettiOptions): Promise<null> | null;
    shapeFromPath(options: ShapeFromPathOptions): Shape;
    reset(): void;
  }

  const confetti: ConfettiInstance;
  export default confetti;
}
