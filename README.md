# Paila Akash — Code, Canvas & Camera

An editorial portfolio for a Computer Science Engineering student, artist, and photographer. Deep charcoal, warm off-white type, electric lime, expressive serif headlines, an original chrome sculpture, and a generative canvas establish the visual identity.

## Architecture

HTML, CSS, and browser JavaScript, with a small Node.js static generator and local JSON. No dependency installation, database, user accounts, or external submission service is required.

Routes: `/`, `/code/`, `/code/signal-lab/`, `/code/lilnest/`, `/code/motionbeatz/`, `/art/`, `/photography/`, `/about/`, and a custom `404.html`.

- `content/`: editable profile, projects, artwork, and photography.
- `templates/home.html`: homepage structure.
- `lib/layout.mjs`: shared header, footer, metadata, and project previews.
- `lib/galleries.mjs`: shared art and photography galleries.
- `build.mjs`: pages, sitemap, and project-dialog data generation.
- `dist/`: complete deployment output, including assets and résumé.
- `server.mjs`: local preview with directory routes and a real 404 response.
- `check.mjs`: JavaScript parsing and local link, metadata, and asset checks.

## Setup, development, and build

Requires Node.js 20+. There are no packages to install.

```powershell
node build.mjs
node check.mjs
node server.mjs
```

Open http://127.0.0.1:4173. Rebuild and refresh after editing content. Stop with Ctrl+C.

## Add your work

See [CONTENT-GUIDE.md](CONTENT-GUIDE.md). Update JSON in `content/`, put images in `dist/assets/`, then rebuild and check. Routine content changes do not require layout edits.

## Deployment

Deploy `dist/` to a static host supporting directory index files. Set `404.html` as the missing-page response. Build command: `node build.mjs`. Output directory: `dist`. No install command.

Sites identity and static directory live in `.openai/hosting.json`. The Site uses owner-only access by default. Its access settings determine who can view it. For updates through Sites, use the supported source workflow and deploy the unchanged packaged output. Credentials belong in the workflow hidden stdin, never source files.

For another domain, set the canonical base URL before building:

```powershell
$env:SITE_URL='https://your-domain.example'
node build.mjs
```

## Content still needed

- Original artwork and photographs; gallery entries are explicitly labeled development placeholders.
- Artwork medium/year and photo stories, locations, and dates, when supplied.
- Actual project screenshots; current illustrations are labeled interface concepts.
- Detailed project challenges and lessons learned. Missing source/demo links are omitted.

Contact uses email and supplied GitHub, LinkedIn, Instagram links. The paper is marked under review. Professional details come from the résumé. Art and photography link to @aakash.reddie.

## Asset provenance

`dist/assets/chrome-sculpture.png` was created with built-in imagegen. Prompt: “Premium studio render of a polished liquid-chrome ribbon knot with one acid-lime sphere, three-quarter view, isolated transparent background, no text or logos.” This is site decoration. Project SVGs are interface concepts. Gallery placeholder SVGs are clearly labeled development assets.
