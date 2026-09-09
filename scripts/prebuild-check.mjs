// Fails the build on structural problems, and reports the publish gate status
// so a deploy never silently ships pages nobody meant to publish.
// Reads content with fs rather than Vite's import.meta.glob, so it runs under
// plain node before Astro starts.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseFrontMatter, toPage, sectionOf } from '../src/lib/gates.js';

// Routes that exist as .astro pages rather than as content files.
const STATIC_ROUTES = new Set(['/', '/services/']);

function walk(dir, ext = '.md') {
  return readdirSync(dir).flatMap((entry) => {
    const p = join(dir, entry);
    return statSync(p).isDirectory() ? walk(p, ext) : p.endsWith(ext) ? [p] : [];
  });
}

const pages = walk('content').map((file) => {
  const { data, body } = parseFrontMatter(readFileSync(file, 'utf8'));
  return toPage(data, body, file);
});

const errors = [];
const seen = new Map();
for (const p of pages) {
  if (seen.has(p.url)) errors.push(`${p.file}: duplicate url ${p.url} (also ${seen.get(p.url)})`);
  seen.set(p.url, p.file);
}
for (const p of pages) {
  if (p.parent !== '/' && !seen.has(p.parent)) {
    errors.push(`${p.file}: parent ${p.parent} does not exist yet`);
  }
}

// Links hardcoded in layouts and .astro pages are not covered by the content
// front matter check, and a stale one in the shared layout breaks every page on
// the site at once. Verify them against the real route table.
const templateFiles = walk('src', '.astro');
for (const file of templateFiles) {
  const src = readFileSync(file, 'utf8');
  for (const [, href] of src.matchAll(/href="(\/[^"#?]*)"/g)) {
    if (/\.[a-z0-9]+$/i.test(href)) {
      // An asset reference, not a route. It must exist in public/, or the page
      // silently loads nothing — which is how a missing stylesheet or a
      // dangling feed link reaches production looking fine locally.
      if (!existsSync(join('public', href))) {
        errors.push(`${file}: references ${href}, which is not in public/`);
      }
    } else if (!seen.has(href) && !STATIC_ROUTES.has(href)) {
      errors.push(`${file}: links to ${href}, which is not a route`);
    }
  }
}

const indexable = pages.filter((p) => p.indexable);
console.log(`Pages: ${pages.length}   indexable: ${indexable.length}`);

if (indexable.length === 0) {
  console.log(
    '\n  All pages are served noindex and the sitemap is empty — nothing has\n' +
      '  cleared its publish gates yet. See docs/deployment.md to publish.\n'
  );
} else {
  const bySection = {};
  for (const p of indexable) {
    const s = sectionOf(p.url);
    bySection[s] = (bySection[s] ?? 0) + 1;
  }
  console.log('In sitemap by section:', bySection);
}

if (errors.length) {
  console.error('\nBuild failed:\n' + errors.map((e) => '  x ' + e).join('\n'));
  process.exit(1);
}
