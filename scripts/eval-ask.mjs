/* Scores the Ask matcher (and the map facts in src/data/facts.js) against tests/ask-questions.tsv (question <tab> acceptable ids, | separated, or "none").
   Run: node scripts/eval-ask.mjs [--misses] */
import fs from 'fs';
import { ANSWERS } from '../src/data/answers.js';
import { match } from '../src/data/match.js';
import { fact } from '../src/data/facts.js';

const rows = fs.readFileSync(new URL('../tests/ask-questions.tsv', import.meta.url), 'utf8').trim().split('\n').map((l) => { const [q, e] = l.split('\t'); return { q, expect: e.split('|') }; });
const ids = new Set(ANSWERS.map((a) => a.id));
rows.forEach((r) => r.expect.forEach((e) => { if (e !== 'none' && !e.startsWith('fact:') && !ids.has(e)) throw new Error('unknown id ' + e); }));
let right = 0, wrong = 0, miss = 0, noneOk = 0, noneBad = 0, dym = 0; const out = [];
rows.forEach((r) => {
  const m = match(r.q), f = fact(r.q, ANSWERS[m.index]), got = f ? f.id : m.index == null ? 'none' : ANSWERS[m.index].id, alts = (m.alts || []).map((i) => ANSWERS[i].id);
  if (r.expect[0] === 'none') { if (got === 'none') noneOk++; else { noneBad++; out.push(['FALSE', r.q, got]); } return; }
  if (r.expect.includes(got)) right++;
  else if (got === 'none') { miss++; if (alts.some((a) => r.expect.includes(a))) dym++; out.push(['MISS', r.q, r.expect.join('|'), alts.join(',')]); }
  else { wrong++; out.push(['WRONG', r.q, 'want ' + r.expect.join('|'), 'got ' + got]); }
});
const n = right + wrong + miss, pct = (x, d) => (100 * x / d).toFixed(0) + '%';
console.log(`answerable: ${n}  right ${right} (${pct(right, n)})  wrong ${wrong} (${pct(wrong, n)})  missed ${miss} (${pct(miss, n)})`);
console.log(`of the misses, ${dym} offer the right answer under "Did you mean"`);
console.log(`off-topic: ${noneOk + noneBad}  correctly declined ${noneOk}  answered anyway ${noneBad}`);
if (process.argv.includes('--misses')) out.forEach((o) => console.log(o.join('  ·  ')));
