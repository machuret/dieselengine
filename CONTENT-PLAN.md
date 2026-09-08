# Diesel Engine AU — Content Expansion Plan

**Goal:** 3x the site's page count and capture the widest possible long-tail
keyword footprint across Australia's top 10 cities, diesel engine brands, and
fault/symptom searches.

**Business model this plan is built for:** an *educational* diesel resource that
does not sell repairs. Revenue comes from routing an informed reader to a
provider. That single fact drives every decision below — most importantly, it
means our money pages are not "book a service" pages, they are **decision pages**
that end in a referral.

---

## 1. The strategic read

An education-and-referral site competes in a market where every workshop in the
country is already bidding on "diesel mechanic {city}". We do not win that fight
head-on with 10 city pages. We win it by owning three things nobody else owns at
scale:

1. **Engine-level specificity.** Workshops write about services. Almost nobody in
   Australia writes a proper page about a *1KD-FTV* or a *4JJ1-TC* or a *ZD30DDTi*.
   These are low-competition, high-intent, and durable — an engine code doesn't
   get rebranded.
2. **Symptom-first entry.** People don't search "diesel injector replacement".
   They search "hilux blowing black smoke". Symptom pages catch the reader
   *before* they know what they need, which is exactly where a referral site
   should sit.
3. **Cost transparency.** "How much does X cost in Australia" is the single
   highest-converting informational intent for a referral model, and the pages
   that rank for it today are thin. Real price ranges are our moat.

Geography (top 10 cities) is the *multiplier* applied to those three, not the
strategy itself. A city page with no unique local substance is a liability in
2026, not an asset.

## 2. Site architecture

```
/                                   Home
├── /diesel-engines/                PILLAR — how diesel engines work
├── /find-a-diesel-mechanic/        PILLAR — directory entry point
│   └── /diesel-mechanics/{city}/            City hub  (25)
├── /services/{service}/            Service national page (35)
│   └── /services/{service}/{city}/          City × service (446)
├── /diesel-problems/               PILLAR — symptom hub
│   └── /diesel-problems/{symptom}/          Symptom page (35)
├── /engine-brands/                 PILLAR — brand hub
│   └── /engine-brands/{brand}/              Brand hub (30)
│       ├── /{engine-family}/                Engine model page (92)
│       ├── /problems/{symptom}/             Brand × symptom (33)
│       └── /specialists/{city}/             Brand × city (60)
├── /costs/                         PILLAR — cost hub
│   ├── /costs/{service}/                    National cost page (26)
│   └── /costs/{service}/{city}/             City cost page (260)
└── /guides/{topic}/                Decision & education guides (26)
```

**URL rules:**
- Service-first, city-second (`/services/dpf-cleaning/brisbane/`), not
  city-first. It keeps one canonical parent per service and makes the
  service the crawl-priority node.
- Every URL is a directory with a trailing slash. No `.html`, no dates,
  no `/blog/` prefix — nothing that signals "this content decays".
- One page, one primary keyword. No two pages in `keyword-map.csv` share a
  primary keyword; the generator asserts URL uniqueness.

## 3. The build: 6 waves, 1,073 pages

Run `python3 scripts/generate_keyword_map.py` to regenerate
`data/keyword-map.csv` (one row per page: URL, title, primary keyword,
secondary keywords, priority, internal-link parent, publish gate).

| Wave | What | Pages | Cumulative | Why this order |
|---|---|---:|---:|---|
| 1 | Pillars + 35 service pages + 10 tier-1 city hubs | 50 | 50 | Nothing else can rank without a parent to link from |
| 2 | City × service (tier 1) + 35 symptom pages + 26 guides | 312 | 362 | The commercial core and the top-of-funnel net |
| 3 | 30 brand hubs + 92 engine model pages | 122 | 484 | The durable moat; lowest competition per page |
| 4 | 15 tier-2 cities + their top services | 210 | 694 | Geographic depth once the model is proven |
| 5 | Brand × city + brand × symptom | 93 | 787 | Compound long tail on proven entities |
| 6 | Cost pages, national and per city | 286 | 1,073 | Highest conversion; needs price data collected during waves 1–5 |

