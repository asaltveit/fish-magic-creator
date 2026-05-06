import { useId } from "react";
import type { FishProfile } from "@/server/fish.functions";

type Action = "swim" | "wiggle" | "leap" | "still";

interface Props {
  fish: FishProfile;
  action: Action;
}

const SHAPE_PATHS: Record<FishProfile["bodyShape"], string> = {
  // Body ellipse-like silhouette in 240x120 viewport, head right
  torpedo:
    "M30 60 Q60 10 160 20 Q210 30 220 60 Q210 90 160 100 Q60 110 30 60 Z",
  round:
    "M40 60 Q60 0 150 15 Q210 35 215 60 Q210 85 150 105 Q60 120 40 60 Z",
  long: "M20 60 Q60 25 180 30 Q220 40 225 60 Q220 80 180 90 Q60 95 20 60 Z",
  flat: "M30 60 Q70 30 160 40 Q215 50 220 60 Q215 70 160 80 Q70 90 30 60 Z",
};

export function AnimatedFish({ fish, action }: Props) {
  const id = useId().replace(/:/g, "");
  const bodyGrad = `bg-${id}`;
  const bellyGrad = `belly-${id}`;
  const patternId = `pat-${id}`;
  const path = SHAPE_PATHS[fish.bodyShape];
  const scale = fish.size;

  return (
    <svg
      viewBox="0 0 280 160"
      className="w-full h-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      role="img"
      aria-label={`Animated ${fish.commonName}`}
    >
      <defs>
        <linearGradient id={bodyGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fish.bodyColor} />
          <stop offset="100%" stopColor={fish.finColor} />
        </linearGradient>
        <linearGradient id={bellyGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fish.bodyColor} stopOpacity="0" />
          <stop offset="100%" stopColor={fish.bellyColor} stopOpacity="0.95" />
        </linearGradient>
        {fish.pattern === "stripes" && (
          <pattern
            id={patternId}
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(75)"
          >
            <rect width="6" height="14" fill={fish.accentColor} opacity="0.55" />
          </pattern>
        )}
        {fish.pattern === "spots" && (
          <pattern
            id={patternId}
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="9" cy="9" r="3" fill={fish.accentColor} opacity="0.6" />
          </pattern>
        )}
      </defs>

      <g
        className="fish-root"
        data-action={action}
        style={{ transformOrigin: "140px 80px", transform: `scale(${scale})` }}
      >
        {/* Tail */}
        <g className="fish-tail" style={{ transformOrigin: "30px 60px" }}>
          <path
            d="M30 60 L0 25 L10 60 L0 95 Z"
            fill={fish.finColor}
            transform="translate(20, 20)"
          />
        </g>

        {/* Body */}
        <g transform="translate(20, 20)">
          <path d={path} fill={`url(#${bodyGrad})`} />
          {(fish.pattern === "stripes" || fish.pattern === "spots") && (
            <path d={path} fill={`url(#${patternId})`} />
          )}
          <path d={path} fill={`url(#${bellyGrad})`} />

          {/* Top fin */}
          <path
            d="M90 22 Q120 -5 150 20 L140 30 Q120 22 100 30 Z"
            fill={fish.finColor}
            className="fish-finTop"
            style={{ transformOrigin: "120px 22px" }}
          />
          {/* Bottom fin */}
          <path
            d="M90 95 Q115 115 140 95 L130 88 Q115 95 100 88 Z"
            fill={fish.finColor}
            opacity="0.9"
            className="fish-finBot"
            style={{ transformOrigin: "115px 95px" }}
          />
          {/* Gill */}
          <path
            d="M170 40 Q165 60 170 80"
            stroke={fish.finColor}
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
          {/* Eye */}
          <circle cx="195" cy="55" r="7" fill="#fff" />
          <circle cx="197" cy="55" r="4" fill="#1a1a1a" />
          <circle cx="198.5" cy="53" r="1.4" fill="#fff" />
        </g>

        {/* Bubbles */}
        <g className="fish-bubbles" aria-hidden="true">
          <circle cx="245" cy="55" r="3" fill="#ffffff" opacity="0.7" />
          <circle cx="252" cy="48" r="2" fill="#ffffff" opacity="0.6" />
          <circle cx="248" cy="40" r="1.5" fill="#ffffff" opacity="0.5" />
        </g>
      </g>
    </svg>
  );
}
