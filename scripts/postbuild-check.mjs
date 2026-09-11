/**
 * Verifies the built output against its own sitemaps.
 *
 * The homepage was absent from the sitemap for every deploy up to this point,
 * because the sitemap was generated from content/ and the homepage is an
 * .astro route. Nothing caught it: the build succeeded, the sitemap was valid,
 * and it simply did not list the most important URL on the site. This asserts
 * the two sets agree, so that cannot happen again.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
if (!existsSync(DIST)) {
  console.error('postbuild: no dist/ to check');
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(DIST);
const errors = [];
let schemaBlockCount = 0;
let schemaPageCount = 0;

/**
 * Validate the structured data we actually ship, not just the source object.
 * This catches malformed JSON and the most common required-property mistakes
 * before search crawlers see them.
 */
function validateSchema(node, page, label) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    errors.push(`${page} ${label} is not a JSON object`);
    return;
  }
  if (!node['@type']) errors.push(`${page} ${label} is missing @type`);

  if (node['@type'] === 'BreadcrumbList') {
    if (!Array.isArray(node.itemListElement) || node.itemListElement.length < 1) {
      errors.push(`${page} BreadcrumbList has no items`);
    } else {
      node.itemListElement.forEach((item, index) => {
        if (item?.['@type'] !== 'ListItem' || item.position !== index + 1 || !item.name || !item.item) {
          errors.push(`${page} BreadcrumbList item ${index + 1} is incomplete or out of order`);
        }
      });
    }
  }

  if (node['@type'] === 'FAQPage') {
    if (!Array.isArray(node.mainEntity) || node.mainEntity.length < 1) {
      errors.push(`${page} FAQPage has no questions`);
    } else {
      node.mainEntity.forEach((item, index) => {
        if (item?.['@type'] !== 'Question' || !item.name ||
            item.acceptedAnswer?.['@type'] !== 'Answer' || !item.acceptedAnswer?.text) {
          errors.push(`${page} FAQPage question ${index + 1} is incomplete`);
        }
      });
    }
  }

  if (node['@type'] === 'HowTo') {
    if (!node.name || !Array.isArray(node.step) || node.step.length < 1) {
      errors.push(`${page} HowTo is missing its name or steps`);
    } else {
      node.step.forEach((step, index) => {
        if (step?.['@type'] !== 'HowToStep' || !step.name || !step.text) {
          errors.push(`${page} HowTo step ${index + 1} is incomplete`);
        }
      });
    }
  }
}

