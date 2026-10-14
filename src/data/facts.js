/* =========================================================
   ASK FACTS: direct answers built from the map's own data (map.js), for the
   questions a written answer can't cover one by one:
   - "Have you used Stripe?" -> where each tool or platform shows up on the map
   - "When were you at Triumvirate?" -> the role's title and dates
   Every word comes from map.js, so it stays true as the map changes.
   ========================================================= */
import { N, L } from './map.js';
import { norm } from './match.js';

const byId = Object.fromEntries(N.map((n) => [n.id, n]));
const nbr = {};
L.forEach(([a, b]) => { (nbr[a] = nbr[a] || []).push(b); (nbr[b] = nbr[b] || []).push(a); });

/* words people use for each tool or platform dot */
const TOOL_WORDS = {
  't-jira': ['jira'], 't-conf': ['confluence'], 't-taiga': ['taiga'], 't-air': ['airtable', 'air table'],
  't-claude': ['claude', 'claude code', 'anthropic'], 't-cursor': ['cursor'], 't-gpt': ['chatgpt', 'chat gpt', 'openai', 'gpt'],
  't-ghl': ['gohighlevel', 'go highlevel', 'highlevel', 'high level', 'ghl'], 't-api': ['rest api', 'rest apis', 'apis', 'api', 'webhooks'],
  't-web': ['html', 'javascript', 'js'], 't-data': ['json', 'csv'], 't-chart': ['chart js', 'chartjs', 'chart.js'],
  't-ga4': ['ga4', 'google analytics'], 't-bq': ['bigquery', 'big query'], 't-stripe': ['stripe'], 't-gh': ['github', 'git'],
  't-cf': ['cloudflare', 'cloudflare pages'], 't-gc': ['google classroom'], 't-cws': ['chrome web store'],
};
const ROLE_WORDS = {
  ap: ['autopilotpr', 'autopilot pr', 'autopilot'], rs: ['razor sparrow', 'razorsparrow'], cp: ['code power', 'optic power'],
  te: ['triumvirate', 'triumvirate environmental'], bi: ['bistro 360', 'bistro'], ch: ['cheesetique'],
};
function mentions(q, words) { return words.some((w) => q.indexOf(' ' + norm(w).trim() + ' ') !== -1); }
function found(q, table) { return Object.keys(table).filter((id) => byId[id] && mentions(q, table[id])); }

/* "General Manager · Arlington, VA · Feb 2017 – May 2018" -> title, from, to */
function roleParts(r) {
  const parts = r.sub.split(' · ');
  const [from, to] = parts[parts.length - 1].split(' – ');
  return { title: parts[0], from, to };
}
const MON = 'jan feb mar apr may jun jul aug sep oct nov dec'.split(' ');
function monthIndex(s) { const [m, y] = s.toLowerCase().split(' '); return Number(y) * 12 + MON.indexOf(m.slice(0, 3)); }
function howLong(from, to) {
  const months = monthIndex(to) - monthIndex(from) + 1;
  if (months < 12) return `${months} months`;
  const years = Math.round(months / 12);
  if (years === 1) return months > 14 ? 'a little over a year' : 'about a year';
  return `about ${['', 'one', 'two', 'three', 'four', 'five', 'six'][years] || years} years`;
}
function when(r) {
  const { from, to } = roleParts(r);
  return to === 'now' ? `since ${from}` : `${from} – ${to}`;
}
function listing(names, max = 4) {
  const shown = names.slice(0, max), more = names.length - shown.length;
  if (more > 0) shown.push(`${more} more on the map`);
  return shown.length > 1 ? shown.slice(0, -1).join(', ') + ' and ' + shown[shown.length - 1] : shown[0];
}

function toolFact(id) {
  const t = byId[id], roles = [], work = {};
  (nbr[id] || []).forEach((m) => {
    const o = byId[m];
    if (o.type === 'role') roles.push(o.id);
    if (o.type === 'work') (work[o.exp] = work[o.exp] || []).push(o);
  });
  const order = N.filter((n) => n.type === 'role').map((n) => n.id).concat(['own']);
  const places = order.filter((r) => roles.includes(r) || work[r]).map((r) => {
    const names = (work[r] || []).map((w) => w.name);
    if (r === 'own') return `in my own projects, on ${listing(names)}`;
    return `at ${byId[r].name} (${when(byId[r])})` + (names.length ? `, on ${listing(names)}` : '');
  });
  if (!places.length) return null;
  const verb = { 't-gc': "I've built for", 't-cws': "I've published extensions to the" }[id] || "I've used";
  let a = `Yes. ${verb} ${t.name} ${places.join('; and ')}.`;
  if (t.body) a += ' ' + t.body;
  const ids = [id].concat(roles, Object.values(work).flat().map((w) => w.id));
  return { id: 'fact:' + id, q: `Have you used ${t.name}?`, a, nodes: ids, fact: true };
}
function article(title) { return /^(Founding|General)/.test(title) ? 'the' : /^[AEIOU]/.test(title) ? 'an' : 'a'; }
function roleFact(id) {
  const r = byId[id], { title, from, to } = roleParts(r), who = article(title) + ' ' + title;
  const a = to === 'now'
    ? `I've been ${who} at ${r.name} since ${from}.`
    : `I was ${who} at ${r.name} from ${from} to ${to}, ${howLong(from, to)}.`;
  return { id: 'fact:' + id, q: `When were you at ${r.name}?`, a, nodes: [id], fact: true };
}

/* yes/no "have you used X" questions, or just the tool's name */
const USE = /^ (have|do|did|are|can|is|has|does|ever|any|experience|familiar|know|used|worked|proficient|comfortable)\b.* (use|used|using|uses|know|knows|familiar|experience|experienced|work with|worked with|working with|proficient|comfortable|tried|touched)\b/;
const TIME = / (when|how long|what years|which years|dates|date|start|started|leave|left|tenure)\b/;

/* Returns a fact answer { id, q, a, nodes, fact } or null.
   written: the written answer the matcher is confident in, if any. A date question
   defers to a written answer about dates; tool questions always take precedence. */
export function fact(qText, written) {
  const q = norm(qText);
  const tools = found(q, TOOL_WORDS);
  if (tools.length === 1) {
    const rest = q.replace(/ (have|has|you|he|indigo|ever|any|do|does|did|used|use|experience|with|in|of|the)\b/g, ' ').trim();
    const justName = TOOL_WORDS[tools[0]].some((w) => norm(w).trim() === rest);
    if (USE.test(q) || / experience (with|in|using) /.test(' ' + q) || justName) return toolFact(tools[0]);
  }
  const roles = found(q, ROLE_WORDS);
  const datesWritten = written && /^(how long|when)/i.test(written.q);
  if (!datesWritten && roles.length === 1 && TIME.test(q)) return roleFact(roles[0]);
  return null;
}
