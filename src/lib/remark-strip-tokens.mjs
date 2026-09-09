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

      // PRICE_TABLE and anything else: drop the paragraph.
    }
    tree.children = out;
  };
}
