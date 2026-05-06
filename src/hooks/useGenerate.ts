import { useRef, useState } from "react";

export type GeneratePhase = "idle" | "starting" | "running" | "done" | "error";

export interface GenerateResult {
  species?: { common_name?: string } & Record<string, unknown>;
  blend_key?: string;
  blend_size_mb?: number;
  blend_url?: string;
}

export function useGenerate() {
  const [phase, setPhase] = useState<GeneratePhase>("idle");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function generate(speciesName: string) {
    setPhase("starting");
    setResult(null);
    setError(null);

    const { runId, error: startErr } = await fetch("/api/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ speciesName }),
    }).then((r) => r.json());

    if (startErr || !runId) {
      setError(startErr ?? "Failed to start run");
      setPhase("error");
      return;
    }

    setPhase("running");

    intervalRef.current = setInterval(async () => {
      const { status, result: r, error: pollErr } = await fetch(
        `/api/status?runId=${runId}`,
      ).then((res) => res.json());

      if (pollErr || status === "FAILED" || status === "ABORTED") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setError(pollErr ?? "Actor run failed");
        setPhase("error");
      } else if (status === "SUCCEEDED") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setResult(r);
        setPhase("done");
      }
    }, 5000);
  }

  return { generate, phase, result, error };
}
