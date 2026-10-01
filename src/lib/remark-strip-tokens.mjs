/**
 * Resolves the {{TOKEN}} placeholders the content ships with.
 *
 * Neither kind is allowed to reach a reader as raw `{{...}}`. A page is
 * published without the section, or with an honest note in its place — never
 * with a visible template artefact, and never with invented data.
 *
 *   {{PRICE_TABLE:x}}  removed entirely. A service page missing its local price
 *                      band is still a complete explanation of the job, so the
 *                      section is dropped rather than announced.
 *
 *   {{PROVIDERS:x}}    replaced with a note. This one is announced because the
 *                      reader arrived looking for operators, and an unexplained
 *                      gap where the listings should be reads as broken.
 */

const ONLY_TOKEN = /^\{\{([A-Z][A-Z0-9_]*)(?::([A-Za-z0-9_.-]+))?\}\}$/;

function titleCase(slug) {
  return (slug ?? '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function nodeText(node) {
  return (node?.children ?? [])
    .map((child) => child.value ?? '')
    .join(' ')
    .trim();
}

export function remarkStripTokens() {
  return (tree) => {
    const out = [];
    for (const node of tree.children) {
      const only =
        node.type === 'paragraph' &&
        node.children?.length === 1 &&
        node.children[0].type === 'text'
          ? ONLY_TOKEN.exec(node.children[0].value.trim())
          : null;

      if (!only) {
        out.push(node);
        continue;
      }

      const [, name, arg] = only;

      if (name === 'DEALERS') {
        // Same contract as PROVIDERS, different preposition: a distributor
        // page's listing is "for a brand", not "in a place", and the wrong
        // one reads as broken English on 20 pages.
        const brand = arg ? ` for ${titleCase(arg)}` : '';
        out.push({
          type: 'html',
          value:
            `<div class="pending-note"><strong>Verified dealer and service ` +
            `listings${brand} are being compiled.</strong> We list marine ` +
            `businesses only after confirming them directly, so none appear ` +
            `here yet. Until they do, the manufacturer's own dealer locator ` +
            `is the authoritative list, and the guidance on this page applies ` +
            `whoever you choose.</div>`,
        });
        continue;
      }

      if (name === 'PROVIDERS') {
        const where = arg ? ` in ${titleCase(arg)}` : '';
        out.push({
          type: 'html',
          value:
            `<div class="pending-note"><strong>Operator listings${where} are ` +
            `being verified.</strong> We list marine businesses only after ` +
            `confirming them directly, so none appear here yet. The guidance ` +
            `on this page applies whoever you choose.</div>`,
        });
        continue;
      }

      if (name === 'PRICE_TABLE') {
        // A number of drafts put the token directly below a cost heading. If
        // the unverified table is removed, that otherwise leaves a visibly
        // empty section (and a useless jump-link) in the published article.
        const previous = out.at(-1);
        if (
          previous?.type === 'heading' &&
          previous.depth === 2 &&
          /\b(cost|costs|price|pricing)\b/i.test(nodeText(previous))
        ) {
          out.pop();
        }
        continue;
      }

      // Unknown placeholders are dropped rather than exposed to readers.
    }
    tree.children = out;
  };
}
