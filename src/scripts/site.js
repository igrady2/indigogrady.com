import * as d3 from 'd3';
import { ANSWERS, SUGGEST } from '../data/answers.js';
import { TYPES, N, L } from '../data/map.js';
/* =========================================================
   DATA: one source of truth for the page, the map, and Ask
   ========================================================= */
var byId = {}; N.forEach(function (n) { byId[n.id] = n; });
var nbr = {}; N.forEach(function (n) { nbr[n.id] = new Set(); });
L.forEach(function (l) { nbr[l[0]].add(l[1]); nbr[l[1]].add(l[0]); });
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

/* recommendations on the page come from the same data */
(function () {
  var box = document.getElementById('quotes');
  N.filter(function (n) { return n.type === 'person' && n.page !== false; }).forEach(function (n) {
    var d = document.createElement('figure'); d.className = 'quote' + (n.lead ? ' lead' : ''); d.style.margin = '0';
    d.innerHTML = '<blockquote>“' + esc(n.quote) + '”</blockquote><figcaption class="by"><span><b>' + esc(n.name) + '</b>, ' + esc(n.sub) + '</span></figcaption>';
    box.appendChild(d);
  });
})();

/* =========================================================
   SKY: one network, quiet in Read mode, interactive in Explore
   ========================================================= */
var hasD3 = typeof d3 !== 'undefined';
var sky = document.getElementById('sky');
var state = { mode: 'read', exp: 'all', types: { role: true, work: true, person: true, skill: true }, focus: null, glow: [] };
var nodeEls = {}, edgeEls = [], zoomer, rootG, POS = {};
function sideMap() { return window.innerWidth >= 900; }
function syncView() { var r = sky.getBoundingClientRect(); sky.setAttribute('viewBox', '0 0 ' + Math.round(r.width) + ' ' + Math.round(r.height)); }
function fitArea() {
  var W = window.innerWidth, H = window.innerHeight;
  if (state.mode === 'read') {
    if (sideMap()) return { x0: W * 0.56 + 28, y0: 64, x1: W - 28, y1: H - 56 };
    return { x0: 14, y0: 58, x1: W - 14, y1: sky.getBoundingClientRect().height - 18 };
  }
  if (W <= 760) return { x0: 16, y0: 200, x1: W - 16, y1: H * 0.56 };
  return { x0: 24, y0: 120, x1: W - 22 * 16 - 56, y1: H - 36 };
}
function fit(ids) {
  if (!zoomer || !ids.length) return;
  var xs = [], ys = []; ids.forEach(function (id) { var p = POS[id]; if (p) { xs.push(p.x); ys.push(p.y); } });
  if (!xs.length) return;
  var pad = 70, minx = Math.min.apply(null, xs) - pad, maxx = Math.max.apply(null, xs) + pad, miny = Math.min.apply(null, ys) - pad / 2, maxy = Math.max.apply(null, ys) + pad;
  var a = fitArea(), k = Math.min((a.x1 - a.x0) / (maxx - minx), (a.y1 - a.y0) / (maxy - miny), 1.8);
  k = Math.max(state.mode === 'read' ? 0.2 : 0.35, k);
  /* in the side panel the map is zoomed out to fit; keep dots and labels at their normal size */
  sky.style.setProperty('--inv', state.mode === 'read' ? String(Math.min(sideMap() ? 2.4 : 1.8, Math.max(1, 1 / k))) : '1');
  var tx = a.x0 + ((a.x1 - a.x0) - (maxx - minx) * k) / 2 - minx * k, ty = a.y0 + ((a.y1 - a.y0) - (maxy - miny) * k) / 2 - miny * k;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  d3.select(sky).transition().duration(reduce || state.mode === 'read' ? 0 : 650).call(zoomer.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
}
function visibleIds() { return N.filter(function (n) { return visible(n); }).map(function (n) { return n.id; }); }
function focusIds(id) { return [id].concat(Array.from(nbr[id])); }

function layout(W, H, flat) {
  var nodes = N.map(function (n) { return { id: n.id, type: n.type }; });
  var links = L.map(function (l) { return { source: l[0], target: l[1] }; });
  var scale = Math.max(0.7, Math.min(1.6, Math.min(W, H) / 650));
  var sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(function (d) { return d.id; }).distance(function (l) {
      var a = l.source.type, b = l.target.type; return ((a === 'me' || b === 'me') ? 170 : (a === 'skill' || b === 'skill') ? 140 : 95) * scale; }).strength(0.45))
    .force('charge', d3.forceManyBody().strength(-620 * scale))
    .force('collide', d3.forceCollide().radius(function (d) { return (TYPES[d.type].r + 30) * scale; }))
    .force('x', d3.forceX(W / 2).strength(0.035)).force('y', d3.forceY(H / 2).strength(0.05 * (flat || 1))).stop();
  nodes.forEach(function (n, i) { var a = i * 2.4; n.x = W / 2 + Math.cos(a) * 40 * (i % 7); n.y = H / 2 + Math.sin(a) * 40 * (i % 7); });
  var me = nodes[0]; me.fx = W / 2; me.fy = H / 2;
  for (var i = 0; i < 400; i++) sim.tick();
  var pos = {}; nodes.forEach(function (n) { pos[n.id] = n; });
  return { pos: pos, links: links };
}

