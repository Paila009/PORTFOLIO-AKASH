/* Choreographed cursors and a scroll tour; no content is edited by the animation. */
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
  const sessionKey = 'akash-builder-tour-seen-v1';
  const crew = [
    ['TYPE', '#ff6a86'], ['FRAME', '#c7abff'], ['GRID', '#f6c579'],
    ['SIGNAL', '#8ad4e1'], ['CODE', '#f3ebe7'], ['LENS', '#9be2bd'],
  ];
  const chapters = [
    ['Introduction', '.cover', [['#cover-name', 'type'], ['.hero-portrait', 'frame'], ['.cover-note', 'align'], ['.cover-billboard', 'place'], ['.hero-actions', 'link'], ['.cover-facts', 'check']]],
    ['Two perspectives', '#ways', [['#ways-title', 'type'], ['#ways .way-card:first-child', 'box'], ['#ways .way-card:last-child', 'align']]],
    ['Selected projects', '#work', [['#selected-title', 'type'], ['#work .selected-image', 'frame'], ['#work .selected-card:nth-child(2)', 'box'], ['#work .selected-card:nth-child(3)', 'align'], ['.toolkit-strip', 'check']]],
    ['Project lab', '#lab', [['#lab-title', 'type'], ['.lab-input', 'trace'], ['.lab-output', 'frame'], ['.lab-control', 'check']]],
    ['The journey', '#journey', [['#journey-title', 'type'], ['.journey-entry', 'check'], ['.journey-notes article', 'box']]],
    ['Creative work', '#creative', [['#creative-title', 'type'], ['.canvas-tile', 'frame'], ['.camera-tile', 'focus'], ['.creative-edit-copy', 'align']]],
    ['Get in touch', '#contact', [['#contact-title', 'type'], ['.edition-contact-row .edition-button', 'link'], ['.edition-socials', 'check']]],
  ].map(([name, selector, items]) => {
    const section = document.querySelector(selector);
    return {
      name, section, anchor: section?.querySelector('.edition-heading') || section,
      items: items.map(([target, action]) => ({node: document.querySelector(target), action})).filter(item => item.node),
    };
  }).filter(chapter => chapter.section && chapter.items.length);
  if (chapters.length < 2) return;

  const cursorSvg = '<svg viewBox="0 0 22 24" focusable="false"><path d="M2 2.1 19.6 12l-7.4 1.1-3.8 7.2z" fill="currentColor" stroke="#0a0608" stroke-width="1.25" stroke-linejoin="round"/></svg>';
  const overlay = document.createElement('div');
  overlay.className = 'builder-overlay';
  overlay.dataset.builderOverlay = '';
  overlay.hidden = true;
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `<div class="builder-ruler builder-ruler-top"></div><div class="builder-ruler builder-ruler-left"></div><div class="builder-baseline"></div><div class="builder-hud"><i></i><span class="builder-hud-text"></span><span class="builder-hud-track"><b></b></span></div>${crew.map(([name,color]) => `<div class="builder-cursor" style="--agent-ink:${color}">${cursorSvg}<span class="builder-chip">${name} <b>·</b> <span></span></span><i class="builder-ping"></i></div>`).join('')}${crew.slice(0,3).map(([,color]) => `<div class="builder-box" style="--agent-ink:${color}"><i></i><i></i><i></i><i></i><span></span></div>`).join('')}`;
  const hud = overlay.querySelector('.builder-hud-text');
  const bar = overlay.querySelector('.builder-hud-track b');
  const agents = [...overlay.querySelectorAll('.builder-cursor')].map((node,i) => ({
    node, action: node.querySelector('.builder-chip span'), x:0, y:0, fromX:0, fromY:0, beat:-1, began:0, phase:i*133,
  }));
  const boxes = [...overlay.querySelectorAll('.builder-box')].map(node => ({node, label:node.querySelector('span')}));
  document.body.append(overlay);

  let frame = 0;
  let pending = 0;
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
    if (!pending && !run) return;
    if (pending) window.clearTimeout(pending);
    pending = 0;
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    run = null;
    overlay.hidden = true;
    root.classList.remove('builder-tour-running');
    remember();
    reflect();
  }

  function start() {
    if (blocked() || document.hidden || run) return;
    if (pending) window.clearTimeout(pending);
    pending = 0;
    remember();
    jump(0);
    const headerHeight = header?.offsetHeight || 70;
    const maxScroll = Math.max(0,root.scrollHeight - window.innerHeight);
    let time = 3800;
    const scenes = chapters.map((chapter,index) => {
      if (index === 0) return {...chapter, from:0, to:0, begin:0, travel:0, end:time};
      const to = clamp(chapter.anchor.getBoundingClientRect().top + window.scrollY - headerHeight - 27,0,maxScroll);
      const scene = {...chapter, from:0, to, begin:time, travel:0, end:0};
      return scene;
    });
    for (let index=1;index<scenes.length;index++) {
      const scene = scenes[index];
      scene.from = scenes[index-1].to;
      scene.begin = time;
      scene.travel = clamp(Math.abs(scene.to-scene.from)*5,2950,6600);
      time += scene.travel + (index === scenes.length-1 ? 1550 : 950);
      scene.end = time;
    }
    run = {scenes, time, started:performance.now(), index:-1, width:root.clientWidth, top:0};
    agents.forEach((agent,index) => {
      agent.x = run.width * [.12,.59,.82,.28,.73,.42][index];
      agent.y = window.innerHeight * [.45,.68,.36,.83,.78,.32][index];
      agent.beat = -1;
    });
    overlay.style.setProperty('--builder-header',`${headerHeight}px`);
    const inset = chapters[0].section.getBoundingClientRect().left + parseFloat(getComputedStyle(chapters[0].section).paddingLeft);
    overlay.style.setProperty('--builder-inset',`${Math.max(14,inset)}px`);
    root.classList.add('builder-tour-running');
    reflect();
    paint(performance.now());
  }

  function sceneTargets(scene, fallback, bounds) {
    const visible = scene.items.map(item => {
      const rect = item.node.getBoundingClientRect();
      return {
        action:item.action, fullWidth:rect.width, fullHeight:rect.height,
        left:Math.max(8,rect.left-4), right:Math.min(bounds.width-8,rect.right+4),
        top:Math.max(bounds.top,rect.top-4), bottom:Math.min(bounds.height-21,rect.bottom+4),
      };
    }).filter(item => item.right-item.left>21 && item.bottom-item.top>22);
    return visible.length || !fallback ? visible : sceneTargets(fallback,null,bounds);
  }

  function paint(now) {
    if (!run) return;
    const elapsed = now-run.started;
    if (elapsed >= run.time) { stop(); return; }
    const index = run.scenes.findIndex(scene => elapsed < scene.end);
    const scene = run.scenes[index];
    const local = elapsed-scene.begin;
    const amount = scene.travel ? easing(clamp(local/scene.travel,0,1)) : 1;
    const top = Math.round(scene.from+(scene.to-scene.from)*amount);
    if (Math.abs(top-window.scrollY)>1) jump(top);
    run.top = top;
    const bounds = {width:root.clientWidth,height:window.innerHeight,top:(header?.offsetHeight||70)+17};
    const targets = sceneTargets(scene,run.scenes[index-1],bounds);
    const beat = Math.floor(local/1510);
    const count = compact.matches ? 3 : agents.length;
    const appear = clamp(elapsed/480,0,1)*clamp((run.time-elapsed)/500,0,1);

    if (run.index !== index) {
      run.index = index;
      hud.textContent = `${String(index+1).padStart(2,'0')} / ${scene.name}`;
      overlay.dataset.chapter = String(index);
      agents.forEach(agent => { agent.beat=-1; });
    }

    for (let i=0;i<count;i++) {
      const agent=agents[i];
      const target=targets[(i+beat)%targets.length];
      if (agent.beat !== beat) {
        agent.beat=beat;
        agent.began=now;
        agent.fromX=agent.x;
        agent.fromY=agent.y;
      }
      const pace=clamp((now-agent.began-agent.phase)/(690+i*45),0,1);
      const shift=easing(pace);
      const corner=(i+beat)%4;
      const chipWidth=compact.matches?87:112;
      const endX=clamp(target ? (corner%2===0 ? target.left+3 : target.right-6) : bounds.width*(.15+i*.13),12,bounds.width-chipWidth);
      const endY=clamp(target ? (corner<2 ? target.top-9 : target.bottom-9) : bounds.height*(.32+i*.082),bounds.top,bounds.height-62);
      const curve=Math.sin(pace*Math.PI)*(i%2===0?-1:1)*(19+i*4);
      agent.x=agent.fromX+(endX-agent.fromX)*shift+curve*.65;
      agent.y=agent.fromY+(endY-agent.fromY)*shift+curve;
      agent.node.style.transform=`translate3d(${Math.round(agent.x)}px,${Math.round(agent.y)}px,0)`;
      const action=target?.action || 'scan';
      if (agent.action.textContent !== action) agent.action.textContent=action;
      const click=pace>.96 && now-agent.began-agent.phase < 1120;
      agent.node.classList.toggle('builder-click',click);
    }

    const selectionCount=compact.matches?1:boxes.length;
    boxes.forEach((box,i) => {
      const target=i<selectionCount ? targets[(beat+i)%targets.length] : null;
      if (!target) { box.node.hidden=true; return; }
      box.node.hidden=false;
      box.node.style.transform=`translate3d(${Math.round(target.left)}px,${Math.round(target.top)}px,0)`;
      box.node.style.width=`${Math.round(target.right-target.left)}px`;
      box.node.style.height=`${Math.round(target.bottom-target.top)}px`;
      const dimensions=`${Math.round(target.fullWidth)} × ${Math.round(target.fullHeight)}`;
      if(box.label.textContent!==dimensions) box.label.textContent=dimensions;
    });

    overlay.style.opacity=String(appear);
    overlay.hidden=false;
    bar.style.transform=`scaleX(${elapsed/run.time})`;
    frame=window.requestAnimationFrame(paint);
  }

  function motionChanged() { if (blocked()) stop(); reflect(); }
  function toggle() { if (run) stop(); else start(); }
  button.addEventListener('click',toggle);
  window.addEventListener('portfolio:motionchange',motionChanged);
  reduced.addEventListener('change',motionChanged);
  window.addEventListener('wheel',stop,{passive:true});
  window.addEventListener('touchstart',event => { if (!button.contains(event.target)) stop(); },{passive:true});
  window.addEventListener('pointerdown',event => { if (!button.contains(event.target)) stop(); },{passive:true});
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
    if (pending && window.scrollY>6) stop();
    if (run && Math.abs(window.scrollY-run.top)>20) stop();
  },{passive:true});
  window.addEventListener('resize',() => { if (run && Math.abs(root.clientWidth-run.width)>12) stop(); },{passive:true});

  played=readSeen();
  button.hidden=false;
  reflect();
  const navigation=performance.getEntriesByType?.('navigation')[0];
  if (!played && !blocked() && !window.location.hash && window.scrollY<6 && !document.hidden && (!navigation || navigation.type==='navigate')) {
    pending=window.setTimeout(() => {
      pending=0;
      if (!window.location.hash && window.scrollY<6 && !document.hidden && !blocked()) start();
    },950);
  }
})();
