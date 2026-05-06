// GET /api
// Vercel-accessible health/index endpoint for the serverless API.
// Lists the available routes so deploys can be sanity-checked from the browser.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  return res.status(200).json({
    ok: true,
    service: 'fish-blender-generator-api',
    endpoints: [
      { method: 'POST', path: '/api/start', body: '{ speciesName } | { speciesData }' },
      { method: 'GET', path: '/api/status', query: 'runId=<id>' },
    ],
  });
}
