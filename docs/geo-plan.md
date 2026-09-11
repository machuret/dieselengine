# Geo plan: owning "marine diesel <city>" in Australia

Status: plan, 2026-09-11. Nothing in Phase 0 or later is built yet.

## 1. The problem this solves

"marine diesel brisbane" is a **head geo term with mixed intent**. Someone
typing it might want a mechanic, a price, an engine to buy, or an explanation.
Right now nothing on the site owns it:

| Live page | Targets | Owns the head term? |
|---|---|---|
| `/marine-mechanics/brisbane/` | marine diesel **mechanics** in Brisbane | No — service intent only |
| `/buy-marine-diesel-engine/brisbane/` | **buying** an engine in Brisbane | No — transactional only |

Both are good pages for their own query. Neither answers the bare one, and the
bare one is the widest-funnel local term in the category.

## 2. The bigger problem: cannibalisation

The existing keyword map plans **1,005 geo pages** — 555 city-service, 340
cost-city, 60 brand-city, 25 city-hub, 25 buying-city.

For Brisbane alone that is roughly **40 pages all containing "marine diesel" and
"Brisbane"**. Google picks one URL per query. When forty pages compete, it often
picks the wrong one, and the whole cluster loses authority rather than
accumulating it.

This is how most programmatic geo builds fail. The volume is not the asset — the
**intent separation** is.

So the governing rule for everything below:

> **One intent, one page, one city. If two pages could answer the same query,
> one of them should not exist.**

## 3. The architecture

A regional hub owns the ambiguous head term and routes to the specific ones.

```
/marine-diesel/<region>/                    ← REGIONAL HUB
│   owns: "marine diesel brisbane"
│   job: disambiguate + route. Real local substance, not a link farm.
│
├── /marine-mechanics/<region>/             ← "marine mechanic brisbane"        [live ×10]
├── /buy-marine-diesel-engine/<region>/     ← "buy marine engine brisbane"      [live ×25]
├── /services/<service>/<region>/           ← "impeller replacement brisbane"   [gated]
├── /engine-brands/<brand>/specialists/<region>/ ← "volvo penta brisbane"       [gated]
└── /marine-diesel/<region>/<precinct>/     ← "marine mechanic manly"           [new layer]
```

Every spoke links up to the hub. The hub links down to every spoke it has.
Nothing links sideways across regions except the nearest-neighbour block that
already exists.

### Why a new hub rather than retargeting an existing page

Retargeting `/marine-mechanics/brisbane/` to the head term would make it worse at
the query it already answers well, and would still leave the buying page
competing. A hub whose job is disambiguation is a different page with a
different purpose — and it is only legitimate if it carries real local content,
which is covered in §5.

## 4. The precinct layer is where the volume actually is

`marine mechanic manly`, `boat mechanic scarborough`, `marine diesel rivergate`,
`impeller pittwater`. Suburb and marina level.

This layer is better than more city-level pages for three reasons:

1. **Thin competition.** Nobody optimises for "marine mechanic Raby Bay".
2. **Genuine uniqueness.** A precinct page can describe the actual marina, the
   actual hardstand, the actual water, the actual access constraints. That is
   real content, not a spun city name.
3. **No cannibalisation.** A precinct query and a city query are different
   queries.

`data/precincts.csv` seeds **38 precincts across the 10 tier-1 regions** —
Coomera, Pittwater, Rivergate, Williamstown, Fremantle, Abell Point and so on.
Every row is marked `verify: PENDING`: the names are right, but facilities,
hardstand and lift capability must be confirmed before any page publishes.

### When a precinct does NOT get a page

Measured, not assumed. Building the first ten precinct pages showed a clean
split against their own region hub:

| Region | Precincts | Precinct vs region hub |
|---|---|---|
| Sydney | 6 | 0.9% |
| Brisbane | 5 | 3.0-5.5% |
| Cairns | 3 | 4.6% |
| Perth | 4 | 5.2% |
| Gold Coast | 5 | 5.8% |
| Melbourne | 5 | 7.0% |
| Port Stephens | 3 | 10.9% |
| **Whitsundays** | **2** | **20.0%** |
| **Sunshine Coast** | **2** | **20.9%** |

The rule that falls out: **where a region has one precinct of substance, the
precinct page and the region hub are the same page.** The Sunshine Coast hub is
about Mooloolaba because that is where everything is; the Whitsundays hub is
about Abell Point for the same reason.

Those two precinct pages were written and then deleted. Paraphrasing them apart
would have passed the overlap check and left two URLs competing for one query,
which is the failure this plan exists to prevent. `data/precincts.csv` marks
them NO PAGE so the decision is not re-made later.

That drops the realistic precinct ceiling from ~120 to roughly 100.

## 5. The doorway-page test

Google's guidance on doorway pages is the live risk for every geo build. Each
page must pass this before it ships:

> **Would this page still be worth reading if the city name were removed?**

If the answer is no, it is a doorway page and it should not exist.

Concretely, each geo page must carry **at least 400 words that are true of that
place and false of the next place**. The existing buying pages clear this — the
measured maximum trigram overlap across all 25 is 5.1%. That is the standard to
hold, and it should be measured on every batch, not assumed.

