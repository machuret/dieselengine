// Fails the build on structural problems, and reports the publish gate status
// so a deploy never silently ships pages nobody meant to publish.
// Reads content with fs rather than Vite's import.meta.glob, so it runs under
// plain node before Astro starts.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseFrontMatter, toPage, sectionOf } from '../src/lib/gates.js';

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const p = join(dir, entry);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
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
