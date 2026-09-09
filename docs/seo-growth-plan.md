# Organic growth plan — marinedieselengine.com.au

Goal: maximise indexed, ranking pages for Australian marine diesel search.

Current state: **72 routes live**, 1,245 pages already planned but unwritten,
and roughly 1,765 more available in layers not yet in the plan. Ceiling is about
**3,000 pages**.

---

## 0. The constraint is not ideas

Page count is the easy part. Three things actually decide whether this works,
and only one of them is content volume.

**Indexation, not publication.** A domain with no history does not get 3,000
pages indexed because it published 3,000 pages. Google crawls a new site
conservatively and forms a quality judgement from the first few hundred URLs it
sees. Publishing everything at once is the reliable way to have most of it
ignored and the site classed as a content farm. **Sequencing beats volume**, and
this plan is ordered accordingly.

**Links.** The site currently has essentially no backlinks. Below a threshold of
authority, additional pages compete for a crawl budget that isn't there. Section
6 is not optional garnish — it is the difference between 300 ranking pages and
3,000 ignored ones.

**Verified operator data.** Still zero rows. It gates 615 planned pages, and it
is the only part of this site a competitor cannot replicate by writing harder.

No keyword volumes appear in this plan because I have no keyword tool access.
Every "validate" note below means exactly that: check it in Search Console, Ahrefs
or Semrush before committing writing time.

---

## 1. Phase 0 — unblock and instrument (weeks 1–2, 0 new pages)

Nothing else matters until these are done.

| Task | Why |
|---|---|
| Name a licensed marine mechanic as `defaultReviewer` | Blocks all 35 symptom and 116 engine pages by design. It is also the E-E-A-T signal for repair advice. |
| Point `contactEmail` at a real mailbox | The privacy page commits to responding there. |
| Verify Search Console + Bing Webmaster, submit `/sitemap.xml` | You cannot sequence indexation you cannot see. |
| Set up rank tracking on 50 seed terms | Baseline before the first wave lands. |
| Run PageSpeed on 3 page types | The site is static and fast; confirm it, then stop worrying about it. |

**Validate before writing anything:** pull Search Console impression data after
4 weeks on the 42 live service pages. Which queries are already surfacing tells
you which of the layers below to build first, and it is real data rather than
my judgement.

---

## 2. Phase 1 — the 207 pages with no data dependency (months 1–3)

The original plan's wave numbering mixes pages that need operator data with
pages that need nothing. That ordering is wrong for a site that has neither
operator data nor price data yet. **Reordered by dependency:**

| Set | Pages | Why first |
|---|---:|---|
| Symptom pages | 35 | Highest intent, lowest competition. Nobody in Australia writes "no water coming out of the exhaust" properly. Needs the reviewer, nothing else. |
| Decision guides | 26 | Repower-vs-rebuild, survey checklists, cost explainers. Attracts links. |
| Engine model pages | 116 | **The moat.** `4JH4-TE`, `D2-55`, `QSB 6.7`. Engine codes never get rebranded, and almost nobody covers them for an Australian audience. |
| Brand hubs | 30 | Parents for the engine pages. |

**207 pages, ~280 including what is live. That is a complete, defensible site**
and the right size to prove indexation before scaling.

Engine pages are the highest-value writing on this list and the slowest — each
needs verified specs, Australian fitment and real failure patterns at known hour
bands. Budget 3–4 hours each and have the mechanic review them. **Do not
generate these from templates**; a fabricated spec table is worse than no page.

Example targets to validate: `yanmar 3ym30 problems`, `volvo penta d2-55
overheating`, `cummins qsb 6.7 marine specs`, `4jh4-te impeller`,
`beta marine 43 review`.

---

## 3. Phase 2 — the marina layer (months 3–6, ~310 pages)

**The biggest untapped geographic surface, and it is specific to marine.**

The site has 25 boating regions. Below that sit roughly 400 Australian marinas
and boat harbours, and boat owners search at that level — `marine mechanic
Coomera`, `boat mechanic Mooloolaba`, `diesel mechanic Pittwater`,
`Rivergate marine services`.

A marina page can carry genuinely unique data that exists nowhere else in one
place:

- berth count, maximum LOA and beam, controlling depth at low water
- hardstand, travel-lift capacity, whether there is a slipway on site
- fuel dock, whether diesel is available and at what hours
- contractor access rules — several marinas restrict who may work on site,
  which is the single most useful and least-published fact for an owner
- which operators actually cover it
- the nearest haul-out if there is none on site

That is a reference page, not a doorway page. Build `data/marinas.csv` with
those columns.

| Set | Pages | Gate |
|---|---:|---|
| Marina hubs (significant marinas) | ~150 | Berth count, access data and contractor rules verified |
| Marina × 4 core services (top 40 marinas) | ~160 | ≥3 operators covering that marina |

Start with the 20 marinas in the Coomera/Gold Coast corridor and Pittwater —
highest density of boats and of search.

---

## 4. Phase 3 — the engine long tail (months 4–9, ~990 pages)

Once the 116 engine pages exist and are indexing, they become parents for the
deepest long tail on the site.

| Set | Pages | Note |
|---|---:|---|
| Engine × core service | 726 | 66 engines (relevance ≥4) × 11 core services. `yanmar 4jh impeller replacement`, `d2-55 heat exchanger service` |
| Engine × characteristic fault | 264 | 4 per engine, only where the fault is genuinely characteristic of that engine |

