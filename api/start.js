// POST /api/start
// Body: { speciesName: string } or { speciesData: object }
// Returns: { runId: string }
//
// Kicks off a fish-blender-generator Actor run and returns the run ID
// immediately so the frontend can poll /api/status?runId=... for progress.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { speciesName, speciesData } = req.body ?? {};
  if (!speciesName && !speciesData) {
    return res.status(400).json({ error: 'speciesName or speciesData is required' });
  }

  const token = process.env.APIFY_TOKEN;
  const username = process.env.APIFY_USERNAME ?? 'whalesharka';

  if (!token) return res.status(500).json({ error: 'APIFY_TOKEN env var not set' });

  const actorId = `${username}~fish-blender-generator`;
  const apifyRes = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ speciesName, speciesData }),
    },
  );

  if (!apifyRes.ok) {
    const text = await apifyRes.text();
    return res
      .status(502)
      .json({ error: `Apify returned ${apifyRes.status}: ${text.slice(0, 300)}` });
  }

  const { data } = await apifyRes.json();
  return res.status(200).json({ runId: data.id });
}