**Where 3x lands.** If the site is currently at *N* pages, stop after the wave
whose cumulative total reaches 3N. Waves 1–3 (484 pages) triples a ~160-page
site; all six waves triple a ~350-page site. The waves are ordered so that
stopping early still leaves a complete, internally coherent site — never a
half-built section.

### Cadence

A realistic pace with one editor and one technical reviewer:

- **Months 1–2:** Wave 1 (50 pages). Hand-written, no templating shortcuts.
  These set the quality bar every later page is measured against.
- **Months 3–5:** Wave 2 (312 pages) at ~25/week.
- **Months 6–7:** Wave 3 (122 pages) at ~15/week — slower, because engine pages
  need a mechanic to review them.
- **Months 8–10:** Wave 4 (210 pages).
- **Months 11–12:** Waves 5–6 (379 pages), gated on the data collected earlier.

## 4. Publish gates — the part that decides whether this works

Programmatic page sets fail for one reason: they ship pages with nothing unique
on them. Every generated page carries a gate in `keyword-map.csv`, and a page
that cannot clear its gate **does not get published** — it gets folded into its
parent as a section instead.

| Page type | Gate |
|---|---|
| City hub | ≥ 10 verified local providers, with suburb coverage listed |
| City × service (tier 1) | ≥ 5 verified providers offering that specific service |
| City × service (tier 2) | ≥ 3 verified providers |
| Cost × city | ≥ 5 real local quotes; otherwise fold into the national cost page |
| Engine model | Engine-specific fault list, not a rewrite of the brand page |
| Brand × symptom | The fault must be genuinely characteristic of that brand |
| Brand × city | ≥ 3 providers who actually specialise in that brand |

Folding is not failure. A national cost page with a "prices in Perth" section is
worth more than an empty Perth cost page.

### Unique-substance requirements

Each page type must carry at least one element that exists nowhere else on the
site:

- **City pages:** named suburbs served, local provider count, state-specific
  regulation (e.g. NSW vs QLD roadworthy/safety inspection differences),
  a local price band, and the market note from `data/cities.csv` (Perth's
  mining fleet, Canberra's European diesel share, Sunshine Coast's marine and RV
  demand). Generic "Sydney is Australia's largest city" filler is banned.
- **Engine pages:** displacement, configuration, injection system, known failure
  modes with the mileage band they typically appear at, which Australian
  vehicles it was fitted to, and what a rebuild costs here.
- **Symptom pages:** a differential-diagnosis table — symptom → likely causes
  ranked by probability → what a workshop will charge to diagnose it.
- **Cost pages:** a real range with parts/labour split and the assumptions behind
  it, dated and re-checked every 6 months.

## 5. Page templates

Written out in `templates/`. Each specifies section order, word-count band,
schema markup, internal links, and the referral CTA:

- `templates/city-hub.md`
- `templates/city-service.md`
- `templates/engine-model.md`
- `templates/symptom.md`
- `templates/cost.md`
- `templates/guide.md`

## 6. Internal linking

Link equity is the whole game on a site this size. Rules:

1. **Every page links up** to its `internal_link_parent` from
   `keyword-map.csv`, in the body copy, not just a breadcrumb.
2. **Every symptom page links across** to the service page in its
   `maps_to_service` column, and down to the 3–5 brand × symptom pages that
   exist for it.
3. **Every city page links sideways** to the 3 nearest cities in the same state,
   and down to every city × service page beneath it.
4. **Every engine page links** to its brand hub, to the 2–3 symptom pages for its
   characteristic faults, and to the relevant cost page.
5. **Pillars link down to everything**, service and symptom hubs included; this
   is what keeps 1,073 pages within 3 clicks of the home page.
6. **Cap outbound internal links at ~40 per page.** City hubs with 30+ children
   need pagination or grouping, not a wall of links.

Breadcrumb schema on every page. An XML sitemap **per section**
(`/sitemap-cities.xml`, `/sitemap-engines.xml`, …) so indexing problems are
diagnosable per page type rather than site-wide.

## 7. Schema markup

| Page type | Schema |
|---|---|
| City hub, city × service | `LocalBusiness` list + `BreadcrumbList` + `FAQPage` |
| Engine model | `Product`/`TechArticle` + `FAQPage` |
| Symptom | `TechArticle` + `FAQPage` + `HowTo` where diagnosis steps are safe to give |
| Cost | `TechArticle` + `FAQPage` — do **not** use `Offer`; we don't sell |
| Guide | `Article` + `FAQPage` |

