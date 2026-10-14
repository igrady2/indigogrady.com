/* =========================================================
   PARTICLES: a living swarm that becomes the map.
   Intro: a ball of streaking particles. Click (or tap, or Enter) and the
   camera chases it around, then it bursts into dust around every dot on
   the map while the page fades in. After that the dust lives on the map:
   it follows zoom and pan, and brightens around whatever is lit.
   Reads the map through window.__siteMap (site.js); never writes to it.
   ========================================================= */
var MAP = window.__siteMap;
var canvas = document.getElementById('dust');
var root = document.documentElement;
var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (MAP && canvas && canvas.getContext) start();
else root.classList.remove('intro');

function start() {
  var ctx = canvas.getContext('2d');
  var DPR = Math.min(window.devicePixelRatio || 1, 1.75);
  var W = 0, H = 0;
  var COLORS = { me: [235, 240, 255], role: [143, 149, 255], work: [91, 224, 196], person: [245, 185, 107], skill: [199, 155, 255] };
  var SPREAD = { me: 46, role: 58, work: 15, person: 13, skill: 13 };
  var COUNT = { me: 220, role: 200, work: 34, person: 26, skill: 26 };
  var small = Math.min(window.innerWidth, window.innerHeight) < 600;
  var thin = small ? 0.5 : 1;

  /* ---------- particles ---------- */
  /* a fixed particle budget keeps density (and frame rate) steady as the map grows */
  var nodes = MAP.nodes, P = [], BUDGET = small ? 1400 : 2800, raw = 0;
  nodes.forEach(function (n) { raw += COUNT[n.type] * thin; });
  var scale = Math.min(1, BUDGET / raw);
  nodes.forEach(function (n, ni) {
    var c = Math.max(small ? 4 : 8, Math.round(COUNT[n.type] * thin * scale));
    for (var i = 0; i < c; i++) {
      var g = gauss();
      P.push({
        n: ni, type: n.type,
        r: Math.abs(g) * SPREAD[n.type] * (0.35 + Math.random() * 0.9),
        a: Math.random() * Math.PI * 2,
        w: (Math.random() - 0.5) * 0.35 / (1 + Math.abs(g)),
        s: Math.random() < 0.08 ? 1.9 : 0.8 + Math.random() * 0.7,
        tb: P.length % 4,
        lx: 0, ly: 0, x: 0, y: 0, px: 0, py: 0, fx: 0, fy: 0, d: Math.random()
      });
    }
  });
  /* swarm orbits: each particle keeps its own radius, so the ball stays evenly spread instead of collapsing into strands */
  P.forEach(function (p) {
    p.sr = 0.08 + Math.sqrt(Math.random()) * 0.9; p.sa = Math.random() * Math.PI * 2;
    p.sw = (0.32 + 0.38 * (1 - p.sr)) * (0.8 + Math.random() * 0.4);
    p.lx = Math.cos(p.sa) * p.sr; p.ly = Math.sin(p.sa) * p.sr;
  });

  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- map projection ---------- */
  var nodeXY = [];
  function project() {
    var rect = MAP.rect(), t = MAP.transform(), k = t.k || 1;
    nodes.forEach(function (n, i) {
      var p = MAP.pos(n.id);
      nodeXY[i] = p ? { x: rect.left + t.x + p.x * k, y: rect.top + t.y + p.y * k, k: k, vis: MAP.visible(n.id) } : null;
    });
  }
  function dustTarget(p, time) {
    var h = nodeXY[p.n]; if (!h) return null;
    var a = p.a + time * p.w, sc = clamp(Math.pow(h.k, 0.65), 0.45, 1.8), r = p.r * sc;
    return { x: h.x + Math.cos(a) * r, y: h.y + Math.sin(a) * r * 0.9 };
  }

  /* ---------- sizing ---------- */
  function fit() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (w !== W || h !== H) { W = w; H = h; canvas.width = Math.round(w * DPR); canvas.height = Math.round(h * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
  }

  /* ---------- phases ---------- */
  var phase = root.classList.contains('intro') && !reduce ? 'swarm' : 'live';
  var t0 = performance.now(), phaseStart = t0, last = t0;
  var swarmC = { x: 0, y: 0 }, swarmR = 0;
  var glideFrom = null, groups = null;
  if (phase === 'live') root.classList.remove('intro');

  function go() {
    if (phase !== 'swarm') return;
    phase = 'glide'; phaseStart = performance.now(); glideFrom = { x: swarmC.x, y: swarmC.y };
    root.classList.add('intro-go');
  }
  function skip() {
    phase = 'live'; root.classList.remove('intro', 'intro-go', 'intro-out');
    try { sessionStorage.setItem('ig-intro', '1'); } catch (e) {}
  }
  var intro = document.getElementById('intro');
  if (intro) {
    intro.addEventListener('click', function (e) { if (e.target.closest('[data-skip]')) { e.stopPropagation(); skip(); } else go(); });
    document.addEventListener('keydown', function (e) {
      if (phase === 'live' || phase === 'form') return;
      if (e.key === 'Escape') skip(); else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
    var enter = intro.querySelector('[data-enter]'); if (enter && phase === 'swarm') setTimeout(function () { try { enter.focus({ preventScroll: true }); } catch (e) {} }, 50);
  }

  /* swarm flow: a slow churning disc; small wobbles keep it alive without bunching */
  function flow(p, dt, time, stretch) {
    p.sa += p.sw * dt * (1 + stretch * 1.5);
    var r = p.sr * (1 + 0.06 * Math.sin(time * 0.8 + p.d * 12));
    p.lx = Math.cos(p.sa) * r + 0.035 * Math.sin(time * 1.1 + p.sr * 9);
    p.ly = Math.sin(p.sa) * r + 0.035 * Math.cos(time * 0.9 + p.d * 7);
  }
  var TILT = -0.38, cT = Math.cos(TILT), sT = Math.sin(TILT);
  function swarmXY(p, stretch, dir) {
    var x = p.lx * swarmR * 1.3, y = p.ly * swarmR * 0.78;
    var X = x * cT - y * sT, Y = x * sT + y * cT;
    if (stretch) { var along = X * dir.x + Y * dir.y; X += dir.x * along * stretch; Y += dir.y * along * stretch; }
    return { x: swarmC.x + X, y: swarmC.y + Y };
  }

  var TYPES = ['me', 'role', 'work', 'person', 'skill'];
  var FORM = 2.3, GLIDE = 1.3, GROUP_MOVE = 1.3, GROUP_HOLD = 1.5;
  var LABELS = { me: ['Indigo', 'the center'], role: ['Roles', 'role'], work: ['Projects', 'project'], person: ['People', 'person'], skill: ['Skills and tools', 'skill'] };
  var NCOUNT = {}; nodes.forEach(function (n) { NCOUNT[n.type] = (NCOUNT[n.type] || 0) + 1; });
  var PCOUNT = {}; P.forEach(function (p) { PCOUNT[p.type] = (PCOUNT[p.type] || 0) + 1; });
  var FONT = (getComputedStyle(root).getPropertyValue('--f-display') || '').trim() || 'system-ui, sans-serif';
  function tail(path, p, q, T, M) {
    var dx = (q.x - p.x) * T, dy = (q.y - p.y) * T, len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.01) return;
    if (len > M) { dx *= M / len; dy *= M / len; }
    path.moveTo(q.x - dx, q.y - dy); path.lineTo(q.x, q.y);
  }
  function startGroup() {
    /* Indigo on top, the four kinds of dots in a row (2 x 2 on phones), labels on one line per row */
    var row = small ? [[0.29, 0.4], [0.71, 0.4], [0.29, 0.68], [0.71, 0.68]] : [[0.2, 0.52], [0.4, 0.52], [0.6, 0.52], [0.8, 0.52]];
    var base = Math.min(W, H) * (small ? 0.0075 : 0.0042), cap = small ? W * 0.135 : Math.min(W * 0.072, H * 0.13);
    function rad(t, f) { return Math.min(cap * f, base * Math.sqrt(PCOUNT[t] || 1) * f); }
    groups = { me: { x: W / 2, y: H * (small ? 0.15 : 0.22), r: rad('me', 0.6) } };
    groups.me.ly = groups.me.y + groups.me.r + (small ? 10 : 14);
    ['role', 'work', 'person', 'skill'].forEach(function (t, k) {
      groups[t] = { x: W * row[k][0], y: H * row[k][1], r: rad(t, 1) };
      groups[t].ly = H * row[k][1] + cap + (small ? 10 : 18);
    });
    P.forEach(function (p) { p.sx = p.x; p.sy = p.y; p.ga = Math.random() * Math.PI * 2; p.gr = Math.min(1, Math.abs(gauss()) * 0.45); });
  }
  function drawLabels(a) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    TYPES.forEach(function (t) {
      var g = groups[t], L = LABELS[t], n = NCOUNT[t] || 0, y = g.ly;
      ctx.fillStyle = 'rgba(255,255,255,' + a + ')';
      ctx.font = '600 ' + (small ? 15 : 18) + 'px ' + FONT; ctx.fillText(L[0], g.x, y);
      var c = COLORS[t];
      ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a * 0.9) + ')';
      ctx.font = '500 ' + (small ? 12 : 13) + 'px ' + FONT;
      ctx.fillText(t === 'me' ? 'where every line starts' : n + ' on the map', g.x, y + (small ? 20 : 25));
    });
    ctx.globalCompositeOperation = 'lighter';
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var time = (now - t0) / 1000, pt = (now - phaseStart) / 1000;
    fit();

    if (phase === 'swarm' || phase === 'glide' || phase === 'group') {
      swarmR = small ? Math.min(W * 0.29, H * 0.36) : Math.min(W, H) * 0.3;
      var spin = 0, mix = 0, gT = 0, labelA = 0;
      if (phase === 'swarm') { swarmC.x = W / 2; swarmC.y = H * 0.38; }
      else if (phase === 'glide') {
        /* one smooth glide to center while the swarm spins up and takes on its colors */
        var u = Math.min(1, pt / GLIDE), eu = ease(u);
        swarmC.x = glideFrom.x + (W / 2 - glideFrom.x) * eu; swarmC.y = glideFrom.y + (H * 0.45 - glideFrom.y) * eu;
        swarmR *= 1 + 0.12 * Math.sin(u * Math.PI);
        spin = Math.sin(u * Math.PI) * 1.6; mix = eu;
        if (u >= 1) { phase = 'group'; phaseStart = now; startGroup(); }
      } else {
        /* sort by type: each color gathers into its own labeled cluster */
        mix = 1; gT = Math.min(1, pt / GROUP_MOVE);
        labelA = clamp((pt - GROUP_MOVE * 0.55) / 0.5, 0, 1);
        if (pt >= GROUP_MOVE + GROUP_HOLD) { phase = 'form'; phaseStart = now; startForm(); }
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1;
      var TAIL = phase === 'swarm' ? 7 : phase === 'glide' ? 5 : 2, MAXT = phase === 'swarm' ? 34 : phase === 'glide' ? 40 : 18;
      if (phase === 'swarm') {
        var paths = [new Path2D(), new Path2D(), new Path2D()];
        P.forEach(function (p, i) {
          flow(p, dt, time, 0);
          var q = swarmXY(p, 0, null);
          if (p.x || p.y) tail(paths[i % 3], p, q, TAIL, MAXT);
          p.x = q.x; p.y = q.y;
        });
        ctx.strokeStyle = 'rgba(235,242,255,0.55)'; ctx.stroke(paths[0]);
        ctx.strokeStyle = 'rgba(140,230,215,0.45)'; ctx.stroke(paths[1]);
        ctx.strokeStyle = 'rgba(160,165,255,0.45)'; ctx.stroke(paths[2]);
      } else {
        var tp = {}, dots = {};
        TYPES.forEach(function (t) { tp[t] = new Path2D(); dots[t] = new Path2D(); });
        P.forEach(function (p) {
          var q;
          if (phase === 'glide') { flow(p, dt, time, spin); q = swarmXY(p, 0, null); }
          else {
            var g = groups[p.type], e = ease(clamp((gT - p.d * 0.2) / 0.8, 0, 1));
            var a = p.ga + time * 0.18, tx = g.x + Math.cos(a) * p.gr * g.r, ty = g.y + Math.sin(a) * p.gr * g.r;
            q = { x: p.sx + (tx - p.sx) * e, y: p.sy + (ty - p.sy) * e };
          }
          tail(tp[p.type], p, q, TAIL, MAXT);
          if (phase === 'group') dots[p.type].rect(q.x - p.s / 2, q.y - p.s / 2, p.s, p.s);
          p.x = q.x; p.y = q.y;
        });
        TYPES.forEach(function (t) {
          var c = COLORS[t], w = [235, 242, 255], m = t === 'me' ? 0 : mix;
          var col = Math.round(w[0] + (c[0] - w[0]) * m) + ',' + Math.round(w[1] + (c[1] - w[1]) * m) + ',' + Math.round(w[2] + (c[2] - w[2]) * m);
          ctx.strokeStyle = 'rgba(' + col + ',' + (phase === 'group' ? 0.35 : 0.55) + ')'; ctx.stroke(tp[t]);
          ctx.fillStyle = 'rgba(' + col + ',0.9)'; ctx.fill(dots[t]);
        });
        if (labelA > 0) drawLabels(labelA);
      }
    } else {
      project();
      var lit = MAP.lit(), glow = {}, any = false;
      (lit.glow || []).concat(lit.pre || []).forEach(function (id) { glow[id] = 1; any = true; });
      var formT = phase === 'form' ? Math.min(1, pt / FORM) : 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      /* soft bloom behind lit dots and hubs */
      nodes.forEach(function (n, i) {
        var h = nodeXY[i]; if (!h || !h.vis) return;
        var on = glow[n.id], big = n.type === 'role' || n.type === 'me';
        if (!on && !big) return;
        var c = COLORS[n.type], R = (big ? 46 : 26) * clamp(Math.pow(h.k, 0.5), 0.6, 1.6) * (on ? 1.25 : 1), al = (on ? 0.32 : any ? 0.06 : 0.14) * formT;
        var g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, R);
        g.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + al + ')'); g.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
        ctx.fillStyle = g; ctx.fillRect(h.x - R, h.y - R, R * 2, R * 2);
      });

      
      /* batch dots into a few paths (type x lit x twinkle x landing) instead of one fill per particle */
      var batch = {};
      for (var j = 0; j < P.length; j++) {
        var p = P[j], tg = dustTarget(p, time); if (!tg) continue;
        var h2 = nodeXY[p.n]; if (!h2.vis) continue;
        var x = tg.x, y = tg.y, eb = 4;
        if (phase === 'form') {
          /* each particle flies from its group to its dot on the map */
          var e = ease(clamp((formT - p.d * 0.35) / 0.65, 0, 1));
          x = p.fx + (x - p.fx) * e; y = p.fy + (y - p.fy) * e; eb = Math.round(e * 4);
        }
        var on2 = glow[nodes[p.n].id] ? 1 : 0, key = p.type + on2 + p.tb + eb;
        var b = batch[key] || (batch[key] = { t: p.type, on: on2, tb: p.tb, eb: eb, path: new Path2D() });
        var s = p.s * (on2 ? 1.25 : 1);
        b.path.rect(x - s / 2, y - s / 2, s, s);
      }
      for (var k in batch) {
        var bb = batch[k], c2 = COLORS[bb.t], tw = 0.75 + 0.25 * Math.sin(time * 1.7 + bb.tb * 1.5708);
        var al2 = (bb.on ? 0.95 : any ? 0.16 : 0.5) * tw;
        if (phase === 'form') al2 = 0.9 + (al2 - 0.9) * (bb.eb / 4);
        ctx.fillStyle = 'rgba(' + c2[0] + ',' + c2[1] + ',' + c2[2] + ',' + al2.toFixed(3) + ')';
        ctx.fill(bb.path);
      }
      if (phase === 'form' && groups) { var la = clamp(1 - formT * 3, 0, 1); if (la > 0) drawLabels(la); }
      if (phase === 'form' && formT >= 1) { phase = 'live'; setTimeout(skip, 700); }
    }
    raf = requestAnimationFrame(frame);
  }
  function startForm() {
    project();
    P.forEach(function (p) { p.fx = p.x; p.fy = p.y; });
    root.classList.add('intro-out');
  }

  var raf = requestAnimationFrame(frame);
  /* pause when the tab is hidden */
  document.addEventListener('visibilitychange', function () { if (document.hidden) cancelAnimationFrame(raf); else { last = performance.now(); raf = requestAnimationFrame(frame); } });
}
