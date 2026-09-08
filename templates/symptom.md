# Template — Symptom
`/diesel-problems/{symptom}/` · 1,200–1,800 words

Symptom pages catch readers before they know what they need. They must diagnose,
not sell.

## H1
{Symptom}: Causes, Diagnosis and What It Costs to Fix

## Sections
1. **What this symptom means (100w)** — Plain-English, immediately.
2. **Is it safe to keep driving? (100w)** — Answer directly and near the top.
   For critical faults (runaway, hydraulic lock, low oil pressure) this is the
   first section and the answer is no.
3. **Likely causes, ranked (the core — table + 400w)** — Differential diagnosis:
   cause → how common → other symptoms that appear with it → how a workshop
   confirms it → repair cost band. Ranked by actual probability.
4. **What you can check yourself (200w)** — Only genuinely safe checks. Explicit
   warning on anything involving fuel-system pressure, hot components, or
   raising a vehicle.
5. **When to see a mechanic (100w)** — Clear threshold.
6. **What diagnosis costs (100w)** — Typical diagnostic fee, and whether it is
   usually credited against the repair.
7. **Common on these engines (150w)** — Link to brand × symptom pages.
8. **FAQ (5–7 Q)**

## Internal links
Up: `/diesel-problems/` · Across: the `maps_to_service` service page,
3–5 brand × symptom pages · Out: relevant cost page

## Schema
`TechArticle` + `FAQPage`; `HowTo` only for the safe self-checks section

## CTA
"Find a diesel mechanic near you" → city hub, geo-detected. Never a hard sell
above the diagnosis content.
