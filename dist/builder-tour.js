/* Draw the actual page in place, preserving layout and native navigation. */
(() => {
  'use strict';
  const button = document.querySelector('[data-builder-tour]');
  const label = button?.querySelector('[data-tour-label]');
  if (!button || !label || !window.requestAnimationFrame) return;
  const icon = button.querySelector('[aria-hidden=true]');

  const root = document.documentElement;
  const header = button.closest('header');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 760px)');
  const sessionKey = 'akash-builder-tour-seen-v3';
  const orbitEntry = 215;
  const orbitDuration = 790;
  const orbitStagger = 38;
  const scrollStart = 2060;
  const crew = [
    ['TYPE', '#ff6a86'], ['FRAME', '#c7abff'], ['GRID', '#f6c579'],
    ['SIGNAL', '#8ad4e1'], ['CODE', '#f3ebe7'], ['LENS', '#9be2bd'],
  ];
  const heading = [['.edition-heading > div > span','type'],['.edition-heading h2','type'],['.edition-heading > a','type']];
  const chapters = [
    ['Introduction', '.cover', [
      ['.cover-billboard','type'], ['#cover-name','type'], ['.cover-visual','media'], ['.cover-topline > *','type'],
      ['.handwritten','type'], ['.site-header nav a, .site-header .contact-link','type',true],
      ['.cover-role','type'], ['.cover-description','type'],
      ['.cover-note','box'], ['.cover-facts','box'], ['.hero-actions','box'], ['.depth-field','media'], ['.cover-bottom','box'],
    ]],
    ['Two perspectives', '#ways', [...heading,['.way-card','box']]],
    ['Selected projects', '#work', [...heading,['.selected-card','box'],['.toolkit-strip','box']]],
    ['Project lab', '#lab', [...heading,['.lab-intro','type'],['.lab-comparison','box']]],
    ['The journey', '#journey', [...heading,['.journey-list','box'],['.journey-notes article','box']]],
    ['Creative work', '#creative', [...heading,['.kinetic-band','box',true],['.creative-edit-copy','type'],['.tile-motion-wrap','media']]],
    ['Get in touch', '#contact', [...heading,['.edition-contact-row > div:first-child','box'],['.edition-socials','box'],['.site-footer','box',true]]],
  ].map(([name, selector, items]) => {
    const section = document.querySelector(selector);
    return {
      name, section, anchor: section?.querySelector('.edition-heading') || section,
      items: items.flatMap(([target, kind, outside]) => [...(outside ? document : section)?.querySelectorAll(target) || []].map(node => ({node,kind,header:header?.contains(node)}))),
    };
  }).filter(chapter => chapter.section && chapter.items.length);
  if (chapters.length < 2) { root.classList.remove('builder-tour-preparing'); return; }
  const tasks = chapters.flatMap(chapter => chapter.items);

  const cursorSvg = '<svg viewBox="0 0 22 24" focusable="false"><path d="M2 2.1 19.6 12l-7.4 1.1-3.8 7.2z" fill="currentColor" stroke="#0a0608" stroke-width="1.25" stroke-linejoin="round"/></svg>';
  const overlay = document.createElement('div');
  overlay.className = 'builder-overlay';
  overlay.dataset.builderOverlay = '';
  overlay.hidden = true;
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `<div class="builder-ruler builder-ruler-top"></div><div class="builder-ruler builder-ruler-left"></div><div class="builder-baseline"></div><div class="builder-orbit"></div><div class="builder-hud"><i></i><span class="builder-hud-text"></span><span class="builder-hud-track"><b></b></span></div>${crew.map(([name,color]) => `<div class="builder-cursor" style="--agent-ink:${color}">${cursorSvg}<span class="builder-chip">${name} <b>·</b> <span></span></span><i class="builder-ping"></i></div>`).join('')}${crew.slice(0,3).map(([,color]) => `<div class="builder-box" style="--agent-ink:${color}"><i></i><i></i><i></i><i></i><span></span></div>`).join('')}`;
  const orbit = overlay.querySelector('.builder-orbit');
  const hud = overlay.querySelector('.builder-hud-text');
  const bar = overlay.querySelector('.builder-hud-track b');
  const agents = [...overlay.querySelectorAll('.builder-cursor')].map((node,i) => ({
    node, action: node.querySelector('.builder-chip span'), x:0, y:0, fromX:0, fromY:0, began:0, task:null, index:i,
  }));
  const boxes = [...overlay.querySelectorAll('.builder-box')].map(node => ({node, label:node.querySelector('span')}));
  document.body.append(overlay);

  let frame = 0;
  let run = null;
  let played = false;
  const blocked = () => reduced.matches || root.classList.contains('motion-off');
  const clamp = (value,min,max) => Math.max(min,Math.min(value,max));
  const easing = t => t * t * (3 - 2 * t);
  const jump = top => window.scrollTo({top, behavior:'instant'});
  const readSeen = () => {
    try { return window.sessionStorage.getItem(sessionKey) === '1'; }
    catch { return true; }
  };
  const remember = () => {
    played = true;
    try { window.sessionStorage.setItem(sessionKey,'1'); } catch { /* replay remains available */ }
  };

  function reflect() {
    const unavailable = blocked();
    const state = unavailable ? 'disabled' : run ? 'running' : played ? 'replay' : 'ready';
    button.dataset.tourState = state;
    button.setAttribute('aria-disabled', String(unavailable));
    const text = unavailable ? 'Builder tour' : run ? 'Stop tour' : played ? 'Replay tour' : 'Builder tour';
    label.textContent = text;
    if (icon) icon.textContent = run ? 'Ⅱ' : '✦';
    button.title = unavailable ? 'Enable motion to play the builder tour' : run ? 'Stop builder tour (Esc)' : 'Play the builder tour (Alt+Shift+S)';
    button.setAttribute('aria-label', unavailable ? 'Builder tour, motion is off' : run ? 'Stop builder tour' : played ? 'Replay builder tour' : 'Play builder tour');
  }

  function stop() {
    root.classList.remove('builder-tour-preparing');
    if (!run) return;
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    for (const {node} of tasks) {
      delete node.dataset.buildState;
      delete node.dataset.buildKind;
      node.style.removeProperty('--build-progress');
    }
    for (const node of document.querySelectorAll('.motion-reveal.is-pending')) {
      node.classList.remove('is-pending');
      node.classList.add('is-revealed');
    }
    run = null;
    overlay.hidden = true;
    root.classList.remove('builder-tour-running');
    remember();
    reflect();
  }

  function start() {
    if (blocked() || document.hidden || run) { root.classList.remove('builder-tour-preparing'); return; }
    remember();
    for(const task of tasks) {
      task.state='waiting';
      task.node.dataset.buildKind=task.kind;
      task.node.dataset.buildState='waiting';
      task.node.style.setProperty('--build-progress','0%');
    }
    root.classList.add('builder-tour-running');
    root.classList.remove('builder-tour-preparing');
    jump(0);
    const now = performance.now();
    run = {started:now,lastFrame:now,index:-1,width:root.clientWidth,top:0,commandedTop:0,bottomSince:null,finishedAt:null};
    for (const agent of agents) {
      agent.x = -120;
      agent.y = 0;
      agent.task = null;
      agent.node.hidden = compact.matches && agent.index >= 3;
      agent.node.classList.remove('builder-typing','builder-sizing','builder-click');
    }
    const inset=chapters[0].section.getBoundingClientRect().left+parseFloat(getComputedStyle(chapters[0].section).paddingLeft);
    overlay.style.setProperty('--builder-inset',Math.max(14,inset)+'px');
    reflect();
    paint(now);
  }

  function finishTask(task) {
    task.state='done';
    task.node.dataset.buildState='done';
    task.node.style.setProperty('--build-progress','100%');
  }

  function movePage(elapsed, delta, height) {
    const max = Math.max(0, root.scrollHeight - root.clientHeight);
    const pace = easing(clamp((elapsed - scrollStart) / 550, 0, 1));
    const remaining = Math.max(0, max - run.top);
    const slowdown = clamp(remaining / (height * .45), .36, 1);
    const speed = Math.min(690, height * (compact.matches ? .55 : .70));
    run.top = Math.min(max, run.top + pace * speed * slowdown * delta / 1000);
    run.commandedTop = Math.round(run.top);
    if (run.commandedTop !== Math.round(window.scrollY)) jump(run.commandedTop);
    return max;
  }

  function placeCursor(agent, action) {
    agent.node.style.transform = `translate3d(${Math.round(agent.x)}px,${Math.round(agent.y)}px,0)`;
    if (agent.action.textContent !== action) agent.action.textContent = action;
  }

  function paint(now) {
    if (!run) return;
    const elapsed = now - run.started;
    const delta = clamp(now - run.lastFrame, 0, 48);
    run.lastFrame = now;
    const width = root.clientWidth;
    const height = window.innerHeight;
    const headerEdge = Math.max(12, header?.getBoundingClientRect().bottom || 0);
    const max = movePage(elapsed, delta, height);
    const count = compact.matches ? 3 : agents.length;

    let chapterIndex = 0;
    for (let i = 1; i < chapters.length; i++) {
      if (chapters[i].anchor.getBoundingClientRect().top > height * .56) break;
      chapterIndex = i;
    }
    if (run.index !== chapterIndex) {
      run.index = chapterIndex;
      hud.textContent = `${String(chapterIndex + 1).padStart(2,'0')} / ${chapters[chapterIndex].name}`;
    }

    // Measure in viewport coordinates so drawing stays attached as the page moves.
    const candidates = [];
    for (const task of tasks) {
      if (task.state === 'done') continue;
      const rect = task.node.getBoundingClientRect();
      task.rect = rect;
      if (!rect.width || !rect.height || (!task.header && rect.bottom <= headerEdge)) {
        finishTask(task);
      } else if (task.state === 'waiting' && rect.top < height * .94) {
        candidates.push(task);
      }
    }

    const orbitX = clamp(width * .15, 78, 190);
    const orbitY = Math.min(height * .48, Math.max(headerEdge + 64, height * .23));
    const radius = (compact.matches ? 47 : 65) * (.40 + .60 * easing(clamp(elapsed / 900, 0, 1)));
    const orbitEnd = orbitEntry + orbitDuration + (count - 1) * orbitStagger;
    orbit.style.transform = `translate3d(${orbitX}px,${orbitY}px,0) scale(${radius / 65})`;
    orbit.style.opacity = String(clamp(elapsed / 250, 0, 1) * clamp((orbitEnd + 130 - elapsed) / 260, 0, 1));

    const drawings = [];
    for (const agent of agents.slice(0,count)) {
      const i = agent.index;
      const intro = elapsed - i * orbitStagger;
      if (intro <= orbitEntry + orbitDuration) {
        const angle = Math.PI + i * Math.PI * 2 / count + Math.PI * 2 * clamp((intro - orbitEntry) / orbitDuration, 0, 1);
        const entry = easing(clamp(intro / orbitEntry, 0, 1));
        agent.x = -125 + (orbitX + Math.cos(angle) * radius + 125) * entry;
        agent.y = orbitY + Math.sin(angle) * radius * .76 * entry;
        placeCursor(agent, 'orbit');
        continue;
      }

      if (agent.task?.state === 'done') agent.task = null;
      if (!agent.task && candidates.length) {
        agent.task = candidates.shift();
        agent.task.state = 'assigned';
        agent.began = now;
        agent.fromX = agent.x;
        agent.fromY = agent.y;
      }

      const task = agent.task;
      if (!task) {
        const seconds = elapsed / 1000;
        const settle = 1 - Math.exp(-delta / 240);
        const idleX = width * [.12,.44,.74,.29,.67,.54][i] + Math.sin(seconds * 2 + i) * 20;
        const idleY = height * [.53,.68,.67,.83,.42,.82][i] + Math.cos(seconds * 1.8 + i) * 18;
        agent.x += (idleX - agent.x) * settle;
        agent.y += (clamp(idleY, headerEdge, height - 34) - agent.y) * settle;
        agent.node.classList.remove('builder-typing','builder-sizing','builder-click');
        placeCursor(agent, 'scan');
        continue;
      }

      const {rect,kind} = task;
      const age = now - agent.began;
      const flight = 200 + i * 12;
      const draw = kind === 'type' ? 410 : 535;
      const active = age >= flight;
      const progress = clamp((age - flight) / draw, 0, 1);
      const shape = kind === 'type' ? Math.floor(progress * 28) / 28 : easing(progress);
      const fill = clamp((shape - .38) / .62, 0, 1);
      if (active) {
        if (task.state !== 'drawing') {
          task.state = 'drawing';
          task.node.dataset.buildState = 'drawing';
        }
        task.node.style.setProperty('--build-progress', `${(shape * 100).toFixed(2)}%`);
        if (kind !== 'type') drawings.push({rect,shape,fill,kind,ink:crew[i][1]});
      }

      const sweepX = kind === 'media' ? .65 : shape;
      const sweepY = kind === 'type' ? .63 : kind === 'media' ? fill : shape;
      const endX = clamp(rect.left + rect.width * sweepX, 8, width - 22);
      const endY = clamp(rect.top + rect.height * sweepY, task.header ? 8 : headerEdge, height - 27);
      const fraction = easing(clamp(age / flight, 0, 1));
      const arc = Math.sin(fraction * Math.PI) * (i % 2 === 0 ? -21 : 21);
      agent.x = agent.fromX + (endX - agent.fromX) * fraction + arc;
      agent.y = agent.fromY + (endY - agent.fromY) * fraction + arc * .6;
      agent.node.classList.toggle('builder-typing', active && kind === 'type');
      agent.node.classList.toggle('builder-sizing', active && kind !== 'type');
      agent.node.classList.toggle('builder-click', progress > .86);
      placeCursor(agent, kind === 'media' ? 'place' : kind);
      if (progress >= 1) {
        finishTask(task);
        agent.task = null;
      }
    }

    boxes.forEach((box, i) => {
      const drawing = drawings[i];
      box.node.hidden = !drawing;
      if (!drawing) return;
      const {rect,shape,fill,kind,ink} = drawing;
      box.node.classList.toggle('builder-box-scan', kind === 'media');
      box.node.style.setProperty('--agent-ink', ink);
      box.node.style.transform = `translate3d(${Math.round(rect.left)}px,${Math.round(rect.top)}px,0)`;
      const boxWidth = Math.max(1, Math.round(rect.width * (kind === 'media' ? 1 : shape)));
      const boxHeight = Math.max(1, Math.round(rect.height * (kind === 'media' ? fill : shape)));
      box.node.style.width = `${boxWidth}px`;
      box.node.style.height = `${boxHeight}px`;
      const dimensions = `${boxWidth} × ${boxHeight}`;
      if (box.label.textContent !== dimensions) box.label.textContent = dimensions;
    });

    if (elapsed >= scrollStart && run.commandedTop >= max - 1) {
      run.bottomSince ??= now;
      if (tasks.every(task => task.state === 'done') || now - run.bottomSince >= 1900) run.finishedAt ??= now;
    }
    const fade = run.finishedAt === null ? 1 : 1 - clamp((now - run.finishedAt) / 400, 0, 1);
    if (!fade) { stop(); return; }
    overlay.style.opacity = String(clamp(elapsed / 135, 0, 1) * fade);
    overlay.hidden = false;
    const progress = max ? .06 + .94 * run.top / max : 1;
    bar.style.transform = `scaleX(${progress * clamp(elapsed / scrollStart, 0, 1)})`;
    frame = window.requestAnimationFrame(paint);
  }

  function motionChanged() { if (blocked()) stop(); reflect(); }
  function toggle() { if (run) stop(); else start(); }
  button.addEventListener('click',toggle);
  window.addEventListener('portfolio:motionchange',motionChanged);
  reduced.addEventListener('change',motionChanged);
  window.addEventListener('wheel',event => { if (event.deltaY < 0 && !event.ctrlKey) stop(); },{passive:true});
  window.addEventListener('pointerdown',event => {
    if (event.pointerType !== 'touch' && !button.contains(event.target)) stop();
  },{passive:true});
  window.addEventListener('keydown',event => {
    if (event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey && event.code === 'KeyS' && !event.repeat && !blocked()) {
      if (event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable]')) return;
      event.preventDefault(); toggle(); return;
    }
    if (['Escape','Tab','PageUp','PageDown','Home','End','ArrowUp','ArrowDown',' '].includes(event.key) && !(event.target===button && event.key===' ')) stop();
  });
  document.addEventListener('focusin',event => { if (event.target!==button) stop(); });
  document.addEventListener('visibilitychange',() => { if (document.hidden) stop(); });
  window.addEventListener('hashchange',stop);
  window.addEventListener('pagehide',stop);
  window.addEventListener('scroll',() => {
    if (!run) return;
    const actual = window.scrollY;
    if (actual < run.commandedTop - 4) stop();
    else if (actual > run.commandedTop) {
      run.top = actual;
      run.commandedTop = actual;
    }
  },{passive:true});
  window.addEventListener('resize',() => { if (run && Math.abs(root.clientWidth-run.width)>12) stop(); },{passive:true});

  played=readSeen();
  button.hidden=false;
  reflect();
  const navigation=performance.getEntriesByType?.('navigation')[0];
  if (!played && !blocked() && !window.location.hash && window.scrollY<6 && !document.hidden && (!navigation || navigation.type==='navigate')) {
    start();
  } else root.classList.remove('builder-tour-preparing');
})();
