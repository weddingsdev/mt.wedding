# Wedding Invitation Site — Mykola & Tetiana

Static single-page site (HTML/CSS/JS, no server) for the wedding on September 13, 2026.

## Local preview

```bash
npx --yes serve .
```

Or any other static file server — no build step needed to view the page (though CSS changes require `npm run build:css` first, see below).

## Styling (Tailwind CSS)

Styles are authored in `css/input.css` (Tailwind import + theme tokens + a small set of custom component rules) and compiled to `css/style.css`, which is the file `index.html` actually loads. **Always rebuild after editing `css/input.css`, and commit the regenerated `css/style.css` in the same commit:**

```bash
npm install          # first time only
npm run build:css    # one-off build
npm run watch:css     # rebuild on every save, for local development
```

## Tests

Unit tests cover the pure logic (countdown, calendar, RSVP validation) and confirm `index.html` contains all the copy and element ids the site depends on.

```bash
npm test
```

## Deploying to GitHub Pages

1. Push the `main` branch to a GitHub repository.
2. Settings → Pages → Source: `Deploy from a branch`, branch `main`, folder `/ (root)`.
3. The site will be available at `https://<username>.github.io/<repo>/`.

## Connecting the Google Form (once it exists)

In `js/main.js`, find `GOOGLE_FORM_CONFIG` and fill in:

- `actionUrl` — the Google Form's `formResponse` endpoint.
- `entryName` — the `entry.*` id for the "Full name" field.
- `entryAttending` — the `entry.*` id for the "Will you attend?" field.

Until these are filled in, the form shows a success message locally and logs the submitted data to the browser console instead of sending it anywhere.
