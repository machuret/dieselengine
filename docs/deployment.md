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

The gates that block publication:

| Gate | Applies to |
|---|---|
| `status: ready` in front matter | every page |
| A named author | every page |
| A named marine mechanic reviewer | symptom, engine-model and brand-symptom pages |

The reviewer gate is deliberately narrow. It applies to pages whose primary
content is diagnostic procedure — a differential diagnosis, or "what you can
check yourself" — where a wrong instruction hurts someone. Education, cost,
directory and index pages route the reader to a mechanic rather than
instructing them, so they publish on the author byline. Those pages are the
ones coming in waves 2 and 3; wave 1 has none of them.

### Placeholders

Neither kind reaches a reader as raw `{{...}}` — the post-build check fails the
build if one does.

`{{PRICE_TABLE:x}}` is **removed**. A service page missing its local price band
is still a complete explanation of the job.

`{{PROVIDERS:x}}` is **replaced with a note** saying listings are being
verified. It is announced rather than silently dropped because the reader
arrived looking for operators, and an unexplained gap reads as broken.

A location hub publishes without its listings because it is not an empty
directory page — it carries roughly 750 words of local substance (fleet mix,
water conditions, state rules, what to ask locally) that stands on its own and
that nothing else on the web covers. The operator shortfall is reported on
every build instead of blocking one.

See `remarkStripTokens` in `src/lib/remark-strip-tokens.mjs`.

## Current state

**59 routes, all 59 in the sitemap.** 57 content pages plus the homepage and
`/services/`.

Two things are outstanding on published pages, reported on every build:

**No named mechanic reviewer** (`defaultReviewer` is `null`). This does not
block wave 1, but it must be set before the wave 2 symptom pages and wave 3
engine pages are written — those cannot publish without it, by design. It is
also the E-E-A-T signal for a site giving repair advice.

```json
"defaultReviewer": "John Citizen, Licensed Marine Mechanic (Lic. 12345)"
```

Do not put a placeholder there. Per-page `author:` / `reviewed_by:` front matter
overrides the default.

**No operator data.** All 10 location hubs publish without listings. Building
`data/providers.csv` is the wave 2 critical path and is what turns them from
useful local guides into the referral pages they are meant to be.

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
