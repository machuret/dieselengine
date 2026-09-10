import site from '../../site.config.json' with { type: 'json' };
import { toPage } from './gates.js';
import { extractFaqs, firstParagraph, metaDescription, seoTitle } from './extract.js';

// Source data the pages are generated from. Loading it here lets a page know
// its own service cluster and its location's coordinates, which is what makes
// related links accurate rather than guessed from word overlap.
const csvFiles = import.meta.glob('/data/*.csv', { eager: true, query: '?raw', import: 'default' });

function parseCsv(raw) {
  const [head, ...lines] = (raw ?? '').trim().split('\n');
  const cols = head.split(',');
  return lines.map((line) => {
    // Values may be quoted and contain commas.
    const cells = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g)?.map((c) =>
      c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"')) ?? [];
    return Object.fromEntries(cols.map((c, i) => [c, cells[i]]));
  });
}

function indexBy(file, key) {
  const rows = parseCsv(csvFiles[file]);
  return Object.fromEntries(rows.filter((r) => r[key]).map((r) => [r[key], r]));
}

const GEO = indexBy('/data/cities.csv', 'slug');
const SERVICES = indexBy('/data/services.csv', 'slug');
const TOPICS = indexBy('/data/decision-topics.csv', 'slug');
export { sectionOf, gateFailures } from './gates.js';

// Astro parses the YAML front matter of every file under /content and hands us
// the compiled body as a component.
const modules = import.meta.glob('/content/**/*.md', { eager: true });

function build() {
  const pages = [];
  for (const [file, mod] of Object.entries(modules)) {
    const raw = mod.rawContent ? mod.rawContent() : '';
    const page = toPage(mod.frontmatter ?? {}, raw, file);
    page.Content = mod.Content;
    // Only h2s: these pages are long, and a two-level contents list is noise.
    page.headings = (mod.getHeadings?.() ?? []).filter((h) => h.depth === 2);
    // Derived metadata. Every page previously served the site-wide description,
    // so all 59 shared one meta description; and every title ran past the ~60
    // characters a search result shows.
    page.description = page.description || metaDescription(firstParagraph(raw));
    page.seoTitleTag = seoTitle(page, site.shortName);
    page.faqs = extractFaqs(raw);
    const slug = page.url.replace(/\/$/, '').split('/').pop();
    // Both the mechanic directory and the buying pages are about a real
    // place, so both earn Place/PostalAddress schema from the same source.
    if (page.pageType === 'city-hub' || page.pageType === 'buying-city') {
      page.geo = GEO[slug] ?? null;
    }
    if (page.pageType === 'service-national') {
      page.cluster = SERVICES[slug]?.cluster ?? null;
    }
    // Guides carry the cluster they were planned under (cost, comparison,
    // buyers-guide, compliance, education) so Related can pair a cost guide
    // with the other cost guides rather than with whatever sorts first.
    if (page.pageType === 'decision') page.cluster = TOPICS[slug]?.cluster ?? null;
    pages.push(page);
  }

  const seen = new Set();
  for (const p of pages) {
    if (seen.has(p.url)) throw new Error(`Duplicate url ${p.url} (${p.file})`);
    seen.add(p.url);
  }
  pages.sort((a, b) => a.url.localeCompare(b.url));
  return pages;
}

export const allPages = build();
export const indexablePages = allPages.filter((p) => p.indexable);
