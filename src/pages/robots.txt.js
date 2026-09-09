import site from '../../site.config.json' with { type: 'json' };
import { indexablePages } from '../lib/content.js';

export function GET() {
  // Until something is actually publishable, tell crawlers not to index rather
  // than advertising a sitemap that points at nothing.
  const open = indexablePages.length > 0;
  const body = open
    ? `User-agent: *
Allow: /

Sitemap: ${site.domain}/sitemap.xml
`
    : `User-agent: *
Disallow: /
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
