import { useState, useRef } from 'react';

export function useGenerate() {
  const [phase, setPhase]   = useState('idle');   // idle | starting | running | done | error
  const [result, setResult] = useState(null);
  const [error, setError]   = useState(null);
  const intervalRef = useRef(null);

  async function generate(speciesName) {
    setPhase('starting');
    setResult(null);
    setError(null);

    // 1. Kick off the actor run
    const { runId, error: startErr } = await fetch('/api/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speciesName }),
    }).then(r => r.json());

    if (startErr) { setError(startErr); setPhase('error'); return; }

    setPhase('running');

    // 2. Poll until done
    intervalRef.current = setInterval(async () => {
      const { status, result: r, error: pollErr } = await fetch(
        `/api/status?runId=${runId}`
      ).then(r => r.json());

      if (pollErr || status === 'FAILED' || status === 'ABORTED') {
        clearInterval(intervalRef.current);
        setError(pollErr ?? 'Actor run failed');
        setPhase('error');
      } else if (status === 'SUCCEEDED') {
        clearInterval(intervalRef.current);
        setResult(r);
        setPhase('done');
      }
      // READY / RUNNING → keep polling
    }, 5000);
  }

  return { generate, phase, result, error };
}
