#!/usr/bin/env python3
"""Generate the page/keyword map for the marinedieselengine.com.au content plan.

Reads the source data in data/*.csv and emits:
  data/keyword-map.csv   one row per planned page, with target keyword,
                         page type, URL, wave, priority and internal-link parents.
  data/wave-summary.csv  page counts per wave and page type.

Gating rules keep the programmatic sets from degenerating into thin pages:
every generated page must have at least one source of unique substance (local
provider data, an engine-specific fault pattern, or a cost model), so the gates
below are deliberately narrower than the full cross product. On a marine site
the strongest gate is fleet mix — a winterisation page in Cairns or a charter
fleet page in Geelong would be fiction.
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
boats = load("boat-brands.csv")
precincts = load("precincts.csv")

tier1 = [c for c in cities if c["tier"] == "1"]
tier2 = [c for c in cities if c["tier"] == "2"]
# Every location on a marine site is on the water, so there is no coastal
# gate. What differs between them is fleet mix, and that is what gates the
# vessel-class and seasonal pages below.
#
# commercial: a working fleet large enough to support survey-vessel servicing.
commercial = {"cairns", "whitsundays", "gladstone", "townsville", "mackay",
              "darwin", "port-lincoln", "hobart", "broome", "adelaide",
              "brisbane", "perth", "sydney", "port-stephens", "coffs-harbour",
              "batemans-bay", "sunshine-coast"}
# charter: bareboat, game fishing and reef charter operators running
# high-hour engines to a schedule.
charter = {"whitsundays", "cairns", "gold-coast", "sunshine-coast",
           "port-stephens", "hervey-bay", "broome", "darwin", "sydney"}
# sailing: a cruising and racing keelboat fleet, so saildrives and small
# auxiliaries rather than planing-craft engines.
sailing = {"sydney", "melbourne", "hobart", "adelaide", "perth", "brisbane",
           "gold-coast", "port-stephens", "geelong", "gippsland-lakes",
           "batemans-bay"}
# cold_layup: a real winter layup season. Queensland and the tropics do not
# have one, and a winterisation page there would be fiction.
cold_layup = {"melbourne", "hobart", "adelaide", "geelong", "gippsland-lakes",
              "batemans-bay", "wollongong", "port-lincoln", "perth"}
# slipway: a haul-out facility, without which below-waterline work is not
# offered locally.
slipway = {"gold-coast", "sydney", "brisbane", "melbourne", "perth", "cairns",
           "whitsundays", "hobart", "adelaide", "port-stephens", "gladstone",
           "townsville", "darwin", "port-lincoln", "geelong"}

SEGMENT_GATES = {
    "commercial-vessel-servicing": commercial,
    "workboat-ferry-servicing": commercial,
    "charter-fleet-servicing": charter,
    "yacht-auxiliary-service": sailing,
    "winterisation-layup": cold_layup,
    "recommissioning-service": cold_layup,
    "slipway-haul-out": slipway,
    "propeller-shaft-service": slipway,
}


def segment_allows(service_slug, city_slug):
    """A location page only exists where that segment of the fleet does."""
    allowed = SEGMENT_GATES.get(service_slug)
    return allowed is None or city_slug in allowed


# Service x city pairs below the wave-2 commercial-value gate that are
# nonetheless justified by a documented local demand pattern. Each needs a
# stated reason; this list is the only way past the value gate, so it stays
# short and auditable.
EXTRA_CITY_SERVICE = [
    ("marine-engine-oil-analysis", "whitsundays",
     "Bareboat charter fleets run predictive oil analysis as standard because "
     "an engine failure strands paying passengers"),
    ("engine-alarms-instruments", "gold-coast",
     "Australia's largest refit and boatbuilding hub does proportionally more "
     "instrumentation and helm electronics work"),
    ("workboat-ferry-servicing", "whitsundays",
     "Island ferries, water taxis and resort tenders run to timetable "
     "alongside the bareboat fleet"),
    ("workboat-ferry-servicing", "cairns",
     "Cairns supports a genuine commercial workboat, reef tender and pilot "
     "fleet alongside its charter trade"),
    ("marine-corrosion-repair", "darwin",
     "Tropical heat and high salinity accelerate galvanic corrosion well "
     "beyond temperate-water rates"),
]

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
add(1, "pillar", "/marine-diesel-engines/", "Marine Diesel Engines in Australia",
    "marine diesel engines australia",
    ["how marine diesel engines work", "boat diesel engine guide"],
    "P0", "/", "Top-level education pillar")
add(1, "pillar", "/find-a-marine-mechanic/", "Find a Marine Diesel Mechanic in Australia",
    "marine diesel mechanic near me",
    ["boat mechanic near me", "marine engineer australia"],
    "P0", "/", "Directory entry point; routes to city hubs")
add(1, "pillar", "/marine-engine-problems/", "Marine Diesel Engine Problems and Symptoms",
    "marine diesel engine problems",
    ["boat engine problems", "common marine diesel faults"],
    "P0", "/", "Symptom hub")
add(1, "pillar", "/engine-brands/", "Marine Diesel Engine Brands in Australia",
    "marine diesel engine brands",
    ["boat engine brands australia", "marine engine manufacturers"],
    "P0", "/", "Brand hub")
add(1, "pillar", "/costs/", "What Marine Engine Work Costs in Australia",
    "marine engine repair cost australia",
    ["marine mechanic hourly rate australia"],
    "P0", "/", "Cost hub; feeds every cost page")
add(4, "pillar", "/marine-diesel/", "Marine Diesel By Australian Region",
    "marine diesel australia by region",
    ["marine diesel service by city australia"],
    "P0", "/", "Region hub index")

# Regional hubs own the ambiguous head term ("marine diesel brisbane") and route
# to the intent-specific pages. One per region, and no more: see docs/geo-plan.md
# on why forty Brisbane pages compete rather than accumulate.
for c in cities:
    add(4, "region-hub", f"/marine-diesel/{c['slug']}/",
        f"Marine Diesel In {c['city']}",
        f"marine diesel {c['city'].lower()}",
        [f"marine mechanic {c['city'].lower()}",
         f"boat engine repair {c['city'].lower()}"],
        "P0" if int(c["tier"]) == 1 else "P1", "/marine-diesel/",
        "Head-term hub; routes to mechanic, buying and service intents")

add(3, "pillar", "/marine-diesel-engine-for/", "Marine Diesel Engines By Boat Brand",
    "marine diesel engine by boat brand",
    ["what engine is in my boat", "boat brand engine guide australia"],
    "P0", "/", "Boat-brand hub; captures owners searching by their hull")
add(3, "pillar", "/distributors/", "Marine Diesel Engine Distributors In Australia",
    "marine diesel engine distributors australia",
    ["marine engine dealers australia"],
    "P0", "/", "Distribution hub; structure of each brand's AU network")

# Precincts: marinas and boatyard precincts within a region. Only where the
# region has more than one of substance — see docs/geo-plan.md. A single-precinct
# region's precinct page and its region hub are the same page.
_pc = {}
for pcr in precincts:
    _pc.setdefault(pcr["region_slug"], []).append(pcr)
for reg, items in _pc.items():
    if len(items) < 3:
        continue
    for pcr in items:
        add(5, "precinct", f"/marine-diesel/{reg}/{pcr['slug']}/",
            f"Marine Diesel At {pcr['precinct']}",
            f"marine mechanic {pcr['precinct'].lower()}",
            [f"boat engine repair {pcr['precinct'].lower()}"],
            "P2", f"/marine-diesel/{reg}/",
            f"{pcr['kind']}; facilities {pcr['verify']}")

# One page per boat brand or hull type. Owners search by the boat they have,
# not by the engine they have never looked at.
for bb in boats:
    add(3, "boat-brand", f"/marine-diesel-engine-for/{bb['slug']}/",
        f"Marine Diesel Engines For {bb['name']}",
        f"{bb['name'].lower()} marine diesel engine",
        [f"{bb['name'].lower()} engine service", f"{bb['name'].lower()} repower"],
        "P1", "/marine-diesel-engine-for/",
        f"{bb['category']} / {bb['drive']}")

# One distributor page per engine brand with a real Australian network. These
# explain how the brand's network is structured rather than listing dealers we
# have not verified.
for eb in [e for e in brands if int(e["au_relevance"]) >= 3]:
    add(3, "distributor", f"/distributors/{eb['brand_slug']}/",
        f"{eb['brand']} Distributors In Australia",
        f"{eb['brand'].lower()} distributors australia",
        [f"{eb['brand'].lower()} dealer australia"],
        "P1", "/distributors/", "Network structure; verified listings pending")

add(2, "pillar", "/buy-marine-diesel-engine/", "Buy A Marine Diesel Engine In Australia",
    "buy marine diesel engine australia",
    ["marine engine dealers australia", "where to buy boat engine australia"],
    "P0", "/", "Buying hub; transactional intent, routes to regional pages")

# One buying page per boating region. This is the transactional half of the
# location strategy: /marine-mechanics/<city>/ answers "who can fit it",
# /buy-marine-diesel-engine/<city>/ answers "where do I get one and what
# should I choose for these waters". Every region gets one, not just tier 1,
# because the buying answer changes most where the supply chain is thinnest.
for c in cities:
    add(2, "buying-city", f"/buy-marine-diesel-engine/{c['slug']}/",
        f"Buy A Marine Diesel Engine In {c['city']}",
        f"buy marine diesel engine {c['city'].lower()}",
        [f"marine engine dealers {c['city'].lower()}",
         f"boat repower {c['city'].lower()}"],
        "P0" if int(c["tier"]) == 1 else "P1",
        "/buy-marine-diesel-engine/",
        "Local market, conditions and supply chain; unique per region")

for s in services:
    add(1, "service-national", f"/services/{s['slug']}/",
        f"{s['service']} in Australia",
        f"{s['service'].lower()} australia",
        [f"{s['service'].lower()} cost", f"what is {s['service'].lower()}"],
        "P0" if int(s["commercial_value"]) >= 5 else "P1",
        "/find-a-marine-mechanic/",
        f"Cluster: {s['cluster']}")

for c in tier1:
    add(1, "city-hub", f"/marine-mechanics/{c['slug']}/",
        f"Marine Diesel Mechanics in {c['city']}",
        f"marine diesel mechanic {c['city'].lower()}",
        [f"boat mechanic {c['city'].lower()}",
         f"marine engineer {c['city'].lower()}",
         f"boat engine repairs {c['city'].lower()}"],
        "P0", "/find-a-marine-mechanic/",
        f"{c['state']} — {c['notes']}")

# ---------------------------------------------------------------- wave 2
# Tier-1 location x high-value service. Gate: commercial_value >= 4, plus the
# fleet-segment gates above, so a charter, commercial, saildrive, layup or
# slipway page only exists where that part of the fleet actually is.
for c in tier1:
    for s in services:
        if int(s["commercial_value"]) < 4:
            continue
        if not segment_allows(s["slug"], c["slug"]):
            continue
        add(2, "city-service", f"/services/{s['slug']}/{c['slug']}/",
            f"{s['service']} in {c['city']}",
            f"{s['service'].lower()} {c['city'].lower()}",
            [f"{s['service'].lower()} near me {c['city'].lower()}",
             f"{s['service'].lower()} {c['state'].lower()}",
             f"best {s['service'].lower()} {c['city'].lower()}"],
            "P0" if int(s["commercial_value"]) == 5 else "P1",
            f"/marine-mechanics/{c['slug']}/",
            f"Needs >=5 verified local providers before publish")

svc_by_slug = {s["slug"]: s for s in services}
city_by_slug = {c["slug"]: c for c in cities}
for sslug, cslug, reason in EXTRA_CITY_SERVICE:
    s_, c_ = svc_by_slug[sslug], city_by_slug[cslug]
    add(2, "city-service", f"/services/{sslug}/{cslug}/",
        f"{s_['service']} in {c_['city']}",
        f"{s_['service'].lower()} {c_['city'].lower()}",
        [f"{s_['service'].lower()} near me {c_['city'].lower()}"],
        "P1", f"/marine-mechanics/{cslug}/", reason)

for sym in symptoms:
    add(2, "symptom", f"/marine-engine-problems/{sym['slug']}/",
        sym["symptom"],
        sym["symptom"].lower(),
        [f"{sym['symptom'].lower()} causes",
         f"{sym['symptom'].lower()} fix",
         f"why is my {sym['symptom'].lower()}"],
        "P0", "/marine-engine-problems/",
        f"CTA routes to /services/{sym['maps_to_service']}/")

for t in topics:
    add(2, "decision", f"/guides/{t['slug']}/",
        t["title"], t["title"].lower(),
        [f"{t['title'].lower()} australia"],
        "P0" if t["cluster"] == "cost" else "P1",
        "/costs/" if t["cluster"] == "cost" else "/marine-diesel-engines/",
        f"{t['cluster']} / {t['funnel_stage']}")

# ---------------------------------------------------------------- wave 3
# Engine brands and engine families. This is where the durable, hard to
# copy long tail lives.
for b in brands:
    add(3, "brand-hub", f"/engine-brands/{b['brand_slug']}/",
        f"{b['brand']} Marine Engines in Australia",
        f"{b['brand'].lower()} marine engine",
        [f"{b['brand'].lower()} marine engine problems",
         f"{b['brand'].lower()} marine engine specs"],
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
    add(4, "city-hub", f"/marine-mechanics/{c['slug']}/",
        f"Marine Diesel Mechanics in {c['city']}",
        f"marine diesel mechanic {c['city'].lower()}",
        [f"boat engine repairs {c['city'].lower()}",
         f"marine engineer {c['city'].lower()}"],
        "P1", "/find-a-marine-mechanic/", c["notes"])
    for s in services:
        if int(s["commercial_value"]) < 5:
            continue
        if not segment_allows(s["slug"], c["slug"]):
            continue
        add(4, "city-service", f"/services/{s['slug']}/{c['slug']}/",
            f"{s['service']} in {c['city']}",
            f"{s['service'].lower()} {c['city'].lower()}",
            [f"{s['service'].lower()} near me {c['city'].lower()}"],
            "P2", f"/marine-mechanics/{c['slug']}/",
            "Publish only where >=3 verified local providers exist")

# ---------------------------------------------------------------- wave 5
# Brand x city. Gate hard: only the highest-relevance brands in tier-1
# cities, or these become 750 near-identical pages.
top_brands = [b for b in brands if int(b["au_relevance"]) == 5]
for b in top_brands:
    for c in tier1:
        add(5, "brand-city",
            f"/engine-brands/{b['brand_slug']}/specialists/{c['slug']}/",
            f"{b['brand']} Specialists in {c['city']}",
            f"{b['brand'].lower()} specialist {c['city'].lower()}",
            [f"{b['brand'].lower()} service {c['city'].lower()}",
             f"{b['brand'].lower()} engine rebuild {c['city'].lower()}"],
            "P2", f"/engine-brands/{b['brand_slug']}/",
            "Gate on verified brand-specialist providers in that city")

# Brand x symptom, for the brands where the fault is genuinely characteristic.
brand_symptom_pairs = [
    ("volvo-penta", ["blocked-exhaust-elbow", "saltwater-in-engine-oil",
                     "marine-engine-overheating", "sterndrive-bellows-failure"]),
    ("yanmar", ["impeller-failure", "no-water-from-exhaust",
                "blocked-exhaust-elbow", "hard-starting-after-layup"]),
    ("mercruiser", ["sterndrive-bellows-failure", "marine-engine-overheating",
                    "marine-battery-not-charging"]),
    ("cummins-marine", ["marine-excessive-blowby", "marine-low-oil-pressure",
                        "marine-engine-overheating", "marine-engine-black-smoke"]),
    ("caterpillar-marine", ["marine-low-oil-pressure", "marine-engine-overheating",
                            "marine-excessive-blowby"]),
    ("perkins-sabre", ["marine-engine-overheating", "coolant-loss-marine",
                       "marine-engine-white-smoke"]),
    ("john-deere-marine", ["marine-engine-overheating", "coolant-loss-marine"]),
    ("beta-marine", ["impeller-failure", "hard-starting-after-layup"]),
    ("nanni", ["impeller-failure", "marine-engine-overheating"]),
    ("zf-marine", ["gearbox-slipping", "gearbox-overheating", "shaft-vibration"]),
    ("twin-disc", ["gearbox-slipping", "gearbox-overheating"]),
    ("yanmar-saildrive", ["stern-gland-leaking", "anodes-wasting-fast"]),
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
