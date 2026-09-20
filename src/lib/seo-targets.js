import { metaDescription } from './extract.js';

const INTENT_BY_TYPE = {
  pillar: 'Category',
  'service-national': 'Commercial service',
  'city-hub': 'Local commercial',
  'region-hub': 'Local informational',
  precinct: 'Local commercial',
  'buying-city': 'Transactional local',
  distributor: 'Commercial brand',
  'brand-hub': 'Brand informational',
  'boat-brand': 'Brand informational',
  symptom: 'Diagnostic informational',
  howto: 'How-to informational',
  decision: 'Informational comparison',
};

const PILLAR_TARGETS = {
  '/costs/': {
    h1: 'Marine Engine Repair Costs in Australia',
    keyword: 'marine engine repair cost Australia',
    description: 'Compare marine engine repair costs in Australia, including mechanic labour rates, service prices, parts, access charges and quote requirements.',
  },
  '/how/': {
    h1: 'Marine Diesel Maintenance and Repair Procedures',
    keyword: 'marine diesel maintenance procedures',
    description: 'Marine diesel maintenance and repair procedures covering oil, impellers, cooling, fuel, gearbox checks, fault diagnosis and safe shutdowns.',
  },
  '/marine-diesel/': {
    h1: 'Marine Diesel Services by Australian Region',
    keyword: 'marine diesel services Australia',
    description: 'Find marine diesel service information by Australian region, including local operating conditions, repair planning, parts access and marine trades.',
  },
  '/find-a-marine-mechanic/': {
    h1: 'Marine Diesel Mechanics in Australia',
    keyword: 'marine diesel mechanic Australia',
    description: 'Find marine diesel mechanics in Australia, compare local service areas and learn what to ask about engine experience, call-outs, quotes and repairs.',
  },
  '/marine-diesel-engines/': {
    h1: 'Marine Diesel Engines in Australia',
    keyword: 'marine diesel engines Australia',
    description: 'Marine diesel engine guides for Australian boat owners covering cooling, fuel, exhaust, electrical systems, maintenance, faults and service planning.',
  },
  '/marine-engine-problems/': {
    h1: 'Marine Diesel Engine Problems and Symptoms',
    keyword: 'marine diesel engine problems',
    description: 'Diagnose marine diesel engine problems by symptom, including overheating, smoke, power loss, starting faults, alarms, fuel issues and vibration.',
  },
  '/engine-brands/': {
    h1: 'Marine Diesel Engine Brands in Australia',
    keyword: 'marine diesel engine brands',
    description: 'Compare marine diesel engine brands in Australia, including model families, base engines, parts support, distributors and repower considerations.',
  },
  '/buy-marine-diesel-engine/': {
    h1: 'Buy a Marine Diesel Engine in Australia',
    keyword: 'buy marine diesel engine Australia',
    description: 'Compare marine diesel engines for sale in Australia, authorised dealers, brands, repower requirements, installation scope and supplier quotes.',
  },
  '/distributors/': {
    h1: 'Marine Diesel Engine Distributors in Australia',
    keyword: 'marine diesel engine distributors Australia',
    description: 'Find marine diesel engine distributors in Australia by brand, with guidance on authorised dealers, parts support, warranty and service coverage.',
  },
  '/marine-diesel-engine-for/': {
    h1: 'Marine Diesel Engines by Boat Brand',
    keyword: 'marine diesel engines by boat brand',
    description: 'Compare marine diesel engine installations by boat brand, including common engines, drives, service access, known issues and repower options.',
  },
};

function clean(value = '') {
  return value
    .replace(/\bMarine Marine\b/gi, 'Marine')
    .replace(/\bGearboxes Marine Engines\b/i, 'Marine Gearboxes')
    .replace(/\s+/g, ' ')
    .trim();
}

function placeName(page) {
  return page.geo?.city || clean(page.title)
    .replace(/^Marine Diesel (?:At|In) /i, '')
    .replace(/^Buy A Marine Diesel Engine In /i, '');
}

function brandName(page) {
  if (page.brand) return page.brand;
  return clean(page.title)
    .replace(/ Marine Engines? In Australia$/i, '')
    .replace(/ Engine Distributors In Australia$/i, '')
    .replace(/ Marine Distributors In Australia$/i, '')
    .trim();
}

function conciseTitle(title) {
  const cleaned = clean(title).replace(/\bAnd\b/g, '&');
  if (cleaned.length <= 65) return cleaned;
  const withoutFiller = cleaned
    .replace('Inspection & Replacement', 'Replacement')
    .replace('Emergency & On-Water', 'Emergency On-Water')
    .replace('Marine Diesel Engine', 'Marine Engine');
  return withoutFiller.length <= 65 ? withoutFiller : withoutFiller;
}

