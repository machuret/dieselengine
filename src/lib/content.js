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
