# Deployment

The site is a static [Astro](https://astro.build) build. Every page under
`content/` is rendered at the URL in its own front matter, so the page/keyword
map in `data/keyword-map.csv` and the live site cannot drift apart.

## Why the 404 happened

The repository previously held only the content plan and the markdown — no
application code, no build config, nothing to serve. Vercel deployed it,
found no output directory and no framework, and returned `404: NOT_FOUND` for
every path including `/`. Adding the Astro app and `vercel.json` is the fix.

## Vercel settings

`vercel.json` already declares these; only set them in the dashboard if you
are overriding it.

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |
| Node version | 20.x or later |

Add `marinedieselengine.com.au` under **Settings → Domains**, and set the
apex/`www` redirect to whichever you want canonical. `astro.config.mjs` builds
absolute URLs from `site.config.json` → `domain`, so canonicals, Open Graph
URLs and the sitemap all follow that one value. Change it there, not in
fifteen templates.

## Publish gates are enforced at build time

The plan's gates (CONTENT-PLAN.md section 4) are not a checklist someone has to
remember — the build applies them. A page that fails any gate is **still built
and served**, so no URL 404s, but it is:

- served `<meta name="robots" content="noindex, follow">`
- excluded from every sitemap
- shown a banner listing exactly why it is not published

When nothing is publishable, `robots.txt` serves `Disallow: /` rather than
advertising an empty sitemap.

The gates:

| Gate | Applies to |
|---|---|
| `status: ready` in front matter | every page |
| A named author | every page |
| A named marine mechanic reviewer | pillars, symptoms, engine models |
| `{{PROVIDERS}}` resolved | location hubs, location services |
| `provider_count` at or above the type's gate | location hubs (10), location services (5) |

### The two kinds of placeholder

`{{PROVIDERS:sydney}}` **blocks publication**. A location hub without its operator
list has no reason to exist.

`{{PRICE_TABLE:sydney}}` **does not**. The paragraph is stripped at render and
the page publishes without it, because a service page missing its local price
band is still a complete explanation of the job — the plan's "folding is not
failure". The build report counts what was stripped so it is not forgotten.

To change which is which, edit `BLOCKING_TOKENS` in `src/lib/gates.js`.

## Current state

57 pages build. **0 are indexable.** All 47 pillar and service pages are
content-complete and marked `status: ready`; they are held back by one thing
only:

> `site.config.json` has `defaultAuthor: null` and `defaultReviewer: null`.

Set both to real named people and those 47 pages go live in the sitemap
immediately:

```json
"defaultAuthor": "Jane Smith",
"defaultReviewer": "John Citizen, Licensed Marine Mechanic (Lic. 12345)"
```

Do not put a placeholder there. For a site giving repair advice, the named
reviewer is the E-E-A-T signal and the thing that keeps the advice correct —
see CONTENT-PLAN.md section 9. Per-page `author:` / `reviewed_by:` front
matter overrides the default where a different person wrote or checked a page.

The 10 location hubs stay blocked until `data/providers.csv` exists and each hub
carries at least 10 verified local operators. That is the wave 2 critical path.

## Commands

```bash
npm install
npm run dev      # local dev server
npm run build    # gate report, then static build to dist/
npm run preview  # serve the built output
npm run check    # python content validator (front matter, links, gates)
```

`npm run build` fails on duplicate URLs and on a page whose `parent` does not
exist, so a broken internal-link graph cannot reach production.

## Adding pages

1. Add the page to `data/*.csv` and re-run `python3 scripts/generate_keyword_map.py`.
2. Write `content/<section>/<slug>.md` with front matter whose `url` matches
   the plan.
3. `npm run check` then `npm run build`.
