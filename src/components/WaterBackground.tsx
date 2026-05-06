export function WaterBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
      <div className="absolute inset-0 water-gradient" />
      <div className="absolute inset-0 water-caustics" />
      <div className="absolute inset-0 water-shimmer" />
      {/* light rays */}
      <div className="absolute -top-10 left-1/4 w-40 h-[120%] bg-gradient-to-b from-white/20 to-transparent blur-2xl rotate-6" />
      <div className="absolute -top-10 right-1/3 w-24 h-[120%] bg-gradient-to-b from-white/15 to-transparent blur-2xl -rotate-3" />
      {/* drifting particles */}
      <div className="particles">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} style={{ ["--i" as string]: i }} />
        ))}
      </div>
    </div>
  );
}
