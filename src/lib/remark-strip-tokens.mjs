import { BLOCKING_TOKENS } from './gates.js';

const ONLY_TOKEN = /^\{\{([A-Z][A-Z0-9_]*)(?::[A-Za-z0-9_.-]+)?\}\}$/;

/**
 * Removes paragraphs that consist solely of a non-blocking placeholder — today
 * that is {{PRICE_TABLE:...}}, standing in for price data not yet sourced.
 * See the note in gates.js: the page is better served without an empty cost
 * section than withheld entirely, and gateFailures() still blocks anything
 * whose placeholder is load-bearing.
 *
 * Blocking placeholders are deliberately left in the output. They only appear
 * on pages that are already noindex, and leaving them visible makes the missing
 * data obvious to anyone reviewing a draft.
 */
export function remarkStripTokens() {
  return (tree) => {
    tree.children = tree.children.filter((node) => {
      if (node.type !== 'paragraph' || node.children?.length !== 1) return true;
      const child = node.children[0];
      if (child.type !== 'text') return true;
      const m = ONLY_TOKEN.exec(child.value.trim());
      return !m || BLOCKING_TOKENS.has(m[1]);
    });
  };
}
