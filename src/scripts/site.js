import * as d3 from 'd3';
/* =========================================================
   DATA: one source of truth for the page, the map, and Ask
   ========================================================= */
var TYPES = {
  me:     { label: "Indigo", color: "#ffffff", r: 16 },
  role:   { label: "Roles", one: "Role", color: "#8f95ff", r: 11 },
  work:   { label: "Projects", one: "Project", color: "#5be0c4", r: 7 },
  person: { label: "People", one: "Person", color: "#f5b96b", r: 7 },
  skill:  { label: "Skills", one: "Skill", color: "#c79bff", r: 6 }
};
var N = [
  { id: "me", type: "me", name: "Indigo Grady", sub: "Product and operations leader · Remote", body: "Start anywhere. Every role, project, recommendation and skill on this map links back to real work." },
  { id: "ap", type: "role", exp: "ap", name: "AutoPilotPR", sub: "Founding COO (part-time) · Oct 2026 – now", body: "Business strategy and Claude-based agentic workflows, with a focus on keeping token costs low as usage grows." },
  { id: "rs", type: "role", exp: "rs", name: "Razor Sparrow", sub: "General Manager · Aug 2023 – Sep 2026", body: "Second hire and, for three years, the entire product function at a remote SaaS and edtech company." },
  { id: "cp", type: "role", exp: "cp", name: "Code Power", sub: "Product Coordinator · an Optic Power company · May 2021 – Jul 2023", body: "Code Power was the software delivery business of the Optic Power group. I joined early, when it had about ten developers, and oversaw eight client projects across six industries as the main liaison for seven clients." },
  { id: "te", type: "role", exp: "early", name: "Triumvirate Environmental", sub: "Environmental Specialist · Sep 2018 – Jul 2020", body: "Rookie of the Year, 2019." },
  { id: "bi", type: "role", exp: "early", name: "Bistro 360", sub: "General Manager · Arlington, VA · Feb 2017 – May 2018", body: "Ran a restaurant with a bar, dining room and retail market. Hired, trained and scheduled a front-of-house team of 12 to 20, managed more than 15 wine and beer distributors, and ordered for an inventory of 300+ wines, beers and liquors on a strict weekly budget." },
  { id: "ch", type: "role", exp: "early", name: "Cheesetique", sub: "Assistant Front-of-House Manager · Arlington, VA · Jun 2016 – Feb 2017", body: "Promoted from server to bartender to assistant front-of-house manager within five months." },
  { id: "w-flow", type: "work", exp: "ap", name: "Facts-locked reply flow", sub: "AutoPilotPR", body: "The model writes the words, and code places the facts from source systems, so a draft can't invent a price or a date." },
  { id: "w-stab", type: "work", exp: "rs", name: "Stabilize, then grow", sub: "Razor Sparrow", body: "Traced much of the support volume to product defects, hired a senior engineer to fix them, and wrote the backlog that guided the work.", result: "First response time fell from weeks to under 24 hours." },
  { id: "w-tickets", type: "work", exp: "rs", name: "Support ticket system", sub: "Razor Sparrow", body: "Routed work by need, prompted follow-up, and closed or reopened cases by clear rules, backed by SOPs and templates." },
  { id: "w-backlog", type: "work", exp: "rs", name: "Backlog in Taiga", sub: "Razor Sparrow", body: "Turned the founders' ideas and a growing support backlog into scoped, prioritized tickets with user stories and acceptance criteria." },
  { id: "w-portal", type: "work", exp: "rs", name: "Admin portal and permissions", sub: "Razor Sparrow", body: "Co-designed a new admin portal for customers and staff with tiered permissions, including the authorization system and database schema behind it. Prototyped with AI first." },
  { id: "w-accounts", type: "work", exp: "rs", name: "District account model", sub: "Razor Sparrow", body: "Tied quotes and invoices to the district instead of the person, and routed each message to the right stakeholder.", result: "About 300 district accounts stayed accurate through constant turnover." },
  { id: "w-pricing", type: "work", exp: "rs", name: "District pricing redesign", sub: "Razor Sparrow", result: "Renewals no longer needed a fresh quote every year." },
  { id: "w-ai", type: "work", exp: "rs", name: "AI support drafting", sub: "Razor Sparrow", body: "Built in Cursor with Claude models, tested against replies the team had actually sent, and limited to routine questions on purpose.", result: "Saved enough time that the support role didn't need to be rehired." },
  { id: "w-launch", type: "work", exp: "rs", name: "Three product launches", sub: "Razor Sparrow · 2026", body: "Led the shift from stabilization to growth with three new Chrome extensions for teachers: GradeSight, Email My Students and ClassCloak." },
  { id: "w-gs", type: "work", exp: "rs", name: "GradeSight", sub: "Chrome extension · launched 2026", body: "Adds grade highlighting, class statistics and at-risk student flags to Google Classroom and Aspen gradebooks, with printable reports for parent conferences.", url: "https://chromewebstore.google.com/detail/gradesight/endcmfcbhcfhoenihpkblpmpfodckfpf", urlLabel: "See it on the Chrome Web Store" },
  { id: "w-ems", type: "work", exp: "rs", name: "Email My Students", sub: "Chrome extension · launched 2026", body: "Lets teachers pick students in Google Classroom and open an Outlook email already addressed to them.", url: "https://chromewebstore.google.com/detail/email-my-students/dobolefimaffkkkohihlhdigcmjehoge", urlLabel: "See it on the Chrome Web Store" },
  { id: "w-cc", type: "work", exp: "rs", name: "ClassCloak", sub: "Chrome extension · launched 2026", body: "Swaps student names and other sensitive details on screen for placeholders like \u201cStudent A,\u201d so teachers can share screenshots and recordings safely.", url: "https://chromewebstore.google.com/detail/classcloak-protect-studen/bicalpdiddceklkfbbfjpnipfhhjpgnh", urlLabel: "See it on the Chrome Web Store" },
  { id: "w-gliders", type: "work", exp: "rs", name: "GLIDERS ambassador program", sub: "Razor Sparrow · launched 2026", body: "A free ambassador community for teachers who use Razor Sparrow's tools: early access to new features, a direct feedback line to leadership, and support to present at teacher conferences. I oversaw the launch, directing a consultant and a new hire.", url: "https://join.razorsparrow.com/gliders", urlLabel: "See GLIDERS" },
  { id: "w-gt", type: "work", exp: "rs", name: "GradeTransferer", sub: "Flagship Chrome extension", body: "About 70,000 users and a 4.8-star rating on the Chrome Web Store.", url: "https://chromewebstore.google.com/detail/gradetransferer-transfer/boapjdphamdkfjfdibbdpcemcdncfhjf", urlLabel: "See it on the Chrome Web Store" },
  { id: "w-connect", type: "work", exp: "cp", name: "Connect Marketing Task Manager", sub: "Code Power client project · 2022–2023", body: "A desktop app that builds a personal schedule from tasks and recurring rituals, pulling tasks in from the client's AirTable and syncing with Google and Outlook calendars. Built with Electron, React, TypeScript and MongoDB. I was the business analyst and product owner proxy: roadmap and backlog prioritization with the client, biweekly status and release reports, and QA across more than 20 releases. The client's president built it to save his own time first, then planned to pilot it at his workplace and use the results as the case for wider rollout.", result: "The client's president wrote that the product “undeniably benefitted.”" },
  { id: "w-build", type: "work", exp: "cp", name: "BUILD Fam-Biz", sub: "Code Power client project · 2022–2023", body: "A game-based entrepreneurship course for students in grades 7 to 12, with grades sent back to the school's LMS. Built with Next.js, with AirTable as the content admin. I was the day-to-day client lead: requirements sessions, the Jira backlog, and running the game's calculations in AirTable to save developer time. I stayed BUILD's go-to advisor through their 2023 restructure.", url: "https://build.org/fambiz/outreachfambiz/", urlLabel: "See Fam-Biz on build.org" },
  { id: "w-dc", type: "work", exp: "cp", name: "BUILD Design Challenge", sub: "Code Power client project · 2022", body: "A second BUILD learning app. I worked through more than 130 wireframes one by one with the client to pin down requirements, then relayed them to the developers.", url: "https://build.org/challenge/", urlLabel: "See the Design Challenge on build.org" },
  { id: "w-mente", type: "work", exp: "cp", name: "Mente Serena", sub: "Code Power client project", body: "A platform connecting patients in Puerto Rico with licensed mental-health professionals, built for founders who are clinical psychologists. It launched publicly in 2024. As project coordinator, I stayed online past midnight with the developers at the end of the project and found the bug pattern that unblocked delivery of the admin panel." },
  { id: "w-mundo", type: "work", exp: "cp", name: "MundoLMS", sub: "Code Power client project", body: "A custom learning platform for Mr. D Math, an accredited online math school, built from the ground up. I was the business analyst and client lead, gathering requirements with the founder from the start." },
  { id: "w-walk", type: "work", exp: "cp", name: "Walkboard Partner Portal", sub: "Code Power client project", body: "An internal web app for Walkboard, a moving-services booking platform, to manage its partner companies. I was the business analyst and client lead, turning new business processes into user flows for the developer, including map-based pickup and drop-off and text and email notifications. Built with React, Firebase and Google Cloud functions, Google Maps, Twilio and SendGrid." },
  { id: "w-friend", type: "work", exp: "cp", name: "Friendbase", sub: "Code Power client project", body: "A remake of Friendbase, a social virtual world where teens hang out as avatars. I was the business analyst and client lead." },
  { id: "w-neuro", type: "work", exp: "cp", name: "NeuroID SDK", sub: "Code Power client project", body: "A mobile SDK for Android and iOS. I kept reporting flowing between the developers and the client." },
  { id: "w-fda", type: "work", exp: "early", name: "FDA inventory migration", sub: "Triumvirate Environmental", body: "Oversaw migration of the FDA's complete chemical inventory into a new system and built a stop-gap process for the six months between contracts." },
  { id: "w-hb", type: "work", exp: "early", name: "Employee handbook and training manual", sub: "Bistro 360", body: "Wrote the restaurant's new handbook and training manual from scratch, including sustainability practices that cut single-use items and food waste." },
  { id: "w-liq", type: "work", exp: "early", name: "First liquor program", sub: "Cheesetique", body: "Planned and ran the store's first liquor program from concept to launch: the craft cocktail list, distributor ordering, and cost analysis and tracking." },
  { id: "p-lauren", type: "person", exp: "rs", name: "Lauren Samaras", sub: "Customer Support and Success Specialist · reported to Indigo", quote: "Indigo is an exceptional leader who consistently balances the bigger picture with the operational details needed to bring ideas to life.", lead: true },
  { id: "p-dev", type: "person", exp: "rs", name: "Lead Software Developer", sub: "Razor Sparrow · engineering partner", quote: "Indigo excelled at breaking down complex or loosely defined requests into clear user stories with acceptance criteria, effort estimates, and priority rankings." },
  { id: "p-neil", type: "person", exp: "cp", name: "Neil Myers", sub: "President, Connect Marketing · client", quote: "He frequently provided insightful suggestions, either simplifying our specifications or prompting us to consider the broader, long-term implications of our requests." },
  { id: "p-rob", type: "person", exp: "cp", name: "Roberto Del Valle", sub: "Senior Software Engineer · teammate at Code Power", quote: "Even when faced with technical aspects that may be unfamiliar, Indigo proactively seeks to understand them, providing valuable insights and facilitating effective communication between developers and the rest of the team." },
  { id: "p-chad", type: "person", exp: "cp", name: "J Chad McCully", sub: "Engineering Manager, my manager on BUILD", quote: "Indigo Owns it." },
  { id: "p-mari", type: "person", exp: "cp", name: "Marianela Ortiz", sub: "Direct manager and project manager at Code Power", quote: "One of Indigo's greatest strengths lies in his exceptional communication and collaboration skills with a strong rapport with the client.", page: false },
  { id: "p-martin", type: "person", exp: "cp", name: "Martin Refi", sub: "Senior Product Designer · teammate at Code Power", quote: "A sharp mind and an innate ability to think outside the box, which allowed us to come up with innovative solutions to complex problems.", page: false },
  { id: "s-req", type: "skill", name: "Requirements and backlogs", sub: "Skill" },
  { id: "s-sys", type: "skill", name: "Process and systems design", sub: "Skill" },
  { id: "s-ai", type: "skill", name: "AI workflows", sub: "Skill" },
  { id: "s-cust", type: "skill", name: "Customer operations", sub: "Skill" },
  { id: "s-stake", type: "skill", name: "Stakeholder alignment", sub: "Skill" },
  { id: "s-lead", type: "skill", name: "Team leadership", sub: "Skill" },
  { id: "t-jira", type: "skill", name: "Jira", sub: "Tool" },
  { id: "t-conf", type: "skill", name: "Confluence", sub: "Tool" },
  { id: "t-taiga", type: "skill", name: "Taiga", sub: "Tool" },
  { id: "t-air", type: "skill", name: "Airtable", sub: "Tool" },
  { id: "t-claude", type: "skill", name: "Claude and Claude Code", sub: "Tool" },
  { id: "t-cursor", type: "skill", name: "Cursor", sub: "Tool" },
  { id: "t-gpt", type: "skill", name: "ChatGPT", sub: "Tool" }
];
var L = [
  ["me","ap"],["me","rs"],["me","cp"],["me","te"],["me","bi"],["me","ch"],["bi","w-hb"],["ch","w-liq"],["s-sys","w-hb"],["s-lead","w-hb"],
  ["ap","w-flow"],
  ["rs","w-stab"],["rs","w-tickets"],["rs","w-backlog"],["rs","w-portal"],["rs","w-accounts"],["rs","w-pricing"],["rs","w-ai"],["rs","w-launch"],["rs","w-gt"],["rs","w-gs"],["rs","w-ems"],["rs","w-cc"],["rs","w-gliders"],
  ["w-stab","w-tickets"],["w-stab","w-backlog"],["t-jira","cp"],["t-jira","w-build"],["t-conf","cp"],["t-taiga","w-backlog"],["t-air","w-build"],["t-air","w-dc"],["t-air","w-connect"],["t-claude","w-ai"],["t-claude","w-flow"],["t-claude","ap"],["t-cursor","w-ai"],["t-gpt","w-portal"],["w-launch","w-gs"],["w-launch","w-ems"],["w-launch","w-cc"],["w-gliders","w-gt"],["s-cust","w-gliders"],["s-lead","w-gliders"],["s-req","w-gs"],["s-req","w-ems"],["s-req","w-cc"],["w-accounts","w-pricing"],
  ["cp","w-connect"],["cp","w-build"],["cp","w-dc"],["cp","w-mente"],["cp","w-mundo"],["cp","w-walk"],["cp","w-friend"],["cp","w-neuro"],["w-build","w-dc"],["te","w-fda"],
  ["rs","p-lauren"],["rs","p-dev"],["cp","p-neil"],["cp","p-chad"],["cp","p-mari"],["cp","p-rob"],["cp","p-martin"],
  ["p-lauren","w-tickets"],["p-lauren","s-lead"],["p-lauren","s-cust"],["p-dev","w-backlog"],["p-dev","w-portal"],["p-neil","w-connect"],["p-rob","w-connect"],["p-martin","w-build"],["p-martin","w-connect"],["p-chad","w-build"],["p-chad","w-dc"],["p-mari","w-build"],
  ["s-req","w-backlog"],["s-req","w-connect"],["s-req","w-dc"],["s-req","w-build"],["s-req","w-portal"],["s-req","w-stab"],
  ["s-sys","w-tickets"],["s-sys","w-accounts"],["s-sys","w-portal"],["s-sys","w-fda"],["s-sys","w-flow"],["s-sys","w-mente"],
  ["s-ai","w-ai"],["s-ai","w-flow"],["s-ai","w-portal"],
  ["s-cust","w-tickets"],["s-cust","w-pricing"],["s-cust","w-accounts"],["s-cust","w-ai"],
  ["s-stake","w-connect"],["s-stake","w-build"],["s-stake","w-mundo"],["s-stake","w-walk"],["s-stake","w-accounts"],["s-stake","p-mari"],["s-stake","p-rob"],
  ["s-lead","bi"],["s-lead","w-stab"]
];
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
function fitArea() {
  var W = window.innerWidth, H = window.innerHeight;
  if (W <= 760) return { x0: 16, y0: 200, x1: W - 16, y1: H * 0.56 };
  return { x0: 24, y0: 120, x1: W - 22 * 16 - 56, y1: H - 36 };
}
function fit(ids) {
  if (!zoomer || !ids.length) return;
  var xs = [], ys = []; ids.forEach(function (id) { var p = POS[id]; if (p) { xs.push(p.x); ys.push(p.y); } });
  if (!xs.length) return;
  var pad = 70, minx = Math.min.apply(null, xs) - pad, maxx = Math.max.apply(null, xs) + pad, miny = Math.min.apply(null, ys) - pad / 2, maxy = Math.max.apply(null, ys) + pad;
  var a = fitArea(), k = Math.min((a.x1 - a.x0) / (maxx - minx), (a.y1 - a.y0) / (maxy - miny), 1.8);
  k = Math.max(0.35, k);
  var tx = a.x0 + ((a.x1 - a.x0) - (maxx - minx) * k) / 2 - minx * k, ty = a.y0 + ((a.y1 - a.y0) - (maxy - miny) * k) / 2 - miny * k;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  d3.select(sky).transition().duration(reduce ? 0 : 650).call(zoomer.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
}
function visibleIds() { return N.filter(function (n) { return visible(n); }).map(function (n) { return n.id; }); }
function focusIds(id) { return [id].concat(Array.from(nbr[id])); }

function layout(W, H) {
  var nodes = N.map(function (n) { return { id: n.id, type: n.type }; });
  var links = L.map(function (l) { return { source: l[0], target: l[1] }; });
  var scale = Math.max(0.7, Math.min(1.6, Math.min(W, H) / 650));
  var sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(function (d) { return d.id; }).distance(function (l) {
      var a = l.source.type, b = l.target.type; return ((a === 'me' || b === 'me') ? 170 : (a === 'skill' || b === 'skill') ? 140 : 95) * scale; }).strength(0.45))
    .force('charge', d3.forceManyBody().strength(-620 * scale))
    .force('collide', d3.forceCollide().radius(function (d) { return (TYPES[d.type].r + 30) * scale; }))
    .force('x', d3.forceX(W / 2).strength(0.035)).force('y', d3.forceY(H / 2).strength(0.05)).stop();
  nodes.forEach(function (n, i) { var a = i * 2.4; n.x = W / 2 + Math.cos(a) * 40 * (i % 7); n.y = H / 2 + Math.sin(a) * 40 * (i % 7); });
  var me = nodes[0]; me.fx = W / 2; me.fy = H / 2;
  for (var i = 0; i < 400; i++) sim.tick();
  var pos = {}; nodes.forEach(function (n) { pos[n.id] = n; });
  return { pos: pos, links: links };
}

