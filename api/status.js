// GET /api/status?runId=<runId>
// Returns: { status, result? }
//
// status is one of the Apify run statuses:
//   READY | RUNNING            — still in progress, poll again
//   SUCCEEDED                  — result contains the dataset item
//   FAILED | ABORTED | TIMED-OUT | TIMING-OUT — something went wrong
//
// result (on SUCCEEDED):
//   { species, blend_key, blend_size_mb, blend_url, blender_log }

const TERMINAL_FAILED = new Set(['FAILED', 'ABORTED', 'TIMED-OUT', 'TIMING-OUT']);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { runId } = req.query;
  if (!runId) return res.status(400).json({ error: 'runId query param is required' });

  const token = process.env.APIFY_TOKEN;
  if (!token) return res.status(500).json({ error: 'APIFY_TOKEN env var not set' });

  const authHeader = { Authorization: `Bearer ${token}` };

  // Fetch run metadata
  const runRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
    headers: authHeader,
  });

  if (!runRes.ok) {
    return res
      .status(502)
      .json({ error: `Apify returned ${runRes.status} for run ${runId}` });
  }

  const { data: run } = await runRes.json();
  const { status, statusMessage, defaultDatasetId } = run;

  // Terminal failure
  if (TERMINAL_FAILED.has(status)) {
    return res.status(200).json({ status, error: statusMessage || 'Actor run failed' });
  }

  // Still running
  if (status !== 'SUCCEEDED') {
    return res.status(200).json({ status });
  }

  // Fetch the first dataset item (the generator pushes exactly one)
  const itemsRes = await fetch(
    `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?limit=1`,
    { headers: authHeader },
  );

  if (!itemsRes.ok) {
    return res
      .status(502)
      .json({ error: `Could not fetch dataset items: ${itemsRes.status}` });
  }

  const items = await itemsRes.json();
  const result = items[0] ?? null;

  // Strip the blender log from the response — it's large and only useful for debugging
  if (result?.blender_log) delete result.blender_log;

  return res.status(200).json({ status, result });
}