function buildSky() {
  if (!hasD3) return;
  var W = window.innerWidth, H = window.innerHeight;
  sky.innerHTML = '';
  /* lay the network out for the space it lives in most of the time: the side panel, or a phone band */
  var L2 = sideMap() ? layout(W * 0.44, H) : layout(W, Math.max(420, W * 0.95), 3); POS = L2.pos;
  var svg = d3.select(sky);
  rootG = svg.append('g');
  var drift = rootG.append('g').attr('class', 'drift');
  var gE = drift.append('g'), gN = drift.append('g');
  edgeEls = [];
  L2.links.forEach(function (l) {
    var e = gE.append('line').attr('class', 'edge').attr('x1', l.source.x).attr('y1', l.source.y).attr('x2', l.target.x).attr('y2', l.target.y);
    edgeEls.push({ el: e.node(), a: l.source.id, b: l.target.id });
  });
  nodeEls = {};
  N.forEach(function (n) {
    var p = L2.pos[n.id], t = TYPES[n.type];
    var g = gN.append('g').attr('class', 'node' + (n.type === 'me' || n.type === 'role' ? ' big' : '') + (n.placeholder ? ' placeholder' : ''))
      .attr('transform', 'translate(' + p.x + ',' + p.y + ')').attr('data-id', n.id);
    g.append('circle').attr('class', 'halo').attr('r', t.r + 7).attr('stroke', t.color);
    g.append('circle').attr('class', 'dot').attr('r', t.r).attr('fill', t.color).attr('stroke', n.placeholder ? t.color : 'none');
    g.append('text').attr('text-anchor', 'middle').attr('dy', t.r + 15).text(n.type === 'me' ? 'Indigo' : n.name);
    g.on('click', function () { if (state.mode === 'explore') focus(n.id); });
    g.on('keydown', function (ev) { if (state.mode === 'explore' && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); focus(n.id); } });
    nodeEls[n.id] = g.node();
  });
  zoomer = d3.zoom().scaleExtent([0.3, 3]).filter(function (ev) { return state.mode === 'explore' && !ev.button; })
    .on('zoom', function (ev) { rootG.attr('transform', ev.transform); });
  svg.call(zoomer);
  applyMode(); paint();
}

function inExp(n) {
  if (state.exp === 'all' || n.type === 'me') return true;
  if (n.exp) return n.exp === state.exp;
  var ok = false; nbr[n.id].forEach(function (m) { if (byId[m].exp === state.exp) ok = true; }); return ok;
}
function visible(n) { return state.mode === 'read' || n.type === 'me' || (state.types[n.type] && inExp(n)); }

