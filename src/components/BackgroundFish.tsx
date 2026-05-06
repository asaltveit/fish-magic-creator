import { useMemo } from "react";

type FishKind = "salmon" | "snapper" | "goldfish";

interface SilhouetteProps {
  kind: FishKind;
}

function FishSilhouette({ kind }: SilhouetteProps) {
  const palette = {
    salmon: { body: "#f4a986", belly: "#fcd9c4", fin: "#d97a55", accent: "#b85a3a" },
    snapper: { body: "#e84c4c", belly: "#f6b3a5", fin: "#a82323", accent: "#7a1414" },
    goldfish: { body: "#ffb02e", belly: "#ffe08a", fin: "#ff7a00", accent: "#cc5500" },
  }[kind];

  return (
    <svg viewBox="0 0 240 120" className="w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id={`bg-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.body} />
          <stop offset="100%" stopColor={palette.fin} />
        </linearGradient>
      </defs>
      {/* Tail */}
      <g className="bgfish-tail" style={{ transformOrigin: "30px 60px" }}>
        <path d="M30 60 L0 25 L12 60 L0 95 Z" fill={palette.fin} />
      </g>
      {/* Body */}
      <path
        d="M30 60 Q70 15 165 25 Q210 35 220 60 Q210 85 165 95 Q70 105 30 60 Z"
        fill={`url(#bg-${kind})`}
      />
      {/* Belly highlight */}
      <path
        d="M50 75 Q120 95 200 75 Q160 100 110 100 Q70 98 50 75 Z"
        fill={palette.belly}
        opacity="0.7"
      />
      {/* Top fin (static — no scaleY flutter to avoid bulging) */}
      <path
        d="M90 28 Q120 0 150 25 L140 35 Q120 28 100 35 Z"
        fill={palette.fin}
      />
      {/* Bottom fin */}
      <path
        d="M95 92 Q120 110 145 92 L135 85 Q120 92 105 85 Z"
        fill={palette.fin}
        opacity="0.9"
      />
      {kind !== "goldfish" && (
        <path
          d="M55 60 Q120 50 200 60"
          stroke={palette.accent}
          strokeWidth="3"
          fill="none"
          opacity="0.5"
        />
      )}
      {kind === "goldfish" && (
        <path d="M25 60 L-8 20 L8 60 L-8 100 Z" fill={palette.body} opacity="0.6" />
      )}
      {/* Gill */}
      <path
        d="M170 42 Q165 60 170 78"
        stroke={palette.fin}
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      {/* Eye (points right in source SVG) */}
      <circle cx="195" cy="55" r="6" fill="#fff" />
      <circle cx="197" cy="55" r="3.5" fill="#1a1a1a" />
      <circle cx="198.5" cy="53.5" r="1.2" fill="#fff" />
    </svg>
  );
}

interface SwimmerProps {
  kind: FishKind;
  top: string;
  duration: string;
  delay: string;
  scale: number;
  reverse?: boolean;
}

function Swimmer({ kind, top, duration, delay, scale, reverse }: SwimmerProps) {
  // When reversed, animate right→left AND mirror the fish so its eye leads.
  return (
    <div
      className="bgfish-swimmer"
      style={{
        top,
        animationDuration: duration,
        animationDelay: delay,
        animationDirection: reverse ? "reverse" : "normal",
      }}
    >
      <div
        className="bgfish-bob"
        style={{
          transform: `scale(${scale}) scaleX(${reverse ? -1 : 1})`,
        }}
      >
        <div className="w-32 sm:w-40">
          <FishSilhouette kind={kind} />
        </div>
      </div>
    </div>
  );
}

const KINDS: FishKind[] = ["salmon", "snapper", "goldfish"];
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

export function BackgroundFish() {
  const swimmers = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => {
      const duration = rand(28, 60); // seconds
      return {
        key: i,
        kind: KINDS[Math.floor(Math.random() * KINDS.length)],
        top: `${Math.round(rand(12, 82))}%`,
        duration: `${duration.toFixed(1)}s`,
        // Negative delay so some fish are mid-swim on first paint;
        // positive delay so others enter later. Randomized per fish.
        delay: `${rand(-duration, 8).toFixed(1)}s`,
        scale: rand(0.55, 1.15),
        reverse: Math.random() < 0.5,
      };
    });
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {swimmers.map((s) => (
        <Swimmer
          key={s.key}
          kind={s.kind}
          top={s.top}
          duration={s.duration}
          delay={s.delay}
          scale={s.scale}
          reverse={s.reverse}
        />
      ))}
    </div>
  );
}
