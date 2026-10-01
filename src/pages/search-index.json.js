import { allPages } from '../lib/content.js';
import { questionClusters } from '../lib/questions.js';
import { editorialGuides } from '../data/editorial-guides.js';
import { supplierPages } from '../data/supplier-pages.js';
import site from '../../site.config.json' with { type: 'json' };

export const prerender = true;

const staticRecords = [
  ['/', 'Marine Diesel Engines Australia', site.description, 'Home'],
  ['/services/', 'Marine Diesel Engine Services', 'Understand common marine diesel service and repair jobs, their scope and the questions to ask before approving work.', 'Services'],
  ['/resources/', 'Marine Diesel Authority Resources', 'Official manufacturer manuals, Australian regulators, safety organisations and consumer resources for marine engine owners.', 'Resources'],
  ['/about/', 'About Marine Diesel Engine Australia', 'Who publishes this independent marine engine information site and what its editorial team does and does not do.', 'About'],
  ['/editorial-policy/', 'Editorial and Sourcing Policy', 'How the site researches, sources, reviews, updates and corrects marine diesel information.', 'Policy'],
  ['/disclaimer/', 'Marine Diesel Information Disclaimer', 'Important limits of general marine diesel information and when to use qualified professional help.', 'Safety'],
];

function records() {
  const result = [
    ...allPages.filter((page) => page.indexable).map((page) => ({
      url: page.url,
      title: page.title,
      description: page.description,
      type: page.pageType,
      keywords: [page.primaryKeyword, ...(page.keywords ?? [])].filter(Boolean),
    })),
    ...editorialGuides.map((guide) => ({
      url: `/guides/${guide.slug}/`, title: guide.title,
      description: guide.description, type: 'Guide', keywords: [guide.intent],
    })),
    ...supplierPages.map((page) => ({
      url: `/marine-engine-suppliers/${page.slug}/`, title: page.title,
      description: page.description, type: 'Supplier guide', keywords: page.points,
    })),
    ...questionClusters.map((cluster) => ({
      url: `/questions/${cluster.slug}/`, title: `${cluster.title} questions`,
      description: cluster.blurb, type: 'Questions',
      keywords: cluster.items.flatMap((item) => [item.question, item.answer]),
    })),
    ...staticRecords.map(([url, title, description, type]) => ({
      url, title, description, type, keywords: [],
    })),
  ];

  const unique = new Map();
  for (const record of result) {
    if (!unique.has(record.url)) unique.set(record.url, record);
  }
  return [...unique.values()];
}

export function GET() {
  return new Response(JSON.stringify(records()), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
