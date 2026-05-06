import { createFileRoute } from "@tanstack/react-router";

const TERMINAL_FAILED = new Set(["FAILED", "ABORTED", "TIMED-OUT", "TIMING-OUT"]);

export const Route = createFileRoute("/api/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const runId = url.searchParams.get("runId");
        if (!runId) {
          return Response.json(
            { error: "runId query param is required" },
            { status: 400 },
          );
        }

        const token = process.env.APIFY_API_TOKEN ?? process.env.APIFY_TOKEN;
        if (!token) {
          return Response.json(
            { error: "APIFY_API_TOKEN env var not set" },
            { status: 500 },
          );
        }
        const authHeader = { Authorization: `Bearer ${token}` };

        const runRes = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}`,
          { headers: authHeader },
        );
        if (!runRes.ok) {
          return Response.json(
            { error: `Apify returned ${runRes.status} for run ${runId}` },
            { status: 502 },
          );
        }

        const { data: run } = (await runRes.json()) as {
          data: {
            status: string;
            statusMessage?: string;
            defaultDatasetId: string;
          };
        };
        const { status, statusMessage, defaultDatasetId } = run;

        if (TERMINAL_FAILED.has(status)) {
          return Response.json({
            status,
            error: statusMessage || "Actor run failed",
          });
        }

        if (status !== "SUCCEEDED") {
          return Response.json({ status });
        }

        const itemsRes = await fetch(
          `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?limit=1`,
          { headers: authHeader },
        );
        if (!itemsRes.ok) {
          return Response.json(
            { error: `Could not fetch dataset items: ${itemsRes.status}` },
            { status: 502 },
          );
        }

        const items = (await itemsRes.json()) as Array<Record<string, unknown>>;
        const result = items[0] ?? null;
        if (result && "blender_log" in result) delete result.blender_log;

        return Response.json({ status, result });
      },
    },
  },
});