function paint() {
  var f = state.mode === 'explore' ? state.focus : null;
  var glow = state.mode === 'read' ? new Set(state.glow) : new Set(), pre = state.mode === 'read' ? new Set(state.pre || []) : new Set();
  document.body.classList.toggle('lit', glow.size + pre.size > 0 && !(glow.size >= 5 && glow.has('me') && state.glowAll));
  N.forEach(function (n) {
    var el = nodeEls[n.id]; if (!el) return;
    el.style.display = visible(n) ? '' : 'none';
    el.classList.toggle('glow', glow.has(n.id));
    el.classList.toggle('pre', pre.has(n.id) && !glow.has(n.id));
    el.classList.toggle('focus', f === n.id);
    el.classList.toggle('dim', !!f && n.id !== f && !nbr[f].has(n.id));
    if (state.mode === 'explore') { el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button'); el.setAttribute('aria-label', TYPES[n.type].label + ': ' + n.name); }
    else { el.removeAttribute('tabindex'); el.removeAttribute('role'); }
  });
  edgeEls.forEach(function (e) {
    e.el.style.display = visible(byId[e.a]) && visible(byId[e.b]) ? '' : 'none';
    e.el.classList.toggle('glow', glow.has(e.a) && glow.has(e.b) || (glow.has(e.a) && e.b === 'me') || (glow.has(e.b) && e.a === 'me'));
    e.el.classList.toggle('hot', !!f && (e.a === f || e.b === f));
    e.el.classList.toggle('dim', !!f && e.a !== f && e.b !== f);
  });
}

/* =========================================================
   MODES
   ========================================================= */
var mRead = document.getElementById('m-read'), mExp = document.getElementById('m-explore'), xui = document.getElementById('xui'), page = document.getElementById('page');
function applyMode() {
  document.body.classList.toggle('read', state.mode === 'read');
  document.body.classList.toggle('explore', state.mode === 'explore');
  mRead.setAttribute('aria-pressed', String(state.mode === 'read'));
  mExp.setAttribute('aria-pressed', String(state.mode === 'explore'));
  xui.setAttribute('aria-hidden', String(state.mode !== 'explore'));
  page.setAttribute('aria-hidden', String(state.mode === 'explore'));
  if ('inert' in page) page.inert = state.mode === 'explore';
  syncView();
  if (state.mode === 'read') fit(N.map(function (n) { return n.id; }));
}
document.querySelectorAll("[data-open]").forEach(function (b) { b.addEventListener("click", function () { setMode("explore", b.getAttribute("data-open")); }); });
function setMode(m, focusId) {
  state.mode = m; if (m === 'explore') { state.focus = focusId || state.focus; showPanel(byId[state.focus || 'me']); }
  applyMode(); paint();
  if (m === 'explore') fit(state.focus ? focusIds(state.focus) : visibleIds());
}
mRead.addEventListener('click', function () { setMode('read'); });
mExp.addEventListener('click', function () { setMode('explore'); });
document.getElementById('cta-explore').addEventListener('click', function () { setMode('explore'); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state.mode === 'explore') setMode('read'); });

/* explore filters */
var EXPS = [["all","All"],["ap","AutoPilotPR"],["rs","Razor Sparrow"],["cp","Code Power"],["early","Earlier"],["own","Personal"]];
var expGroup = document.getElementById('expGroup');
EXPS.forEach(function (e) {
  var b = document.createElement('button'); b.type = 'button'; b.className = 'chip sel'; b.textContent = e[1];
  b.setAttribute('aria-pressed', e[0] === 'all' ? 'true' : 'false');
  b.addEventListener('click', function () {
    state.exp = e[0]; state.focus = null;
    expGroup.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
    b.setAttribute('aria-pressed', 'true'); paint(); fit(visibleIds());
    showPanel(e[0] === 'all' ? byId.me : byId[{ ap: 'ap', rs: 'rs', cp: 'cp', early: 'te', own: 'me' }[e[0]]]);
  });
  expGroup.appendChild(b);
});
var typeGroup = document.getElementById('typeGroup');
["role","work","person","skill"].forEach(function (t) {
  var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.setAttribute('aria-pressed', 'true');
  b.innerHTML = '<i style="background:' + TYPES[t].color + '"></i>' + TYPES[t].label;
  b.addEventListener('click', function () { state.types[t] = !state.types[t]; b.setAttribute('aria-pressed', String(state.types[t])); paint(); fit(visibleIds()); });
  typeGroup.appendChild(b);
});

