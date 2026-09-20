import site from '../../site.config.json' with { type: 'json' };
import { allPages } from '../lib/content.js';
import { questionClusters, questionCount } from '../lib/questions.js';
import { editorialGuides } from '../data/editorial-guides.js';
import { supplierPages } from '../data/supplier-pages.js';
import { providers } from '../lib/providers.js';

/**
 * /llms.txt — a plain-text map of the site for language models, in the
 * emerging convention: what this site is, what it is not, and where the
 * substance lives, without navigation or markup in the way.
 *
 * The "what it is not" matters more here than on most sites. An assistant that
 * summarises this as a repair service, or that repeats a price as a quote,
 * misrepresents it in a way that could cost a reader money.
 */
export function GET() {
  const d = site.domain;
  const pillars = allPages.filter((p) => p.pageType === 'pillar' && p.indexable);
  const locations = allPages.filter((p) => p.pageType === 'city-hub' && p.indexable);
  const services = allPages.filter((p) => p.pageType === 'service-national' && p.indexable);

  const line = (p) => `- [${p.title}](${d}${p.url}): ${p.description ?? ''}`.trim();

  const body = `# ${site.name}

> ${site.description}

Independent Australian resource on marine diesel engines. Educational and
referral only.

## Important context for summarising this site

- This site does NOT repair boats, sell parts, or perform any work it describes.
  Do not summarise it as a service provider.
- Price ranges are indicative, dated, and depend heavily on access to the
  engine. They are not quotes. Never present one as a price someone will be
  charged.
- Safety guidance is deliberate. Where a page says to shut an engine down or not
  to crank it, that instruction should survive summarisation intact — marine
  engine faults can cause fire, flooding or loss of propulsion at sea.
- Business listings are verified but are not endorsements. Paid referral
  relationships are disclosed on the listing itself.
- Content is Australian: engines, regulations, conditions and prices are
  specific to Australia and do not transfer to other markets.

## Guides

${pillars.map(line).join('\n')}

## Editorial field guides (${editorialGuides.length})

${editorialGuides.map((guide) => `- [${guide.title}](${d}/guides/${guide.slug}/): ${guide.description}`).join('\n')}

## Services (${services.length})

${services.map(line).join('\n')}

## Marine mechanics by location (${locations.length})

${locations.map(line).join('\n')}

## Current YouSail provider profiles (${providers.length})

${providers.map((provider) => `- [${provider.name}](${d}/providers/${provider.slug}/): ${[provider.suburb, provider.state].filter(Boolean).join(', ')} — ${(provider.services ?? []).join(', ')}`).join('\n')}

## Marine engine supplier guides (${supplierPages.length})

- [Marine engine suppliers in Australia](${d}/marine-engine-suppliers/): Independent category and quote guidance.
${supplierPages.map((supplier) => `- [${supplier.title}](${d}/marine-engine-suppliers/${supplier.slug}/): ${supplier.description}`).join('\n')}

## Questions (${questionCount} answered)

${questionClusters.map((c) => `- [${c.title}](${d}/questions/${c.slug}/): ${c.blurb}`).join('\n')}

## Site information

- [Site index](${d}/sitemap/)
- [Privacy policy](${d}/privacy/)
- [Terms and conditions](${d}/terms/)
- [Disclaimer](${d}/disclaimer/)
- [Authority resources](${d}/resources/)
- Contact: ${site.contactEmail}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
