import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  species: z.string().trim().min(2).max(60),
});

export type FishProfile = {
  species: string;
  commonName: string;
  habitat: string;
  diet: string;
  funFact: string;
  bodyColor: string;
  bellyColor: string;
  finColor: string;
  accentColor: string;
  pattern: "solid" | "stripes" | "spots" | "gradient";
  bodyShape: "torpedo" | "round" | "long" | "flat";
  size: number; // 0.6 - 1.4 scale multiplier
  sources: string[];
};

const FALLBACK_PALETTES = [
  { body: "#3aa1c9", belly: "#e8f4f8", fin: "#1f6f8b", accent: "#f5b04a" },
  { body: "#e07a5f", belly: "#f4e9d8", fin: "#a8432a", accent: "#3d5a80" },
  { body: "#5b8a72", belly: "#dde7c7", fin: "#345648", accent: "#f2c14e" },
  { body: "#7a5cbf", belly: "#efe6ff", fin: "#3b2466", accent: "#ffd166" },
];

async function researchWithApify(species: string): Promise<string[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) return [];
  try {
    const url = `https://api.apify.com/v2/acts/apify~rag-web-browser/run-sync-get-dataset-items?token=${token}&timeout=45`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `${species} fish habitat diet appearance color`,
        maxResults: 3,
        scrapingTool: "raw-http",
        outputFormats: ["markdown"],
      }),
      signal: AbortSignal.timeout(50_000),
    });
    if (!res.ok) return [];
    const items = (await res.json()) as Array<{
      metadata?: { url?: string; title?: string };
      markdown?: string;
      text?: string;
    }>;
    return items
      .slice(0, 3)
      .map((i) => {
        const snippet = (i.markdown ?? i.text ?? "").slice(0, 1500);
        return `Source: ${i.metadata?.title ?? ""} (${i.metadata?.url ?? ""})\n${snippet}`;
      })
      .filter(Boolean);
  } catch (err) {
    console.error("Apify research failed:", err);
    return [];
  }
}

async function summarizeWithAI(
  species: string,
  research: string[],
): Promise<Partial<FishProfile> | null> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return null;
  const context = research.length
    ? research.join("\n\n---\n\n")
    : "No external research available; use general knowledge.";

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You are a marine biologist. Return JSON describing a fish species for a stylized SVG renderer. Be accurate when the species is real; invent reasonably for fictional ones.",
        },
        {
          role: "user",
          content: `Species: "${species}"\n\nResearch:\n${context}\n\nReturn STRICT JSON, no prose.`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "describe_fish",
            description: "Describe a fish for stylized rendering",
            parameters: {
              type: "object",
              properties: {
                commonName: { type: "string" },
                habitat: { type: "string", description: "1 short sentence" },
                diet: { type: "string", description: "1 short sentence" },
                funFact: { type: "string", description: "1 short sentence" },
                bodyColor: { type: "string", description: "hex color" },
                bellyColor: { type: "string", description: "hex color" },
                finColor: { type: "string", description: "hex color" },
                accentColor: { type: "string", description: "hex color" },
                pattern: {
                  type: "string",
                  enum: ["solid", "stripes", "spots", "gradient"],
                },
                bodyShape: {
                  type: "string",
                  enum: ["torpedo", "round", "long", "flat"],
                },
                size: { type: "number", description: "0.6 to 1.4" },
              },
              required: [
                "commonName",
                "habitat",
                "diet",
                "funFact",
                "bodyColor",
                "bellyColor",
                "finColor",
                "accentColor",
                "pattern",
                "bodyShape",
                "size",
              ],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "describe_fish" } },
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!res.ok) {
    console.error("AI call failed", res.status, await res.text());
    return null;
  }
  const data = await res.json();
  const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) return null;
  try {
    return JSON.parse(args);
  } catch {
    return null;
  }
}

export const generateFish = createServerFn({ method: "POST" })
  .inputValidator((d) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const research = await researchWithApify(data.species);
    const ai = await summarizeWithAI(data.species, research);

    const fallback = FALLBACK_PALETTES[
      Math.floor(Math.random() * FALLBACK_PALETTES.length)
    ];

    const profile: FishProfile = {
      species: data.species,
      commonName: ai?.commonName ?? data.species,
      habitat: ai?.habitat ?? "Found in a variety of aquatic environments.",
      diet: ai?.diet ?? "Feeds opportunistically on available prey.",
      funFact: ai?.funFact ?? "A fascinating creature of the deep.",
      bodyColor: ai?.bodyColor ?? fallback.body,
      bellyColor: ai?.bellyColor ?? fallback.belly,
      finColor: ai?.finColor ?? fallback.fin,
      accentColor: ai?.accentColor ?? fallback.accent,
      pattern: (ai?.pattern as FishProfile["pattern"]) ?? "gradient",
      bodyShape: (ai?.bodyShape as FishProfile["bodyShape"]) ?? "torpedo",
      size: Math.min(1.4, Math.max(0.6, ai?.size ?? 1)),
      sources: research
        .map((r) => {
          const m = r.match(/\((https?:\/\/[^)]+)\)/);
          return m?.[1] ?? "";
        })
        .filter(Boolean),
    };

    return { profile, researched: research.length > 0 };
  });