function buildSky() {
  if (!hasD3) return;
  var W = window.innerWidth, H = window.innerHeight;
  sky.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  sky.innerHTML = '';
  var L2 = layout(W, H); POS = L2.pos;
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
  if (state.mode === 'explore') fit(state.focus ? focusIds(state.focus) : visibleIds());
}

function inExp(n) {
  if (state.exp === 'all' || n.type === 'me') return true;
  if (n.exp) return n.exp === state.exp;
  var ok = false; nbr[n.id].forEach(function (m) { if (byId[m].exp === state.exp) ok = true; }); return ok;
}
function visible(n) { return state.mode === 'read' || n.type === 'me' || (state.types[n.type] && inExp(n)); }

function paint() {
  var f = state.mode === 'explore' ? state.focus : null;
  var glow = state.mode === 'read' ? new Set(state.glow) : new Set();
  N.forEach(function (n) {
    var el = nodeEls[n.id]; if (!el) return;
    el.style.display = visible(n) ? '' : 'none';
    el.classList.toggle('glow', glow.has(n.id));
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
  if (state.mode === 'read' && zoomer) d3.select(sky).call(zoomer.transform, d3.zoomIdentity);
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
var EXPS = [["all","All"],["ap","AutoPilotPR"],["rs","Razor Sparrow"],["cp","Code Power"],["early","Earlier"]];
var expGroup = document.getElementById('expGroup');
EXPS.forEach(function (e) {
  var b = document.createElement('button'); b.type = 'button'; b.className = 'chip sel'; b.textContent = e[1];
  b.setAttribute('aria-pressed', e[0] === 'all' ? 'true' : 'false');
  b.addEventListener('click', function () {
    state.exp = e[0]; state.focus = null;
    expGroup.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
    b.setAttribute('aria-pressed', 'true'); paint(); fit(visibleIds());
    showPanel(e[0] === 'all' ? byId.me : byId[{ ap: 'ap', rs: 'rs', cp: 'cp', early: 'te' }[e[0]]]);
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
  h += '<span class="type" style="color:' + t.color + '">' + (n.type === 'me' ? 'START HERE' : (n.sub === 'Tool' ? 'TOOL' : (t.one || t.label).toUpperCase())) + '</span>';
  h += '<h3>' + esc(n.name) + '</h3>';
  if (n.sub) h += '<span class="sub">' + esc(n.sub) + '</span>';
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
var sections = Array.prototype.slice.call(document.querySelectorAll('[data-nodes]')).filter(function (s) { return !s.classList.contains('case'); });
var current = { section: null, slide: 0 };
function setGlowFrom(el) {
  var ids = (el.getAttribute('data-nodes') || '').split(/\s+/).filter(Boolean);
  if (el.id === 'work') { var c = document.querySelectorAll('.case')[current.slide]; ids = (c.getAttribute('data-nodes') || '').split(/\s+/); }
  state.glow = ids; paint();
}
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { current.section = en.target; setGlowFrom(en.target); } });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.concat([document.getElementById('work')]).forEach(function (s) { io.observe(s); });
}

/* carousel */
(function () {
  var track = document.getElementById('cases'), slides = Array.prototype.slice.call(track.children);
  var dots = document.getElementById('dots'), prev = document.getElementById('prev'), next = document.getElementById('next'), count = document.getElementById('count');
  slides.forEach(function (s, i) {
    s.setAttribute('aria-roledescription', 'slide'); s.setAttribute('aria-label', (i + 1) + ' of ' + slides.length);
    var d = document.createElement('button'); d.type = 'button'; d.className = 'dot'; d.setAttribute('aria-label', 'Show case study ' + (i + 1));
    d.addEventListener('click', function () { go(i); }); dots.appendChild(d);
  });
  function go(i) { i = Math.max(0, Math.min(slides.length - 1, i)); track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft }); }
  function update(i) {
    current.slide = i;
    Array.prototype.forEach.call(dots.children, function (d, j) { d.setAttribute('aria-current', j === i ? 'true' : 'false'); });
    prev.disabled = i === 0; next.disabled = i === slides.length - 1; count.textContent = (i + 1) + ' / ' + slides.length;
    if (current.section && current.section.id === 'work') setGlowFrom(current.section);
  }
  prev.addEventListener('click', function () { go(current.slide - 1); });
  next.addEventListener('click', function () { go(current.slide + 1); });
  track.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(current.slide + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(current.slide - 1); } });
  var t; track.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(function () { update(Math.round(track.scrollLeft / track.clientWidth)); }, 60); });
  update(0);
})();

