# Diesel Engine AU — Content Programme

Content and site for **marinedieselengine.com.au** — an independent Australian
marine diesel engine resource. Holds the content strategy, the keyword
architecture, the source data that generates it, and the Astro app that publishes
it.

We educate boat owners and refer them to workshops. We do not sell repairs.

```bash
npm install && npm run build
```

## Start here
- **[CONTENT-PLAN.md](CONTENT-PLAN.md)** — the full plan: strategy, site
  architecture, 6 build waves, publish gates, linking, schema, compliance,
  measurement.
- **[docs/editorial-standards.md](docs/editorial-standards.md)** — how pages
  must read, review requirements, refresh cycles.
- **[templates/](templates/)** — one template per page type.
- **[docs/deployment.md](docs/deployment.md)** — Vercel setup, and how the
  publish gates are enforced at build time.

## Publishing

57 pages build today and **0 are indexable**: pages that fail a publish gate are
served `noindex` and kept out of the sitemap rather than shipped thin. The 47
pillar and service pages need only a named author and reviewer in
`site.config.json` to go live. See [docs/deployment.md](docs/deployment.md).

## Regenerate the keyword map

```bash
python3 scripts/generate_keyword_map.py
```

Reads the source CSVs in `data/` and writes `data/keyword-map.csv` and
`data/wave-summary.csv`. Edit the source CSVs to
change scope; never hand-edit the generated files.

## Data

| File | Rows | Generated |
|---|---:|---|
| `data/cities.csv` | 25 boating regions | no |
| `data/services.csv` | 42 marine services | no |
| `data/engine-brands.csv` | 30 marine brands | no |
| `data/symptoms.csv` | 35 marine symptoms | no |
| `data/decision-topics.csv` | 26 | no |
| `data/providers.csv` | — | to be built (see CONTENT-PLAN.md §8) |
| `data/keyword-map.csv` | ~1,279 | **yes** |
| `data/wave-summary.csv` | — | **yes** |
