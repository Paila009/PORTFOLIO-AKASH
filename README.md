# Paila Akash — Code, Canvas & Camera

An editorial portfolio for a Computer Science Engineering student, artist, and photographer. Near-black surfaces, crimson accents, oversized condensed typography, a layered chrome hero, and compact editorial sections establish the visual identity. The design follows the supplied black-and-red reference while using Akash’s own content.

## Architecture

HTML, CSS, and browser JavaScript, with a small Node.js static generator and local JSON. No dependency installation, database, user accounts, or external submission service is required.

Routes: `/`, `/code/`, `/code/signal-lab/`, `/code/lilnest/`, `/code/motionbeatz/`, `/art/`, `/photography/`, `/about/`, and a custom `404.html`.

- `content/`: editable profile, projects, artwork, and photography.
- `lib/home.mjs`: active homepage structure.
- `templates/home.html`: retained previous homepage template.
- `dist/editorial.css` and `dist/portrait-edition.css`: homepage composition, portraits, journey, and project lab.
- `dist/dark.css`: shared black/crimson colors and typography.
- `dist/motion.js` and `motion.css`: scroll parallax, section reveals, sliding type bands, pointer tilt, and reading progress.
- `dist/orbit-field.js`: a dependency-free decorative canvas with perspective-projected 3D rings.
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

GitHub Pages: **https://Paila009.github.io/PORTFOLIO-AKASH/**

The workflow in `.github/workflows/pages.yml` builds, checks, and deploys `dist/` whenever `main` changes. It can also be run manually from the repository's Actions tab. Pages must use **GitHub Actions** as its publishing source. The workflow reads the URL and project base path from GitHub's Pages configuration, so internal links, galleries, responsive images, metadata, and the sitemap use the correct address.

To reproduce the GitHub Pages build locally:

```powershell
$env:BASE_PATH='/PORTFOLIO-AKASH'
$env:SITE_URL='https://Paila009.github.io/PORTFOLIO-AKASH'
node build.mjs
node check.mjs
node server.mjs
```

Open `http://127.0.0.1:4173/PORTFOLIO-AKASH/`. To return to the root-path build, clear `BASE_PATH` and `SITE_URL`, then rebuild. The tracked output keeps the default root-path configuration; Actions creates the GitHub Pages output during each deployment.

Deploy `dist/` to a static host supporting directory index files. Set `404.html` as the missing-page response. Build command: `node build.mjs`. Output directory: `dist`. No install command.

Sites identity and static directory live in `.openai/hosting.json`. The Site uses owner-only access by default. Its access settings determine who can view it. For updates through Sites, use the supported source workflow and deploy the unchanged packaged output. Credentials belong in the workflow hidden stdin, never source files.

For another domain, set the canonical base URL before building:

```powershell
$env:SITE_URL='https://your-domain.example'
node build.mjs
```

## Content still needed

- Original artwork and photographs; the public gallery pages are ready for the first entries.
- Artwork medium/year and photo stories, locations, and dates, when supplied.
- Actual project screenshots; current illustrations are labeled interface concepts.
- Detailed project challenges and lessons learned. Missing source/demo links are omitted.

Contact uses email and supplied GitHub, LinkedIn, Instagram links. The paper is marked under review. Professional details come from the résumé. Art and photography link to @aakash.reddie.

## Asset provenance

The original `dist/assets/chrome-sculpture.png` was created with built-in imagegen. Prompt: “Premium studio render of a polished liquid-chrome ribbon knot with one acid-lime sphere, three-quarter view, isolated transparent background, no text or logos.” This is site decoration. Project SVGs are interface concepts. Gallery placeholder SVGs are clearly labeled development assets.

The camera portrait on the homepage and the seated portrait on About are supplied by Akash. The site uses responsive WebP copies with image metadata removed. The homepage cutout was prepared with built-in ImageGen using a background-only edit: “Replace the white backdrop with transparency; preserve the pose, camera, clothes, grayscale lighting, and framing.” `crimson-sculpture.png` and its WebP variants are retained assets from the earlier version of the hero.

## Motion

Scrolling stays native. The hero has scroll-driven translation, scale, and 3D rotation; its orbit field uses perspective projection. Opposing typography bands slide with scroll, section reveals stagger into view, and cards combine scroll depth with pointer tilt. Touch devices use gentler effects and no hover tilt. The footer Motion control and system reduced-motion setting disable the effects. Content remains visible without JavaScript. Rendering pauses when the page is hidden and the orbit field is offscreen.

The homepage's Builder Tour (`dist/builder-tour.js` and `dist/builder-tour.css`) begins on a blank drafting surface. Labeled cursors reveal text, draw cards, and place images as the viewport glides between sections. The tour plays once per browser tab on a fresh visit at the top of the homepage, and its header button stops or replays it. Stopping restores the entire page immediately. Normal scrolling, touch, and keyboard navigation take priority, and the tour follows reduced-motion preferences.
