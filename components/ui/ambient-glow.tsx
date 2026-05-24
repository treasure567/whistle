type Position =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

type Intensity = "subtle" | "medium" | "strong";

export interface AmbientGlowProps {
  position?: Position;
  intensity?: Intensity;
  color?: string;
  size?: number;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AmbientGlow(_props: AmbientGlowProps): null {
  return null;
}
