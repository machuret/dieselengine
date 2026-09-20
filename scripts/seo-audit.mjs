import { readFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const domain = 'https://www.marinedieselengine.com.au';

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory.pathname, entry.name);
    return entry.isDirectory() ? htmlFiles(new URL(`file://${path}${sep}`)) : path.endsWith('.html') ? [path] : [];
  }));
  return nested.flat();
}

function decode(value = '') {
  return value.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
}

function capture(html, pattern) {
  return decode(html.match(pattern)?.[1] ?? '');
}

const files = await htmlFiles(dist);
const records = [];
const errors = [];

for (const file of files) {
  const html = await readFile(file, 'utf8');
  if (/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
  const route = `/${relative(dist.pathname, file).split(sep).join('/').replace(/index\.html$/, '')}`;
  const title = capture(html, /<title>([\s\S]*?)<\/title>/i);
  const description = capture(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const canonical = capture(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => decode(match[1]));
  const keyword = capture(html, /<html\b[^>]*data-primary-keyword="([^"]+)"/i);
  const intent = capture(html, /<html\b[^>]*data-search-intent="([^"]+)"/i);
  const expectedCanonical = `${domain}${route}`;
  records.push({ route, title, description, canonical, h1: h1s[0], keyword, intent });

  if (!title) errors.push(`${route}: missing title`);
  if (title.length > 65) errors.push(`${route}: title is ${title.length} characters`);
  if (!description) errors.push(`${route}: missing meta description`);
  if (description.length < 120 || description.length > 165) errors.push(`${route}: meta description is ${description.length} characters`);
  if (h1s.length !== 1) errors.push(`${route}: expected one H1, found ${h1s.length}`);
  if (!keyword) errors.push(`${route}: missing primary keyword target`);
  if (!intent) errors.push(`${route}: missing search intent`);
  if (canonical !== expectedCanonical) errors.push(`${route}: canonical is ${canonical || 'missing'}, expected ${expectedCanonical}`);
  if (/something wrong|how to do it|authority resources|everything you need|explore our|discover/i.test(h1s[0] ?? '')) {
    errors.push(`${route}: vague or editorial H1: ${h1s[0]}`);
  }
}

for (const field of ['title', 'description', 'canonical']) {
  const seen = new Map();
  for (const record of records) {
    if (!record[field]) continue;
    const existing = seen.get(record[field]);
    if (existing) errors.push(`${record.route}: duplicate ${field} also used by ${existing}`);
    else seen.set(record[field], record.route);
  }
}

if (errors.length) {
  console.error(`SEO audit failed with ${errors.length} issue(s):\n${errors.map((error) => `- ${error}`).join('\n')}`);
  process.exit(1);
}

console.log(`SEO audit passed: ${records.length} indexable pages have unique titles, descriptions and canonicals; one H1; explicit keyword and intent; and valid metadata lengths.`);
