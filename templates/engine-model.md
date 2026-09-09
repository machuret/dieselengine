# Template — Engine Model
`/engine-brands/{brand}/{engine-family}/` · 1,500–2,500 words
Gate: engine-specific fault data, mechanic-reviewed

This is the highest-value page type on the site: lowest competition, most
durable, most linkable. Treat it accordingly.

## H1
{Brand} {Engine} Marine Engine: Problems, Specs and Repair

## Sections
1. **What it is (150w)** — Production years, what it replaced, what replaced it.
2. **Specifications (table)** — Displacement, configuration, injection system,
   aspiration, rated power and RPM, cooling arrangement (raw water / keel /
   heat exchanger), and the drive types it is offered with (shaft, saildrive,
   sterndrive, pod). **Every figure verified against manufacturer
   documentation.**
3. **Australian application (table)** — Boat types and builders it was fitted to,
   years, and the gearbox commonly paired with it. Plus dealer and parts support
   in Australia, which materially affects the repower decision.
4. **Known problems (the core, 600–900w)** — Each fault as its own H3:
   symptom → cause → typical hours band it appears at → diagnosis → repair →
   cost range. Rank by how commonly it actually occurs. Cover the
   marine-specific ones explicitly: exhaust elbow, heat exchanger, aftercooler,
   raw water pump, anodes.
5. **Service intervals and known-good maintenance (200w)** — Oil spec, impeller
   and exhaust elbow intervals, anode locations including internal ones, coolant
   interval, and what shortens this engine's life.
6. **Rebuild vs repower (250w)** — Rebuild cost band in Australia, exchange
   availability, and whether the installation makes a repower disproportionately
   expensive.
7. **Finding a specialist** — Link to
   `/engine-brands/{brand}/specialists/{location}/` pages where they exist, else
   the brand hub.
8. **FAQ (6–8 Q)**

## Internal links
Up: brand hub · Across: 2–3 symptom pages for its characteristic faults ·
Out: rebuild cost page, engine swap service page

## Schema
`TechArticle` + `FAQPage` + `BreadcrumbList`, with `author` and `reviewedBy`

## Byline
Named author + named licensed mechanic reviewer + review date. Mandatory.
