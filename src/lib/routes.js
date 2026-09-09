import site from '../../site.config.json' with { type: 'json' };
import { allPages, sectionOf } from './content.js';
import { questionClusters } from './questions.js';

/**
 * The single list of everything that should appear in a sitemap: content pages
 * that cleared their gates, the hand-written .astro routes, and the question
 * cluster pages generated from the site's FAQs.
 *
 * Everything that builds or verifies a sitemap reads this, so a new route
 * cannot be added in one place and forgotten in another — which is exactly how
 * the homepage stayed out of the sitemap.
 */
export const sitemapRoutes = [
  ...allPages.filter((p) => p.indexable).map((p) => ({
    url: p.url,
    pageType: p.pageType,
    updated: p.updated,
  })),
  ...(site.staticRoutes ?? []).map((r) => ({
    url: r.url,
    pageType: 'static',
    priority: r.priority,
    updated: null,
  })),
  ...questionClusters.map((c) => ({
    url: `/questions/${c.slug}/`,
    pageType: 'questions',
    priority: '0.7',
    updated: null,
  })),
].sort((a, b) => a.url.localeCompare(b.url));

export { sectionOf };
