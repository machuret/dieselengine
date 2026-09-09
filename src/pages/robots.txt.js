import site from '../../site.config.json' with { type: 'json' };
import { sitemapRoutes as indexablePages } from '../lib/routes.js';

/**
 * AI crawlers are explicitly allowed.
 *
 * This is a referral site: being quoted by an assistant that then names the
 * source is distribution, not theft, and the same reasoning that makes the
 * content worth publishing makes it worth being cited from. Listing the major
 * agents by name states that intent rather than leaving it to a default.
 *
 * To reverse it, change these to Disallow — and note that Google-Extended
 * governs Gemini training only, not Googlebot, so disallowing it does not
 * affect ordinary search indexing.
 */
const AI_AGENTS = [
  'GPTBot',            // OpenAI, training
  'OAI-SearchBot',     // OpenAI, search results
  'ChatGPT-User',      // OpenAI, user-initiated fetch
  'ClaudeBot',         // Anthropic
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',   // Gemini training; separate from Googlebot
  'Applebot-Extended',
  'CCBot',             // Common Crawl
  'Bytespider',
  'meta-externalagent',
  'cohere-ai',
  'Amazonbot',
  'DuckAssistBot',
  'MistralAI-User',
  'YouBot',
];

export function GET() {
  const open = indexablePages.length > 0;
  if (!open) {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const body = [
    '# Search and AI crawlers are both welcome here.',
    '# Full site index: /sitemap.xml   Plain-text summary: /llms.txt',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# Named AI agents, allowed explicitly rather than by default.',
    ...AI_AGENTS.flatMap((a) => [`User-agent: ${a}`, 'Allow: /', '']),
    `Sitemap: ${site.domain}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