function descriptionFor(page, current) {
  const h1 = page.h1;
  const place = placeName(page);
  const brand = brandName(page);
  const templates = {
    'service-national': `${h1}: service scope, common faults, inspection points, Australian cost factors and questions to ask a qualified marine mechanic.`,
    symptom: `${h1}: common marine diesel causes, safe checks, professional diagnosis, likely repairs and clear guidance on when to stop the engine.`,
    howto: `${h1}: preparation, tools, step-by-step checks, common mistakes, safety limits and when to use a qualified marine mechanic.`,
    'city-hub': `Find marine diesel mechanics in ${place}. Compare local service areas, engine experience, call-out questions and typical boat engine repair costs.`,
    'region-hub': `Marine diesel services in ${place}: local operating conditions, common engine faults, parts access, repair planning and nearby marine trades.`,
    precinct: `Marine diesel services in ${place}: local marina access, common engine work, operating conditions, repair planning and questions for marine mechanics.`,
    'buying-city': `Buy a marine diesel engine in ${place}: compare dealers, brands, repower planning, installation scope, service support and quote requirements.`,
    'brand-hub': /transmission/i.test(page.brandSegment || '')
      ? `${brand} in Australia: gearbox and transmission models, parts, service support, common faults and replacement or repower considerations.`
      : /saildrive/i.test(page.brandSegment || '')
        ? `${brand} in Australia: saildrive models, diaphragms, corrosion, parts, service support and replacement considerations for boat owners.`
        : /genset/i.test(page.brandSegment || '')
          ? `${brand} in Australia: marine generator options, base engines, parts, service support, common faults and replacement considerations.`
          : `${brand} marine engines in Australia: models, base engines, parts, service support, common faults and buying or repower considerations.`,
    distributor: `Find ${brand} marine engine distributors and dealers in Australia. Check authorised service, parts support, model coverage and booking questions.`,
    'boat-brand': `${h1}: common installations, service access, cooling and drive issues, parts support and repower considerations for Australian owners.`,
  };
  const proposed = templates[page.pageType];
  if (proposed) return metaDescription(proposed, 160);

  const text = String(current || '').trim();
  if (text.length >= 120 && text.length <= 160) return text;
  const prefixed = text.toLowerCase().includes(h1.toLowerCase().slice(0, 24))
    ? text
    : `${h1}: ${text}`;
  const expanded = prefixed.length < 120
    ? `${prefixed.replace(/[.!?]?$/, '.')} Includes Australian context, practical checks, cost factors and related marine diesel service guidance.`
    : prefixed;
  return metaDescription(expanded, 160);
}

export function optimisePageSeo(page, currentDescription) {
  const pillar = PILLAR_TARGETS[page.url];
  if (pillar) {
    page.h1 = pillar.h1;
    page.title = pillar.h1;
    page.primaryKeyword = pillar.keyword;
    page.description = pillar.description;
  } else {
    page.primaryKeyword = page.keyword || clean(page.title);
    page.h1 = clean(page.title);

    if (page.pageType === 'region-hub') {
      page.h1 = `Marine Diesel Services in ${placeName(page)}`;
      page.title = page.h1;
      page.primaryKeyword = `marine diesel services ${placeName(page)}`;
    } else if (page.pageType === 'precinct') {
      page.h1 = `Marine Diesel Services in ${placeName(page)}`;
      page.title = page.h1;
      page.primaryKeyword = `marine diesel services ${placeName(page)}`;
    } else if (page.pageType === 'brand-hub') {
      const brand = brandName(page);
      if (/transmission/i.test(page.brandSegment || '') || /gearbox/i.test(brand)) {
        page.h1 = `${brand} in Australia`;
      } else if (/saildrive|genset|base-engine/i.test(page.brandSegment || '')) {
        page.h1 = `${brand} in Australia`;
      } else {
        page.h1 = `${brand} Engines in Australia`;
      }
      page.title = page.h1;
      page.primaryKeyword = `${brand} Australia`;
    } else {
      page.title = page.h1;
    }
    page.description = descriptionFor(page, currentDescription);
  }

  page.searchIntent = INTENT_BY_TYPE[page.pageType] || 'Informational';
  page.seoTitleTag = conciseTitle(page.h1);
  page.keywords = [page.primaryKeyword, ...(page.secondaryKeywords ?? [])].filter(Boolean);
  return page;
}
