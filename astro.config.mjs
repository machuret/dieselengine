import { defineConfig } from 'astro/config';
import site from './site.config.json' with { type: 'json' };
import { remarkStripTokens } from './src/lib/remark-strip-tokens.mjs';
import { rehypeEnhance } from './src/lib/rehype-enhance.mjs';

export default defineConfig({
  site: site.domain,
  output: 'static',
  trailingSlash: 'always',
  build: {
    // Every planned URL is a directory with a trailing slash (CONTENT-PLAN.md
    // section 2), so pages emit as <url>/index.html.
    format: 'directory',
  },
  markdown: {
    remarkPlugins: [remarkStripTokens],
    rehypePlugins: [rehypeEnhance],
    shikiConfig: { theme: 'github-light', wrap: true },
  },
});
