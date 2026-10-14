/* =========================================================
   MAP DATA: roles, projects, people, skills and tools.
   One source for the page, the map, the particle intro and Ask.
   Tools are skill dots with sub "Tool" (or "Platform" for the
   ecosystems a product runs in, which aren't stack claims).
   ========================================================= */
export const TYPES = {
  me:     { label: "Indigo", color: "#ffffff", r: 16 },
  role:   { label: "Roles", one: "Role", color: "#8f95ff", r: 11 },
  work:   { label: "Projects", one: "Project", color: "#5be0c4", r: 7 },
  person: { label: "People", one: "Person", color: "#f5b96b", r: 7 },
  skill:  { label: "Skills", one: "Skill", color: "#c79bff", r: 6 }
};
export const N = [
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
  { id: "p-dev", type: "person", exp: "rs", name: "Andrew Randall", sub: "Lead Software Developer, Razor Sparrow · engineering partner", quote: "Indigo excelled at breaking down complex or loosely defined requests into clear user stories with acceptance criteria, effort estimates, and priority rankings." },
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
export const L = [
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

/* ---------------------------------------------------------
   Added 2026-10-14 from Indigo's tools-and-skills inventory.
   Each skill dot groups the finer skills it lists in its body.
   --------------------------------------------------------- */
const SKILL_BODY = {
  's-req': 'Includes MVP scoping, user stories, acceptance criteria, backlog prioritization and requirements definition.',
  's-sys': 'Includes process design, workflow design, business rules, SOPs and process improvement.',
  's-ai': 'Includes AI-assisted development, prompt design, evaluating AI output against real replies, human-in-the-loop workflows and knowledge-base design.',
  's-cust': 'Includes support operations, escalation design and customer operations.',
  's-stake': 'Includes stakeholder management, engineering collaboration and cross-functional leadership.',
  's-lead': 'Includes operations leadership, hiring and root-cause analysis.'
};
N.forEach((n) => { if (SKILL_BODY[n.id]) n.body = SKILL_BODY[n.id]; });

N.push(
  /* Razor Sparrow highlights */
  { id: 'w-export', type: 'work', exp: 'rs', name: 'Estimate and invoice exporters', sub: 'Razor Sparrow · built with AI assistance', body: 'Browser utilities that pull billing records from the CRM and export custom fields, service dates, viewing history and other operational data, with a preview before export.' },
  { id: 'w-audit', type: 'work', exp: 'rs', name: 'Auto-invoice audit tool', sub: 'Razor Sparrow · built with AI assistance', body: 'Checks the auto-invoice settings on estimates, records the before and after values, and corrects them, with paging through records and debugging of API validation errors.' },
  { id: 'w-renew', type: 'work', exp: 'rs', name: 'Renewal estimate workflows', sub: 'Razor Sparrow', body: 'Worked through template and manual estimate flows for renewals: capacity-based plans, service dates, discounts, mapping the customer and issuer, and sending.' },
  { id: 'w-purch', type: 'work', exp: 'rs', name: 'District purchasing and renewals', sub: 'Razor Sparrow', body: 'Ran estimates, purchase orders, vendor paperwork, invoices and service dates, coordinating across buyers, administrators and accounts payable.' },
  { id: 'w-chirpy', type: 'work', exp: 'rs', name: 'Support bot guidance', sub: 'Razor Sparrow · Chirpy', body: 'Wrote the prompting and knowledge-use guidance for Chirpy, a support bot, including when it should ask a clarifying question and when it should hand off to a person.' },
  { id: 'w-dash', type: 'work', exp: 'rs', name: 'GradeTransferer usage dashboard', sub: 'Razor Sparrow · prototype', body: 'A standalone dashboard built from usage data, with search, defined KPIs, charts by transfer platform and a printable report.' },
  { id: 'w-churn', type: 'work', exp: 'rs', name: 'Usage, subscription and churn analysis', sub: 'Razor Sparrow', body: 'Worked across usage, billing and CRM data to connect activity with subscriptions, with careful definitions of who counts and over what period.' },
  { id: 'w-segment', type: 'work', exp: 'rs', name: 'Audience segmentation and messaging', sub: 'Razor Sparrow', body: 'Defined audience categories and wrote teacher-focused service descriptions and AI drafting guidance so messages fit who they were going to.' },
  /* personal projects */
  { id: 'w-site', type: 'work', exp: 'own', name: 'indigogrady.com', sub: 'Personal project · 2026', body: 'This site. Iterated through GitHub pull requests and Cloudflare Pages: the project map, the Ask box and its answer library, and the particle intro.' },
  { id: 'w-coqui', type: 'work', exp: 'own', name: 'QueCoqui', sub: 'Personal venture · setup and prototype', body: 'A local-business automation venture. I developed the brand and set up HighLevel and WhatsApp.' },

  /* skills */
  { id: 's-auto', type: 'skill', name: 'Workflow automation', sub: 'Skill', body: 'Includes CRM automations, reply-driven stage changes and data synchronization.' },
  { id: 's-crm', type: 'skill', name: 'CRM architecture', sub: 'Skill', body: 'Includes data modeling, custom objects, multi-contact accounts and CRM setup.' },
  { id: 's-tools', type: 'skill', name: 'Internal tools and APIs', sub: 'Skill', body: 'Includes internal tools, API integration, data transformation and validation, audit trails and debugging.' },
  { id: 's-proto', type: 'skill', name: 'Rapid prototyping', sub: 'Skill', body: 'Includes prototyping to clarify workflows before engineering time is spent, and iterative design.' },
  { id: 's-bill', type: 'skill', name: 'Billing and renewals', sub: 'Skill', body: 'Includes billing operations, renewal operations and procurement workflows.' },
  { id: 's-analytics', type: 'skill', name: 'Product analytics', sub: 'Skill', body: 'Includes metric definition, churn and subscription analysis, and data interpretation.' },
  { id: 's-viz', type: 'skill', name: 'Dashboards and data visualization', sub: 'Skill' },
  { id: 's-launch', type: 'skill', name: 'Launches and positioning', sub: 'Skill', body: 'Includes launch coordination, product positioning, community program design and customer feedback.' },
  { id: 's-comms', type: 'skill', name: 'Audience and messaging', sub: 'Skill', body: 'Includes audience segmentation, lifecycle communications, brand voice and documentation.' },
  { id: 's-ux', type: 'skill', name: 'Information architecture and interaction design', sub: 'Skill', body: 'Includes permissions design, privacy-aware design and user-centered design.' },
  { id: 's-brand', type: 'skill', name: 'Brand and service design', sub: 'Skill', body: 'Includes brand development, service design and business model design.' },

  /* tools */
  { id: 't-ghl', type: 'skill', name: 'GoHighLevel', sub: 'Tool', body: 'The CRM I ran Razor Sparrow on: support, billing, accounts and automations.' },
  { id: 't-api', type: 'skill', name: 'REST APIs', sub: 'Tool' },
  { id: 't-web', type: 'skill', name: 'HTML and JavaScript', sub: 'Tool', body: 'For internal utilities and prototypes, built with AI assistance.' },
  { id: 't-data', type: 'skill', name: 'JSON and CSV', sub: 'Tool' },
  { id: 't-chart', type: 'skill', name: 'Chart.js', sub: 'Tool' },
  { id: 't-ga4', type: 'skill', name: 'GA4', sub: 'Tool' },
  { id: 't-bq', type: 'skill', name: 'BigQuery', sub: 'Tool' },
  { id: 't-stripe', type: 'skill', name: 'Stripe', sub: 'Tool' },
  { id: 't-gh', type: 'skill', name: 'GitHub', sub: 'Tool' },
  { id: 't-cf', type: 'skill', name: 'Cloudflare Pages', sub: 'Tool' },
  { id: 't-wa', type: 'skill', name: 'WhatsApp', sub: 'Tool' },
  { id: 't-gc', type: 'skill', name: 'Google Classroom', sub: 'Platform', body: 'The platform Razor Sparrow’s extensions run in.' },
  { id: 't-cws', type: 'skill', name: 'Chrome Web Store', sub: 'Platform', body: 'Where Razor Sparrow’s extensions are published.' }
);

L.push(
  ['rs','w-export'],['rs','w-audit'],['rs','w-renew'],['rs','w-purch'],['rs','w-chirpy'],['rs','w-dash'],['rs','w-churn'],['rs','w-segment'],
  ['me','w-site'],['me','w-coqui'],
  ['w-dash','w-gt'],['w-chirpy','w-ai'],['w-renew','w-pricing'],['w-purch','w-accounts'],['w-export','w-audit'],
  /* existing projects to new skills and tools */
  ['t-ghl','w-tickets'],['s-auto','w-tickets'],
  ['t-ghl','w-accounts'],['s-crm','w-accounts'],['s-auto','w-accounts'],
  ['s-proto','w-portal'],['s-ux','w-portal'],['s-stake','w-portal'],
  ['s-launch','w-gs'],['s-launch','w-ems'],['s-launch','w-cc'],['s-launch','w-gliders'],['s-ux','w-cc'],
  ['t-gc','w-gs'],['t-gc','w-ems'],['t-gc','w-cc'],['t-gc','w-gt'],['t-cws','w-gs'],['t-cws','w-ems'],['t-cws','w-cc'],['t-cws','w-gt'],
  ['t-taiga','w-gs'],['t-taiga','w-ems'],['t-taiga','w-cc'],['t-taiga','w-portal'],
  ['t-ghl','w-stab'],['s-sys','w-stab'],['s-cust','w-chirpy'],['s-ai','w-chirpy'],['s-ai','w-segment'],
  /* new projects */
  ['t-ghl','w-export'],['t-api','w-export'],['t-web','w-export'],['t-data','w-export'],['s-ai','w-export'],['s-tools','w-export'],
  ['t-ghl','w-audit'],['t-api','w-audit'],['t-web','w-audit'],['t-data','w-audit'],['s-ai','w-audit'],['s-tools','w-audit'],
  ['t-ghl','w-renew'],['t-api','w-renew'],['s-auto','w-renew'],['s-bill','w-renew'],['s-tools','w-renew'],
  ['t-ghl','w-purch'],['s-bill','w-purch'],['s-stake','w-purch'],['s-cust','w-purch'],
  ['t-web','w-dash'],['t-data','w-dash'],['t-chart','w-dash'],['s-viz','w-dash'],['s-analytics','w-dash'],['s-proto','w-dash'],['s-ai','w-dash'],
  ['t-ga4','w-churn'],['t-bq','w-churn'],['t-stripe','w-churn'],['t-ghl','w-churn'],['s-analytics','w-churn'],
  ['t-ghl','w-segment'],['s-comms','w-segment'],['s-launch','w-segment'],
  ['t-gh','w-site'],['t-cf','w-site'],['s-ux','w-site'],['s-ai','w-site'],['s-proto','w-site'],
  ['t-ghl','w-coqui'],['t-wa','w-coqui'],['s-brand','w-coqui'],['s-crm','w-coqui'],['s-sys','w-coqui']
);

/* Full recommendation letters, shown in the map panel when a person is clicked.
   Contact details are left out on purpose. */
const LETTERS = {
  'p-dev': [
    'To Whom It May Concern,',
    'I am writing to enthusiastically recommend Indigo Grady for product and operations roles. I had the pleasure of working closely with Indigo as a colleague at Razor Sparrow LLC, where we collaborated on product development, backlog management, and technical delivery.',
    'One of Indigo\u2019s standout contributions was transforming the founders\u2019 high-level ideas and the growing support backlog into well-scoped, prioritized tickets in Taiga. Indigo excelled at breaking down complex or loosely defined requests into clear user stories with acceptance criteria, effort estimates, and priority rankings. This process brought much-needed structure to the team\u2019s work and ensured that the highest-impact items moved forward first.',
    'We also worked closely together on the design of several new systems. We designed and built an entirely new admin portal used by both customers and Razor Sparrow employees, supporting varying degrees of authorization. We also designed a new authorization system, including a totally new database schema to support it. Indigo approached these technical discussions thoughtfully, balancing the need for a clean, scalable data model with practical delivery constraints. His collaborative style made it easy to reason through trade-offs, challenge assumptions constructively, and land on solutions that served both immediate needs and longer-term maintainability.',
    'Beyond scoping and design work, Indigo was totally willing to dive as deep as necessary to help figure out and resolve software bugs. He showed real persistence and technical curiosity when tracking down difficult issues, never shying away from complex root-cause analysis or messy edge cases.',
    'Together we formed an effective working relationship that consistently moved the product forward. Indigo combines product thinking, operational rigor, and strong interpersonal skills. I am confident he would be a valuable addition to any product or operations team and would recommend him without reservation.',
    'Sincerely,\nAndrew Randall\nLead Software Developer'
  ]
};
N.forEach((n) => { if (LETTERS[n.id]) n.letter = LETTERS[n.id]; });
