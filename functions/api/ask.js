/* =========================================================
   POST /api/ask  (Cloudflare Pages Function)
   Body {"q": "..."} -> {"index": n} (an ANSWERS index), or {"index": null, "alts": [n, ...]}
   with up to two near misses for "Did you mean".
   Jev (TypeSafe's System One model) picks which of Indigo's written answers
   fits the question, or "none". It never writes text: the page shows the
   chosen answer word for word. Needs the TYPESAFE_API_KEY secret; without
   it every question falls back to "I haven't written about that yet".
   ========================================================= */
import { ANSWERS } from '../../src/data/answers.js';
import { PHRASINGS } from '../../src/data/phrasings.js';

const JEV_URL = 'https://api.typesafe.ai/v1/systemone';
const MAX_Q = 300;
// Minimum probability for the top answer. Tune against real questions.
const DEFAULT_MIN_P = 0.5;
// Near misses at or above this probability come back as "Did you mean" options.
const ALT_MIN_P = 0.15;
// How many extra phrasings per answer to show Jev (keeps the prompt small).
const PHRASINGS_PER_ANSWER = 6;

const CRITERIA = Object.fromEntries(ANSWERS.map((a) => {
  const more = (a.also || []).concat((PHRASINGS[a.id] || []).slice(0, PHRASINGS_PER_ANSWER));
  return [a.id, more.length ? `${a.q} Also covers: ${more.join('; ')}` : a.q];
}).concat([[
  'none',
  "None of these written answers addresses the question, or the question isn't about Indigo's work, background or availability.",
]]));
const INDEX = new Map(ANSWERS.map((a, i) => [a.id, i]));

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

/* Up to two answers Jev found plausible but not certain, as "Did you mean" options. */
function altsFrom(ans) {
  return Object.entries(ans.probabilities || {}).filter(([id, q]) => id !== 'none' && INDEX.has(id) && q >= ALT_MIN_P)
    .sort((a, b) => b[1] - a[1]).slice(0, 2).map(([id]) => INDEX.get(id));
}

export async function pick(q, env, fetchImpl = fetch) {
  const res = await fetchImpl(JEV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.TYPESAFE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'jev-latest',
      state: { site: "Indigo Grady's portfolio site. Visitors, often recruiters and hiring managers, ask about his work.", question: q },
      questions: {
        answer: {
          type: 'choice',
          instructions: "Which of Indigo's written answers best answers the visitor's `question`? Choose none if no answer addresses what they asked.",
          criteria: CRITERIA,
        },
      },
    }),
    signal: AbortSignal.timeout(2000),
  });
  if (!res.ok) return { index: null, error: res.status };
  const out = await res.json();
  const ans = out && out.answers && out.answers.answer;
  if (!ans) return { index: null, alts: [] };
  const p = (ans.probabilities || {})[ans.choice] || 0;
  const minP = Number(env.ASK_MIN_P) || DEFAULT_MIN_P;
  if (INDEX.has(ans.choice) && p >= minP) return { index: INDEX.get(ans.choice), p };
  return { index: null, alts: altsFrom(ans), p };
}

export async function onRequestPost({ request, env }) {
  let q = '';
  try { q = String((await request.json()).q || '').trim().slice(0, MAX_Q); } catch (e) { return json({ index: null }, 400); }
  if (!q || !env.TYPESAFE_API_KEY) return json({ index: null });

  // Same question, same answer: cache Jev's pick for a day to save calls.
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const key = new Request('https://ask.cache/' + encodeURIComponent(q.toLowerCase().replace(/\s+/g, ' ')));
  if (cache) {
    const hit = await cache.match(key);
    if (hit) return json(await hit.json());
  }
  let result;
  try { result = await pick(q, env); } catch (e) { return json({ index: null }); }
  if (cache && !result.error) {
    await cache.put(key, new Response(JSON.stringify({ index: result.index, alts: result.alts || [] }), { headers: { 'Cache-Control': 'max-age=86400' } }));
  }
  return json({ index: result.index, alts: result.alts || [] });
}
