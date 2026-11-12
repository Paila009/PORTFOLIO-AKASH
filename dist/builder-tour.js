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
  const sessionKey = 'akash-builder-tour-seen-v2';
  const crew = [
    ['TYPE', '#ff6a86'], ['FRAME', '#c7abff'], ['GRID', '#f6c579'],
    ['SIGNAL', '#8ad4e1'], ['CODE', '#f3ebe7'], ['LENS', '#9be2bd'],
  ];
  const heading = [['.edition-heading > div > span','type'],['.edition-heading h2','type'],['.edition-heading > a','type']];
  const chapters = [
    ['Introduction', '.cover', [
      ['.site-header nav a, .site-header .contact-link','type',true],
      ['.cover-topline > *','type'], ['.cover-billboard','type'], ['.handwritten','type'], ['#cover-name','type'],
      ['.cover-visual','media'], ['.cover-role','type'], ['.cover-description','type'],
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
  const tasks=chapters.flatMap(chapter=>chapter.items);

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
    node, action: node.querySelector('.builder-chip span'), x:0, y:0, fromX:0, fromY:0, began:0, task:null, phase:i*133,
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
    root.classList.remove('builder-tour-preparing');
    if (!pending && !run) return;
    if (pending) window.clearTimeout(pending);
    pending = 0;
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    if (run) {
      for(const {node} of tasks) {
        delete node.dataset.buildState;
        delete node.dataset.buildKind;
        node.style.removeProperty('--build-progress');
      }
      for(const node of document.querySelectorAll('.motion-reveal.is-pending')) {
        node.classList.remove('is-pending');
        node.classList.add('is-revealed');
      }
    }
    run = null;
    overlay.hidden = true;
    root.classList.remove('builder-tour-running');
    remember();
    reflect();
  }

  const layoutTop=node=>{
    let top=0;
    for(let el=node;el;el=el.offsetParent)top+=el.offsetTop;
    return top;
  };
  function start() {
    if (blocked() || document.hidden || run) { root.classList.remove('builder-tour-preparing'); return; }
    if (pending) window.clearTimeout(pending);
    pending = 0;
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
    const headerHeight = header?.offsetHeight || 70;
    const maxScroll = Math.max(0,root.scrollHeight - window.innerHeight);
    let time=0;
    const scenes=chapters.map((chapter,index)=>{
      const from=index ? chapters[index-1].position : 0;
      const to=index ? clamp(layoutTop(chapter.anchor)-headerHeight-27,0,maxScroll) : 0;
      chapter.position=to;
      const travel=index ? clamp(Math.abs(to-from)*3.7,2450,4320) : 0;
      const begin=time;
      time+=index ? travel+2020 : 5850;
      chapter.items.forEach((task,taskIndex)=>{
        task.ready=begin+(index ? travel*.83+180+taskIndex*190 : 425+taskIndex*205);
      });
      return {...chapter,from,to,begin,travel,end:time};
    });
    run = {scenes,time,started:performance.now(),index:-1,width:root.clientWidth,top:0};
    agents.forEach((agent,index)=>{
      agent.x=run.width*[.12,.59,.82,.28,.73,.42][index];
      agent.y=window.innerHeight*[.45,.68,.36,.83,.78,.32][index];
      agent.task=null;
    });
    overlay.style.setProperty('--builder-header',headerHeight+'px');
    const inset=chapters[0].section.getBoundingClientRect().left+parseFloat(getComputedStyle(chapters[0].section).paddingLeft);
    overlay.style.setProperty('--builder-inset',Math.max(14,inset)+'px');
    reflect();
    paint(performance.now());
  }

  function targetRect(task,bounds) {
    const rect=task.node.getBoundingClientRect();
    const result={
      width:rect.width,height:rect.height,
      left:Math.max(8,rect.left-3),right:Math.min(bounds.width-8,rect.right+3),
      top:Math.max(task.header?8:bounds.top,rect.top-3),bottom:Math.min(bounds.height-21,rect.bottom+3),
    };
    return result.right-result.left>15 && result.bottom-result.top>12 ? result : null;
  }
  function finishTask(task) {
    task.state='done';
    task.node.dataset.buildState='done';
    task.node.style.setProperty('--build-progress','100%');
  }

  function paint(now) {
    if (!run) return;
    const elapsed=now-run.started;
    if (elapsed>=run.time) { stop(); return; }
    const index=run.scenes.findIndex(scene=>elapsed<scene.end);
    const scene=run.scenes[index];
    const local=elapsed-scene.begin;
    const amount=scene.travel ? easing(clamp(local/scene.travel,0,1)) : 1;
    const top=Math.round(scene.from+(scene.to-scene.from)*amount);
    run.top=top;
    if (Math.abs(top-window.scrollY)>1) jump(top);
    const bounds={width:root.clientWidth,height:window.innerHeight,top:(header?.offsetHeight||70)+14};
    const count=compact.matches ? 3 : agents.length;

    if(run.index!==index){
      run.index=index;
      hud.textContent=String(index+1).padStart(2,'0')+' / '+scene.name;
      overlay.dataset.chapter=String(index);
    }

    // Keep the target blank while an agent travels to it. Only that agent can reveal it.
    const candidates=[];
    for(const task of tasks) {
      if(task.state!=='waiting' || task.ready>elapsed)continue;
      const rect=targetRect(task,bounds);
      if(rect)candidates.push({task,rect});
    }
    const drawings=[];
    for(let i=0;i<count;i++){
      const agent=agents[i];
      if(!agent.task && candidates.length){
        const target=candidates.shift();
        agent.task=target.task;
        agent.task.state='assigned';
        agent.began=now;
        agent.fromX=agent.x;
        agent.fromY=agent.y;
      }
      const task=agent.task;
      const rect=task ? targetRect(task,bounds) : null;
      const age=now-agent.began;
      const flight=340+i*19;
      const draw=task?.kind==='type' ? 610 : 780;
      const progress=clamp((age-flight)/draw,0,1);
      const shape=task?.kind==='type' ? Math.floor(progress*27)/27 : easing(progress);
      if(task && age>=flight){
        if(task.state!=='drawing'){task.state='drawing';task.node.dataset.buildState='drawing';}
        task.node.style.setProperty('--build-progress',(shape*100).toFixed(2)+'%');
      }
      if(task && rect){
        const sweepX=task.kind==='type'||task.kind==='box' ? shape : 0.62;
        const sweepY=task.kind==='type' ? .69 : shape;
        const endX=clamp(rect.left+(rect.right-rect.left)*sweepX,10,bounds.width-88);
        const endY=clamp(rect.top+(rect.bottom-rect.top)*sweepY,8,bounds.height-48);
        const fraction=easing(clamp(age/flight,0,1));
        const arc=Math.sin(fraction*Math.PI)*(i%2===0?-19:19);
        agent.x=agent.fromX+(endX-agent.fromX)*fraction+arc;
        agent.y=agent.fromY+(endY-agent.fromY)*fraction+arc*.6;
        if(task.kind!=='type'&&age>=flight)drawings.push({rect,shape,kind:task.kind,ink:crew[i][1]});
      } else {
        const seconds=elapsed/1000;
        const idleX=clamp(bounds.width*[.16,.57,.8,.33,.76,.45][i]+Math.sin(seconds*1.8+i)*38,10,bounds.width-90);
        const idleY=clamp(bounds.height*[.37,.59,.35,.74,.75,.27][i]+Math.cos(seconds*1.7+i)*32,bounds.top,bounds.height-58);
        agent.x+=(idleX-agent.x)*.055;
        agent.y+=(idleY-agent.y)*.055;
      }
      agent.node.style.transform='translate3d('+Math.round(agent.x)+'px,'+Math.round(agent.y)+'px,0)';
      const action=task ? ({type:'type',media:'place',box:'box'})[task.kind] : 'scan';
      if(agent.action.textContent!==action)agent.action.textContent=action;
      agent.node.classList.toggle('builder-typing',!!rect && task.kind==='type' && age>=flight && progress<1);
      agent.node.classList.toggle('builder-click',!!rect && progress>.82);
      if(task && progress>=1){finishTask(task);agent.task=null;}
    }

    boxes.forEach((box,i)=>{
      const drawing=i<(compact.matches?1:boxes.length) ? drawings[i] : null;
      if(!drawing){box.node.hidden=true;return;}
      const {rect,shape,kind,ink}=drawing;
      box.node.hidden=false;
      box.node.style.setProperty('--agent-ink',ink);
      box.node.style.transform='translate3d('+Math.round(rect.left)+'px,'+Math.round(rect.top)+'px,0)';
      const width=Math.max(1,Math.round((rect.right-rect.left)*shape));
      const height=Math.max(1,Math.round((rect.bottom-rect.top)*shape));
      box.node.style.width=width+'px';
      box.node.style.height=height+'px';
      const dimensions=width+' × '+height;
      if(box.label.textContent!==dimensions)box.label.textContent=dimensions;
    });

    overlay.style.opacity=String(clamp(elapsed/240,0,1)*clamp((run.time-elapsed)/500,0,1));
    overlay.hidden=false;
    bar.style.transform='scaleX('+(elapsed/run.time)+')';
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
      else root.classList.remove('builder-tour-preparing');
    },290);
  } else root.classList.remove('builder-tour-preparing');
})();
