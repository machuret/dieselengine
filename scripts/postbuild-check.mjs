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

const indexableCount = [...routes.values()].filter(Boolean).length;
console.log(
  `postbuild: ${routes.size} routes, ${indexableCount} indexable, ${listed.size} in sitemaps`
);
if (errors.length) {
  console.error('\npostbuild FAILED:\n' + errors.map((e) => '  x ' + e).join('\n'));
  process.exit(1);
}
console.log('postbuild: sitemap and routes agree.');
