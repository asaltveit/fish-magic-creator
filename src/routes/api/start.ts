import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/start")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({}));
        const { speciesName, speciesData } = body ?? {};
        if (!speciesName && !speciesData) {
          return Response.json(
            { error: "speciesName or speciesData is required" },
            { status: 400 },
          );
        }

        const token = process.env.APIFY_API_TOKEN ?? process.env.APIFY_TOKEN;
        const username = process.env.APIFY_USERNAME ?? "whalesharka";
        if (!token) {
          return Response.json(
            { error: "APIFY_API_TOKEN env var not set" },
            { status: 500 },
          );
        }

        const actorId = `${username}~fish-blender-generator`;
        const apifyRes = await fetch(
          `https://api.apify.com/v2/acts/${actorId}/runs`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ speciesName, speciesData }),
          },
        );

        if (!apifyRes.ok) {
          const text = await apifyRes.text();
          return Response.json(
            { error: `Apify returned ${apifyRes.status}: ${text.slice(0, 300)}` },
            { status: 502 },
          );
        }

        const { data } = (await apifyRes.json()) as { data: { id: string } };
        return Response.json({ runId: data.id });
      },
    },
  },
});
