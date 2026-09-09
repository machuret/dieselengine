# Template — Location Hub
`/marine-mechanics/{location}/` · 1,200–1,800 words · Gate: ≥10 verified operators

## H1
Marine Diesel Mechanics in {Location}

## Sections
1. **Opening (150–200w)** — The local mechanism, not a description. What is
   distinctive about this fleet and this water, and what it does to engines.
   Use the note in `data/cities.csv`. No "X is a popular boating destination".
2. **What work costs here (150w + table)** — Local band, and the local cost
   driver (access, mooring vs berth, parts freight, seasonality).
3. **Operators (the core)** — Grouped by marina and precinct. Per entry: name,
   marinas covered, services, engine brands and dealer authorisations, whether
   they attend moorings, verification date. **Paid-placement disclosure above
   this block.**
4. **Choosing an operator here (250w)** — Local specifics: which precincts are
   separate service areas, seasonal booking pressure, haul-out availability,
   marina contractor rules.
5. **State rules (150w)** — The state's recreational authority, plus the AMSA
   domestic commercial vessel position. `compliance_review: required`.
6. **Services available** — Link block to published children, grouped by cluster,
   capped around 30 links.
7. **Nearby** — 2–3 nearest locations.
8. **FAQ (4–6 Q)** — From real Search Console queries, not invented.

## Internal links
Up: `/find-a-marine-mechanic/` · Down: all location × service children ·
Across: nearby locations · Out: relevant cost pages

## Schema
`BreadcrumbList` + `ItemList` of `LocalBusiness` + `FAQPage`

## CTA
"Get quotes from {n} verified marine operators in {Location}" — referral, with
disclosure. Never phrased as if we perform the work.
