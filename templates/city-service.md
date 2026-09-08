# Template — City × Service
`/services/{service}/{city}/` · 900–1,400 words · Gate: ≥5 verified providers
offering this specific service (≥3 for tier-2 cities)

## H1
{Service} in {City}

## Sections
1. **Opening (100w)** — The {City}-specific angle on this service. Why demand
   exists here (fleet mix, climate, terrain, towing patterns).
2. **When you need it (200w)** — Symptoms that lead here. Link to the matching
   `/diesel-problems/{symptom}/` pages.
3. **What the job involves (250w)** — The actual process, honestly described,
   including how long it takes and what a good workshop does differently.
4. **What it costs in {City} (150w + table)** — Local band, parts/labour split,
   dated. Link to the cost page.
5. **Providers offering {service} in {City}** — Filtered subset of the city's
   provider list. Disclosure above the block.
6. **What to ask before booking (150w)** — Service-specific questions.
7. **FAQ (4–6 Q)**

## Do not
Reuse the national service page's copy with the city name swapped in. If there
is no genuinely local angle, this page fails its gate — fold it into the city
hub as a section.

## Internal links
Up: `/diesel-mechanics/{city}/` and `/services/{service}/` ·
Across: symptom pages, cost page

## Schema
`BreadcrumbList` + `ItemList` of `LocalBusiness` + `FAQPage`
