# marinedieselengine.com.au — Content Plan

**Goal:** capture the widest possible long-tail keyword footprint in Australian
marine diesel search, across boating regions, marine engine brands and the faults
boat owners actually search for.

**Business model this plan is built for:** an *educational* marine diesel
resource that does not sell repairs. Revenue comes from routing an informed
owner to a workshop. That single fact drives every decision below — our money
pages are not "book a service" pages, they are **decision pages** that end in a
referral.

---

## 1. The strategic read

Marine diesel is a far better market to compete in than automotive diesel, and
the reason is supply, not demand. Every workshop in Australia writes about "car
servicing". Very few write about a `4JH4-TE`, a corroded exhaust elbow, or what a
saildrive diaphragm interval actually means. The information available to
Australian boat owners is thin, scattered across forums, and frequently wrong.

Three things are ours to own:

1. **Marine-specific faults.** Impeller failure, exhaust elbow corrosion, heat
   exchanger blockage, diesel bug, hydrolock through the exhaust, saildrive
   seals, anode wastage. These have no automotive equivalent, which means no
   automotive site competes for them and the searcher has nowhere good to go.
2. **Engine-level specificity.** Volvo Penta D-series, Yanmar JH and YM,
   Cummins QSB, and the Kubota blocks under Beta, Nanni, Craftsman and Solé.
   Engine codes don't get rebranded, and almost nobody covers them properly for
   an Australian audience.
3. **Cost transparency.** "What does a repower cost in Australia" is the
   highest-converting informational intent for a referral model, and the pages
   ranking today are thin. Real, dated price ranges are our moat.

Geography multiplies those three. It is not the strategy on its own — a location
page with no unique local substance is a liability, not an asset.

### What makes marine geography different

Marine locations are boating regions, not population centres. Canberra has no
fleet. The Gold Coast, with a fraction of Sydney's population, is Australia's
largest marine industry hub. Whitsundays and Cairns matter far beyond their size
because of charter and commercial fleets.

Fleet mix, not population, also decides which service pages a location gets — see
the segment gates in §4.

## 2. Site architecture

```
/                                        Home
├── /marine-diesel-engines/              PILLAR — how marine diesels work
├── /find-a-marine-mechanic/             PILLAR — directory entry point
│   └── /marine-mechanics/{location}/            Location hub (25)
├── /services/{service}/                 Service national page (42)
│   └── /services/{service}/{location}/          Location × service (~546)
├── /marine-engine-problems/             PILLAR — symptom hub
│   └── /marine-engine-problems/{symptom}/       Symptom page (35)
├── /engine-brands/                      PILLAR — brand hub
│   └── /engine-brands/{brand}/                  Brand hub (30)
│       ├── /{engine-family}/                    Engine model page (116)
│       ├── /problems/{symptom}/                 Brand × symptom (34)
│       └── /specialists/{location}/             Brand × location (60)
├── /costs/                              PILLAR — cost hub
│   ├── /costs/{service}/                        National cost page (33)
│   └── /costs/{service}/{location}/             Location cost page (330)
└── /guides/{topic}/                     Decision & education guides (26)
```

**URL rules:**
- Service-first, location-second (`/services/impeller-replacement/gold-coast/`).
  One canonical parent per service, and the service is the crawl-priority node.
- Every URL is a directory with a trailing slash. No dates, no `/blog/` — nothing
  that signals decay.
- One page, one primary keyword. The generator asserts URL uniqueness.

## 3. The build: 6 waves

Run `python3 scripts/generate_keyword_map.py` to regenerate
`data/keyword-map.csv` — one row per page with URL, title, primary keyword,
secondary keywords, priority, internal-link parent and publish gate.

| Wave | What | Pages | Cumulative |
|---|---|---:|---:|
| 1 | 5 pillars + 42 service pages + 10 tier-1 location hubs | 57 | 57 |
| 2 | Location × service (tier 1) + 35 symptoms + 26 guides | ~370 | ~427 |
| 3 | 30 brand hubs + 116 engine model pages | 146 | ~573 |
| 4 | 15 tier-2 locations + their top services | ~249 | ~822 |
| 5 | Brand × location + brand × symptom | 94 | ~916 |
| 6 | Cost pages, national and per location | ~363 | ~1,279 |

