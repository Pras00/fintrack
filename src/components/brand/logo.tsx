import React, { useId } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 36, className }: LogoMarkProps) {
  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const pillarId = `ftPillarGrad_${safeId}`;
  const topId = `ftTopGrad_${safeId}`;
  const midId = `ftMidGrad_${safeId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      aria-label="FinTrack Logo"
    >
      {/* Gradients with unique IDs defined first for 100% reliable SVG rendering */}
      <defs>
        <linearGradient id={pillarId} x1="9" y1="8" x2="14.5" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14B8A6" />
          <stop offset="1" stopColor="#0D9488" />
        </linearGradient>
        <linearGradient id={topId} x1="12" y1="8" x2="30" y2="13.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2DD4BF" />
          <stop offset="1" stopColor="#0D9488" />
        </linearGradient>
        <linearGradient id={midId} x1="12" y1="17.25" x2="24.5" y2="22.75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#0D9488" />
        </linearGradient>
      </defs>

      {/* Background Frame with Sovereign Ledger Depth */}
      <rect width="40" height="40" rx="10" className="fill-[#0F172A] dark:fill-[#0B1120]" />
      <rect
        x="0.5"
        y="0.5"
        width="39"
        height="39"
        rx="9.5"
        className="stroke-slate-700/60 dark:stroke-slate-800"
      />

      {/* Pillar - Left Vertical Anchor (Foundation & Capital) */}
      <rect x="9" y="8" width="5.5" height="24" rx="2.75" fill={`url(#${pillarId})`} />

      {/* Top Beam - Institutional Velocity */}
      <rect x="12" y="8" width="18" height="5.5" rx="2.75" fill={`url(#${topId})`} />

      {/* Mid Beam - Liquidity & Tracking Pulse */}
      <rect x="12" y="17.25" width="12.5" height="5.5" rx="2.75" fill={`url(#${midId})`} />

      {/* Sovereign Beacon - Yield Trajectory Accent */}
      <circle cx="28.5" cy="20" r="2.25" fill="#34D399" />
    </svg>
  );
}

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  href?: string;
  className?: string;
}

export function Logo({
  size = "md",
  showTagline = true,
  href,
  className,
}: LogoProps) {
  const markSize = size === "sm" ? 28 : size === "lg" ? 44 : 36;
  const titleClass =
    size === "sm"
      ? "text-sm font-bold tracking-tight"
      : size === "lg"
      ? "text-xl font-extrabold tracking-tight"
      : "text-base font-bold tracking-tight";
  const taglineClass =
    size === "sm"
      ? "text-[10px] text-muted-foreground leading-none"
      : size === "lg"
      ? "text-xs text-muted-foreground leading-none mt-0.5"
      : "text-[11px] text-muted-foreground leading-none";

  const content = (
    <div className={cn("flex items-center gap-3 select-none group", className)}>
      <div className="transition-transform duration-200 group-hover:scale-105">
        <LogoMark size={markSize} />
      </div>
      <div className="flex flex-col">
        <span className={cn("text-foreground font-sans", titleClass)}>
          Fin<span className="text-teal-600 dark:text-teal-400">Track</span>
        </span>
        {showTagline && (
          <span className={taglineClass}>
            Manajemen Keuangan
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
