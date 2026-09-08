# Template — City Hub
`/diesel-mechanics/{city}/` · 1,200–1,800 words · Gate: ≥10 verified providers

## H1
Diesel Mechanics in {City}

## Sections
1. **Opening (100–150w)** — What the {City} diesel market actually looks like.
   Use the market note from `data/cities.csv`. Name the dominant vehicle types.
   No population filler.
2. **What diesel repairs cost in {City} (150w + table)** — Local price bands for
   the 5 most common jobs. Link to `/costs/{service}/{city}/` where published,
   else `/costs/{service}/`.
3. **Providers in {City} (the core)** — Grouped by suburb cluster (e.g. Sydney:
   Inner West, Northern Beaches, Western Sydney, Sutherland, Hills). Per entry:
   name, suburb, services, engine brands specialised in, licence number,
   verification date. **Paid-placement disclosure sits above this block.**
4. **Choosing a workshop in {City} (200w)** — What to check locally: licensing
   body for the state, whether they have the diagnostic equipment for your
   engine, turnaround expectations.
5. **{State} rules that affect you (150w)** — Roadworthy/safety inspection
   requirements, state EPA emissions enforcement, log-book servicing and
   warranty under Australian Consumer Law.
6. **Services available in {City}** — Link block to every published
   `/services/{service}/{city}/`. Group by cluster; cap at ~30 links.
7. **Nearby cities** — 3 nearest same-state cities.
8. **FAQ (5–7 Q)** — Sourced from real queries in Search Console, not invented.

## Internal links
Up: `/find-a-diesel-mechanic/` · Down: all city × service children ·
Across: 3 nearest cities · Out: relevant cost pages

## Schema
`BreadcrumbList` + `ItemList` of `LocalBusiness` + `FAQPage`

## CTA
"Get quotes from {n} verified diesel workshops in {City}" — referral, with
disclosure. Never phrased as if we perform the work.
