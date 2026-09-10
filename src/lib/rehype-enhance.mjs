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

/** True when everything from `from` onward is links, separators or whitespace. */
function onlyLinksAfter(kids, from) {
  for (let i = from; i < kids.length; i++) {
    const c = kids[i];
    if (isLink(c)) continue;
    if (c.type === 'element' && c.tagName === 'br') continue;
    if (c.type === 'text' && !/[a-z0-9]/i.test(c.value.replace(/→/g, ''))) continue;
    return false;
  }
  return true;
}

function stripArrows(kids) {
  for (const c of kids) {
    if (c.type === 'text') c.value = c.value.replace(/→/g, '').replace(/\s{2,}/g, ' ');
  }
  return kids;
}

function linkRow(children) {
  return {
    type: 'element',
    tagName: 'p',
    properties: { className: ['linkrow'] },
    children,
  };
}

/**
 * A bullet can also carry a trailing "→ link". Inside a list a chip row would
 * be out of place, so the reference becomes a small block beneath the bullet
 * text instead — same intent, appropriate form.
 */
function fixListItems(node) {
  if (node.type !== 'element') return;
  if (node.tagName === 'li') {
    const kids = node.children ?? [];
    const arrowAt = kids.findIndex((c) => c.type === 'text' && c.value.includes('→'));
    if (arrowAt !== -1 && kids.slice(arrowAt + 1).some(isLink) && onlyLinksAfter(kids, arrowAt + 1)) {
      const at = kids[arrowAt];
      const before = at.value.slice(0, at.value.indexOf('→')).replace(/\s+$/, '');
      const after = at.value.slice(at.value.indexOf('→') + 1);
      const head = kids.slice(0, arrowAt);
      if (before) head.push({ type: 'text', value: before });
      const tail = stripArrows([{ type: 'text', value: after }, ...kids.slice(arrowAt + 1)]);
      node.children = [
        ...head,
        { type: 'element', tagName: 'span', properties: { className: ['li-link'] }, children: tail },
      ];
      return;
    }
  }
  for (const child of node.children ?? []) fixListItems(child);
}

export function rehypeEnhance() {
  return (tree) => {
    for (const child of tree.children) fixListItems(child);
    tree.children = transform(tree.children);
  };
}

function transform(children) {
    const out = [];

    for (let i = 0; i < children.length; i++) {
      const node = children[i];

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

      // --- link rows -------------------------------------------------------
      if (node.type === 'element' && node.tagName === 'p') {
        const kids = node.children ?? [];
        const links = kids.filter(isLink);

        if (links.length > 0) {
          // The content marks related links with a leading "→". A paragraph
          // may be entirely such links, or may be body copy with a "→ link"
          // tail appended on its last line. Both become chip rows, and the
          // arrow goes: an arrow glued to link text is decoration, and once
          // the row is rendered as chips it says nothing the layout doesn't.
          // The arrow usually sits inside a text node that also holds the end
          // of the sentence before it, so the split happens within that node
          // rather than between children.
          const arrowAt = kids.findIndex(
            (c) => c.type === 'text' && c.value.includes('→')
          );

          if (arrowAt !== -1 && onlyLinksAfter(kids, arrowAt + 1)) {
            const at = kids[arrowAt];
            const before = at.value.slice(0, at.value.indexOf('→')).replace(/\s+$/, '');
            const after = at.value.slice(at.value.indexOf('→') + 1);
            const head = kids.slice(0, arrowAt);
            if (before) head.push({ type: 'text', value: before });
            const tail = [{ type: 'text', value: after }, ...kids.slice(arrowAt + 1)];

            if (head.some((c) => isLink(c) || /[a-z0-9]/i.test(text(c)))) {
              // Real body copy precedes the arrow: keep it, and move the links
              // into their own row beneath.
              node.children = head;
              out.push(node);
              out.push(linkRow(stripArrows(tail)));
            } else {
              // The whole paragraph was a link row.
              out.push(linkRow(stripArrows(kids)));
            }
            continue;
          }

          const total = text(node).trim();
          const linked = links.map(text).join('');
          const rest = total.replace(/[→·—\-|]/g, '').replace(/\s+/g, ' ').trim();
          const mostlyLinks = linked.length / Math.max(total.length, 1) > 0.5;
          if (mostlyLinks && rest.length - linked.length < 45) {
            out.push(linkRow(stripArrows(kids)));
            continue;
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
        while (j < children.length) {
          const next = children[j];
          if (next.type === 'element' && /^h[12]$/.test(next.tagName)) break;
          section.push(next);
          j++;
        }
        out.push({
          type: 'element',
          tagName: 'section',
          properties: { className: ['safety'], role: 'note' },
          // Transform the section body, but not its own heading — that
          // heading is what matched SAFETY_HEADING, and feeding it back in
          // would wrap it again without end.
          children: [node, ...transform(section.slice(1))],
        });
        i = j - 1;
        continue;
      }

      out.push(node);
    }

  return out;
}