function focus(id) { state.focus = (state.focus === id && id !== 'me') ? null : id; paint(); showPanel(byId[state.focus || 'me']); fit(state.focus ? focusIds(state.focus) : visibleIds()); }
var panel = document.getElementById('panel');
function chipBtn(o) { return '<button type="button" data-id="' + o.id + '"><i style="background:' + TYPES[o.type].color + '"></i>' + esc(o.name) + '</button>'; }
function showPanel(n) {
  var t = TYPES[n.type], h = '';
  h += '<span class="type" style="color:' + t.color + '">' + (n.type === 'me' ? 'START HERE' : (n.sub === 'Tool' || n.sub === 'Platform' ? n.sub.toUpperCase() : (t.one || t.label).toUpperCase())) + '</span>';
  h += '<h3>' + esc(n.name) + '</h3>';
  if (n.sub && !/^(Tool|Platform|Skill)$/.test(n.sub)) h += '<span class="sub">' + esc(n.sub) + '</span>';
  if (n.quote) h += '<q>' + esc(n.quote) + '</q>';
  if (n.body) h += '<p>' + esc(n.body) + '</p>';
  if (n.result) h += '<p class="result">' + esc(n.result) + '</p>';
  if (n.url) h += '<p><a class="ext" href="' + esc(n.url) + '" target="_blank" rel="noopener">' + esc(n.urlLabel || 'Visit') + ' ↗</a></p>';
  if (n.todo) h += '<p class="todo">To map: ' + esc(n.todo) + '</p>';
  var groups = { role: [], work: [], person: [], skill: [] };
  nbr[n.id].forEach(function (m) { var o = byId[m]; if (o.type !== 'me') groups[o.type].push(o); });
  ["role","work","person","skill"].forEach(function (k) {
    if (!groups[k].length) return;
    h += '<h4>' + TYPES[k].label.toUpperCase() + '</h4><div class="links">' + groups[k].map(chipBtn).join('') + '</div>';
  });
  if (state.focus) h += '<button class="reset" type="button" data-reset="1">Show everything</button>';
  panel.innerHTML = h;
  panel.querySelectorAll('[data-id]').forEach(function (b) { b.addEventListener('click', function () { focus(b.getAttribute('data-id')); }); });
  var r = panel.querySelector('[data-reset]'); if (r) r.addEventListener('click', function () { state.focus = null; paint(); showPanel(byId.me); fit(visibleIds()); });
}

/* =========================================================
   READ MODE: the section you're reading lights up its part of the sky
   ========================================================= */
var mapNow = document.getElementById('mapNow');
function glowTo(ids, label, all) { state.glow = ids; state.glowAll = !!all; state.pre = []; if (label) mapNow.textContent = label; paint(); }
function setGlowFrom(el) {
  var ids = (el.getAttribute('data-nodes') || '').split(/\s+/).filter(Boolean);
  if (!ids.length) return;
  document.querySelectorAll('.case.lit').forEach(function (c) { c.classList.toggle('lit', c === el); });
  glowTo(ids, el.getAttribute('data-label') || '', el.id === 'top');
}
var sections = Array.prototype.slice.call(document.querySelectorAll('[data-nodes]'));
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) setGlowFrom(en.target); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(function (s) { io.observe(s); });
}
/* hovering or focusing a case or role lights its part of the map */
document.querySelectorAll('.case').forEach(function (c) {
  ['mouseenter', 'focusin'].forEach(function (ev) { c.addEventListener(ev, function () { setGlowFrom(c); }); });
});
var ROLE_IDS = ['ap', 'rs', 'cp', 'te', 'bi', 'ch'];
document.querySelectorAll('.roles li').forEach(function (li, i) {
  var id = ROLE_IDS[i]; if (!id) return;
  li.addEventListener('mouseenter', function () {
    document.querySelectorAll('.roles li').forEach(function (x) { x.classList.toggle('lit', x === li); });
    var kids = N.filter(function (n) { return n.exp === id && n.type !== 'person'; }).map(function (n) { return n.id; });
    var EARLY = { te: 'w-fda', bi: 'w-hb', ch: 'w-liq' }; if (EARLY[id]) kids.push(EARLY[id]);
    glowTo([id].concat(kids), byId[id].name);
  });
});

/* =========================================================
   ASK: instant answers from Indigo's written answer library (src/data/answers.js).
   No model writes text. `also` phrases (weight 4) beat the broader single-word keys.
   ========================================================= */
var INTENTS = ANSWERS.map(function (a) {
  return Object.assign({}, a, { keys: (a.keys || []).concat((a.also || []).map(function (p) { return [p, 4]; })) });
});

