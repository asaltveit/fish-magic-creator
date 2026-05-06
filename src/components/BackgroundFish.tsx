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
      {/* Top fin */}
      <path
        d="M90 28 Q120 0 150 25 L140 35 Q120 28 100 35 Z"
        fill={palette.fin}
        className="bgfish-fin"
        style={{ transformOrigin: "120px 28px" }}
      />
      {/* Bottom fin */}
      <path
        d="M95 92 Q120 110 145 92 L135 85 Q120 92 105 85 Z"
        fill={palette.fin}
        opacity="0.9"
      />
      {/* Stripe accent for snapper/salmon */}
      {kind !== "goldfish" && (
        <path
          d="M55 60 Q120 50 200 60"
          stroke={palette.accent}
          strokeWidth="3"
          fill="none"
          opacity="0.5"
        />
      )}
      {/* Goldfish flowing tail accent */}
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
      {/* Eye */}
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
  return (
    <div
      className="bgfish-swimmer"
      style={{
        top,
        animationDuration: duration,
        animationDelay: delay,
        ["--bgfish-scale" as string]: scale,
        ["--bgfish-flip" as string]: reverse ? "-1" : "1",
      }}
    >
      <div className="bgfish-bob">
        <div className="w-32 sm:w-40">
          <FishSilhouette kind={kind} />
        </div>
      </div>
    </div>
  );
}

export function BackgroundFish() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <Swimmer kind="salmon" top="22%" duration="38s" delay="0s" scale={0.9} />
      <Swimmer kind="snapper" top="58%" duration="46s" delay="-12s" scale={1.05} reverse />
      <Swimmer kind="goldfish" top="75%" duration="32s" delay="-22s" scale={0.7} />
    </div>
  );
}