**Gate hard.** These publish only where the page can say something specific to
that engine — the impeller part number, the actual interval, the known failure
at a known hour band. An engine × service page that restates the national
service page with a model number swapped in is the exact thing that gets a site
demoted. Expect to publish perhaps 60% of the theoretical cross product, and
treat that as success rather than shortfall.

---

## 5. Phase 4 — the remaining layers (months 6–12, ~1,290 pages)

In descending order of return:

| Set | Pages | Depends on |
|---|---:|---|
| Location × service | 555 | **Operator data** |
| Cost pages (national + location) | 374 | **Price data** — 5+ real quotes per service |
| Brand × service | 240 | Nothing; moderate value |
| Boat-type × topic | 140 | 14 vessel types (cruising yacht, catamaran, trawler, sportfisher, houseboat, charter cat, RIB, commercial fishing…) |
| Brand × location | 60 | Operator data + dealer authorisations |
| Repower comparisons | 60 | `beta 43 vs nanni n4.38`, `d2-55 vs 3ym30` — repower shoppers search these by name |
| Glossary terms | 25 | Only terms with validated volume; the rest stay in one glossary page |

---

## 6. Links — the part that actually decides ranking

Content volume without links produces indexed pages that rank on page 4. Build
assets people cite, then tell the people who would cite them.

**Linkable assets** (build these deliberately, not as a by-product):

1. **Impeller cross-reference** — engine model → impeller part number → interval.
   Boat owners and forums link to this kind of table constantly. Nothing
   comparable exists for the Australian market.
2. **Engine spec database** — the 116 engine pages, presented as one searchable
   table. Reference pages earn links; guides rarely do.
3. **Marine repair cost index for Australia** — updated every 6 months and
   dated. Journalists and marine media cite dated price data.
4. **Anode selector** — engine and drive → correct anode alloy and part.
5. **Pre-purchase engine inspection checklist** as a printable PDF.

**Where the links are:** Australian sailing and boating forums where owners
already ask these questions, state yacht clubs and cruising associations,
marina newsletters, marine trade associations, the marine press, and the
operators you list — a listed business linking to its own listing is a natural,
legitimate link and you will have 400+ of them.

**Also worth doing:** claim a Google Business Profile if there is a real
business address; get listed in Australian marine directories; answer questions
on the forums with a link only where it genuinely answers the question.

---

## 7. Indexation sequencing — do not skip this

| Month | Publish | Cumulative | Checkpoint |
|---|---:|---:|---|
| 1 | 35 symptoms | ~107 | Are they indexed within 3 weeks? |
| 2 | 26 guides + 30 brand hubs | ~163 | Impressions rising per page type? |
| 3 | 40 engine pages | ~203 | Any engine page ranking top 50? |
| 4–5 | 76 engine pages + 40 marina hubs | ~320 | Indexation rate holding above 80%? |
| 6–9 | Marina layer + engine long tail | ~1,200 | Impressions per page not falling |
| 10–12 | Location, cost and remaining layers | ~2,500 | |

**Stop rule.** If indexation rate for a page type falls below 60% after 6 weeks,
stop publishing that type and fix it before adding more. A stalling indexation
rate is Google telling you the pages are too thin — adding more makes it worse,
not better.

---

## 8. Measurement

Track **per page type**, never sitewide — a wave of 300 pages moves site
averages regardless of whether it worked.

- **Leading (weeks 2–8):** indexation rate, impressions per page, and **unique
  queries per page** — target 15+ by month 3. That last number is the real
  measure of long-tail capture.
- **Lagging (months 3–9):** clicks per page type, referral clickthroughs to
  operators, ratio of 4+ word queries to head terms.
- **Health:** pages with zero impressions at 90 days. Above 20% for a page type
  means that type's gate was too loose.

**Kill criterion:** zero impressions at 6 months → merge into parent and 301.
Plan for pruning from the start.

---

## 9. Australian specifics worth building around

- **Seasonality is inverted by latitude.** Southern layup and recommissioning
  peaks (Mar–Apr, Sep–Oct) and northern cyclone-season preparation (Oct–Nov) are
  opposite ends of the year. Publish seasonal content 8 weeks ahead of each.
- **Boat shows** — Sydney and Sanctuary Cove drive repower and survey searches.
  Have the comparison and repower-cost pages live well before them.
- **Spelling.** Keep Australian spelling throughout — "metre", "litre",
  "tyre", "aluminium", "specialised". Mixed spelling reads as imported content.
- **Regulator names are search terms.** AMSA, Maritime Safety Queensland,
  Transport for NSW. Use them correctly and cite the current instrument.
- **The `.com.au` is an asset.** It carries genuine trust for Australian
  queries. Keep the content unmistakably local — prices in AUD, distances in
  km, real marina names.

---

## Summary

| Phase | Months | Pages added | Cumulative |
|---|---|---:|---:|
| 0 — unblock and instrument | 1 | 0 | 72 |
| 1 — no-dependency content | 1–3 | 207 | ~280 |
| 2 — marina layer | 3–6 | 310 | ~590 |
| 3 — engine long tail | 4–9 | 990 | ~1,580 |
| 4 — remaining layers | 6–12 | 1,290 | ~2,870 |

Realistically ~2,900 pages at genuine quality is an 18-month programme for a
small team, not a 12-month one. **Phases 0–2 (~590 pages) is the point at which
this is a real, defensible, ranking site.** Everything after that is
compounding, and none of it works without the links in section 6.
