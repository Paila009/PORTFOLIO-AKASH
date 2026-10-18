'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionOff = reducedMotion.matches;
const motionButton = document.querySelector('#motion-toggle');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
}, { threshold: 0.06 });
if (!motionOff) document.documentElement.classList.add('js-motion');
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
function setMotion(value) {
  motionOff = value;
  document.documentElement.classList.toggle('motion-off', motionOff);
  motionButton.textContent = motionOff ? 'Motion off' : 'Motion on';
  motionButton.setAttribute('aria-pressed', String(motionOff));
  if (motionOff) document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
}
setMotion(motionOff);
motionButton.addEventListener('click', () => { document.documentElement.classList.toggle('motion-override', motionOff); setMotion(!motionOff); });
reducedMotion.addEventListener('change', event => { document.documentElement.classList.remove('motion-override'); setMotion(event.matches); });
document.querySelector('#year').textContent = new Date().getFullYear();
function updateClock() {
  document.querySelector('#local-time').textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }).format(new Date()) + ' IST';
}
updateClock();
setInterval(updateClock, 60000);

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open menu'); navigation.classList.remove('menu-open'); }
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  navigation.classList.toggle('menu-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); } });
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const projects = window.portfolioProjects;
const dialog = document.querySelector('#project-dialog');
let dialogTrigger;
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects[button.dataset.project];
  dialogTrigger = button;
  document.querySelector('#dialog-eyebrow').textContent = project.eyebrow;
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-intro').textContent = project.intro;
  const tags = document.querySelector('#dialog-tags'); tags.replaceChildren();
  project.tags.forEach(tag => { const span = document.createElement('span'); span.textContent = tag; tags.append(span); });
  const description = document.querySelector('#dialog-description'); description.replaceChildren();
  project.sections.forEach(([heading, content]) => {
    const h3 = document.createElement('h3'); h3.textContent = heading; description.append(h3);
    if (Array.isArray(content)) { const list = document.createElement('ul'); content.forEach(item => { const li = document.createElement('li'); li.textContent = item; list.append(li); }); description.append(list); }
    else { const p = document.createElement('p'); p.textContent = content; description.append(p); }
  });
  const links = document.querySelector('#dialog-links'); links.replaceChildren();
  project.links.forEach(([label, url]) => { const a = document.createElement('a'); a.textContent = label + ' ↗'; a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = 'button button-dark'; links.append(a); });
  dialog.showModal(); dialog.scrollTop = 0; document.body.classList.add('dialog-open');
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); dialogTrigger?.focus({ preventScroll: true }); });

document.querySelector('#copy-email').addEventListener('click', async () => {
  const button = document.querySelector('#copy-email');
  const status = document.querySelector('#copy-status');
  try { await navigator.clipboard.writeText('pailaakash041@gmail.com'); button.textContent = 'Copied ✓'; status.textContent = 'Email address copied to clipboard.'; }
  catch { button.textContent = 'Select email'; status.textContent = 'Select the email address beside this button to copy it.'; const range = document.createRange(); range.selectNodeContents(document.querySelector('.email-link')); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); }
  window.setTimeout(() => { button.textContent = 'Copy email ⧉'; }, 2600);
});

// An original generative illustration; no personal photographs or artwork are implied.
const canvas = document.querySelector('#art-canvas');
const context = canvas.getContext('2d');
let canvasWidth = 0, canvasHeight = 0, phase = 0, lastFrame = 0, artVisible = false, composition = 0;
let pointer = { x: 0, y: 0, active: false };
function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect(); canvasWidth = bounds.width; canvasHeight = bounds.height;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(canvasWidth * ratio); canvas.height = Math.round(canvasHeight * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0); drawArt();
}
function drawArt() {
  if (!canvasWidth || !canvasHeight) return;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  const cx = canvasWidth * .5, cy = canvasHeight * .5;
  context.strokeStyle = '#8c9b6815'; context.lineWidth = .7;
  for (let x = 20; x < canvasWidth; x += 28) { for (let y = 20; y < canvasHeight; y += 28) { context.beginPath(); context.moveTo(x - 1, y); context.lineTo(x + 1, y); context.stroke(); } }
  const scale = Math.min(canvasWidth, canvasHeight) * .32;
  const bendX = pointer.active ? (pointer.x / canvasWidth - .5) * 40 : 0;
  const bendY = pointer.active ? (pointer.y / canvasHeight - .5) * 40 : 0;
  const colors = ['#c4f465', '#dd8d64', '#abacfd'];
  for (let line = 0; line < 72; line++) {
    const progress = line / 72, rotation = progress * Math.PI * 2;
    context.beginPath();
    for (let step = 0; step <= 160; step++) {
      const t = step / 160 * Math.PI * 2;
      const breathing = Math.sin(t * 3 + phase * .4 + composition) * .12;
      const radius = scale * (1 + .21 * Math.cos(t * 3 + rotation + composition) + breathing);
      const x = cx + Math.cos(t + rotation * .23) * radius * Math.cos(rotation) + Math.sin(t * 2 + rotation) * 16 + bendX * Math.sin(t);
      const y = cy + Math.sin(t + rotation * .23) * radius * .85 + Math.cos(rotation) * 15 + bendY * Math.cos(t);
      step ? context.lineTo(x, y) : context.moveTo(x, y);
    }
    context.closePath(); context.strokeStyle = colors[composition % colors.length]; context.globalAlpha = .18 + .22 * Math.sin(progress * Math.PI); context.lineWidth = .8; context.stroke();
  }
  context.globalAlpha = 1;
  context.fillStyle = '#c4f465'; context.beginPath(); context.arc(cx + scale * 1.12, cy - scale * .62, 5, 0, Math.PI * 2); context.fill();
}
new ResizeObserver(resizeCanvas).observe(canvas);
new IntersectionObserver(entries => { artVisible = entries[0].isIntersecting; }, { threshold: .01 }).observe(canvas);
canvas.addEventListener('pointermove', event => { const bounds = canvas.getBoundingClientRect(); pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top, active: true }; if (motionOff) drawArt(); });
canvas.addEventListener('pointerleave', () => { pointer.active = false; if (motionOff) drawArt(); });
function remixArt() { composition = (composition + 1) % 9; phase += 1.7; drawArt(); }
canvas.addEventListener('click', remixArt);
document.querySelector('#reset-art').addEventListener('click', remixArt);
function animateArt(time) { if (artVisible && !motionOff && !document.hidden && time - lastFrame > 65) { phase += .025; drawArt(); lastFrame = time; } requestAnimationFrame(animateArt); }
requestAnimationFrame(animateArt);
