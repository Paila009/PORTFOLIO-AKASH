const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const imageSource = (value, fallback) => {
  const source = String(value || '').trim();
  return /^(?:https:\/\/|\/(?!\/)|\.\/|assets\/)/i.test(source) && !source.includes('\\')
    ? source
    : fallback;
};

const photoCollections = [
  { id: 'wildlife', label: 'Wildlife', cover: 'dsc02215', position: '65% 75%' },
  { id: 'birds', label: 'Birds', cover: 'dsc04234', position: '50% 32%' },
  { id: 'night', label: 'Moon studies', cover: 'dsc05592', position: '50% 47%' },
];

const frameNumber = (index) => String(index + 1).padStart(2, '0');

function renderPhotoFeatures(entries, viewerId) {
  return `<div class="photo-features" aria-label="Featured photographs">
    ${photoCollections.map(({ id, label, cover, position }) => {
      const item = entries.find((entry) => entry.id === cover) || entries.find((entry) => entry.category === id);
      if (!item) return '';
      const index = entries.indexOf(item);
      const source = imageSource(item.full, imageSource(item.src, '/assets/placeholder-photo.svg'));
      const preview = imageSource(item.src, source);
      const srcset = item.width > item.thumbWidth ? ` srcset="${escapeHtml(preview)} ${item.thumbWidth}w, ${escapeHtml(source)} ${item.width}w" sizes="${id === 'wildlife' ? '(max-width: 620px) 88vw, (max-width: 1480px) 62vw, 920px' : '(max-width: 620px) 43vw, 30vw'}"` : '';
      return `<a class="photo-feature photo-feature--${id}" href="${escapeHtml(source)}" data-photo-feature="${escapeHtml(item.id)}" style="--photo-position: ${position}" aria-haspopup="dialog" aria-controls="${viewerId}" aria-label="View ${escapeHtml(item.title)}" aria-description="${escapeHtml(item.alt)}">
        <img src="${escapeHtml(preview)}"${srcset} width="${item.width}" height="${item.height}" alt="${escapeHtml(item.alt)}" decoding="async"${id === 'wildlife' ? ' fetchpriority="high"' : ''} />
        <span class="photo-feature-label"><span class="photo-feature-index">${escapeHtml(label)} <span aria-hidden="true">/</span> ${frameNumber(index)}</span><span class="photo-feature-title">${escapeHtml(item.title)}</span></span>
        <span class="photo-feature-open" aria-hidden="true">↗</span>
      </a>`;
    }).join('\n')}
  </div>`;
}

function renderContactSheet(entries, cards) {
  const collections = [{ id: 'all', label: 'All frames' }, ...photoCollections];
  return `<section class="photo-contact-sheet" id="contact-sheet" aria-labelledby="gallery-collection-title">
    <header class="photo-sheet-header">
      <h2 id="gallery-collection-title">Contact sheet<span>.</span></h2>
      <span class="photo-results" data-photo-results role="status">${entries.length} frames</span>
    </header>
    <div class="photo-filters" data-photo-filters role="group" aria-label="Filter photographs" hidden>
      ${collections.map(({ id, label }) => {
        const count = id === 'all' ? entries.length : entries.filter((item) => item.category === id).length;
        return count ? `<button type="button" data-photo-filter="${id}" aria-pressed="${id === 'all'}">${label} <span aria-hidden="true">${count}</span></button>` : '';
      }).join('\n')}
    </div>
    <div class="gallery-grid photo-grid" id="photo-frames">${cards}</div>
  </section>`;
}

