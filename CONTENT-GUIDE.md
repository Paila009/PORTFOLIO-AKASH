# Updating Code, Canvas & Camera

## Profile

Edit `content/profile.json`. Keep valid JSON: double quotes, commas between properties, no trailing commas. `bio` is an array of paragraphs, `skills` maps group names to arrays, and social links are complete HTTPS URLs. `resumePath` points to a file inside `dist/`. Replace the existing résumé PDF at that path or change the path.

The homepage and About page use `lib/home.mjs` and `lib/about.mjs`. The content files supply contact links, projects, journey entries, research, credentials, and education. The homepage uses each project's `label` for the card title when supplied. The original `templates/home.html` is retained for reference. Dedicated pages use shared layouts in `lib/layout.mjs`.

## Coding projects

Edit `content/projects.json`. Each object creates `/code/[slug]/` automatically. Use a unique URL-safe `slug`. Fill in title, summary, problem, intendedUsers, approach, contribution, technologies, challenges, lessons, status, and improvements. Improvements are proposals, not implemented features. Keep unsupported details clearly marked as missing. Set `github` or `live` to `null` when unavailable.

Add the project illustration or screenshot under `dist/assets/` and use a root-relative path such as `/assets/my-project.webp`. Supply descriptive `imageAlt`. Use `imageLabel: "Application screenshot"` only for an actual screenshot; retain `"Interface concept"` for an illustration. The first three projects appear on the homepage; all projects appear on the Code page.

## Art and photography

Both collections start empty. Put your images under `dist/assets/`, then add one object per piece to the array in `content/artwork.json` or `content/photography.json`. Each entry accepts `title`, `description`, `src` (for example `/assets/my-piece.webp`), and `alt`. Use `medium` and `year` for art, or `location` and `date` for photography, when known. Omit missing metadata or use `null`.

Use images you own or have permission to display. Export compressed WebP/JPEG where appropriate; keep enough resolution for the viewer. Preserve artwork proportions. Below-the-fold thumbnails load lazily. The viewer supports previous/next, arrow keys, Escape, close, counts, and focus return.

Set either content file to `[]` for an honest empty collection. The page still links to Instagram. A missing image receives a labeled fallback rather than a broken-image icon.

## Build and verify

```powershell
node build.mjs
node check.mjs
node server.mjs
```

Review the affected pages on mobile and desktop. Check captions, keyboard navigation, and external destinations. The static checker validates local references and metadata; it does not verify the uptime of external services.

## Colors and motion

The homepage composition lives in `dist/editorial.css` and `dist/portrait-edition.css`. The black and crimson palette and condensed display typography live in `dist/dark.css`. Base layout tokens live in `dist/style.css`. Page layouts are in `dist/pages.css`, galleries in `dist/gallery.css`. Motion respects the operating-system preference and can be changed with the footer Motion control. Keep readable contrast when changing colors.

Scroll and pointer effects live in `dist/motion.js` and `dist/motion.css`. The decorative 3D orbit renderer is `dist/orbit-field.js`; the controller owns its animation loop. Keep the `portfolio:motionchange` event in `dist/site.js` connected when changing the footer motion control. Text and links must remain usable with motion off, on touch devices, and without JavaScript.
