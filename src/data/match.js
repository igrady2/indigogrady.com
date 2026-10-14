/* =========================================================
   ASK MATCHER: picks which of Indigo's written answers fits a question.
   Pure function, shared by the page (site.js) and scripts/eval-ask.mjs.
   Two signals:
   - keys: hand-weighted words and `also` phrases (answers.js)
   - similarity: word overlap with the written question, `also` phrases and
     the extra phrasings (phrasings.js), weighting rare words more
   ========================================================= */
import { ANSWERS } from './answers.js';
import { PHRASINGS } from './phrasings.js';

export function norm(s) { return ' ' + String(s).toLowerCase().replace(/[^a-z0-9\- ]+/g, ' ').replace(/\s+/g, ' ') + ' '; }

/* ---------- keys ---------- */
const KEYED = ANSWERS.map((a) => (a.keys || []).concat((a.also || []).map((p) => [p, 4])));
export function keyScores(qText) {
  const q = norm(qText);
  return KEYED.map((keys) => {
    let s = 0;
    keys.forEach((k) => { const key = k[0].trim().length <= 3 ? ' ' + k[0].trim() + ' ' : k[0]; if (q.indexOf(key) !== -1) s += k[1]; });
    return s;
  });
}

/* ---------- similarity ---------- */
const STOP = new Set(('a an the and or but of to in on at for with from by as is are was were be been being am do does did done have has had ' +
  'i me my mine you your yours he him his indigo grady we our they them their it its this that these those there here ' +
  'what whats which who whom whose when where why how can could would should will shall may might must ' +
  'tell describe explain give walk talk share about any some much many more most very really just so if than then ' +
  'not no yes ever also too please time something anything thing things kind sort get got go went like').split(' '));
function stem(w) {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}
export function tokens(s) {
  return Array.from(new Set(norm(s).replace(/-/g, ' ').trim().split(' ').filter((w) => w && !STOP.has(w)).map(stem).filter((w) => w.length > 1)));
}
const DOCS = ANSWERS.map((a) => [a.q].concat(a.also || [], PHRASINGS[a.id] || []).map(tokens).filter((t) => t.length));
const DF = new Map();
DOCS.forEach((doc) => { new Set(doc.flat()).forEach((t) => DF.set(t, (DF.get(t) || 0) + 1)); });
const NA = ANSWERS.length;
/* a word no answer uses counts as rare, so off-topic questions score low */
function idf(t) { return Math.log((NA + 1) / ((DF.get(t) || 0) + 0.5)); }
function sim(qt, pt) {
  let shared = 0, qw = 0, pw = 0; const ps = new Set(pt);
  qt.forEach((t) => { const w = idf(t); qw += w; if (ps.has(t)) shared += w; });
  pt.forEach((t) => { pw += idf(t); });
  return qw && pw ? shared / Math.sqrt(qw * pw) : 0;
}
/* how much of the question (by word weight) any phrasing of this answer shares */
function cover(qt, doc) {
  let qw = 0, shared = 0; const all = new Set(doc.flat());
  qt.forEach((t) => { const w = idf(t); qw += w; if (all.has(t)) shared += w; });
  return qw ? shared / qw : 0;
}
export function simScores(qText) {
  const qt = tokens(qText);
  return DOCS.map((doc) => doc.reduce((best, pt) => Math.max(best, sim(qt, pt)), 0));
}

/* ---------- decision ---------- */
export const SURE = 0.6;   // confident enough to answer outright
export const MAYBE = 0.3;  // close enough to offer as "Did you mean"
export const COVER = 0.5;  // share of the question's weight the answer must cover to be sure
/* Returns { index, alts, ranked }: index is the confident pick or null;
   alts are up to two plausible answers when nothing is confident. */
export function match(qText) {
  const ks = keyScores(qText), ss = simScores(qText);
  const ranked = ANSWERS.map((a, index) => ({ index, score: ss[index] + Math.min(ks[index], 8) * 0.03 }))
    .filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
  const top = ranked[0], second = ranked[1];
  /* "What's your favorite food?" shares only "favorite" with a real answer: not sure, so Jev decides */
  const covered = top && (ks[top.index] >= 4 || cover(tokens(qText), DOCS[top.index]) >= COVER);
  const sure = top && covered && top.score >= SURE && (!second || top.score - second.score >= 0.05);
  if (sure) return { index: top.index, alts: [], ranked };
  return { index: null, alts: ranked.filter((r) => r.score >= MAYBE).slice(0, 2).map((r) => r.index), ranked };
}
