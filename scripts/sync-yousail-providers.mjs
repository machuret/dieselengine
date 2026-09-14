#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SITE_KEY = 'marinedieselengine';
export const SERVICE_KEY = 'diesel_engine_service';
const endpoint = (process.env.YOUSAIL_CONTENT_API_URL || `https://yousail.com.au/api/content-platform/v1/sites/${SITE_KEY}`).replace(/\/$/, '');

export async function fetchSnapshot({ secret, fetchImpl = fetch, now = new Date() }) {
  if (!secret || secret.length < 32) throw new Error('YOUSAIL_CONTENT_API_SECRET must contain at least 32 characters');
  const summaries = [];
  let totalCount = null;
  for (let offset = 0; totalCount === null || summaries.length < totalCount; offset = summaries.length) {
    const page = await getJson(`${endpoint}/businesses?limit=50&offset=${offset}`, secret, fetchImpl);
    if (page.apiVersion !== '1' || page.site?.key !== SITE_KEY || page.filter?.serviceKey !== SERVICE_KEY) throw new Error('YouSail returned the wrong feed contract');
    totalCount ??= page.pagination.totalCount;
    if (page.pagination.totalCount !== totalCount) throw new Error('YouSail count changed during pagination');
    summaries.push(...page.businesses);
    if (!page.businesses.length && summaries.length < totalCount) throw new Error('YouSail pagination stopped early');
  }
  if (!totalCount) throw new Error('Refusing to replace marine-diesel membership with an empty feed');
  if (summaries.length !== totalCount) throw new Error(`Expected ${totalCount} businesses, received ${summaries.length}`);
  if (new Set(summaries.map((item) => item.slug)).size !== totalCount) throw new Error('Duplicate provider slug in YouSail feed');
  const businesses = [];
  for (const summary of summaries) {
    const detail = await getJson(`${endpoint}/businesses/${encodeURIComponent(summary.slug)}`, secret, fetchImpl);
    if (detail.business?.slug !== summary.slug) throw new Error(`Detail mismatch for ${summary.slug}`);
    businesses.push(mapBusiness(detail.business));
  }
  return { apiVersion: '1', siteKey: SITE_KEY, syncedAt: now.toISOString(), totalCount, businesses };
}

export function stableSnapshot(previous, next) {
  return previous?.apiVersion === next.apiVersion && previous?.siteKey === next.siteKey
    && previous?.totalCount === next.totalCount && JSON.stringify(previous.businesses) === JSON.stringify(next.businesses)
    ? previous : next;
}

function mapBusiness(business) {
  if (!business.sourceId || !business.slug || !business.name || !business.canonicalUrl) throw new Error('Provider detail is missing stable identity');
  return {
    sourceId: business.sourceId, slug: business.slug, name: business.name,
    state: business.location?.stateOrTerritory, suburb: business.location?.suburb,
    address: business.location?.address, postcode: business.location?.postcode,
    operatingScope: business.operatingScope, serviceArea: business.serviceArea,
    services: business.services ?? [], website: business.contact?.website,
    phone: business.contact?.phone, email: business.contact?.email,
    logoImageUrl: business.media?.logoImageUrl, featureImageUrl: business.media?.heroImageUrl,
    yousailUrl: business.canonicalUrl, sourceUpdatedAt: business.sourceUpdatedAt,
  };
}

async function getJson(url, secret, fetchImpl) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetchImpl(url, { headers: { authorization: `Bearer ${secret}`, accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`);
      return response.json();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
  throw lastError;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const output = path.join(root, 'data/yousail-providers.json');
  let previous = null;
  try { previous = JSON.parse(fs.readFileSync(output, 'utf8')); } catch {}
  const next = stableSnapshot(previous, await fetchSnapshot({ secret: process.env.YOUSAIL_CONTENT_API_SECRET }));
  const previousText = fs.existsSync(output) ? fs.readFileSync(output, 'utf8') : '';
  const nextText = `${JSON.stringify(next, null, 2)}\n`;
  if (nextText !== previousText) fs.writeFileSync(output, nextText);
  console.log(nextText === previousText ? `Snapshot already current: ${next.totalCount} providers.` : `Replaced membership with ${next.totalCount} YouSail providers.`);
}
