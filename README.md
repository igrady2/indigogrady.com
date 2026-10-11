# indigogrady.com

Personal site for Indigo Grady: a one-page portfolio with a "Read" view, an "Explore the map" network of roles, projects, people and skills, and an instant, rule-based "Ask about my experience" box (no AI model at runtime).

Built with [Astro](https://astro.build) and [D3](https://d3js.org).

## Run it locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/ (needs Node 22.12 or newer)
```

## Where things live

- `src/pages/index.astro`: page markup
- `src/scripts/site.js`: map data (nodes, links, Ask answers) and all interactions
- `src/styles/site.css`: styles
- `public/`: images and favicon

## Next

- Move each node into its own Markdown file (`[[Code Power]]`-style links) and build the map from them.
- Deploy on Cloudflare Pages or Netlify and point indigogrady.com at it.
