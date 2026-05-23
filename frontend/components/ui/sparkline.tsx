import { cn } from "@/lib/utils";

interface SparklineProps {
  data: ReadonlyArray<number>;
  className?: string;
  stroke?: string;
  width?: number;
  height?: number;
}

export function Sparkline({
  data,
  className,
  stroke = "#A78BFA",
  width = 200,
  height = 60,
}: SparklineProps) {
  if (data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / Math.max(data.length - 1, 1);
  const points = data
    .map((d, i) => {
      const x = i * step;
      const y = height - ((d - min) / range) * (height - 8) - 4;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("w-full", className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