Wave 1 is **complete** — see `content/`.

The waves are ordered so stopping early still leaves a coherent site. Waves 1–3
(~573 pages) are a complete and credible outcome on their own; treat 4–6 as
extension.

### Cadence

Realistic with one editor and one technical reviewer:

- **Months 1–2:** Wave 1 (57 pages), hand-written. Sets the quality bar.
- **Months 3–5:** Wave 2 at ~25/week.
- **Months 6–7:** Wave 3 at ~15/week — slower; engine pages need mechanic review.
- **Months 8–10:** Wave 4.
- **Months 11–12:** Waves 5–6, gated on data collected earlier.

## 4. Publish gates — the part that decides whether this works

Programmatic page sets fail for one reason: they ship pages with nothing unique
on them. **These gates are enforced by the build**, not by memory — see
`src/lib/gates.js` and `docs/deployment.md`. A page that fails a gate is still
built and served (no dead URLs) but is `noindex` and excluded from the sitemap.

| Page type | Gate |
|---|---|
| Location hub | ≥ 10 verified local operators, with marina coverage listed |
| Location × service (tier 1) | ≥ 5 verified operators offering that service |
| Location × service (tier 2) | ≥ 3 verified operators |
| Cost × location | ≥ 5 real local quotes; else fold into the national cost page |
| Engine model | Engine-specific fault data, not a rewrite of the brand page |
| Brand × symptom | The fault must be characteristic of that brand's engines |
| Brand × location | ≥ 3 operators who genuinely specialise in that brand |

Folding is not failure. A national cost page with a "prices in Perth" section
beats an empty Perth cost page.

### Fleet-segment gates

The generator will not create a location × service page where that part of the
fleet does not exist. A winterisation page in Cairns or a charter fleet page in
Geelong would be fiction. The gates in `scripts/generate_keyword_map.py`:

- **commercial** — a working fleet large enough to support survey-vessel work
- **charter** — bareboat, game and reef charter operators
- **sailing** — a keelboat fleet, so saildrives and small auxiliaries
- **cold_layup** — a real winter layup season (excludes Queensland and the tropics)
- **slipway** — a haul-out facility, without which below-waterline work isn't local

`EXTRA_CITY_SERVICE` is the only way past the commercial-value gate, and every
entry carries a stated reason. Keep it short and auditable.

### Unique-substance requirements

- **Location pages:** named marinas and precincts, operator count, the local
  fleet mix, the state's recreational authority, a local price band, and the
  local mechanism from `data/cities.csv` — Brisbane River silt shortening raw
  water intervals, Cairns tropical water cutting cooling margin, Perth parts lead
  time. Generic "X is a popular boating destination" filler is banned.
- **Engine pages:** displacement, configuration, cooling arrangement, drive
  types, known failure modes with the hours band they appear at, Australian
  fitment, parts and dealer support, and rebuild cost here.
- **Symptom pages:** a differential-diagnosis table — symptom → likely causes
  ranked by probability → how a mechanic confirms each → cost. Plus an explicit
  "is it safe to keep going" answer near the top.
- **Cost pages:** a real range with parts/labour split, the access assumption
  stated, dated and re-checked every 6 months.

## 5. Page templates

In `templates/`: `location-hub.md`, `location-service.md`, `engine-model.md`,
`symptom.md`, `cost.md`, `guide.md`. Each specifies section order, word band,
schema, internal links and the referral CTA.

## 6. Internal linking

1. Every page links up to its `internal_link_parent`, in body copy not just a
   breadcrumb.
2. Every symptom page links across to its `maps_to_service` page and down to the
   brand × symptom pages that exist for it.
3. Every location page links sideways to nearby locations and down to its
   children.
4. Every engine page links to its brand hub, its characteristic symptom pages,
   and the relevant cost page.
5. Pillars link down to everything, keeping the whole site within 3 clicks.
6. Cap outbound internal links at ~40 per page.

Breadcrumb schema everywhere. Per-section XML sitemaps so indexing problems are
diagnosable per page type — implemented in `src/pages/sitemap-[section].xml.js`.

