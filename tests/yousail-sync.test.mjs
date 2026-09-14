import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchSnapshot, stableSnapshot } from '../scripts/sync-yousail-providers.mjs';

test('imports the exact protected YouSail feed with stable identities', async () => {
  const queue = [
    { apiVersion: '1', site: { key: 'marinedieselengine' }, filter: { serviceKey: 'diesel_engine_service' }, pagination: { totalCount: 1 }, businesses: [{ slug: 'alpha' }] },
    { business: { sourceId: '11111111-1111-4111-8111-111111111111', slug: 'alpha', name: 'Alpha Diesel', canonicalUrl: 'https://yousail.com.au/directory/alpha', location: { stateOrTerritory: 'NSW' }, contact: {}, media: {}, services: ['Marine diesel engines'] } },
  ];
  const snapshot = await fetchSnapshot({ secret: 'x'.repeat(32), fetchImpl: async () => ({ ok: true, json: async () => queue.shift() }), now: new Date('2026-09-15') });
  assert.equal(snapshot.totalCount, 1);
  assert.equal(snapshot.businesses[0].sourceId, '11111111-1111-4111-8111-111111111111');
  assert.match(snapshot.businesses[0].yousailUrl, /^https:\/\/yousail\.com\.au\/directory\//);
});

test('fails closed on an empty feed', async () => {
  const page = { apiVersion: '1', site: { key: 'marinedieselengine' }, filter: { serviceKey: 'diesel_engine_service' }, pagination: { totalCount: 0 }, businesses: [] };
  await assert.rejects(fetchSnapshot({ secret: 'x'.repeat(32), fetchImpl: async () => ({ ok: true, json: async () => page }) }), /empty feed/);
});

test('does not rewrite an unchanged snapshot timestamp', () => {
  const previous = { apiVersion: '1', siteKey: 'marinedieselengine', syncedAt: 'old', totalCount: 1, businesses: [{ slug: 'alpha' }] };
  const next = { ...previous, syncedAt: 'new' };
  assert.equal(stableSnapshot(previous, next), previous);
});