/** Render a standalone gallery body. The page shell loads /gallery.css and /gallery.js. */
export function renderGallery({ kind = 'artwork', items = [] } = {}) {
  const isArt = kind === 'art' || kind === 'artwork' || kind === 'canvas';
  const isPhoto = kind === 'photo' || kind === 'photography' || kind === 'camera';
  if (!isArt && !isPhoto) throw new TypeError(`Unknown gallery kind: ${kind}`);
  const label = isArt ? 'Canvas' : 'Camera';
  const category = isArt ? 'artwork' : 'photography';
  const fallback = `/assets/placeholder-${isArt ? 'art' : 'photo'}.svg`;
  const entries = Array.isArray(items) ? items.filter(Boolean) : [];
  const hasPhotoArchive = isPhoto && entries.some((item) => item.category && item.id && !item.placeholder);
  const hasPersonalImages = entries.some((item) => item.placeholder !== true);
  const hasPlaceholders = entries.some((item) => item.placeholder === true);
  const viewerId = `gallery-${category}-viewer`;
  const intro = isArt
    ? 'A space for sketches, experiments, and ideas that take shape away from a screen.'
    : 'A place for photographs that make me stop and look again: people, places, and the details in between.';
  const empty = isArt
    ? { label: 'Studio notes', title: 'Still on the easel.', copy: 'I’m putting together a selection of my artwork for this space.' }
    : { label: 'Field notes', title: 'First frames to come.', copy: 'I’m putting together a selection of my photography for this space.' };
  const instagram = '<a class="gallery-instagram" href="https://www.instagram.com/aakash.reddie/" target="_blank" rel="noopener noreferrer">@aakash.reddie <span aria-hidden="true">↗</span><span class="gallery-sr-only"> on Instagram, opens in a new tab</span></a>';
  const cards = entries.map((item, index) => {
    const preview = imageSource(item.src, fallback);
    const source = imageSource(item.full, preview);
    const title = String(item.title || `${label} ${index + 1}`);
    const description = String(item.description || '');
    const placeholder = item.placeholder === true;
    const metadata = (isArt ? [item.medium, item.year] : [item.location, item.date]).filter((value) => value !== null && value !== undefined && value !== '').join(' · ');
    const collection = photoCollections.find(({ id }) => id === item.category);
    const photoCaption = hasPhotoArchive && collection ? `${collection.label} · Frame ${frameNumber(index)}` : '';
    const caption = [description, metadata, photoCaption, placeholder ? 'Development placeholder. No personal image supplied.' : ''].filter(Boolean).join(' ');
    const alt = String(item.alt || (placeholder ? `Abstract development placeholder for the ${category} gallery, not a personal image.` : title));
    const width = item.width || (isArt ? 1200 : 1600);
    const height = item.height || (isArt ? 1500 : 1200);
    return `<article class="gallery-entry"${collection ? ` data-photo-category="${collection.id}"` : ''}>
      <a class="gallery-card" href="${escapeHtml(source)}" data-gallery-item${item.id ? ` data-photo-id="${escapeHtml(item.id)}"` : ''} data-gallery-source="${escapeHtml(source)}" data-gallery-title="${escapeHtml(title)}" data-gallery-caption="${escapeHtml(caption)}" data-gallery-alt="${escapeHtml(alt)}" data-gallery-placeholder="${placeholder}" aria-haspopup="dialog" aria-controls="${viewerId}" aria-label="View ${escapeHtml(title)}${placeholder ? ', development placeholder' : ''}"${hasPhotoArchive ? ` aria-description="${escapeHtml(alt)}"` : ''}>
        <div class="gallery-image-wrap">
          <img class="gallery-image" src="${escapeHtml(preview)}" width="${width}" height="${height}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" />
          ${placeholder ? '<span class="gallery-placeholder-tag">Development placeholder</span>' : ''}
          ${hasPhotoArchive ? '' : '<span class="gallery-open-label">View image <span aria-hidden="true">↗</span></span>'}
        </div>
        <div class="gallery-item-heading"><span class="gallery-item-number" aria-hidden="true">${frameNumber(index)}</span><${hasPhotoArchive ? 'h3' : 'h2'} class="gallery-item-title">${escapeHtml(title)}</${hasPhotoArchive ? 'h3' : 'h2'}><span class="gallery-item-arrow" aria-hidden="true">↗</span></div>
      </a>
      ${metadata ? `<p class="gallery-item-meta">${escapeHtml(metadata)}</p>` : ''}
      ${description ? `<p class="gallery-item-description">${escapeHtml(description)}</p>` : ''}
    </article>`;
  }).join('\n');

  const gallery = `<section class="gallery-page gallery-${category}${hasPhotoArchive ? ' photo-archive' : ''}" data-gallery aria-labelledby="gallery-page-title">
    ${hasPhotoArchive ? `<header class="photo-intro">
      <div class="gallery-topline"><span class="gallery-eyebrow">Photography by Paila Akash</span><a class="gallery-back" href="/">Back to portfolio <span aria-hidden="true">↗</span></a></div>
      <div class="photo-intro-body"><h1 id="gallery-page-title">Field notes<span>.</span></h1><p>Wildlife in shifting light, birds caught mid-flight, and studies of the moon.</p><a class="photo-jump" href="#contact-sheet">Browse ${entries.length} frames <span aria-hidden="true">↓</span></a></div>
    </header>
    ${renderPhotoFeatures(entries, viewerId)}` : `<header class="gallery-intro">
      <div class="gallery-topline"><span class="gallery-eyebrow">${isArt ? '02' : '03'} / ${label.toUpperCase()}</span><a class="gallery-back" href="/">Back to portfolio <span aria-hidden="true">↗</span></a></div>
      <div class="gallery-intro-grid"><h1 class="gallery-title" id="gallery-page-title">${label},<br><em>${isArt ? 'beyond the code.' : 'a slower look.'}</em></h1><div class="gallery-intro-copy"><p>${escapeHtml(intro)}</p>${entries.length ? instagram : ''}</div></div>
    </header>`}
    ${entries.length ? `
    ${hasPlaceholders ? `<aside class="gallery-notice" aria-label="About these gallery previews"><span class="gallery-notice-symbol" aria-hidden="true">✳</span><div><p class="gallery-notice-title">A little space for what comes next.</p><p>These abstract images are clearly labeled development placeholders. They show the gallery layout and are not Akash’s personal artwork or photographs.</p></div></aside>` : ''}
    ${hasPhotoArchive ? renderContactSheet(entries, cards) : `<div class="gallery-section-line"><h2 class="gallery-eyebrow" id="gallery-collection-title">${hasPersonalImages ? 'SELECTED ' + category.toUpperCase() : 'GALLERY LAYOUT PREVIEWS'}</h2><span>${String(entries.length).padStart(2, '0')} ${entries.length === 1 ? 'image' : 'images'}</span></div>
    <div class="gallery-grid" aria-labelledby="gallery-collection-title">${cards}</div>`}
    <footer class="gallery-endnote"><span>CODE. CANVAS. CAMERA.</span><p>More creative explorations on <a href="https://www.instagram.com/aakash.reddie/" target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span><span class="gallery-sr-only">, opens in a new tab</span></a></p></footer>
    <dialog class="gallery-viewer" id="${viewerId}" aria-labelledby="gallery-viewer-title" aria-describedby="gallery-viewer-caption">
      <div class="gallery-viewer-top"><span class="gallery-viewer-count" data-gallery-count${hasPhotoArchive ? '' : ' aria-live="polite" aria-atomic="true"'}>Image viewer</span><button class="gallery-viewer-close" type="button" data-gallery-close autofocus>Close <span aria-hidden="true">×</span></button></div>
      ${hasPhotoArchive ? '<span class="gallery-sr-only" data-gallery-viewer-status role="status"></span>' : ''}
      <figure class="gallery-viewer-figure"><div class="gallery-viewer-stage"><img class="gallery-viewer-image" data-gallery-viewer-image alt="" decoding="async" /><p class="gallery-viewer-error" data-gallery-error hidden>This image couldn’t be loaded. Please try another image.</p></div><figcaption class="gallery-viewer-caption"><div><span class="gallery-viewer-placeholder" data-gallery-viewer-placeholder>Development placeholder</span><h2 class="gallery-viewer-title" id="gallery-viewer-title" data-gallery-viewer-title>Image viewer</h2><p id="gallery-viewer-caption" data-gallery-viewer-caption></p></div><div class="gallery-viewer-navigation"><button type="button" class="gallery-viewer-nav" data-gallery-previous aria-label="Previous image"><span aria-hidden="true">←</span><span>Previous</span></button><button type="button" class="gallery-viewer-nav" data-gallery-next aria-label="Next image"><span>Next</span><span aria-hidden="true">→</span></button></div></figcaption></figure>
      <p class="gallery-keyboard-hint">Use the left and right arrow keys to browse. Press Esc to close.</p>
    </dialog>` : `<section class="gallery-holding" aria-labelledby="gallery-holding-title">
      <div class="gallery-holding-content">
        <span class="gallery-eyebrow gallery-holding-label">${empty.label} <span aria-hidden="true">/</span> In progress</span>
        <h2 id="gallery-holding-title">${empty.title}</h2>
        <p>${empty.copy}</p>
        ${instagram}
      </div>
      <div class="gallery-holding-mark" aria-hidden="true"><div></div><i></i><i></i><b>${isArt ? '✳' : '✦'}</b><span>${label.toUpperCase()} / 01</span></div>
    </section>`}
  </section>`;

  return hasPhotoArchive ? gallery.replace(/^[ \t]+\r?\n/gm, '') : gallery;
}