## 7. Schema markup

| Page type | Schema |
|---|---|
| Location hub, location × service | `LocalBusiness` list + `BreadcrumbList` + `FAQPage` |
| Engine model | `TechArticle` + `FAQPage` |
| Symptom | `TechArticle` + `FAQPage`; `HowTo` only for safe self-checks |
| Cost | `TechArticle` + `FAQPage` — **no `Offer`**; we don't sell |
| Guide | `Article` + `FAQPage` |

Every page carries `author` and `reviewedBy` with a named person and trade
credentials. For a site giving repair advice this is not optional.

## 8. Operator data — the asset that makes this defensible

Build `data/providers.csv`: business name, marinas and precincts covered,
location, state, services, engine brands and dealer authorisations, whether they
attend moorings, licence or accreditation, contact, verification date, referral
relationship (paid / unpaid / none).

Marine-specific fields that matter: **which marinas they cover** (coverage is
genuinely patchy, especially in Sydney), **whether they attend swing moorings**,
and **which marinas require contractor registration**.

- **Verify before listing.** An unverifiable business is a liability.
- **Disclose paid placement** above the listing, not in the footer. Undisclosed
  paid placement presented as a recommendation is misleading conduct under
  Australian Consumer Law.
- **Re-verify every 6 months.**

This is the critical path for waves 2, 4 and 6.

## 9. Compliance guardrails

1. **Commercial vessels.** Domestic commercial vessels operate under the national
   system administered by AMSA. Every reference to survey, maintenance or
   record-keeping obligations must be checked against current instruments and
   written as orientation, not compliance advice. All such pages carry
   `compliance_review: required`.
2. **State recreational authorities** differ by state and are named on each
   location hub. Verify each before publish.
3. **Safety advice.** Marine faults carry consequences a road fault does not —
   hydrolock, fire from an overheated exhaust hose, flooding through a failed
   shaft seal or bellows. Symptom pages must answer "is it safe to keep going"
   near the top, and must say plainly when the answer is no.
4. **Never advise cranking a suspected hydrolocked engine.**

Have a licensed marine mechanic review the technical content. Their name goes on
the pages — that is the E-E-A-T signal and the thing that keeps the advice right.

## 10. Measurement

Track per **page type**, not sitewide.

- **Leading (weeks 2–8):** indexation rate per page type, impressions per page,
  unique queries per page — target 15+ per page by month 3.
- **Lagging (months 3–9):** clicks per page type, referral clickthroughs, and the
  ratio of long-tail (4+ word) to head-term impressions.
- **Health:** pages with zero impressions after 90 days. If more than 20% of a
  page type is dead, that type's gate was too loose — tighten and consolidate
  before building more.

**Kill criterion.** Zero impressions at 6 months → merge into parent and 301.

## 11. Risks, stated plainly

- **Thin content.** The biggest risk, mitigated by the gates in §4 — which are
  now enforced by the build rather than by discipline.
- **Operator data decay.** Mitigated by 6-month re-verification.
- **Editorial capacity.** ~1,279 pages at genuine quality is a 12-month programme
  for a small team, not a quarter.
- **Cost data accuracy.** Wrong prices destroy credibility permanently. Date
  every figure and state the access assumption.
- **Engine specification accuracy.** The engine families in
  `data/engine-brands.csv` are a working planning list. Verify every model code,
  fitment and specification against manufacturer documentation before publishing.

---

## Data files

| File | Contents |
|---|---|
| `data/cities.csv` | 25 boating regions, tier 1 (top 10) and tier 2 |
| `data/services.csv` | 42 marine services with intent, cluster, commercial value |
| `data/engine-brands.csv` | 30 marine brands, 116 engine families |
| `data/symptoms.csv` | 35 marine symptom entry points mapped to services |
| `data/decision-topics.csv` | 26 cost, comparison, buyer-guide and education topics |
| `data/keyword-map.csv` | **Generated** — the full planned page set |
| `data/wave-summary.csv` | **Generated** — counts per wave and type |

Edit the source CSVs and re-run the generator; never hand-edit generated files.
