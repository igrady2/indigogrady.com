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
  var nodes = MAP.nodes, P = [];
  nodes.forEach(function (n, ni) {
    var c = Math.round(COUNT[n.type] * thin);
    for (var i = 0; i < c; i++) {
      var g = gauss();
      P.push({
        n: ni, type: n.type,
        r: Math.abs(g) * SPREAD[n.type] * (0.35 + Math.random() * 0.9),
        a: Math.random() * Math.PI * 2,
        w: (Math.random() - 0.5) * 0.35 / (1 + Math.abs(g)),
        s: Math.random() < 0.08 ? 1.9 : 0.8 + Math.random() * 0.7,
        tw: Math.random() * Math.PI * 2,
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
  var STARS = []; for (var i = 0; i < (small ? 70 : 160); i++) STARS.push({ x: Math.random(), y: Math.random(), z: 0.2 + Math.random() * 0.8 });

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
  var swarmC = { x: 0, y: 0 }, swarmR = 0, vel = { x: 0, y: 0 };
  var formFrom = null, zoomC = null;
  if (phase === 'live') root.classList.remove('intro');

  function go() {
    if (phase !== 'swarm') return;
    phase = 'fly'; phaseStart = performance.now();
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
      if (phase !== 'swarm' && phase !== 'fly') return;
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

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var time = (now - t0) / 1000, pt = (now - phaseStart) / 1000;
    fit();
    if (phase === 'live' && root.classList.contains('intro')) root.classList.remove('intro');

    if (phase === 'swarm' || phase === 'fly') {
      swarmR = small ? Math.min(W * 0.29, H * 0.36) : Math.min(W, H) * 0.3;
      var stretch = 0, dir = { x: 1, y: 0 };
      if (phase === 'swarm') { swarmC.x = W / 2; swarmC.y = H * 0.38; }
      else {
        /* the camera chases the ball as it zips around, then lets it settle */
        var u = Math.min(1, pt / 2.1), amp = Math.sin(u * Math.PI);
        var nx = W / 2 + Math.sin(u * 9.5) * W * 0.2 * amp, ny = H * 0.38 + Math.sin(u * 6.3 + 1) * H * 0.14 * amp;
        vel.x = (nx - swarmC.x) / Math.max(dt, 0.001); vel.y = (ny - swarmC.y) / Math.max(dt, 0.001);
        swarmC.x = nx; swarmC.y = ny;
        var sp = Math.sqrt(vel.x * vel.x + vel.y * vel.y); stretch = clamp(sp / 2600, 0, 0.9); if (sp > 1) dir = { x: vel.x / sp, y: vel.y / sp };
        if (u >= 1) { phase = 'form'; phaseStart = now; startForm(time); }
      }
      /* clear every frame: streaks are drawn as tails, so nothing lingers on the background */
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
      /* streaming stars give the chase its speed */
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(160,175,255,0.5)';
      STARS.forEach(function (s) {
        s.x = (s.x - vel.x * dt * s.z * 0.00035 + 1) % 1; s.y = (s.y - vel.y * dt * s.z * 0.00035 + 1) % 1;
        if (phase !== 'fly') return; ctx.fillRect(s.x * W, s.y * H, 1.2 * s.z, 1.2 * s.z);
      });
      ctx.lineWidth = 1;
      var TAIL = phase === 'fly' ? 5 : 7, MAXT = phase === 'fly' ? 150 : 34;
      var paths = [new Path2D(), new Path2D(), new Path2D()];
      P.forEach(function (p, i) {
        flow(p, dt, time, stretch);
        var q = swarmXY(p, stretch, dir);
        if (p.x || p.y) {
          var dx = (q.x - p.x) * TAIL, dy = (q.y - p.y) * TAIL, len = Math.sqrt(dx * dx + dy * dy);
          if (len > MAXT) { dx *= MAXT / len; dy *= MAXT / len; }
          var path = paths[i % 3]; path.moveTo(q.x - dx, q.y - dy); path.lineTo(q.x, q.y);
        }
        p.x = q.x; p.y = q.y;
      });
      ctx.strokeStyle = 'rgba(235,242,255,0.55)'; ctx.stroke(paths[0]);
      ctx.strokeStyle = 'rgba(140,230,215,0.45)'; ctx.stroke(paths[1]);
      ctx.strokeStyle = 'rgba(160,165,255,0.45)'; ctx.stroke(paths[2]);
      if (phase === 'swarm') { vel.x *= 0.9; vel.y *= 0.9; }
    } else {
      project();
      var lit = MAP.lit(), glow = {}, any = false;
      (lit.glow || []).concat(lit.pre || []).forEach(function (id) { glow[id] = 1; any = true; });
      var formT = phase === 'form' ? Math.min(1, pt / 1.9) : 1;
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

      var zs = 1, zc = zoomC;
      if (phase === 'form') zs = 1 + 2.2 * (1 - ease(formT));
      for (var j = 0; j < P.length; j++) {
        var p = P[j], tg = dustTarget(p, time); if (!tg) continue;
        var h2 = nodeXY[p.n]; if (!h2.vis) continue;
        var x = tg.x, y = tg.y, e = 1;
        if (phase === 'form') {
          /* zoom out from inside the cloud while each particle flies from the swarm to its dot */
          x = zc.x + (x - zc.x) * zs; y = zc.y + (y - zc.y) * zs;
          e = ease(clamp((formT - p.d * 0.35) / 0.65, 0, 1));
          x = p.fx + (x - p.fx) * e; y = p.fy + (y - p.fy) * e;
        }
        var on2 = glow[nodes[p.n].id], tw = 0.75 + 0.25 * Math.sin(time * 1.7 + p.tw);
        var al2 = (on2 ? 0.95 : any ? 0.16 : 0.5) * tw;
        var c2 = e < 0.55 ? COLORS.me : COLORS[p.type];
        ctx.fillStyle = 'rgba(' + c2[0] + ',' + c2[1] + ',' + c2[2] + ',' + al2 + ')';
        var s = p.s * (on2 ? 1.25 : 1);
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
      if (phase === 'form' && formT >= 1) { phase = 'live'; skip(); }
    }
    raf = requestAnimationFrame(frame);
  }
  function startForm(time) {
    project();
    var xs = 0, ys = 0, c = 0;
    nodeXY.forEach(function (h) { if (h) { xs += h.x; ys += h.y; c++; } });
    zoomC = { x: xs / c, y: ys / c };
    P.forEach(function (p) { p.fx = p.x; p.fy = p.y; });
    root.classList.add('intro-out');
  }

  var raf = requestAnimationFrame(frame);
  /* pause when the tab is hidden */
  document.addEventListener('visibilitychange', function () { if (document.hidden) cancelAnimationFrame(raf); else { last = performance.now(); raf = requestAnimationFrame(frame); } });
}