function norm(s) { return ' ' + s.toLowerCase().replace(/[^a-z0-9\- ]+/g, ' ').replace(/\s+/g, ' ') + ' '; }
function answer(qText) {
  var t0 = performance.now(), q = norm(qText), best = null, bestScore = 0;
  INTENTS.forEach(function (it) {
    var s = 0; it.keys.forEach(function (k) { var key = k[0].trim().length <= 3 ? ' ' + k[0].trim() + ' ' : k[0]; if (q.indexOf(key) !== -1) s += k[1]; });
    if (s > bestScore) { bestScore = s; best = it; }
  });
  var out = { ms: 0 };
  if (best && bestScore >= 2) { out.intent = best; }
  else {
    var STOP = ' what about tell have does with your that this from they there their when where which would could should know experience ';
    var words = q.split(' ').filter(function (w) { return w.length >= 4 && STOP.indexOf(' ' + w + ' ') === -1; });
    var hits = N.filter(function (n) { var hay = (n.name + ' ' + (n.body || '') + ' ' + (n.result || '') + ' ' + (n.sub || '')).toLowerCase(); return words.some(function (w) { return hay.indexOf(w) !== -1; }); });
    out.related = hits.slice(0, 6);
  }
  out.ms = performance.now() - t0;
  return out;
}
/* ---------------------------------------------------------
   ASK THE MAP (Constellation). The question lives in a small copy of the map:
   matching dots brighten as you type, and an answer traces a path to its sources.
   Answers are only Indigo's written text. Optional remote matcher: set data-endpoint
   on #ask; it receives POST {"q": "..."} and returns {"index": n} (an INTENTS index)
   or {"index": null}. Without it, unmatched questions go straight to the fallback.
   --------------------------------------------------------- */
var askSec = document.getElementById('ask'), ansBox = document.getElementById('answer'), input = document.getElementById('askInput'),
    live = document.getElementById('askLive'), ENDPOINT = askSec.getAttribute('data-endpoint') || '';
