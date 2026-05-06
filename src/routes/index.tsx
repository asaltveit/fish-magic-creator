import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useTransition, useCallback } from "react";
import { generateFish, type FishProfile } from "@/lib/fish.functions";
import { AnimatedFish } from "@/components/AnimatedFish";
import { WaterBackground } from "@/components/WaterBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Waves, Search, Zap, Loader2, Check, Fish as FishIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FishForge — Generate animated fish from any species" },
      {
        name: "description",
        content:
          "Type a fish species and FishForge researches it, then generates a unique animated fish with multiple actions. Powered by AI + Apify.",
      },
      { property: "og:title", content: "FishForge — AI fish generator" },
      {
        property: "og:description",
        content: "Researched, animated, ready to swim.",
      },
    ],
  }),
  component: Index,
});

type Action = "swim" | "wiggle" | "leap" | "still";

const ACTIONS: { id: Action; label: string }[] = [
  { id: "swim", label: "Swim" },
  { id: "wiggle", label: "Wiggle" },
  { id: "leap", label: "Leap" },
  { id: "still", label: "Idle" },
];

const EXAMPLES = ["Clownfish", "Great White Shark", "Koi", "Anglerfish", "Rainbow Trout"];

function Index() {
  const generate = useServerFn(generateFish);
  const [species, setSpecies] = useState("");
  const [fish, setFish] = useState<FishProfile | null>(null);
  const [action, setAction] = useState<Action>("swim");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "researching" | "rendering">("idle");

  const handleGenerate = useCallback(
    (value: string) => {
      const v = value.trim();
      if (v.length < 2) {
        setError("Enter a species name (2+ characters).");
        return;
      }
      setError(null);
      setStage("researching");
      startTransition(async () => {
        try {
          const res = await generate({ data: { species: v } });
          setStage("rendering");
          setFish(res.profile);
          setTimeout(() => setStage("idle"), 600);
        } catch (e) {
          console.error(e);
          setError("Generation failed. Please try again.");
          setStage("idle");
        }
      });
    },
    [generate],
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 opacity-50" aria-hidden="true">
          <WaterBackground />
        </div>

        <header className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <FishIcon className="w-5 h-5" aria-hidden="true" />
            <span>FishForge</span>
          </div>
          <a
            href="#generator"
            className="text-sm opacity-90 hover:opacity-100 transition-opacity"
          >
            Try it free
          </a>
        </header>

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-10 sm:pt-24 sm:pb-20 text-center text-white">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs animate-fade-in-up">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Researched by Apify · Animated in your browser
          </div>
          <h1 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight hero-text animate-fade-in-up">
            Any fish, instantly alive.
          </h1>
          <p
            className="mt-4 text-base sm:text-lg max-w-xl mx-auto text-white animate-fade-in-up shadow-sm bg-transparent opacity-85"
            style={{ animationDelay: "0.1s", textShadow: "0 1px 12px oklch(0.18 0.06 240 / 0.6)" }}
          >
            Type a fish species. We research it across the web, then generate a
            unique animated fish you can preview in real time.
          </p>

          <div
            className="mt-8 flex flex-wrap justify-center gap-3 text-sm animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            {[
              { icon: Search, label: "Live web research" },
              { icon: Sparkles, label: "AI species profile" },
              { icon: Waves, label: "Multiple actions" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="glass rounded-full px-3 py-1.5 flex items-center gap-2"
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GENERATOR */}
      <section
        id="generator"
        className="relative max-w-6xl mx-auto px-5 sm:px-8 -mt-10 sm:-mt-16 pb-20"
      >
        <div className="rounded-3xl bg-card shadow-[var(--shadow-card)] overflow-hidden border">
          <div className="grid lg:grid-cols-5">
            {/* Preview */}
            <div className="lg:col-span-3 relative min-h-[320px] sm:min-h-[420px] bg-ocean-deep">
              <WaterBackground />
              <div className="relative z-10 h-full w-full p-6 sm:p-10 flex items-center justify-center">
                {fish ? (
                  <div className="w-full max-w-md aspect-[7/4] animate-fade-in-up">
                    <AnimatedFish fish={fish} action={action} />
                  </div>
                ) : (
                  <div className="text-center text-white">
                    <FishIcon
                      className="w-12 h-12 mx-auto mb-3 opacity-70"
                      aria-hidden="true"
                    />
                    <p className="text-sm sm:text-base max-w-xs mx-auto">
                      Your generated fish will appear here.
                    </p>
                  </div>
                )}

                {pending && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ocean-deep/40 backdrop-blur-sm text-white"
                    role="status"
                    aria-live="polite"
                  >
                    <Loader2 className="w-7 h-7 animate-spin" aria-hidden="true" />
                    <p className="text-sm font-medium">
                      {stage === "researching"
                        ? "Researching the species…"
                        : "Rendering your fish…"}
                    </p>
                  </div>
                )}
              </div>

              {fish && (
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 z-10">
                  {ACTIONS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAction(a.id)}
                      aria-pressed={action === a.id}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        action === a.id
                          ? "bg-white text-ocean-deep shadow-md"
                          : "glass text-white hover:bg-white/20"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="lg:col-span-2 p-6 sm:p-8 flex flex-col gap-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Generate a fish
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter any species — real or imagined.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGenerate(species);
                }}
                className="flex flex-col gap-3"
              >
                <label htmlFor="species-input" className="sr-only">
                  Fish species
                </label>
                <Input
                  id="species-input"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  placeholder="e.g. Clownfish"
                  disabled={pending}
                  aria-invalid={!!error}
                  aria-describedby={error ? "species-error" : undefined}
                  className="h-12 text-base"
                />
                <Button
                  type="submit"
                  disabled={pending}
                  className="h-12 text-base font-semibold cta-glow text-white border-0"
                >
                  {pending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" aria-hidden="true" />
                      Generate fish
                    </>
                  )}
                </Button>
                {error && (
                  <p id="species-error" role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
              </form>

              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground self-center mr-1">
                  Try:
                </span>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => {
                      setSpecies(ex);
                      handleGenerate(ex);
                    }}
                    disabled={pending}
                    className="text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-accent transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {fish && (
                <div className="rounded-2xl border bg-secondary/40 p-4 animate-fade-in-up">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Species profile
                  </p>
                  <p className="font-semibold text-lg mt-0.5">{fish.commonName}</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground text-xs">Habitat</dt>
                      <dd>{fish.habitat}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Diet</dt>
                      <dd>{fish.diet}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Did you know</dt>
                      <dd>{fish.funFact}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features / pricing-y strip */}
        <div className="grid sm:grid-cols-3 gap-4 mt-10">
          {[
            {
              title: "Web-researched",
              body: "Apify scrapes fresh facts about the species before rendering.",
            },
            {
              title: "Action library",
              body: "Swim, wiggle, leap, or idle — preview any motion instantly.",
            },
            {
              title: "Production-ready",
              body: "Lightweight SVG output, accessible labels, no heavy assets.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-primary" aria-hidden="true" />
                {f.title}
              </div>
              <p className="text-sm text-muted-foreground mt-1.5">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        FishForge · Built for marine-loving creators
      </footer>
    </main>
  );
}