Every page gets `author` and `reviewedBy` with a named person and their trade
credentials. For a site giving repair advice this is not optional — it is the
difference between being treated as a resource and being treated as a content
farm.

## 8. Provider data — the asset that makes this defensible

The city and city × service pages are only as good as the provider data behind
them. Build `data/providers.csv` with: business name, suburb, city, state,
services offered, engine brands specialised in, ABN, licence number, phone,
website, verification date, referral relationship (paid / unpaid / none).

- **Verify before listing.** An unverifiable business is a liability.
- **Disclose the commercial relationship** on every page where a paid referral
  appears. Under Australian Consumer Law, an undisclosed paid placement
  presented as a recommendation is misleading conduct. Put the disclosure above
  the listing, not in the footer.
- **Re-verify every 6 months.** Dead listings kill trust faster than thin
  content kills rankings.

## 9. Compliance guardrails

This site tells people how to fix engines and who to hire. Three specific risks:

1. **DPF/emissions content.** Removing or defeating a DPF is illegal for
   road-registered vehicles in Australia and attracts penalties under state
   EPA legislation. The `dpf-delete-legality` page must be written as a
   compliance explainer, never as a how-to, and must not link to providers
   offering removal. Same posture for EGR deletes and emissions-defeat tuning.
2. **Repair advice.** Every symptom page carries a clear line on what is safe to
   check yourself versus what requires a licensed mechanic. Fuel-system work on
   common rail systems runs at extreme pressure — the pages must say so.
3. **Tuning content.** ECU remapping can void warranty and breach ADR compliance
   and insurance conditions. State it on every tuning page.

Have a licensed diesel mechanic review the technical content. Their name goes on
the pages — that is the E-E-A-T signal, and it is also the thing that keeps the
advice correct.

## 10. Measurement

Track per **page type**, not sitewide. A wave that adds 300 pages will move
sitewide averages regardless of whether it worked.

- **Leading (weeks 2–8):** indexation rate per page type, impressions per page,
  unique queries per page (the real long-tail measure — target 15+ per page by
  month 3).
- **Lagging (months 3–9):** clicks per page type, referral clickthroughs to
  providers, and the ratio of long-tail (4+ word) to head-term impressions.
- **Health:** pages with zero impressions after 90 days. If more than 20% of a
  page type is dead, that type's gate was too loose — tighten it and consolidate
  before building more of it.

**Kill criterion.** Any page with zero impressions at 6 months gets merged into
its parent and 301'd. Plan for pruning from day one; a 1,073-page site that
never prunes becomes a 1,073-page site with a crawl-budget problem.

## 11. Risks, stated plainly

- **Thin-content penalty.** The single biggest risk. Mitigated by the gates in
  §4 — but only if they are actually enforced. If the team starts publishing
  ungated pages to hit a weekly number, this plan fails.
- **Provider data decay.** Mitigated by 6-month re-verification.
- **Editorial capacity.** 1,073 pages at genuine quality is a 12-month programme
  for a small team, not a quarter. Waves 1–3 alone (484 pages) are a credible
  and complete outcome; treat waves 4–6 as an extension, not a commitment.
- **Cost data accuracy.** Wrong prices destroy credibility. Date every figure
  and cite the basis.

---

## Data files

| File | Contents |
|---|---|
| `data/cities.csv` | 25 cities, tier 1 (top 10) and tier 2, with market notes |
| `data/services.csv` | 35 services with intent, cluster, commercial value |
| `data/engine-brands.csv` | 30 brands, 92 engine families, AU relevance scores |
| `data/symptoms.csv` | 35 symptom entry points mapped to services |
| `data/decision-topics.csv` | 26 cost, comparison, buyer-guide and education topics |
| `data/keyword-map.csv` | **Generated** — 1,073 planned pages |
| `data/wave-summary.csv` | **Generated** — page counts per wave and type |

Edit the source CSVs and re-run the generator; never hand-edit the generated
files.

> **Verify before publishing:** the engine families in `data/engine-brands.csv`
> are a working list for planning. Confirm every engine code, fitment and spec
> against manufacturer documentation before it goes on a page.