Material that genuinely differentiates:

- The actual water: silt, sand, weed, temperature, tidal range, salinity
- The actual infrastructure: which yards, what lift capacity, tide-dependent access
- The actual fleet: charter, commercial, trailer boat, cruising
- The actual supply chain: freight, parts holding, who is two hours away
- The actual calendar: cyclone season, winter layup, fishing season, boat shows

Material that does not, and must never be the bulk of a page:

- The same paragraph with the city name swapped
- Population and general tourism facts
- Generic engine advice already on a national page

## 6. Schema: do not fake LocalBusiness

This site has no physical presence in any of these cities. Emitting
`LocalBusiness` markup for a place we do not operate in is a spam signal and
risks a manual action.

- **Regional hub and precinct pages:** `Article` + `Place` + `BreadcrumbList`,
  with `Place` carrying real coordinates from `cities.csv` / `precincts.csv`
- **Directory pages, once operators are verified:** the operators themselves are
  the `LocalBusiness` entities, listed as an `ItemList` — never the site
- **FAQPage** where the page carries a real Q&A block

This is already how the buying and mechanic pages behave. Keep it.

## 7. The gate math, honestly

The plan's 555 city-service pages require **5 verified operators each** under the
current publish gate. That is 2,775 verified operator relationships. Across
Australia's marine trade, that number does not exist to be collected.

Similarly, 340 cost-city pages each need a sourced local price band. There is
currently **no price data at all** — 108 unresolved `{{PRICE_TABLE}}` tokens
across the live site.

**The 1,005-page geo plan cannot ship as specified.** Two options:

**(a) Change the page, not the gate.** Rewrite city-service pages so the job
explanation and the local conditions are the content, and verified operators are
an addition rather than the reason to exist. Then the gate drops to 0 and the
pages are honest. This is what the buying pages already do.

**(b) Keep the gate and cut the count.** Publish only where operators exist.

**Recommendation: (a) for services, (b) for anything that promises a directory.**
A page titled "Marine Diesel Mechanics in Brisbane" promises a list and must have
one. A page titled "Impeller Replacement in Brisbane" promises an explanation of
the job in local conditions, and can stand without one.

### Realistic geo ceiling

| Layer | Planned | Realistic | Why |
|---|---|---|---|
| Regional hubs | 0 | **25** | New; one per region |
| Buying pages | 25 | **25** | Live |
| Mechanic hubs | 25 | **25** | 10 live; gated on operators |
| Precinct pages | 0 | **38 → ~120** | Tier 1 seeded; expandable |
| City-service | 555 | **~80** | Top 8 services × tier 1, rewritten per (a) |
| Brand-city | 60 | **~50** | Gated on operators |
| Cost-city | 340 | **0** | Blocked until price data exists |
| **Total** | **1,005** | **~325** | |

325 well-differentiated geo pages will outperform 1,005 thin ones, and it is the
number that can actually be built without fabricating anything.

## 8. Sequencing

**Phase 0 — architecture (no new content).** Add the `/marine-diesel/<region>/`
route and section, wire the hub-and-spoke internal linking, add the overlap
measurement to the build report so cannibalisation is visible rather than
discovered. ~1 day.

**Phase 1 — 10 tier-1 regional hubs.** Gold Coast, Sydney, Brisbane, Sunshine
Coast, Melbourne, Perth, Whitsundays, Cairns, Port Stephens, Adelaide. These are
the head-term pages. Each ~800 words of genuinely local material.

**Phase 2 — 15 tier-2 regional hubs.** Same pattern, completing the 25.

**Phase 3 — precinct pages, tier 1 only.** The 38 seeded precincts, after
verifying facilities. This is the phase with the most upside and the most
research per page.

**Phase 4 — city-service, rewritten.** Top 8 services × 10 tier-1 regions = 80.
Only after the service page template is rewritten per §7(a).

**Phase 5 — brand-city and cost-city.** Both blocked on data that does not exist
yet. Do not start these until operators and prices do.

## 9. What must be true before Phase 1 starts

- [ ] **`contactEmail` points at a monitored mailbox.** Geo pages attract listing
      requests and corrections, and the privacy page commits to responding.
- [ ] Precinct facilities verified for any precinct page (Phase 3).
- [ ] Operator data collection under way, or the mechanic hubs stay `noindex`
      and the regional hubs must not link to them as if they were directories.

## 10. Measurement

Per-section, not site-wide — an average across 200 pages hides everything.

- **Google Search Console, filtered by URL path**, one row per section. The
  question is whether `/marine-diesel/` earns impressions for bare city terms.
- **Cannibalisation check:** for each head term, how many of our URLs appear?
  More than one means the architecture is leaking.
- **Overlap metric in the build report:** maximum trigram overlap within each
  geo section, failing the build above a threshold. Cheap, automatic, and it
  catches template drift before publication rather than after indexing.
- **Do not judge before 12 weeks.** New geo pages on a young domain take a
  quarter to settle, and reacting at week 3 produces churn, not rankings.
