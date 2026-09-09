import site from '../../site.config.json' with { type: 'json' };
import { indexablePages, sectionOf } from '../lib/content.js';

/**
 * Sitemap index. CONTENT-PLAN.md section 6 calls for one sitemap per section
 * so an indexing problem can be diagnosed per page type rather than
 * site-wide. Sections with no indexable pages are omitted — an empty sitemap
 * is worse than no sitemap.
 */
export function GET() {
  const used = new Set(indexablePages.map((p) => sectionOf(p.url)));
  const now = new Date().toISOString().slice(0, 10);
  const entries = site.sections
    .filter((s) => used.has(s.id))
    .map(
      (s) =>
        `  <sitemap><loc>${site.domain}/sitemap-${s.id}.xml</loc><lastmod>${now}</lastmod></sitemap>`
    );

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</sitemapindex>
`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
