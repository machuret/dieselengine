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

**72 routes, all 72 in the sitemap.** 57 content pages, 9 question cluster
pages, and 6 hand-written routes (home, services index, question hub, HTML site
index, privacy, terms).

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


## SEO surface

Derived from the markdown rather than hand-maintained, in `src/lib/extract.js`:

| | How |
|---|---|
| Title tag | `seo_title` front matter, else the page title with " in Australia" trimmed; the brand is appended only if the result stays under 60 characters |
| Meta description | First real paragraph, truncated at a sentence boundary near 155 characters |
| FAQ schema | The "Frequently asked questions" section is parsed into `FAQPage` JSON-LD — 265 Q&A pairs across 57 pages |
| Question pages | The same Q&As, deduplicated and grouped into 9 topic clusters at `/questions/{topic}/` |
| Geo schema | `Place`, `PostalAddress` and `GeoCoordinates` on location hubs, from the lat/lon columns in `data/cities.csv` |
| Related links | Service pages relate by their `cluster` column; location hubs by great-circle distance |

Both were previously broken rather than merely absent: every page served the
same site-wide meta description, and every title ran past what a search result
shows.

### Why questions are clustered, not one page each

265 individual question pages was the obvious reading of "unique URLs", but the
answers run 25-35 words. That many pages of that length is a doorway-page
pattern, which is penalised rather than rewarded. Nine cluster pages each carry
9-63 substantial answers, are internally linked from every related page, and
carry `FAQPage` markup for the whole set.

The answers also remain on their source pages, where readers expect them. That
overlap is deliberate: the cluster page targets topic-level questions, the
service page targets the head term, and each answer links back to its full
guide.

### AI crawlers

`robots.txt` allows 19 named AI agents explicitly, and `/llms.txt` gives a
plain-text map of the site. The llms.txt carries a "context for summarising"
block stating what this site is not — it does not do the work, prices are not
quotes, and safety instructions must survive summarisation. To reverse the
policy, change the entries in `src/pages/robots.txt.js` to `Disallow`. Note that
`Google-Extended` governs Gemini training only; disallowing it does not affect
Googlebot or ordinary search indexing.
