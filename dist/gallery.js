/* Native-dialog image viewer. Loaded only by the artwork and photography pages. */
(() => {
  'use strict';
  const scriptUrl = document.currentScript.src;
  document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    const cards = Array.from(gallery.querySelectorAll('[data-gallery-item]'));
    const viewer = gallery.querySelector('.gallery-viewer');
    if (!cards.length || !viewer || typeof viewer.showModal !== 'function') return;

    const image = viewer.querySelector('[data-gallery-viewer-image]');
    const title = viewer.querySelector('[data-gallery-viewer-title]');
    const caption = viewer.querySelector('[data-gallery-viewer-caption]');
    const count = viewer.querySelector('[data-gallery-count]');
    const placeholder = viewer.querySelector('[data-gallery-viewer-placeholder]');
    const error = viewer.querySelector('[data-gallery-error]');
    const previous = viewer.querySelector('[data-gallery-previous]');
    const next = viewer.querySelector('[data-gallery-next]');
    const closeButton = viewer.querySelector('[data-gallery-close]');
    let currentIndex = 0;
    let opener = null;
    let pointerStartedOutside = false;

    const showImage = (index) => {
      currentIndex = (index + cards.length) % cards.length;
      const card = cards[currentIndex];
      image.hidden = false;
      error.hidden = true;
      image.alt = card.dataset.galleryAlt || card.dataset.galleryTitle || '';
      image.src = card.dataset.gallerySource;
      title.textContent = card.dataset.galleryTitle || 'Untitled image';
      caption.textContent = card.dataset.galleryCaption || '';
      count.textContent = `Image ${currentIndex + 1} of ${cards.length}`;
      placeholder.hidden = card.dataset.galleryPlaceholder !== 'true';
      previous.disabled = cards.length < 2;
      next.disabled = cards.length < 2;
    };

    cards.forEach((card, index) => {
      const thumbnail = card.querySelector('.gallery-image');
      const imageFallback = () => {
        if (thumbnail.dataset.fallbackApplied) return;
        thumbnail.dataset.fallbackApplied = 'true';
        const fallback = new URL(gallery.classList.contains('gallery-artwork') ? 'assets/placeholder-art.svg' : 'assets/placeholder-photo.svg', scriptUrl).href;
        thumbnail.src = fallback;
        thumbnail.alt = 'Image unavailable. Development placeholder shown.';
        card.dataset.gallerySource = fallback;
        card.dataset.galleryPlaceholder = 'true';
        card.dataset.galleryAlt = thumbnail.alt;
        card.dataset.galleryCaption = 'The original image is unavailable. A labeled development placeholder is shown.';
        const tag = document.createElement('span');
        tag.className = 'gallery-placeholder-tag'; tag.textContent = 'Image unavailable';
        card.querySelector('.gallery-image-wrap').append(tag);
      };
      thumbnail.addEventListener('error', imageFallback);
      if (thumbnail.complete && !thumbnail.naturalWidth) imageFallback();
      card.addEventListener('click', (event) => {
        // Preserve the link's normal open-in-new-tab behavior.
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        opener = card;
        showImage(index);
        if (!viewer.open) viewer.showModal();
        document.body.classList.add('gallery-viewer-open');
        closeButton.focus({ preventScroll: true });
      });
    });

    previous.addEventListener('click', () => showImage(currentIndex - 1));
    next.addEventListener('click', () => showImage(currentIndex + 1));
    closeButton.addEventListener('click', () => viewer.close());

    viewer.addEventListener('keydown', (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showImage(currentIndex + (event.key === 'ArrowLeft' ? -1 : 1));
      }
      // Escape and the focus trap are provided by the native modal dialog.
    });

    const outsideViewer = (event) => {
      const bounds = viewer.getBoundingClientRect();
      return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    };
    viewer.addEventListener('pointerdown', (event) => {
      pointerStartedOutside = event.target === viewer && outsideViewer(event);
    });
    viewer.addEventListener('pointerup', (event) => {
      if (pointerStartedOutside && event.target === viewer && outsideViewer(event)) viewer.close();
      pointerStartedOutside = false;
    });
    viewer.addEventListener('pointercancel', () => { pointerStartedOutside = false; });
    viewer.addEventListener('close', () => {
      document.body.classList.remove('gallery-viewer-open');
      pointerStartedOutside = false;
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    });
    image.addEventListener('error', () => {
      image.hidden = true;
      error.hidden = false;
    });
  });
})();
