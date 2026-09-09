/**
 * Structural enhancements applied to every markdown page after parsing.
 *
 * The content is written as plain prose, so these plugins recognise patterns
 * the writing already uses rather than requiring authors to add markup:
 *
 *  - a paragraph that is mostly links becomes a chip row, so the "→ related
 *    page · related page" lines read as navigation instead of body copy;
 *  - tables get a scroll container, so a wide table never makes the page
 *    scroll sideways;
 *  - the sections that tell a reader to stop the engine are lifted out of
 *    ordinary body copy, because on a boat that instruction is the difference
 *    between an inconvenience and a destroyed engine.
 */

const SAFETY_HEADING =
  /^(shut down now|shut down for|stop now|do not crank|safety first|if it has just happened|first: is it safe)/i;

function text(node) {
  if (node.type === 'text') return node.value;
  return (node.children ?? []).map(text).join('');
}

function isLink(node) {
  return node.type === 'element' && node.tagName === 'a';
}

export function rehypeEnhance() {
  return (tree) => {
    const out = [];

    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];

      // --- tables: wrap for horizontal scroll --------------------------------
      if (node.type === 'element' && node.tagName === 'table') {
        out.push({
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-scroll'] },
          children: [node],
        });
        continue;
      }

      // --- link-heavy paragraphs become chip rows ---------------------------
      if (node.type === 'element' && node.tagName === 'p') {
        const links = (node.children ?? []).filter(isLink);
        if (links.length > 0) {
          const total = text(node).trim();
          const linked = links.map(text).join('');
          // Strip the separators the content uses between related links.
          const rest = total.replace(/[→·—\-|]/g, '').replace(/\s+/g, ' ').trim();
          const mostlyLinks = linked.length / Math.max(total.length, 1) > 0.5;
          if (mostlyLinks && rest.length - linked.length < 45) {
            node.properties = node.properties ?? {};
            node.properties.className = [
              ...(node.properties.className ?? []),
              'linkrow',
            ];
          }
        }
        out.push(node);
        continue;
      }

      // --- safety sections: h2 + everything up to the next h2 ----------------
      if (node.type === 'element' && node.tagName === 'h2' &&
          SAFETY_HEADING.test(text(node).trim())) {
        const section = [node];
        let j = i + 1;
        while (j < tree.children.length) {
          const next = tree.children[j];
          if (next.type === 'element' && /^h[12]$/.test(next.tagName)) break;
          section.push(next);
          j++;
        }
        out.push({
          type: 'element',
          tagName: 'section',
          properties: { className: ['safety'], role: 'note' },
          children: section,
        });
        i = j - 1;
        continue;
      }

      out.push(node);
    }

    tree.children = out;
  };
}
