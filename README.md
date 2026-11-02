# PS5 Linux Wiki

Source of [wiki.ps5-linux.eu](https://wiki.ps5-linux.eu), built with [Docusaurus](https://docusaurus.io/) and deployed by Cloudflare Pages on every push to `main`.

## Editing

- Read [STYLE_GUIDE.md](STYLE_GUIDE.md) before writing or changing a page. It is not published on the site.
- Pages live in `docs/`. The sidebar order is set in `sidebars.ts`.
- `.md` files are plain Markdown. Use `.mdx` only when a page needs components such as `<Tabs>`.
- The site is dark-only with a blue/purple accent. Colours, tables, code blocks and callouts are styled in `src/css/custom.css`.
- Fonts (DM Sans, JetBrains Mono) are self-hosted via `@fontsource` packages, loaded in `src/clientModules/fonts.js`.
- Callouts: `:::note`, `:::tip`, `:::info`, `:::warning`, `:::danger`, optionally with a title: `:::tip[My title]`.
- Scripts users can `curl` live in `static/scripts/` and are served at `https://wiki.ps5-linux.eu/scripts/...`.

## Local development

```bash
npm ci
npm start        # live preview on http://localhost:3000
npm run build    # production build into build/
```

## Credits

See [NOTICE](NOTICE) for licence information.
Community project, not affiliated with Sony Interactive Entertainment.
