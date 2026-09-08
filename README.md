# Diesel Engine AU — Content Programme

Planning repository for the Australian diesel engine education and referral
site. No application code — this repo holds the content strategy, the keyword
architecture, and the source data that generates it.

## Start here
- **[CONTENT-PLAN.md](CONTENT-PLAN.md)** — the full plan: strategy, site
  architecture, 6 build waves, publish gates, linking, schema, compliance,
  measurement.
- **[docs/editorial-standards.md](docs/editorial-standards.md)** — how pages
  must read, review requirements, refresh cycles.
- **[templates/](templates/)** — one template per page type.

## Regenerate the keyword map

```bash
python3 scripts/generate_keyword_map.py
```

Reads the source CSVs in `data/` and writes `data/keyword-map.csv`
(1,073 planned pages) and `data/wave-summary.csv`. Edit the source CSVs to
change scope; never hand-edit the generated files.

## Data

| File | Rows | Generated |
|---|---:|---|
| `data/cities.csv` | 25 | no |
| `data/services.csv` | 35 | no |
| `data/engine-brands.csv` | 30 | no |
| `data/symptoms.csv` | 35 | no |
| `data/decision-topics.csv` | 26 | no |
| `data/providers.csv` | — | to be built (see CONTENT-PLAN.md §8) |
| `data/keyword-map.csv` | 1,073 | **yes** |
| `data/wave-summary.csv` | — | **yes** |
