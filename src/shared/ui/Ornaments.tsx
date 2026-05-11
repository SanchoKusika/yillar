import girihTile from "@shared/assets/svg/girih-tile.svg";
import paperGrain from "@shared/assets/svg/paper-grain.svg";

type GirihOverlayProps = { size?: number; opacity?: number };

export function GirihOverlay({ size = 180, opacity = 0.06 }: GirihOverlayProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `url(${girihTile})`,
        backgroundSize: `${size}px ${size}px`,
        opacity: `calc(${opacity} * var(--girih-opacity, 1))`,
      }}
    />
  );
}

type PaperGrainProps = { opacity?: number };

export function PaperGrain({ opacity = 0.35 }: PaperGrainProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `url(${paperGrain})`,
        mixBlendMode: "multiply",
        opacity,
      }}
    />
  );
}
