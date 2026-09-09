import { allPages } from './content.js';
import { slugifyQuestion } from './extract.js';

/**
 * The 265 Q&A pairs across the site, grouped into topic clusters.
 *
 * One page per question was the obvious reading of "unique URLs", but the
 * answers run 25-35 words: 265 pages of that is a doorway-page pattern, which
 * is penalised rather than rewarded. Clustering by topic gives unique URLs that
 * each carry 15-40 substantial answers, which is a page worth ranking.
 */
export const CLUSTERS = [
  { slug: 'overheating-and-cooling', title: 'Overheating and cooling',
    blurb: 'Impellers, heat exchangers, exhaust elbows, strainers and the raw water circuit — the system behind most marine engine failures in Australia.',
    match: /impeller|heat-exchanger|exhaust-elbow|aftercooler|raw-water|cooling-system|overheat/ },
  { slug: 'fuel-and-diesel-bug', title: 'Fuel, tanks and diesel bug',
    blurb: 'Contaminated fuel, microbial growth, blocked filters and water in the tank — on a boat the tank causes more trouble than the engine.',
    match: /fuel-polishing|diesel-bug|fuel-filter|fuel-pump|injector/ },
  { slug: 'gearbox-and-drives', title: 'Gearboxes, sterndrives and shafts',
    blurb: 'ZF and Twin Disc gearboxes, sterndrive bellows, stern glands, shafts and alignment.',
    match: /gearbox|sterndrive|shaft-seal|alignment|propeller-shaft/ },
  { slug: 'rebuilds-and-repowers', title: 'Rebuilds, repowers and major work',
    blurb: 'When to rebuild, when to repower, what a reconditioned engine really is, and what saltwater ingress costs.',
    match: /rebuild|reconditioning|repower|cylinder-head|head-gasket|saltwater-damage|turbo|engine-repair/ },
  { slug: 'servicing-and-layup', title: 'Servicing, layup and recommissioning',
    blurb: 'Service intervals by hours and by calendar, winter layup, recommissioning, and why low hours is not good news.',
    match: /engine-service|winterisation|recommissioning|oil-analysis|anode|corrosion/ },
  { slug: 'buying-and-surveys', title: 'Buying a boat and engine surveys',
    blurb: 'Pre-purchase engine inspections, sea trials, and the findings that should change your offer.',
    match: /survey|sea-trial/ },
  { slug: 'finding-a-mechanic', title: 'Finding and choosing a mechanic',
    blurb: 'Which trade does which job, mobile versus workshop versus haul-out, and what to ask before booking.',
    match: /diesel-mechanic|mobile|emergency|slipway|electrical|alarms/ },
  { slug: 'commercial-and-charter', title: 'Commercial, charter and workboats',
    blurb: 'Survey obligations, downtime economics, and how commercial operators maintain engines differently.',
    match: /commercial-vessel|charter-fleet|workboat|yacht-auxiliary/ },
  { slug: 'by-location', title: 'Questions by location',
    blurb: 'Local conditions, seasonality and access, from the Gold Coast to Port Stephens.',
    match: /^\/marine-mechanics\// },
];

function clusterFor(url) {
  return CLUSTERS.find((c) => c.match.test(url)) ?? CLUSTERS[CLUSTERS.length - 1];
}

function build() {
  const seen = new Map();
  for (const c of CLUSTERS) c.items = [];
  for (const p of allPages) {
    if (!p.indexable || !p.faqs?.length) continue;
    for (const f of p.faqs) {
      // The same question can be asked on more than one page; keep the first,
      // rather than publishing the same Q&A twice under different clusters.
      const key = f.question.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      if (seen.has(key)) continue;
      seen.set(key, true);
      clusterFor(p.url).items.push({
        ...f,
        id: slugifyQuestion(f.question),
        source: p.url,
        sourceTitle: p.title,
      });
    }
  }
  return CLUSTERS.filter((c) => c.items.length > 0);
}

export const questionClusters = build();
export const questionCount = questionClusters.reduce((n, c) => n + c.items.length, 0);
