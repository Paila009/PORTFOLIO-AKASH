# Updating Code, Canvas & Camera

## Profile

Edit `content/profile.json`. Keep valid JSON: double quotes, commas between properties, no trailing commas. `bio` is an array of paragraphs, `skills` maps group names to arrays, and social links are complete HTTPS URLs. `resumePath` points to a file inside `dist/`. Replace the existing résumé PDF at that path or change the path.

The active homepage has editorial headings in `lib/home.mjs`; contact links, project previews, education year, and CGPA come from the content files. Its concise featured project titles are keyed by slug there. The original `templates/home.html` is retained for reference. Dedicated pages use shared layouts in `lib/layout.mjs`. If you change your current year, review the homepage fact labels too.

## Coding projects

Edit `content/projects.json`. Each object creates `/code/[slug]/` automatically. Use a unique URL-safe `slug`. Fill in title, summary, problem, intendedUsers, approach, contribution, technologies, challenges, lessons, status, and improvements. Improvements are proposals, not implemented features. Keep unsupported details clearly marked as missing. Set `github` or `live` to `null` when unavailable.

Add the project illustration or screenshot under `dist/assets/` and use a root-relative path such as `/assets/my-project.webp`. Supply descriptive `imageAlt`. Use `imageLabel: "Application screenshot"` only for an actual screenshot; retain `"Interface concept"` for an illustration. The first three projects appear on the homepage; all projects appear on the Code page.

## Art and photography

Edit `content/artwork.json` or `content/photography.json`. Replace the development entries rather than leaving them mixed into your real collection. Match the provided field names. Set `placeholder` to `false`, point `src` to your own image, and add an honest title and description. Include medium/year for art and location/date for photography only when known. Omit missing metadata or use `null`.

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

The homepage composition lives in `dist/editorial.css`. The active black/crimson palette, condensed display typography, and contrast overrides live in `dist/dark.css`, loaded after the other styles. Base layout tokens live in `dist/style.css`. Page layouts are in `dist/pages.css`, galleries in `dist/gallery.css`. Motion respects the operating-system preference and can be changed with the footer Motion control. Keep readable contrast when changing colors.
