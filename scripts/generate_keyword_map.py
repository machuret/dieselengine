#!/usr/bin/env python3
"""Generate the page/keyword map for the Diesel Engine AU content expansion.

Reads the source data in data/*.csv and emits:
  data/keyword-map.csv   one row per planned page, with target keyword,
                         page type, URL, wave, priority and internal-link parents.
  data/wave-summary.csv  page counts per wave and page type.

Gating rules keep the programmatic sets from degenerating into thin pages:
every generated page must have at least one source of unique substance
(local provider data, an engine-specific fault pattern, or a cost model),
so the gates below are deliberately narrower than the full cross product.
"""
import csv
import os
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")


def load(name):
    with open(os.path.join(DATA, name), newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


cities = load("cities.csv")
services = load("services.csv")
brands = load("engine-brands.csv")
symptoms = load("symptoms.csv")
topics = load("decision-topics.csv")

tier1 = [c for c in cities if c["tier"] == "1"]
tier2 = [c for c in cities if c["tier"] == "2"]
coastal = {"sydney", "melbourne", "brisbane", "perth", "gold-coast",
           "newcastle", "sunshine-coast", "wollongong", "hobart", "cairns",
           "townsville", "darwin", "mackay", "bunbury", "launceston"}
regional = {"toowoomba", "wagga-wagga", "dubbo", "ballarat", "bendigo",
            "albury-wodonga", "rockhampton", "mackay", "adelaide", "launceston"}
mining = {"perth", "newcastle", "wollongong", "townsville", "mackay",
          "rockhampton", "darwin", "bunbury"}

rows = []


def add(wave, page_type, url, title, keyword, secondary, priority, parent, notes):
    rows.append({
        "wave": wave,
        "page_type": page_type,
        "url": url,
        "title": title,
        "primary_keyword": keyword,
        "secondary_keywords": " | ".join(secondary),
        "priority": priority,
        "internal_link_parent": parent,
        "notes": notes,
    })


# ---------------------------------------------------------------- wave 1
# Pillars. Everything else links up into these, so they ship first.
add(1, "pillar", "/diesel-engines/", "Diesel Engines in Australia",
    "diesel engines australia",
    ["how diesel engines work", "diesel engine guide australia"],
    "P0", "/", "Top-level education pillar")
add(1, "pillar", "/find-a-diesel-mechanic/", "Find a Diesel Mechanic in Australia",
    "diesel mechanic near me",
    ["diesel mechanic australia", "diesel specialist near me"],
    "P0", "/", "Directory entry point; routes to city hubs")
add(1, "pillar", "/diesel-problems/", "Diesel Engine Problems and Symptoms",
    "diesel engine problems",
    ["diesel engine symptoms", "common diesel faults"],
    "P0", "/", "Symptom hub")
add(1, "pillar", "/engine-brands/", "Diesel Engine Brands in Australia",
    "diesel engine brands",
    ["diesel engine manufacturers australia"],
    "P0", "/", "Brand hub")
add(1, "pillar", "/costs/", "What Diesel Repairs Cost in Australia",
    "diesel repair cost australia",
    ["diesel mechanic hourly rate australia"],
    "P0", "/", "Cost hub; feeds every cost page")

for s in services:
    add(1, "service-national", f"/services/{s['slug']}/",
        f"{s['service']} in Australia",
        f"{s['service'].lower()} australia",
        [f"{s['service'].lower()} cost", f"what is {s['service'].lower()}"],
        "P0" if int(s["commercial_value"]) >= 5 else "P1",
        "/find-a-diesel-mechanic/",
        f"Cluster: {s['cluster']}")

for c in tier1:
    add(1, "city-hub", f"/diesel-mechanics/{c['slug']}/",
        f"Diesel Mechanics in {c['city']}",
        f"diesel mechanic {c['city'].lower()}",
        [f"diesel mechanic near me {c['city'].lower()}",
         f"diesel specialist {c['city'].lower()}",
         f"diesel repairs {c['city'].lower()}"],
        "P0", "/find-a-diesel-mechanic/",
        f"{c['state']} — {c['notes']}")

# ---------------------------------------------------------------- wave 2
# Tier-1 city x high-value service. Gate: commercial_value >= 4, plus
# segment gates so marine/agricultural/plant pages only exist where the
# demand does.
for c in tier1:
    for s in services:
        if int(s["commercial_value"]) < 4:
            continue
        if s["slug"] == "marine-diesel-mechanic" and c["slug"] not in coastal:
            continue
        if s["slug"] == "agricultural-diesel-mechanic" and c["slug"] not in regional:
            continue
        if s["slug"] == "earthmoving-plant-diesel" and c["slug"] not in mining:
            continue
        add(2, "city-service", f"/services/{s['slug']}/{c['slug']}/",
            f"{s['service']} in {c['city']}",
            f"{s['service'].lower()} {c['city'].lower()}",
            [f"{s['service'].lower()} near me {c['city'].lower()}",
             f"{s['service'].lower()} {c['state'].lower()}",
             f"best {s['service'].lower()} {c['city'].lower()}"],
            "P0" if int(s["commercial_value"]) == 5 else "P1",
            f"/diesel-mechanics/{c['slug']}/",
            f"Needs >=5 verified local providers before publish")

for sym in symptoms:
    add(2, "symptom", f"/diesel-problems/{sym['slug']}/",
        sym["symptom"],
        sym["symptom"].lower(),
        [f"{sym['symptom'].lower()} causes",
         f"{sym['symptom'].lower()} fix",
         f"why is my {sym['symptom'].lower()}"],
        "P0", "/diesel-problems/",
        f"CTA routes to /services/{sym['maps_to_service']}/")

for t in topics:
    add(2, "decision", f"/guides/{t['slug']}/",
        t["title"], t["title"].lower(),
        [f"{t['title'].lower()} australia"],
        "P0" if t["cluster"] == "cost" else "P1",
        "/costs/" if t["cluster"] == "cost" else "/diesel-engines/",
        f"{t['cluster']} / {t['funnel_stage']}")

# ---------------------------------------------------------------- wave 3
# Engine brands and engine families. This is where the durable, hard to
# copy long tail lives.
for b in brands:
    add(3, "brand-hub", f"/engine-brands/{b['brand_slug']}/",
        f"{b['brand']} Diesel Engines in Australia",
        f"{b['brand'].lower()} diesel engine",
        [f"{b['brand'].lower()} diesel engine problems",
         f"{b['brand'].lower()} diesel engine specs"],
        "P0" if int(b["au_relevance"]) >= 4 else "P1",
        "/engine-brands/", b["notes"])
    for fam in [f.strip() for f in b["notable_engine_families"].split(";") if f.strip()]:
        fam_slug = (fam.lower().replace(" ", "-").replace(".", "-")
                    .replace("/", "-").replace("--", "-").strip("-"))
        add(3, "engine-model",
            f"/engine-brands/{b['brand_slug']}/{fam_slug}/",
            f"{b['brand']} {fam} Engine: Problems, Specs and Repair",
            f"{fam.lower()} engine",
            [f"{fam.lower()} problems", f"{fam.lower()} specs",
             f"{fam.lower()} rebuild cost", f"{fam.lower()} common faults"],
            "P0" if int(b["au_relevance"]) >= 4 else "P2",
            f"/engine-brands/{b['brand_slug']}/",
            "Must carry engine-specific fault data, not boilerplate")

# ---------------------------------------------------------------- wave 4
# Tier-2 cities, mirroring the wave 1-2 structure at reduced depth.
for c in tier2:
    add(4, "city-hub", f"/diesel-mechanics/{c['slug']}/",
        f"Diesel Mechanics in {c['city']}",
        f"diesel mechanic {c['city'].lower()}",
        [f"diesel repairs {c['city'].lower()}",
         f"diesel specialist {c['city'].lower()}"],
        "P1", "/find-a-diesel-mechanic/", c["notes"])
    for s in services:
        if int(s["commercial_value"]) < 5:
            continue
        if s["slug"] == "marine-diesel-mechanic" and c["slug"] not in coastal:
            continue
        add(4, "city-service", f"/services/{s['slug']}/{c['slug']}/",
            f"{s['service']} in {c['city']}",
            f"{s['service'].lower()} {c['city'].lower()}",
            [f"{s['service'].lower()} near me {c['city'].lower()}"],
            "P2", f"/diesel-mechanics/{c['slug']}/",
            "Publish only where >=3 verified local providers exist")

# ---------------------------------------------------------------- wave 5
# Brand x city. Gate hard: only the highest-relevance brands in tier-1
# cities, or these become 750 near-identical pages.
top_brands = [b for b in brands if int(b["au_relevance"]) == 5]
for b in top_brands:
    for c in tier1:
        add(5, "brand-city",
            f"/engine-brands/{b['brand_slug']}/specialists/{c['slug']}/",
            f"{b['brand']} Diesel Specialists in {c['city']}",
            f"{b['brand'].lower()} diesel specialist {c['city'].lower()}",
            [f"{b['brand'].lower()} diesel mechanic {c['city'].lower()}",
             f"{b['brand'].lower()} engine rebuild {c['city'].lower()}"],
            "P2", f"/engine-brands/{b['brand_slug']}/",
            "Gate on verified brand-specialist providers in that city")

# Brand x symptom, for the brands where the fault is genuinely characteristic.
brand_symptom_pairs = [
    ("nissan", ["diesel-loss-of-power", "diesel-blowing-black-smoke",
                "diesel-timing-chain-rattle", "diesel-excessive-blowby"]),
    ("toyota", ["dpf-light-on", "dpf-wont-regenerate",
                "diesel-intake-manifold-carbon", "diesel-injector-leak-off"]),
    ("ford", ["diesel-oil-dilution", "diesel-limp-mode",
              "diesel-turbo-oil-leak", "dpf-wont-regenerate"]),
    ("isuzu", ["dpf-wont-regenerate", "diesel-blowing-white-smoke",
               "diesel-overheating"]),
    ("mitsubishi", ["diesel-hard-to-start-cold", "diesel-loss-of-power",
                    "diesel-timing-chain-rattle"]),
    ("volkswagen", ["diesel-limp-mode", "egr-valve-stuck",
                    "diesel-swirl-flap-failure"]),
    ("mercedes-benz", ["adblue-warning-countdown", "diesel-swirl-flap-failure",
                       "diesel-oil-in-coolant"]),
    ("land-rover", ["diesel-timing-chain-rattle", "diesel-low-oil-pressure",
                    "diesel-coolant-loss-no-leak"]),
    ("cummins", ["diesel-excessive-blowby", "diesel-runaway",
                 "diesel-low-oil-pressure"]),
    ("caterpillar", ["diesel-low-oil-pressure", "diesel-overheating",
                     "diesel-excessive-blowby"]),
]
sym_by_slug = {s["slug"]: s for s in symptoms}
brand_by_slug = {b["brand_slug"]: b for b in brands}
for bslug, slugs in brand_symptom_pairs:
    b = brand_by_slug[bslug]
    for sslug in slugs:
        sym = sym_by_slug[sslug]
        add(5, "brand-symptom",
            f"/engine-brands/{b['brand_slug']}/problems/{sym['slug']}/",
            f"{b['brand']}: {sym['symptom']}",
            f"{b['brand'].lower()} {sym['symptom'].lower()}",
            [f"{b['brand'].lower()} {sym['symptom'].lower()} fix",
             f"{b['brand'].lower()} {sym['symptom'].lower()} causes"],
            "P1", f"/engine-brands/{b['brand_slug']}/",
            "Only where the fault is characteristic of that brand's engines")

# ---------------------------------------------------------------- wave 6
# Cost pages by service and by city. Cost is the highest-converting
# informational intent for a referral model.
for s in services:
    if int(s["commercial_value"]) < 4:
        continue
    add(6, "cost-service", f"/costs/{s['slug']}/",
        f"{s['service']} Cost in Australia",
        f"{s['service'].lower()} cost australia",
        [f"how much does {s['service'].lower()} cost",
         f"{s['service'].lower()} price"],
        "P0", "/costs/", "Needs a real price range sourced from providers")
    for c in tier1:
        add(6, "cost-city", f"/costs/{s['slug']}/{c['slug']}/",
            f"{s['service']} Cost in {c['city']}",
            f"{s['service'].lower()} cost {c['city'].lower()}",
            [f"{s['service'].lower()} price {c['city'].lower()}"],
            "P2", f"/costs/{s['slug']}/",
            "Publish only with >=5 local quotes; otherwise fold into national page")

out = os.path.join(DATA, "keyword-map.csv")
with open(out, "w", newline="", encoding="utf-8") as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
    w.writeheader()
    w.writerows(rows)

counts = Counter((r["wave"], r["page_type"]) for r in rows)
summary = os.path.join(DATA, "wave-summary.csv")
with open(summary, "w", newline="", encoding="utf-8") as fh:
    w = csv.writer(fh)
    w.writerow(["wave", "page_type", "pages"])
    for (wave, ptype), n in sorted(counts.items()):
        w.writerow([wave, ptype, n])
    w.writerow(["TOTAL", "", len(rows)])

by_wave = Counter(r["wave"] for r in rows)
running = 0
print(f"{'wave':<6}{'pages':>8}{'cumulative':>13}")
for wave in sorted(by_wave):
    running += by_wave[wave]
    print(f"{wave:<6}{by_wave[wave]:>8}{running:>13}")
print(f"\nTotal pages planned: {len(rows)}")
print(f"Unique URLs: {len(set(r['url'] for r in rows))}")
print("\nBy page type:")
for ptype, n in Counter(r["page_type"] for r in rows).most_common():
    print(f"  {ptype:<18}{n:>6}")
