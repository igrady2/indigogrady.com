/* Scores the Ask matcher (and the map facts in src/data/facts.js) against tests/ask-questions.tsv (question <tab> acceptable ids, | separated, or "none").
   Run: node scripts/eval-ask.mjs [--misses] [--file tests/ask-holdout.tsv]
   tests/ask-holdout.tsv holds questions written without tuning phrasings to them: a fairer score.
   With --jev, questions the page isn't sure about go to Jev, as on the live site:
   TYPESAFE_API_KEY=... node scripts/eval-ask.mjs --jev --misses */
import fs from 'fs';
import { ANSWERS } from '../src/data/answers.js';
import { match } from '../src/data/match.js';
import { fact } from '../src/data/facts.js';
import { pick } from '../functions/api/ask.js';

const fi = process.argv.indexOf('--file'), FILE = fi > 0 ? new URL('../' + process.argv[fi + 1], import.meta.url) : new URL('../tests/ask-questions.tsv', import.meta.url);
const rows = fs.readFileSync(FILE, 'utf8').trim().split('\n').map((l) => { const [q, e] = l.split('\t'); return { q, expect: e.split('|') }; });
const ids = new Set(ANSWERS.map((a) => a.id));
rows.forEach((r) => r.expect.forEach((e) => { if (e !== 'none' && !e.startsWith('fact:') && !ids.has(e)) throw new Error('unknown id ' + e); }));
const JEV = process.argv.includes('--jev');
if (JEV && !process.env.TYPESAFE_API_KEY) throw new Error('--jev needs TYPESAFE_API_KEY');
let right = 0, wrong = 0, miss = 0, noneOk = 0, noneBad = 0, dym = 0, jevCalls = 0; const out = [];
for (const r of rows) {
  const m = match(r.q), f = fact(r.q, ANSWERS[m.index]);
  let index = m.index, altIdx = m.alts || [];
  if (JEV && !f && index == null) {
    jevCalls++;
    const j = await pick(r.q, { TYPESAFE_API_KEY: process.env.TYPESAFE_API_KEY });
    if (j.error) throw new Error('Jev returned ' + j.error);
    index = j.index; if (j.alts && j.alts.length) altIdx = j.alts;
  }
  const got = f ? f.id : index == null ? 'none' : ANSWERS[index].id, alts = altIdx.map((i) => ANSWERS[i].id);
  if (r.expect[0] === 'none') { if (got === 'none') noneOk++; else { noneBad++; out.push(['FALSE', r.q, got]); } continue; }
  if (r.expect.includes(got)) right++;
  else if (got === 'none') { miss++; if (alts.some((a) => r.expect.includes(a))) dym++; out.push(['MISS', r.q, r.expect.join('|'), alts.join(',')]); }
  else { wrong++; out.push(['WRONG', r.q, 'want ' + r.expect.join('|'), 'got ' + got]); }
}
const n = right + wrong + miss, pct = (x, d) => (100 * x / d).toFixed(0) + '%';
if (JEV) console.log(`Jev was asked ${jevCalls} questions the page wasn't sure about`);
console.log(`answerable: ${n}  right ${right} (${pct(right, n)})  wrong ${wrong} (${pct(wrong, n)})  missed ${miss} (${pct(miss, n)})`);
console.log(`of the misses, ${dym} offer the right answer under "Did you mean"`);
console.log(`off-topic: ${noneOk + noneBad}  correctly declined ${noneOk}  answered anyway ${noneBad}`);
if (process.argv.includes('--misses')) out.forEach((o) => console.log(o.join('  ·  ')));
