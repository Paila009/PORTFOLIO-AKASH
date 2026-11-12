/* Scroll-driven depth with native scrolling, no dependencies, and an off switch. */
(() => {
  'use strict';
  const root = document.documentElement;
  const clamp = (value,min=0,max=1) => Math.min(max,Math.max(min,value));
  const mix = (a,b,t) => a+(b-a)*t;
  const coarse = matchMedia('(hover: none), (pointer: coarse)');
  const mobile = matchMedia('(max-width: 760px)');
  const cover = document.querySelector('.cover-stage');
  const canvas = document.querySelector('.depth-field');
  const field = canvas && window.createOrbitField ? window.createOrbitField(canvas) : null;
  const band = document.querySelector('.kinetic-band');
  const statement = document.querySelector('.statement-panel');
  const contactArt = document.querySelector('.contact-art');
  const lines = [...document.querySelectorAll('.heading-rule')].map(element=>({element,top:0,height:0}));
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.setAttribute('aria-hidden','true');
  document.body.prepend(progressBar);

  const revealGroups = [
    ['.editorial-heading, .edition-heading, .page-intro > *, .case-intro > *, .gallery-intro-grid > *', 'left'],
    ['.selected-card, .code-card, .gallery-entry', 'cards'],
    ['.education-panel, .creative-edit-copy, .contact-lead, .about-page-statement', 'left'],
    ['.process-panel, .contact-directory, .about-page-bio', 'right'],
    ['.process-list li, .skills-groups > div, .case-details article, .way-card, .journey-entry, .journey-notes article', 'up'],
    ['.statement-panel, .tile-motion-wrap, .case-image', 'up'],
  ];
  const reveals = [];
  const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const {target,isIntersecting} of entries) if(isIntersecting) {
      target.classList.remove('is-pending');
      target.classList.add('is-revealed');
      revealObserver.unobserve(target);
    }
  },{threshold:.08,rootMargin:'0px 0px -24px 0px'}) : null;
  for(const [selector,direction] of revealGroups) document.querySelectorAll(selector).forEach((element,index) => {
    if(element.classList.contains('motion-reveal')) return;
    element.classList.add('motion-reveal');
    const sign = direction==='right' ? 1 : direction==='cards' ? (index%2 ? 1 : -1) : -1;
    const horizontal = direction!=='up';
    element.style.setProperty('--reveal-x',`${horizontal ? sign*(mobile.matches?22:80) : 0}px`);
    element.style.setProperty('--reveal-turn',`${direction==='cards' ? sign*(mobile.matches?5:16) : 0}deg`);
    element.style.setProperty('--reveal-lean',`${direction==='cards' ? 6 : 0}deg`);
    element.style.setProperty('--reveal-delay',`${direction==='cards' ? index%3*85 : direction==='up' ? index%4*45 : 0}ms`);
    const pending = revealObserver && element.getBoundingClientRect().top > innerHeight*.92;
    element.classList.add(pending?'is-pending':'is-revealed');
    if(pending) revealObserver.observe(element);
    reveals.push(element);
  });
  document.addEventListener('focusin',event => {
    const element=event.target.closest('.is-pending');
    if(element){element.classList.remove('is-pending');element.classList.add('is-revealed');revealObserver?.unobserve(element);}
  });

  const cards = [...document.querySelectorAll('.selected-image, .creative-tile, .code-card > .project-image, .contact-art')].map((element,index) => {
    element.classList.add('depth-card');
    const card = {element,index,top:0,height:0,x:0,y:0,tx:0,ty:0,lift:0,hover:false};
    element.addEventListener('pointermove',event => {
      if(!enabled || coarse.matches || event.pointerType==='touch') return;
      const rect=element.getBoundingClientRect();
      card.tx=clamp((event.clientX-rect.left)/rect.width*2-1,-1,1);
      card.ty=clamp((event.clientY-rect.top)/rect.height*2-1,-1,1);
      card.hover=true;
      element.classList.add('is-hovered');
      schedule();
    });
    const release=()=>{card.tx=0;card.ty=0;card.hover=false;element.classList.remove('is-hovered');schedule();};
    element.addEventListener('pointerleave',release);
    element.addEventListener('pointercancel',release);
    return card;
  });

  let enabled = !root.classList.contains('motion-off');
  let frame=0,last=0,lastPaint=0,scroll=window.scrollY,goalScroll=scroll;
  let heroTop=0,heroHeight=1,viewport=innerHeight,pageHeight=1,heroVisible=false;
  let pointerX=0,pointerY=0,targetX=0,targetY=0,bandTop=0,bandHeight=1;
  let statementTop=0,statementHeight=1,contactTop=0,contactHeight=1;
  const layoutTop=element=>{let top=0;for(let node=element;node;node=node.offsetParent)top+=node.offsetTop;return top;};
  function measure(){
    viewport=innerHeight;
    pageHeight=Math.max(1,document.documentElement.scrollHeight-viewport);
    if(cover){heroTop=layoutTop(cover);heroHeight=cover.offsetHeight;field?.resize(cover.clientWidth,heroHeight);}
    if(band){bandTop=layoutTop(band);bandHeight=band.offsetHeight;}
    for(const card of cards){card.top=layoutTop(card.element);card.height=card.element.offsetHeight;}
    for(const line of lines){line.top=layoutTop(line.element.parentElement);line.height=line.element.parentElement.offsetHeight;}
    if(statement){statementTop=layoutTop(statement);statementHeight=statement.offsetHeight;}
    if(contactArt){contactTop=layoutTop(contactArt);contactHeight=contactArt.offsetHeight;}
    goalScroll=window.scrollY;
    schedule();
  }
  function schedule(){if(enabled && !document.hidden && !frame)frame=requestAnimationFrame(draw);}
  function draw(now){
    frame=0;
    if(!enabled || document.hidden)return;
    const dt=last?Math.min(64,now-last):16.67;last=now;
    const ease=1-Math.pow(.82,dt/16.67);
    scroll=mix(scroll,goalScroll,ease);
    pointerX=mix(pointerX,targetX,ease);
    pointerY=mix(pointerY,targetY,ease);
    heroVisible=!!cover && goalScroll<heroTop+heroHeight && goalScroll+viewport>heroTop;
    progressBar.style.transform=`scaleX(${clamp(goalScroll/pageHeight)})`;
    if(cover && heroVisible){
      const p=clamp((scroll-Math.max(0,heroTop-120))/(heroHeight*.95));
      const strength=mobile.matches?.45:1;
      const set=(key,value)=>cover.style.setProperty(key,value);
      set('--hero-x',`${pointerX*17*strength+p*28*strength}px`);
      set('--hero-y',`${p*100*strength+Math.sin(now*.00065)*5}px`);
      set('--hero-z',`${p*35*strength}px`);
      set('--hero-rx',`${-pointerY*6*strength+p*12*strength}deg`);
      set('--hero-ry',`${pointerX*10*strength-p*26*strength}deg`);
      set('--hero-rz',`${p*17*strength}deg`);
      set('--hero-scale',`${1+p*.04*strength}`);
      set('--title-x',`${-p*110*strength}px`);
      set('--title-y',`${p*145*strength}px`);
      set('--title-r',`${-p*3}deg`);
      set('--intro-y',`${-p*35*strength}px`);
      if(field && now-lastPaint>33){field.render({time:now/1000,progress:p,pointerX:pointerX*strength,pointerY:pointerY*strength});lastPaint=now;}
    }
    if(band){const p=clamp((scroll+viewport-bandTop)/(viewport+bandHeight));band.style.setProperty('--ribbon-x',`${-p*(mobile.matches?220:480)}px`);band.style.setProperty('--ribbon-reverse',`${-360+p*300}px`);}
    let settling=Math.abs(scroll-goalScroll)>.2 || Math.abs(pointerX-targetX)>.002 || Math.abs(pointerY-targetY)>.002;
    for(const card of cards){
      const visible=goalScroll+viewport>card.top-80 && goalScroll<card.top+card.height+80;
      if(!visible && !card.hover && Math.abs(card.x)+Math.abs(card.y)<.01)continue;
      card.x=mix(card.x,card.tx,ease);card.y=mix(card.y,card.ty,ease);card.lift=mix(card.lift,card.hover?-8:0,ease);
      const p=clamp((card.top+card.height*.5-scroll-viewport*.5)/(viewport*.7),-1,1);
      const side=card.index%2?1:-1;
      const style=card.element.style;
      style.setProperty('--tilt-x',`${-card.y*7}deg`);style.setProperty('--tilt-y',`${card.x*9}deg`);
      style.setProperty('--depth-turn',`${p*side*(mobile.matches?3:9)}deg`);
      style.setProperty('--depth-rise',`${p*(mobile.matches?6:14)}px`);style.setProperty('--lift',`${card.lift}px`);
      style.setProperty('--shine-x',`${50+card.x*50}%`);style.setProperty('--shine-y',`${50+card.y*50}%`);
      if(Math.abs(card.x-card.tx)+Math.abs(card.y-card.ty)>.005 || Math.abs(card.lift-(card.hover?-8:0))>.1)settling=true;
    }
    for(const line of lines){const top=line.top-scroll;if(top+line.height>0&&top<viewport)line.element.style.setProperty('--line-progress',String(clamp((viewport-top)/(viewport*.6),.08,1)));}
    if(statement)statement.style.setProperty('--statement-glow',`${20+clamp((scroll+viewport-statementTop)/(viewport+statementHeight))*70}%`);
    if(contactArt){const p=clamp((scroll+viewport-contactTop)/(viewport+contactHeight));contactArt.style.setProperty('--contact-x',`${(1-p)*35}px`);contactArt.style.setProperty('--contact-r',`${(1-p)*-12}deg`);}
    if(heroVisible || settling)schedule();
  }
  function syncMotion(){
    enabled=!root.classList.contains('motion-off');
    root.classList.toggle('motion-enabled',enabled);
    if(!enabled){cancelAnimationFrame(frame);frame=0;field?.clear();for(const card of cards){card.tx=card.ty=card.x=card.y=card.lift=0;card.hover=false;card.element.classList.remove('is-hovered');}}
    else{scroll=goalScroll=window.scrollY;last=0;measure();}
  }
  window.addEventListener('scroll',()=>{goalScroll=window.scrollY;schedule();},{passive:true});
  window.addEventListener('resize',measure,{passive:true});
  window.addEventListener('portfolio:motionchange',syncMotion);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else{measure();}});
  if(cover){
    cover.addEventListener('pointermove',event=>{if(!enabled||coarse.matches||event.pointerType==='touch')return;const r=cover.getBoundingClientRect();targetX=clamp((event.clientX-r.left)/r.width*2-1,-1,1);targetY=clamp((event.clientY-r.top)/r.height*2-1,-1,1);schedule();});
    cover.addEventListener('pointerleave',()=>{targetX=targetY=0;schedule();});
  }
  if('ResizeObserver' in window){const resize=new ResizeObserver(measure);resize.observe(document.body);}
  document.fonts?.ready.then(measure);
  window.addEventListener('load',measure,{once:true});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;last=0;});
  window.addEventListener('pageshow',measure);
  syncMotion();
})();
