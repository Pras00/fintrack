"use client";

import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/utils";

interface NumberCounterProps {
  value: number;
  className?: string;
  isCurrency?: boolean;
  duration?: number;
}

export function NumberCounter({
  value,
  className,
  isCurrency = true,
  duration = 900,
}: NumberCounterProps) {
  const [count, setCount] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo curve for smooth finish
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(easeProgress * value));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration]);

  const display = isCurrency ? formatRupiah(count) : count.toLocaleString("id-ID");

  return (
    <span className={`tabular-nums font-semibold tracking-tight ${className ?? ""}`}>
      {display}
    </span>
  );
}