function askPreview(ids) { if (state.mode !== 'read') return; state.pre = ids; paint(); }
var traceTimers = [];
function askTrace(ids, label) {
  traceTimers.forEach(clearTimeout); traceTimers = [];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  glowTo(['me'], label);
  ids.forEach(function (id, i) { traceTimers.push(setTimeout(function () { state.glow = state.glow.concat([id]); paint(); }, reduce ? 0 : 110 * (i + 1))); });
}
var sparkG = null;
function askPulse(on) {
  if (sparkG) { sparkG.remove(); sparkG = null; }
  if (!on || !rootG || !POS.me) return;
  sparkG = rootG.select('.drift').append('g');
  ['ap', 'rs', 'cp', 'te', 'bi'].forEach(function (id, i) {
    var a = POS.me, b = POS[id]; if (!b) return;
    sparkG.append('circle').attr('class', 'spark').attr('r', 3.5)
      .append('animateMotion').attr('dur', '0.9s').attr('repeatCount', 'indefinite').attr('begin', (i * 0.12) + 's').attr('path', 'M' + a.x + ',' + a.y + ' L' + b.x + ',' + b.y);
  });
}
function suggestHtml(list) { return '<div class="suggest">' + list.map(function (i) { return '<button type="button" data-q="' + i + '">' + esc(INTENTS[i].q) + '</button>'; }).join('') + '</div>'; }
function showAnswer(qText, it, how) {
  /* show which written question this answers, so a loose match is never mistaken for a direct one */
  var same = norm(qText).trim() === norm(it.q).trim();
  var h = (same ? '' : '<span class="q">You asked: ' + esc(qText) + '</span>') + '<h3>' + esc(it.q) + '</h3><p>' + esc(it.a) + '</p>';
  if (it.quote) { var p = byId[it.quote]; h += '<q>' + esc(p.quote) + ' — ' + esc(p.name) + '</q>'; }
  h += '<div class="ev"><span>SOURCES · OPEN ON MAP</span>' + it.nodes.filter(function (id) { return id !== 'me'; }).map(function (id) { return chipBtn(byId[id]); }).join('') + '</div>';
  h += '<span class="speed">' + (how === 'instant' ? 'Instant' : 'Matched') + ' · my written answer</span>';
  finish(h); askTrace(it.nodes.filter(function (id) { return id !== 'me'; }), 'Answer sources');
  live.textContent = 'Its sources are lit on the map.';
}
function showFallback(qText, related) {
  var h = '<span class="q">' + esc(qText) + '</span><p>I haven’t written about that yet. Try one of these, or <a href="https://www.linkedin.com/in/indigogrady">ask me on LinkedIn</a>.</p>' + suggestHtml(SUGGEST.slice(0, 3));
  if (related && related.length) h += '<div class="ev"><span>CLOSEST PARTS OF MY WORK</span>' + related.map(chipBtn).join('') + '</div>';
  finish(h); askTrace((related || []).map(function (n) { return n.id; }), related && related.length ? 'Closest parts of my work' : 'No written answer yet');
  live.textContent = '';
}
function finish(h) {
  ansBox.innerHTML = h; ansBox.hidden = false; askPulse(false); askSec.classList.remove('matching');
  ansBox.querySelectorAll('[data-id]').forEach(function (b) { b.addEventListener('click', function () { setMode('explore', b.getAttribute('data-id')); }); });
}
var askSeq = 0;
function render(qText) {
  qText = qText.trim(); if (!qText) { ansBox.hidden = true; return; }
  var seq = ++askSeq, r = answer(qText);
  if (r.intent) return showAnswer(qText, r.intent, 'instant');
  if (!ENDPOINT || !window.fetch) return showFallback(qText, r.related);
  askSec.classList.add('matching'); glowTo([], 'Matching…'); askPulse(true);
  ansBox.hidden = false; ansBox.innerHTML = '<span class="q">' + esc(qText) + '</span><span class="speed matching">Matching your question to my written answers</span>';
  live.textContent = 'Matching your question…';
  var ctl = 'AbortController' in window ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 2500);
  fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: qText }), signal: ctl ? ctl.signal : undefined })
    .then(function (res) { return res.ok ? res.json() : null; })
    .catch(function () { return null; })
    .then(function (j) { clearTimeout(to); if (seq !== askSeq) return; var it = j && typeof j.index === 'number' ? INTENTS[j.index] : null; if (it) showAnswer(qText, it, 'matched'); else showFallback(qText, r.related); });
}
document.getElementById('askForm').addEventListener('submit', function (e) { e.preventDefault(); render(input.value); });
var deb; input.addEventListener('input', function () {
  clearTimeout(deb); deb = setTimeout(function () {
    var v = input.value.trim();
    if (!v) { askPreview([]); live.textContent = 'Matching dots brighten as you type.'; return; }
    var r = answer(v), ids = r.intent ? r.intent.nodes : (r.related || []).map(function (n) { return n.id; });
    askPreview(ids); live.innerHTML = ids.length ? '<b>' + ids.length + '</b> parts of my work look related. Press Ask.' : 'Press Ask to see if I’ve written about that.';
  }, 120);
});
askSec.addEventListener('click', function (e) { var b = e.target.closest('[data-q]'); if (b) { var it = INTENTS[+b.getAttribute('data-q')]; input.value = it.q; render(it.q); } });
document.getElementById('suggest').innerHTML = suggestHtml(SUGGEST).replace(/^<div class="suggest">|<\/div>$/g, '');

/* email, assembled in the browser so scrapers miss it */
(function () {
  var el = document.getElementById('email'); el.textContent = el.dataset.u + String.fromCharCode(64) + el.dataset.d;
  document.getElementById('copy-email').addEventListener('click', function () {
    var btn = this;
    function fallback() { var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Selected'; }
    try { navigator.clipboard.writeText(el.textContent).then(function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy email'; }, 1600); }, fallback); } catch (e) { fallback(); }
  });
})();

/* boot */
showPanel(byId.me);
buildSky();
/* read-only view of the map for the particle layer (particles.js) */
window.__siteMap = {
  nodes: N,
  pos: function (id) { return POS[id]; },
  transform: function () { return hasD3 ? d3.zoomTransform(sky) : { x: 0, y: 0, k: 1 }; },
  rect: function () { return sky.getBoundingClientRect(); },
  lit: function () { return state.mode === 'read' ? { glow: state.glow || [], pre: state.pre || [] } : { glow: state.focus ? focusIds(state.focus) : [], pre: [] }; },
  mode: function () { return state.mode; },
  visible: function (id) { return visible(byId[id]); }
};
var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(buildSky, 200); });
applyMode();