for (const f of files) {
  if (!f.endsWith('.html')) continue;
  const page = relative(DIST, f);
  const html = readFileSync(f, 'utf8');
  const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (blocks.length) schemaPageCount++;
  if (f.endsWith('index.html') && !page.endsWith('404/index.html') && blocks.length === 0) {
    errors.push(`${page} has no JSON-LD structured data`);
  }
  blocks.forEach((match, index) => {
    schemaBlockCount++;
    let data;
    try {
      data = JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${page} JSON-LD block ${index + 1} is invalid JSON: ${error.message}`);
      return;
    }
    if (data['@context'] !== 'https://schema.org') {
      errors.push(`${page} JSON-LD block ${index + 1} has an invalid @context`);
    }
    if (data['@graph'] !== undefined) {
      if (!Array.isArray(data['@graph']) || data['@graph'].length < 1) {
        errors.push(`${page} JSON-LD block ${index + 1} has an empty or invalid @graph`);
      } else {
        data['@graph'].forEach((node, nodeIndex) =>
          validateSchema(node, page, `JSON-LD graph node ${nodeIndex + 1}`)
        );
      }
    } else {
      validateSchema(data, page, `JSON-LD block ${index + 1}`);
    }
  });
}

// Every route that renders a page, and whether it asks to be indexed.
const routes = new Map();
for (const f of files) {
  if (!f.endsWith('index.html')) continue;
  const rel = relative(DIST, f).replace(/index\.html$/, '');
  const url = '/' + rel;
  const html = readFileSync(f, 'utf8');
  routes.set(url, !/<meta name="robots" content="noindex/.test(html));
}

// Every URL the sitemaps claim.
const listed = new Set();
for (const f of files) {
  if (!/sitemap-.*\.xml$/.test(f)) continue;
  for (const [, loc] of readFileSync(f, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)) {
    listed.add(new URL(loc).pathname);
  }
}

for (const [url, indexable] of routes) {
  if (indexable && !listed.has(url)) {
    errors.push(`${url} is indexable but missing from every sitemap`);
  }
  if (!indexable && listed.has(url)) {
    errors.push(`${url} is noindex but listed in a sitemap`);
  }
}
for (const url of listed) {
  if (!routes.has(url)) errors.push(`${url} is in a sitemap but was not built`);
}

// Internal navigation and local image assets must resolve in the built site.
// This turns the expanded cross-linking into a checked site graph rather than
// a collection of links that can quietly rot as slugs change.
let internalLinkCount = 0;
let localImageCount = 0;
for (const f of files) {
  if (!f.endsWith('.html')) continue;
  const page = relative(DIST, f);
  const html = readFileSync(f, 'utf8');

  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    internalLinkCount++;
    const pathname = decodeURIComponent(href.split(/[?#]/, 1)[0]);
    const targetExists = pathname.endsWith('/')
      ? routes.has(pathname)
      : existsSync(join(DIST, pathname.replace(/^\//, '')));
    if (!targetExists) errors.push(`${page} links to missing internal target ${href}`);
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = match[1];
    if (!/\balt=["'][^"']*["']/i.test(attrs)) {
      errors.push(`${page} contains an image without alt text`);
    }
    const src = /\bsrc=["']([^"']+)["']/i.exec(attrs)?.[1];
    if (!src || !src.startsWith('/') || src.startsWith('//')) continue;
    localImageCount++;
    const pathname = decodeURIComponent(src.split(/[?#]/, 1)[0]);
    if (!existsSync(join(DIST, pathname.replace(/^\//, '')))) {
      errors.push(`${page} references missing image ${src}`);
    }
  }
}

// The sitemap index must point only at sitemaps that exist and are non-empty.
const indexPath = join(DIST, 'sitemap.xml');
if (!existsSync(indexPath)) {
  errors.push('sitemap.xml was not generated');
} else {
  for (const [, loc] of readFileSync(indexPath, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)) {
    const name = new URL(loc).pathname.replace(/^\//, '');
    const p = join(DIST, name);
    if (!existsSync(p)) errors.push(`sitemap.xml points at ${name}, which does not exist`);
    else if (!readFileSync(p, 'utf8').includes('<loc>')) errors.push(`${name} is empty`);
  }
}

// A raw template placeholder must never reach a reader.
for (const f of files) {
  if (!f.endsWith('.html')) continue;
  const m = readFileSync(f, 'utf8').match(/\{\{[A-Z][A-Z0-9_:.-]*\}\}/);
  if (m) errors.push(`${relative(DIST, f)} contains an unresolved placeholder ${m[0]}`);
}

/**
 * Near-duplicate detection across the geo sections.
 *
 * The failure mode for programmatic location pages is not a broken link, it is
 * template drift: two pages that read as the same page with the city name
 * swapped. Google calls that a doorway page and it costs the whole cluster, so
 * it has to be caught before publication rather than discovered after
 * indexing. Measured as trigram Jaccard over the rendered prose.
 *
 * WARN_AT is where a human should look; FAIL_AT is where the pages are close
 * enough that shipping them is a real risk. The 25 buying pages measured 0.051
 * at their worst, so a section drifting past 0.25 has genuinely changed
 * character.
 */
const WARN_AT = 0.25;
const FAIL_AT = 0.4;
const GEO_SECTIONS = [/^marine-diesel\//, /^marine-mechanics\//, /^buy-marine-diesel-engine\//, /^how\//, /^guides\//, /^engine-brands\//, /^distributors\//];

function prose(html) {
  const body = html
    .replace(/<(script|style|nav|header|footer)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .toLowerCase();
  return body.match(/[a-z]{4,}/g) ?? [];
}

function trigrams(words) {
  const out = new Set();
  for (let i = 0; i + 2 < words.length; i++) out.add(words.slice(i, i + 3).join(' '));
  return out;
}

for (const section of GEO_SECTIONS) {
  const pages = [];
  for (const f of files) {
    if (!f.endsWith('index.html')) continue;
    const rel = relative(DIST, f);
    if (!section.test(rel)) continue;
    const t = trigrams(prose(readFileSync(f, 'utf8')));
    if (t.size > 200) pages.push({ rel, t });
  }
  let worst = 0;
  let pair = null;
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      const a = pages[i].t;
      const b = pages[j].t;
      let shared = 0;
      for (const g of a) if (b.has(g)) shared++;
      const jac = shared / (a.size + b.size - shared);
      if (jac > worst) {
        worst = jac;
        pair = [pages[i].rel, pages[j].rel];
      }
    }
  }
  if (!pair) continue;
  const label = `${String(section).slice(2, -3)} (${pages.length} pages)`;
  if (worst >= FAIL_AT) {
    errors.push(
      `${label}: ${pair[0]} and ${pair[1]} are ${(worst * 100).toFixed(0)}% ` +
        `identical by trigram. That reads as one template with the place name swapped.`
    );
  } else {
    const note = worst >= WARN_AT ? '  <- review, drifting towards a template' : '';
    console.log(
      `postbuild: ${label} max overlap ${(worst * 100).toFixed(1)}%` +
        ` (${pair[0]} / ${pair[1]})${note}`
    );
  }
}

/**
 * The cannibalisation check the within-section one misses.
 *
 * Two pages about the same city in DIFFERENT sections compete for the same
 * local queries, and that is the failure the geo plan is built to avoid. A
 * regional hub and a buying page for Cairns can each be unique against their
 * own siblings and still be near-copies of each other.
 */
const bySlug = new Map();
for (const f of files) {
  if (!f.endsWith('index.html')) continue;
  const rel = relative(DIST, f);
  const m =
    /^(marine-diesel|marine-mechanics|buy-marine-diesel-engine)\/([^/]+)\/index\.html$/.exec(rel) ??
    /^(engine-brands|distributors)\/([^/]+)\/index\.html$/.exec(rel);
  if (!m) continue;
  const t = trigrams(prose(readFileSync(f, 'utf8')));
  if (t.size < 200) continue;
  if (!bySlug.has(m[2])) bySlug.set(m[2], []);
  bySlug.get(m[2]).push({ rel, section: m[1], t });
}
let crossWorst = 0;
let crossPair = null;
for (const [, pages] of bySlug) {
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      const a = pages[i].t;
      const b = pages[j].t;
      let shared = 0;
      for (const g of a) if (b.has(g)) shared++;
      const jac = shared / (a.size + b.size - shared);
      if (jac >= FAIL_AT) {
        errors.push(
          `${pages[i].rel} and ${pages[j].rel} are ${(jac * 100).toFixed(0)}% identical ` +
            `by trigram. Same subject, different sections: these will compete for the ` +
            `same queries instead of covering different intents.`
        );
      }
      if (jac > crossWorst) {
        crossWorst = jac;
        crossPair = [pages[i].rel, pages[j].rel];
      }
    }
  }
}
if (crossPair) {
  const note = crossWorst >= WARN_AT ? '  <- review, intents are converging' : '';
  console.log(
    `postbuild: same-subject cross-section max overlap ${(crossWorst * 100).toFixed(1)}%` +
      ` (${crossPair[0]} / ${crossPair[1]})${note}`
  );
}

const indexableCount = [...routes.values()].filter(Boolean).length;
console.log(
  `postbuild: ${routes.size} routes, ${indexableCount} indexable, ${listed.size} in sitemaps`
);
console.log(
  `postbuild: validated ${schemaBlockCount} JSON-LD blocks across ${schemaPageCount} pages`
);
console.log(
  `postbuild: checked ${internalLinkCount} internal links and ${localImageCount} local images`
);
if (errors.length) {
  console.error('\npostbuild FAILED:\n' + errors.map((e) => '  x ' + e).join('\n'));
  process.exit(1);
}
console.log('postbuild: sitemap and routes agree.');
