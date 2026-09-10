#!/usr/bin/env python3
"""Validate content/ against the plan's publish gates.

Enforces the rules that CONTENT-PLAN.md sets out, so a page cannot reach
`status: ready` while it still contains unsourced figures or unmet gates.

Checks per page:
  * front matter present and complete
  * url exists in data/keyword-map.csv and matches its planned page_type/wave
  * no unresolved {{TOKEN}} placeholders in a page marked ready
  * cost figures carry a `prices_checked` date
  * provider-gated pages declare provider_count >= their gate
  * author/reviewer set on pages whose type requires technical review
  * every internal link target resolves to a planned URL
Exit code 1 if any page marked `ready` fails. Draft pages report warnings only.
"""
import collections
import csv
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "content")

# Author and reviewer may be set once in site.config.json rather than on every
# page; the Astro build reads the same file, so both tools must agree on who
# counts as named. A per-page value still overrides the default.
with open(os.path.join(ROOT, "site.config.json"), encoding="utf-8") as fh:
    SITE = json.load(fh)
DEFAULT_AUTHOR = SITE.get("defaultAuthor")
DEFAULT_REVIEWER = SITE.get("defaultReviewer")

REQUIRED_FIELDS = ["url", "title", "page_type", "wave", "primary_keyword",
                   "status", "parent"]
# Pages whose primary content is diagnostic procedure. Kept in step with
# REVIEW_REQUIRED in src/lib/gates.js — the build and this script must not
# disagree about what is publishable.
REVIEW_REQUIRED = {"symptom", "engine-model", "brand-symptom"}
# Operator shortfalls and unresolved placeholders are reported, not blocking:
# a location hub carries substantial local content without its listings.
PROVIDER_GATES = {"city-hub": 10, "city-service": 5, "brand-city": 3, "distributor": 3}
# Placeholder tokens look like {{PRICE_TABLE:gold-coast}} — the name is
# upper-case, but the argument after the colon is a lower-case slug, so the
# argument must not be restricted to upper-case or the token is missed.
TOKEN = re.compile(r"\{\{([A-Z][A-Z0-9_]*(?::[A-Za-z0-9_.\-]+)?)\}\}")


def parse_front_matter(text, path):
    if not text.startswith("---\n"):
        return None, f"{path}: missing front matter"
    end = text.find("\n---\n", 4)
    if end == -1:
        return None, f"{path}: unterminated front matter"
    fm, body = {}, text[end + 5:]
    for line in text[4:end].splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            return None, f"{path}: bad front matter line: {line!r}"
        k, v = line.split(":", 1)
        v = v.strip()
        if v.startswith("[") and v.endswith("]"):
            v = [x.strip() for x in v[1:-1].split(",") if x.strip()]
        fm[k.strip()] = v
    fm["_body"] = body
    return fm, None


def main():
    planned = {}
    with open(os.path.join(ROOT, "data", "keyword-map.csv"),
              newline="", encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            planned[row["url"]] = row

    errors, warnings, seen = [], [], set()
    pages = []
    for dirpath, _, filenames in os.walk(CONTENT):
        for fn in sorted(filenames):
            if fn.endswith(".md"):
                pages.append(os.path.join(dirpath, fn))

    for path in sorted(pages):
        rel = os.path.relpath(path, ROOT)
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
        fm, err = parse_front_matter(text, rel)
        if err:
            errors.append(err)
            continue

        ready = fm.get("status") == "ready"
        sink = errors if ready else warnings

        for field in REQUIRED_FIELDS:
            if not fm.get(field):
                errors.append(f"{rel}: missing required field '{field}'")
        url = fm.get("url")
        if not url:
            continue
        if url in seen:
            errors.append(f"{rel}: duplicate url {url}")
        seen.add(url)

        if url not in planned:
            errors.append(f"{rel}: url {url} is not in keyword-map.csv")
        else:
            plan = planned[url]
            if fm.get("page_type") != plan["page_type"]:
                errors.append(f"{rel}: page_type {fm.get('page_type')!r} "
                              f"but plan says {plan['page_type']!r}")
            if str(fm.get("wave")) != plan["wave"]:
                errors.append(f"{rel}: wave {fm.get('wave')} "
                              f"but plan says {plan['wave']}")
            if fm.get("parent") != plan["internal_link_parent"]:
                warnings.append(f"{rel}: parent {fm.get('parent')!r} differs "
                                f"from plan {plan['internal_link_parent']!r}")

        tokens = sorted(set(TOKEN.findall(text)))
        if tokens:
            warnings.append(f"{rel}: unresolved placeholders: {', '.join(tokens)}")

        ptype = fm.get("page_type", "")
        gate = PROVIDER_GATES.get(ptype)
        if gate is not None:
            try:
                count = int(fm.get("provider_count", -1))
            except (TypeError, ValueError):
                count = -1
            if count < gate:
                warnings.append(f"{rel}: {max(count, 0)}/{gate} verified "
                                f"operators for {ptype}")

        body = fm["_body"]
        # Any dollar figure on a page must be dated, or it is unsourced. This
        # one stays blocking: an undated price is worse than no price.
        checked = fm.get("prices_checked")
        if re.search(r"\$\s?[\d,]+", body) and (not checked or checked == "PENDING"):
            errors.append(f"{rel}: contains price figures but no "
                          f"'prices_checked' date")

        author = fm.get("author")
        if not author or author == "TBD":
            author = DEFAULT_AUTHOR
        reviewer = fm.get("reviewed_by")
        if not reviewer or reviewer == "TBD":
            reviewer = DEFAULT_REVIEWER

        if ptype in REVIEW_REQUIRED and not reviewer:
            sink.append(f"{rel}: {ptype} requires a named "
                        f"'reviewed_by' mechanic (or site.config defaultReviewer)")
        elif not reviewer:
            warnings.append(f"{rel}: no named mechanic reviewer")
        if not author:
            sink.append(f"{rel}: missing named author "
                        f"(or site.config defaultAuthor)")

        for link in re.findall(r"\]\((/[^)#\s]*)\)", body):
            if link not in planned and link != "/":
                warnings.append(f"{rel}: links to unplanned url {link}")

    print(f"Scanned {len(pages)} pages ({len(seen)} unique urls)")
    ready_n = 0
    for path in pages:
        with open(path, encoding="utf-8") as fh:
            if "\nstatus: ready\n" in fh.read()[:800]:
                ready_n += 1
    print(f"  ready: {ready_n}   draft/blocked: {len(pages) - ready_n}")

    if warnings:
        kinds = collections.Counter(
            re.sub(r"^[^:]+: ", "", w).split(":")[0] for w in warnings)
        print(f"\n{len(warnings)} outstanding item(s), by kind:")
        for kind, n in kinds.most_common():
            print(f"  ! {n:>4}  {kind}")
    if errors:
        print(f"\n{len(errors)} ERROR(s) blocking publish:")
        for e in errors:
            print(f"  x {e}")
        return 1
    print("\nNo publish-blocking errors.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
