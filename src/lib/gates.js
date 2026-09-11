import site from '../../site.config.json' with { type: 'json' };

/**
 * Publish-gate logic, shared by the Astro build (src/lib/content.js, which
 * loads files via Vite's import.meta.glob) and the pre-build check
 * (scripts/prebuild-check.mjs, which reads them with fs). Nothing in here may
 * use Vite-only APIs, or the pre-build check cannot run under plain node.
 */

export const TOKEN = /\{\{([A-Z][A-Z0-9_]*)(?::([A-Za-z0-9_.-]+))?\}\}/g;

/**
 * Two kinds of unresolved placeholder, treated differently on purpose.
 *
 * BLOCKING placeholders stand in for the page's whole reason to exist. A city
 * hub without its provider list is an empty directory page, so it must not be
 * indexed — CONTENT-PLAN.md section 4.
 *
 * OMITTED placeholders stand in for a section the page is better off without
 * until the data is sourced. A service page missing its local price band is
 * still a complete, useful explanation of the job, and section 4's "folding is
 * not failure" applies: drop the section rather than withhold the page. The
 * section is stripped at render and counted in the build report so it is never
 * silently forgotten.
 */
export const BLOCKING_TOKENS = new Set();

/** Strip placeholders that are omitted rather than blocking, plus the "→ cost
 *  page" line that immediately follows a price table and would dangle. */
export function stripOmittedTokens(md) {
  return md
    .replace(/^\s*\{\{PRICE_TABLE:[A-Za-z0-9_.-]+\}\}\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n');
}

/** Placeholder names still present in a body, deduplicated. */
export function tokensIn(raw) {
  return [...new Set([...(raw ?? '').matchAll(TOKEN)].map((m) => m[1]))];
}

const PROVIDER_GATES = {
  'city-hub': 10, 'city-service': 5, 'brand-city': 3, distributor: 3,
};
// Pages whose primary content is diagnostic procedure — a differential
// diagnosis, or "what you can check yourself". A wrong instruction on one of
// these hurts someone, so they do not publish without a named mechanic.
// Education, cost, directory and index pages are deliberately not here: they
// route the reader to a mechanic rather than instructing them.
const REVIEW_REQUIRED = new Set(['symptom', 'engine-model', 'brand-symptom', 'howto']);

/** Minimal front-matter reader for the simple `key: value` / `[a, b]` form
 *  the content files use. Only needed outside the Vite pipeline. */
export function parseFrontMatter(text) {
  if (!text.startsWith('---\n')) return { data: {}, body: text };
  const end = text.indexOf('\n---\n', 4);
  if (end === -1) return { data: {}, body: text };
  const data = {};
  for (const line of text.slice(4, end).split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      data[key] = v.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
    } else if (/^-?\d+$/.test(v)) {
      data[key] = Number(v);
    } else {
      data[key] = v;
    }
  }
  return { data, body: text.slice(end + 5) };
}

/** Normalise raw front matter plus body into the page shape the site uses. */
export function toPage(fm, raw, file) {
  if (!fm.url) throw new Error(`${file}: front matter has no "url"`);
  const page = {
    file,
    url: fm.url,
    title: fm.title,
    pageType: fm.page_type,
    status: fm.status ?? 'draft',
    // "TBD" is the placeholder the wave-1 pages ship with; it is not an author.
    author: fm.author && fm.author !== 'TBD' ? fm.author : site.defaultAuthor || null,
    reviewer:
      fm.reviewed_by && fm.reviewed_by !== 'TBD'
        ? fm.reviewed_by
        : site.defaultReviewer || null,
    needsReviewer: REVIEW_REQUIRED.has(fm.page_type),
    providerGate: PROVIDER_GATES[fm.page_type] ?? null,
    provider_count: fm.provider_count,
    parent: fm.parent ?? '/',
    keyword: fm.primary_keyword,
    // YAML parses an unquoted 2026-09-08 into a Date, whose String() form is a
    // full ISO timestamp. Sitemaps and bylines both want the plain date.
    updated: fm.last_updated ? toDate(fm.last_updated) : null,
    schema: fm.schema ?? ['Article'],
    relatesTo: fm.relates_to ?? [],
    tokens: tokensIn(raw),
  };
  page.blockers = gateFailures(page);
  page.warnings = qualityWarnings(page);
  page.indexable = page.blockers.length === 0;
  return page;
}

/**
 * A page is indexable only when it clears the publish gates from
 * CONTENT-PLAN.md section 4. Anything short of that is still built and served —
 * so the site has no dead URLs — but is served `noindex` and kept out of the
 * sitemap, because a page carrying unresolved price tables or an unverified
 * provider list is exactly the thin content the plan is designed to avoid.
 */
export function gateFailures(page) {
  const f = [];
  if (page.status !== 'ready') f.push(`status is "${page.status}", not "ready"`);
  if (!page.author) f.push('no named author');
  if (page.needsReviewer && !page.reviewer) f.push('no named mechanic reviewer');
  const blocking = (page.tokens ?? []).filter((t) => BLOCKING_TOKENS.has(t));
  if (blocking.length) {
    f.push(`unresolved ${blocking.map((t) => `{{${t}}}`).join(', ')} in the body`);
  }
  return f;
}

function toDate(v) {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

/** Non-blocking quality warnings, surfaced in the build report. */
export function qualityWarnings(page) {
  const w = [];
  if (page.providerGate && (page.provider_count ?? 0) < page.providerGate) {
    w.push(`${page.provider_count ?? 0}/${page.providerGate} verified operators`);
  }
  if ((page.tokens ?? []).length) {
    w.push(`unresolved ${page.tokens.map((t) => `{{${t}}}`).join(', ')}`);
  }
  if (!page.reviewer) w.push('no named mechanic reviewer');
  return w;
}

export function sectionOf(url) {
  for (const s of site.sections) if (new RegExp(s.match).test(url)) return s.id;
  return 'pages';
}
