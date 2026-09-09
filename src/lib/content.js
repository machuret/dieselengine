import site from '../../site.config.json' with { type: 'json' };
import { toPage } from './gates.js';
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

/**
 * Everything that belongs in a sitemap: the content pages that cleared their
 * gates, plus the .astro routes. Those are real URLs — the homepage most of
 * all — and were previously absent from the sitemap because it only ever read
 * from content/.
 */
export const indexablePages = [
  ...allPages.filter((p) => p.indexable),
  ...(site.staticRoutes ?? []).map((r) => ({
    url: r.url,
    pageType: 'static',
    priority: r.priority,
    updated: null,
    indexable: true,
  })),
].sort((a, b) => a.url.localeCompare(b.url));
