# PS5 Linux Wiki

Source of [wiki.ps5-linux.eu](https://wiki.ps5-linux.eu), built with [Docusaurus](https://docusaurus.io/) and deployed by Cloudflare Pages on every push to `main`.

## Editing

- Pages live in `docs/`. The sidebar order is set in `sidebars.ts`.
- `.md` files are plain Markdown. Use `.mdx` only when a page needs components such as `<Tabs>`.
- Callouts: `:::note`, `:::tip`, `:::info`, `:::warning`, `:::danger`, optionally with a title: `:::tip[My title]`.
- Images go in `static/img/` and are referenced as `/img/...`.
- Scripts users can `curl` live in `static/scripts/` and are served at `https://wiki.ps5-linux.eu/scripts/...`.

## Local development

```bash
npm ci
npm start        # live preview on http://localhost:3000
npm run build    # production build into build/
```

## Credits

Content based on the [PS5 Linux Guide](https://guide.rmux.eu/) by rmuxnet and contributors (MIT License).
Community project, not affiliated with Sony Interactive Entertainment.
