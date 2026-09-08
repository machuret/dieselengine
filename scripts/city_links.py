#!/usr/bin/env python3
"""Emit the "find this in your city" link block for a service page.

Reads the planned city-service children from data/keyword-map.csv so a service
page can never link to a city page the plan does not contain. Prints nothing
if the service has no planned children.

Usage: python3 scripts/city_links.py <service-slug> "<label>"
"""
import csv
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
slug, label = sys.argv[1], sys.argv[2]

cities = {c["slug"]: c["city"] for c in
          csv.DictReader(open(os.path.join(ROOT, "data", "cities.csv")))}
rows = list(csv.DictReader(open(os.path.join(ROOT, "data", "keyword-map.csv"))))

kids = [r for r in rows
        if r["page_type"] == "city-service"
        and r["url"].startswith(f"/services/{slug}/")
        and r["wave"] in ("1", "2")]
if not kids:
    sys.exit(0)

order = {c: i for i, c in enumerate(cities)}
kids.sort(key=lambda r: order.get(r["url"].rstrip("/").split("/")[-1], 99))

links = " ·\n".join(
    f"[{cities[r['url'].rstrip('/').split('/')[-1]]}]({r['url']})" for r in kids)
print(f"\n## Find {label} in your city\n\n{links}")
