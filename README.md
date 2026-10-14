# indigogrady.com

Personal site for Indigo Grady: a one-page portfolio with a "Read" view, an "Explore the map" network of roles, projects, people and skills, and an "Ask about my experience" box that only ever shows answers Indigo wrote.

Built with [Astro](https://astro.build) and [D3](https://d3js.org).

## Run it locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/ (needs Node 22.12 or newer)
```

## Where things live

- `src/pages/index.astro`: page markup
- `src/scripts/site.js`: map data (nodes, links) and all interactions
- `src/data/answers.js`: the Ask answer library (Indigo's written answers)
- `functions/api/ask.js`: Cloudflare Pages Function that asks Jev which written answer fits a question
- `src/styles/site.css`: styles
- `public/`: images and favicon

## How Ask works

1. In the browser, `src/data/match.js` compares the question with each answer's question, keywords and extra phrasings (`src/data/phrasings.js`, about 850 ways people ask the same things). A clear winner is answered instantly.
2. Anything else is posted to `/api/ask`. That function sends the question and the list of answers to [Jev](https://docs.typesafe.ai) (TypeSafe's System One model). Jev returns which answer fits, or "none". It never writes text, so the page only ever shows Indigo's own words.
3. If Jev isn't confident (top probability below 0.5), the box offers up to two near misses as "Did you mean". With no near miss, it invites the visitor to ask Indigo on LinkedIn and suggests questions.

To grow coverage, add phrasings to `src/data/phrasings.js` (questions only, never new facts) and run `npm run eval:ask`. It scores the in-browser matcher against `tests/ask-questions.tsv`: how many questions get the right answer, the wrong one, or none.

To turn Jev on in Cloudflare Pages, add an encrypted environment variable `TYPESAFE_API_KEY` (Settings → Variables and Secrets) and redeploy. Optional: `ASK_MIN_P` changes the confidence bar (default `0.5`). Locally, `npm run dev` has no `/api/ask`, so unmatched questions go straight to the fallback.

## Next

- Move each node into its own Markdown file (`[[Code Power]]`-style links) and build the map from them.
- Deploy on Cloudflare Pages or Netlify and point indigogrady.com at it.