/* =========================================================
   ASK: instant answers from structured data. No model, no network call.
   ========================================================= */
var INTENTS = [
  { q: "Do you have leadership experience?", keys: [["lead",2],["leader",3],["leadership",3],["manage people",3],["managed",1],["team",1],["coach",2],["mentor",2],["hire",2],["hiring",2],["report",1],["supervis",2],["people",1]],
    a: "Yes. As General Manager at Razor Sparrow I ran day-to-day operations across support, billing, renewals, product and compliance, hired a senior engineer, and managed and coached our customer support and success specialist for nearly two years. Earlier, as a restaurant general manager, I hired, trained and scheduled a team of 12 to 20.",
    quote: "p-lauren", nodes: ["rs","p-lauren","s-lead","w-stab","bi"] },
  { q: "How do you use AI?", keys: [["ai",3],["artificial",3],["llm",3],["claude",3],["gpt",2],["chatgpt",2],["agent",3],["agentic",3],["automat",2],["machine learning",2],["prompt",2],["cursor",2],["mcp",2]],
    a: "I use AI where it actually helps and keep it away from what it shouldn't be trusted with. At Razor Sparrow I built an AI support-drafting system in Cursor with Claude models, tested it against replies the team had actually sent, and limited it to routine questions. It saved enough time that the support role didn't need to be rehired. I also prototype admin workflows with AI before engineering starts. At AutoPilotPR I design Claude-based agentic workflows where the model writes the words and code supplies the facts.",
    nodes: ["w-ai","w-flow","w-portal","s-ai","ap"] },
  { q: "What's your product management experience?", keys: [["product",2],["roadmap",3],["backlog",2],["user stor",3],["prioriti",2],["feature",2],["launch",2],["pm ",1],["discovery",2],["saas",1],["chrome",2],["extension",2]],
    a: "I was the second hire and, for three years, the entire product function at Razor Sparrow, whose flagship Chrome extension GradeTransferer has about 70,000 users and a 4.8-star rating. I turned the founders' ideas and the support backlog into scoped, prioritized tickets, traced support volume to product defects, and then led the shift to growth with three new product launches.",
    quote: "p-dev", nodes: ["rs","w-gt","w-launch","w-gs","w-ems","w-cc","w-backlog","s-req"] },
  { q: "What operations work have you done?", keys: [["operation",3],["ops",3],["process",2],["sop",3],["sops",3],["support",2],["ticket",2],["billing",2],["renewal",2],["efficien",2],["system",1],["scale",1],["customer success",2]],
    a: "I rebuilt Razor Sparrow's support so first response time fell from weeks to under 24 hours. I designed the ticket system, wrote the SOPs, built an account model that kept about 300 school district accounts accurate, and redesigned district pricing so renewals no longer needed re-quoting.",
    nodes: ["w-stab","w-tickets","w-accounts","w-pricing","s-sys"] },
  { q: "Have you managed projects or programs?", keys: [["project",3],["program",3],["agile",3],["scrum",3],["jira",3],["sprint",3],["deliver",2],["deadline",2],["timeline",2],["pmp",2],["kanban",2],["concurrent",2]],
    a: "Yes. At Code Power I oversaw eight client projects across six industries, ran up to three at a time in Jira, and filled the business analyst, scrum master and project manager roles at times as each project needed. I owned requirements and backlog grooming and tested builds before release.",
    quote: "p-chad", nodes: ["cp","w-connect","w-build","w-dc","w-mente","s-req","p-chad"] },
  { q: "How do you work with clients and stakeholders?", keys: [["stakeholder",3],["client",3],["customer",1],["communicat",2],["executive",2],["cross-functional",3],["cross functional",3],["relationship",2],["align",2],["liaison",3]],
    a: "I was the main liaison for seven software clients at Code Power, translating their goals into requirements developers could build. At Razor Sparrow I coordinated district purchasing and renewals across administrators, purchasing teams, accounts payable and our own staff, and worked directly with the co-founders to prioritize competing needs.",
    quote: "p-mari", nodes: ["s-stake","w-connect","w-accounts","p-neil","p-mari"] },
  { q: "How technical are you?", keys: [["technical",3],["code",2],["coding",3],["engineer",2],["developer",2],["sql",2],["database",3],["api",2],["javascript",3],["html",2],["schema",3],["bug",2],["architecture",2]],
    a: "I'm not a software engineer, but I work comfortably close to the code. I co-designed an authorization system and the database schema behind it, built browser utilities with HTML, JavaScript and APIs to audit and update records our CRM couldn't handle, and worked with engineering on root-cause analysis of difficult bugs.",
    quote: "p-rob", nodes: ["w-portal","p-dev","p-rob","s-sys"] },
  { q: "Can you work remotely from Puerto Rico?", keys: [["remote",3],["puerto",3],["rico",3],["location",3],["where",2],["relocat",3],["visa",3],["sponsor",3],["time zone",3],["timezone",3],["eastern",2],["based",2],["live",1],["us citizen",3],["authoriz",2]],
    a: "Yes. I live in Humacao, Puerto Rico, a US territory, so no visa or sponsorship is needed. I work on Atlantic Time, the same as US Eastern for most of the year, and I've worked remotely since 2021.",
    nodes: ["me"] },
  { q: "Do you have edtech experience?", keys: [["edtech",3],["education",3],["school",3],["k-12",3],["k12",3],["teacher",3],["district",3],["student",2],["learning",2]],
    a: "Yes. Razor Sparrow builds tools for teachers and schools, and I managed purchasing and renewals for about 300 school districts. At Code Power I led two BUILD.org learning apps, Fam-Biz and Design Challenge, and worked on a custom learning management system for a tutoring business.",
    nodes: ["rs","w-gt","w-accounts","w-build","w-dc","w-mundo"] },
  { q: "Do you work with data?", keys: [["data",3],["analy",3],["metric",3],["kpi",3],["report",2],["churn",3],["dashboard",2],["excel",2],["spreadsheet",2]],
    a: "Yes. At Razor Sparrow I analyzed billing and customer data on payment failures, renewals, churn reasons and tenure to give leadership clearer information for decisions, and I built browser tools to audit and export records our CRM couldn't handle.",
    nodes: ["rs","s-cust","w-accounts"] },
  { q: "What's your education?", keys: [["education",2],["degree",3],["college",3],["university",3],["school",1],["certif",3],["mba",3],["bachelor",3],["elon",3]],
    a: "I have a BS in Environmental Studies from Elon University, and my senior capstone included formal project management training. I've also completed Claude 101 from Claude Academy.",
    nodes: ["me"] },
  { q: "What tools do you use?", keys: [["tool",3],["software",2],["stack",3],["jira",1],["taiga",3],["confluence",3],["airtable",3],["stripe",3],["gohighlevel",3],["crm",2]],
    a: "Jira, Taiga, Confluence, Airtable, Stripe, GoHighLevel, REST APIs and webhooks, Claude, Claude Code, Cursor, MCP, HTML and JavaScript.",
    nodes: ["s-req","s-ai","s-sys"] },
  { q: "What did you do before tech?", keys: [["before",2],["earlier",2],["background",2],["previous",1],["restaurant",3],["hospitality",3],["bistro",3],["cheesetique",3],["environmental",3],["hazard",3],["triumvirate",3],["fda",3],["career change",3]],
    a: "Before Code Power I was an environmental specialist at Triumvirate Environmental, where I oversaw moving the FDA's chemical inventory into a new system and was Rookie of the Year in 2019. Before that I ran Bistro 360 as general manager: I hired and trained a team of 12 to 20, managed more than 15 distributors, and wrote the employee handbook and training manual from scratch. At Cheesetique I was promoted to assistant front-of-house manager within five months and launched the store's first liquor program.",
    nodes: ["te","w-fda","bi","w-hb","ch","w-liq"] },
  { q: "Are you available now?", keys: [["available",3],["availability",3],["start",2],["full-time",3],["full time",3],["notice",2],["looking",2],["open to",2]],
    a: "Yes. I'm looking for a full-time remote role in product, program or operations management. My AutoPilotPR role is part-time.",
    nodes: ["ap","me"] }
];
var SUGGEST = [0, 1, 2, 7, 4];

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
var ansBox = document.getElementById('answer'), input = document.getElementById('askInput');
function render(qText) {
  if (!qText.trim()) { ansBox.hidden = true; return; }
  var r = answer(qText), h = '<span class="q">' + esc(qText) + '</span>';
  if (r.intent) {
    h += '<p>' + esc(r.intent.a) + '</p>';
    if (r.intent.quote) { var p = byId[r.intent.quote]; h += '<q>' + esc(p.quote) + ' — ' + esc(p.name) + '</q>'; }
    h += '<div class="ev"><span>EVIDENCE · SHOW ON MAP</span>' + r.intent.nodes.filter(function (id) { return id !== 'me'; }).map(function (id) { return chipBtn(byId[id]); }).join('') + '</div>';
  } else if (r.related && r.related.length) {
    h += '<p>I don’t have a written answer for that yet. These parts of my work look related:</p><div class="ev">' + r.related.map(chipBtn).join('') + '</div>';
  } else {
    h += '<p>I don’t have a written answer for that yet. Try one of the suggested questions, or ask me directly. My contact details are at the bottom of the page.</p>';
  }
  h += '<span class="speed">Answered in ' + (r.ms < 1 ? 'under 1' : r.ms.toFixed(1)) + ' ms from my mapped experience. No AI model involved.</span>';
  ansBox.innerHTML = h; ansBox.hidden = false;
  ansBox.querySelectorAll('[data-id]').forEach(function (b) { b.addEventListener('click', function () { setMode('explore', b.getAttribute('data-id')); }); });
  if (r.intent) { state.glow = r.intent.nodes; paint(); }
}
document.getElementById('askForm').addEventListener('submit', function (e) { e.preventDefault(); render(input.value); });
var deb; input.addEventListener('input', function () { clearTimeout(deb); deb = setTimeout(function () { if (input.value.trim().length > 6) render(input.value); }, 250); });
var sug = document.getElementById('suggest');
SUGGEST.forEach(function (i) {
  var b = document.createElement('button'); b.type = 'button'; b.textContent = INTENTS[i].q;
  b.addEventListener('click', function () { input.value = INTENTS[i].q; render(INTENTS[i].q); });
  sug.appendChild(b);
});

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
var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(buildSky, 200); });
applyMode();
