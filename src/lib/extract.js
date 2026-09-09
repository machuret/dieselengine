/**
 * Pulls structured data out of the markdown the content is already written in,
 * so pages get real titles, descriptions, FAQ schema and question pages without
 * anyone hand-maintaining a parallel set of metadata.
 */

const FM = /^---\n[\s\S]*?\n---\n/;

/** Markdown inline syntax -> plain text, for use in meta tags and JSON-LD. */
export function plain(md) {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')   // links -> their text
    .replace(/[*_`]/g, '')
    .replace(/^\s*[→·—-]\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The page's opening paragraph, for the meta description. */
export function firstParagraph(md) {
  const body = md.replace(FM, '');
  for (const block of body.split(/\n{2,}/)) {
    const t = block.trim();
    if (!t) continue;
    if (/^(#|>|\||-{3,}|[*+-]\s|\d+\.\s)/.test(t)) continue;  // headings, quotes, tables, rules, lists
    if (/^\{\{/.test(t)) continue;                             // unresolved placeholder
    const text = plain(t);
    if (text.length < 40) continue;                            // link rows and stubs
    return text;
  }
  return '';
}

/**
 * Truncate to a whole sentence where possible, otherwise a whole word, so a
 * description never ends mid-thought. Google renders roughly 155 characters.
 */
export function metaDescription(text, max = 155) {
  if (!text) return '';
  if (text.length <= max) return text;
  const window = text.slice(0, max + 1);
  const sentence = window.lastIndexOf('. ');
  if (sentence > max * 0.55) return window.slice(0, sentence + 1);
  return window.slice(0, window.lastIndexOf(' ')).replace(/[,;:—-]$/, '') + '…';
}

/**
 * Q&A pairs from the "Frequently asked questions" section, which the content
 * writes as a bold question followed by its answer.
 */
export function extractFaqs(md) {
  const body = md.replace(FM, '');
  const start = body.search(/^##\s+Frequently asked questions\s*$/mi);
  if (start === -1) return [];
  let section = body.slice(start).replace(/^##.*\n/, '');
  const nextH2 = section.search(/^##\s/m);
  if (nextH2 !== -1) section = section.slice(0, nextH2);

  const faqs = [];
  // The content writes a question as a bold line with its answer on the very
  // next line, so question and answer share one paragraph block. Split on the
  // bold line rather than on blank lines.
  for (const block of section.split(/\n{2,}/)) {
    const t = block.trim();
    if (!t) continue;
    const m = /^\*\*(.+?)\*\*\s*(?:\n([\s\S]*))?$/.exec(t);
    if (m) {
      const question = plain(m[1]).replace(/\s+/g, ' ');
      const answerMd = (m[2] ?? '').trim();
      if (question && answerMd) {
        faqs.push({ question, answerMd, answer: plain(answerMd) });
      }
      continue;
    }
    // A continuation paragraph belongs to the question above it.
    if (faqs.length) {
      const last = faqs[faqs.length - 1];
      last.answerMd += '\n\n' + t;
      last.answer = plain(last.answerMd);
    }
  }
  return faqs;
}

/** URL-safe slug from a question. */
export function slugifyQuestion(q) {
  return q
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .split('-')
    .slice(0, 12)          // keep URLs readable
    .join('-');
}

/**
 * A title tag that survives the SERP. Search results truncate around 60
 * characters, and every title on this site was over it because the full page
 * title plus the brand never fit. Prefer an explicit seo_title, then the page
 * title with the redundant national suffix removed, and only append the brand
 * when there is room for it.
 */
export function seoTitle(page, brand, max = 60) {
  const base = (page.seoTitle || page.title || '')
    .replace(/\s+in Australia$/i, '')
    .trim();
  const withBrand = `${base} | ${brand}`;
  if (withBrand.length <= max) return withBrand;
  return base.length <= max ? base : base.slice(0, base.lastIndexOf(' ', max)).trim();
}
