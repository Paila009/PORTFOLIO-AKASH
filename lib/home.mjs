import { layout, escapeHtml as e } from './layout.mjs';

const arrow = '<span aria-hidden="true">↗</span>';
const down = '<span aria-hidden="true">↓</span>';
const sectionHeader = (id,index,label,title,accent,link='') => `<div class="edition-heading">
    <div><span class="edition-index">${index} / ${label}</span><h2 id="${id}">${title}<em>${accent}</em></h2></div>${link}
  </div>`;

function projectCard(project,index) {
  const href=`/code/${e(project.slug)}/`;
  return `<article class="selected-card">
    <a class="selected-image" href="${href}" aria-label="Explore ${e(project.title)}"><img src="${e(project.image)}" alt="${e(project.imageAlt)}" width="1200" height="800" loading="lazy"><span>${e(project.imageLabel || 'Interface concept')}</span><div class="selected-view">EXPLORE PROJECT ${arrow}</div></a>
    <div class="feature-card-copy"><span class="edition-index">0${index+1} / ${e(project.kicker)}</span><h3><a href="${href}">${e(project.label || project.title)} ${arrow}</a></h3><p>${e(project.summary)}</p><div class="edition-tags">${project.technologies.slice(0,4).map(tech=>`<span>${e(tech)}</span>`).join('')}</div></div>
  </article>`;
}

function renderJourney(profile) {
  const milestones=[...(profile.experience || []),{role:profile.degree,organization:profile.college,period:profile.year,summary:`${profile.cgpa} CGPA. Studying computer science with a focus on Generative AI.`}];
  return milestones.map((item,index)=>`<details class="journey-entry" ${index===0?'open':''}>
    <summary><span class="journey-number" aria-hidden="true">0${index+1}</span><span class="journey-title"><span>${e(item.role)}</span><small>${e(item.organization)}${item.location?' · '+e(item.location):''}</small></span><span class="journey-period">${e(item.period)}</span><span class="journey-plus" aria-hidden="true"></span></summary>
    <p>${e(item.summary)}</p>
  </details>`).join('');
}

export function renderHome({ profile, projects, siteUrl, artwork=[], photography=[] }) {
  const workCount = String(Math.min(projects.length,3)).padStart(2,'0');
  const cgpa=e(profile.cgpa.split('/')[0].trim());
  const featuredSkills=['Python','Java','JavaScript','React','Node.js','MongoDB','Computer vision','Machine learning'];
  const body = `
  <section class="cover wrap" aria-labelledby="cover-name">
    <div class="cover-topline"><span>COMPUTER SCIENCE & ENGINEERING<br><b>GENERATIVE AI · ART · PHOTOGRAPHY</b></span><a href="#contact"><i aria-hidden="true"></i> ${e(profile.location.toUpperCase())} ${arrow}</a></div>
    <div class="cover-stage">
      <canvas class="depth-field" aria-hidden="true"></canvas>
      <div class="cover-billboard" aria-hidden="true"><svg viewBox="0 0 1200 300" focusable="false"><defs><linearGradient id="billboard-ink" x2="0" y2="1"><stop offset="0" stop-color="#de1830"/><stop offset=".55" stop-color="#9a1021"/><stop offset="1" stop-color="#220a0e"/></linearGradient></defs><text x="0" y="250" textLength="1200" lengthAdjust="spacingAndGlyphs" fill="url(#billboard-ink)">PORTFOLIO</text></svg></div>
      <div class="cover-intro">
        <span class="handwritten">Hello, I’m</span>
        <h1 id="cover-name">PAILA<br> AKASH<span class="name-period">.</span></h1>
        <p class="cover-role">ENGINEERING MIND.<br> CREATIVE INSTINCT.</p>
        <p class="cover-description">I build with code and machine learning, and I look at the world through a camera.</p>
        <div class="hero-actions"><a class="edition-button" href="#work">EXPLORE MY WORK ${down}</a><a class="edition-button secondary" href="${e(profile.resumePath)}" download>RÉSUMÉ ${down}</a></div>
      </div>
      <figure class="cover-visual portrait-cutout">
        <img class="hero-portrait" src="/assets/portrait-cutout-800.webp" srcset="/assets/portrait-cutout-480.webp 480w, /assets/portrait-cutout-800.webp 800w, /assets/portrait-cutout-1100.webp 1069w" sizes="(max-width: 760px) min(94vw, 445px), min(43vw, 630px)" alt="Paila Akash holding a camera, in a black and white portrait" width="800" height="831" fetchpriority="high">
      </figure>
      <aside class="cover-aside" aria-label="At a glance">
        <div class="cover-note"><span aria-hidden="true">✦</span><p>Build with intent.<br>Look a little closer.</p></div>
        <dl class="cover-facts"><div><dt>${cgpa}<span>/10</span></dt><dd>CGPA AT<br> K L UNIVERSITY</dd></div><div><dt>${workCount}</dt><dd>FEATURED<br> PROJECTS</dd></div><div><dt>AI/ML</dt><dd>RESEARCH &<br> ENGINEERING</dd></div></dl>
      </aside>
    </div>
    <div class="cover-bottom"><span><i></i> CODE / CANVAS / CAMERA</span><a href="#ways">SCROLL TO EXPLORE ${down}</a><a href="${e(profile.github)}" target="_blank" rel="noopener noreferrer">GITHUB ${arrow}</a></div>
  </section>

  <section class="edition-section wrap" id="ways" aria-labelledby="ways-title">
    ${sectionHeader('ways-title','00','TWO SIDES OF MY WORK','SAME CURIOSITY. ','DIFFERENT TOOLS.')}
    <div class="ways-grid"><a class="way-card" href="#work"><span class="edition-index">01 / ENGINEERING</span><h3>WHAT I BUILD<span>.</span></h3><p>Software, computer vision, and applied machine learning. See the ideas that made it off the page.</p><span class="way-link">EXPLORE PROJECTS ${arrow}</span></a><a class="way-card" href="#creative"><span class="edition-index">02 / CREATIVE</span><h3>HOW I SEE<span>.</span></h3><p>Art and photography give me a reason to slow down, notice what’s there, and make something from it.</p><span class="way-link">EXPLORE THE CREATIVE SIDE ${arrow}</span></a></div>
  </section>

  <section class="edition-section selected-work wrap" id="work" aria-labelledby="selected-title">
    ${sectionHeader('selected-title','01','SELECTED PROJECTS','IDEAS INTO ','THINGS THAT WORK.',`<a class="edition-link" href="/code/">ALL PROJECTS ${arrow}</a>`)}
    <div class="selected-grid">${projects.slice(0,3).map(projectCard).join('')}</div>
    <div class="toolkit-strip"><span class="edition-index">TOOLS I BUILD WITH</span><div class="edition-tags">${featuredSkills.map(skill=>`<span>${e(skill)}</span>`).join('')}</div></div>
  </section>

  <section class="edition-section wrap" id="lab" aria-labelledby="lab-title">
    ${sectionHeader('lab-title','02','PROJECT LAB','FROM GESTURE ','TO PLAYBACK.',`<a class="edition-link" href="/code/motionbeatz/">MOTIONBEATZ CASE STUDY ${arrow}</a>`)}
    <p class="lab-intro">MotionBeatz uses hand gesture recognition to control a music player. Explore an illustrated view of the input and the interface.</p>
    <div class="lab-comparison" data-lab>
      <div class="lab-stage">
        <div class="lab-pane lab-input"><span>01 / GESTURE INPUT</span><svg viewBox="0 0 120 136" aria-hidden="true" focusable="false"><path d="M39 117 29 91 13 72c-5-7 2-13 9-8l16 12-5-48c-1-9 8-11 11-3l10 31-2-43c0-8 10-9 12 0l8 42 3-33c1-7 10-7 11 1l4 37 7-20c3-7 11-4 10 4l-4 42-13 33Z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M43 112 56 81 54 56M56 81l16-26m-16 26 34-21m-34 21 37 4M56 81 38 76" fill="none" stroke="currentColor" stroke-width="1" opacity=".5"/><g fill="currentColor"><circle cx="43" cy="112" r="3"/><circle cx="56" cy="81" r="3"/><circle cx="54" cy="56" r="3"/><circle cx="72" cy="55" r="3"/><circle cx="90" cy="60" r="3"/><circle cx="93" cy="85" r="3"/><circle cx="38" cy="76" r="3"/></g></svg></div>
        <div class="lab-pane lab-output"><span>02 / PLAYBACK CONTROL</span><div class="lab-player" aria-hidden="true"><div class="lab-player-bars">${[17,30,44,24,57,38,67,50,24,48,66,38,28,53,34,19].map(h=>`<i style="height:${h}%"></i>`).join('')}</div><div class="lab-player-controls"><b>◀</b><b>▶</b><b>▶</b></div></div></div>
        <div class="lab-divider" aria-hidden="true"><span>↔</span></div>
      </div>
      <label class="lab-control" hidden><span>DRAG TO COMPARE</span><input type="range" min="0" max="100" value="50" aria-label="Compare gesture input and playback interface"><span>ILLUSTRATED DEMO</span></label>
    </div>
  </section>

  <section class="edition-section wrap" id="journey" aria-labelledby="journey-title">
    ${sectionHeader('journey-title','03','THE JOURNEY','ALWAYS ','LEARNING.',`<a class="edition-link" href="/about/">MORE ABOUT ME ${arrow}</a>`)}
    <div class="journey-grid"><div class="journey-list">${renderJourney(profile)}</div>
      <div class="journey-notes">
        ${profile.research?`<article><span class="edition-index">RESEARCH / ${e(profile.research.status)}</span><h3>${e(profile.research.title)}</h3><p>${e(profile.research.venue)} · ${e(profile.research.summary)}</p></article>`:''}
        ${profile.openSource?`<article><span class="edition-index">OPEN SOURCE</span><h3>${e(profile.openSource.organization)}</h3><p>${e(profile.openSource.description)}</p><a class="edition-link" href="${e(profile.openSource.url)}" target="_blank" rel="noopener noreferrer">VIEW CONTRIBUTION ${arrow}</a></article>`:''}
      </div>
    </div>
  </section>

  <div class="kinetic-band" aria-hidden="true"><div class="kinetic-track">${Array.from({length:4},()=>'<span>CODE.</span><b>✦</b><span>CANVAS.</span><b>✦</b><span>CAMERA.</span><b>✦</b>').join('')}</div></div>

  <section class="edition-section creative-edit wrap" id="creative" aria-labelledby="creative-title">
    ${sectionHeader('creative-title','04','CREATIVE WORK','BEYOND ','THE CODE.',`<a class="edition-link" href="${e(profile.instagram)}" target="_blank" rel="noopener noreferrer">@AAKASH.REDDIE ${arrow}</a>`)}
    <div class="creative-edit-grid"><div class="creative-edit-copy"><span class="panel-label">ANOTHER WAY TO THINK</span><h3>Some ideas<br>don’t need<br><span>a keyboard.</span></h3><p>Art and photography are where I explore composition, light, and the small details that change how a story feels.</p></div>
      <div class="tile-motion-wrap"><a class="creative-tile canvas-tile" href="/art/"><span class="tile-top">01 / ART & EXPRESSION ${arrow}</span><div class="canvas-motif" aria-hidden="true"><i></i><i></i><i></i></div><div class="tile-bottom"><h3>CANVAS</h3><p>${artwork.some(item=>!item.placeholder)?'View artwork':'Collection coming soon'}</p></div></a></div>
      <div class="tile-motion-wrap"><a class="creative-tile camera-tile" href="/photography/"><span class="tile-top">02 / PHOTOGRAPHY ${arrow}</span><div class="camera-motif" aria-hidden="true"><i></i><i></i><span>LOOK CLOSER</span></div><div class="tile-bottom"><h3>CAMERA</h3><p>${photography.some(item=>!item.placeholder)?'View photographs':'Collection coming soon'}</p></div></a></div>
    </div>
  </section>

  <section class="edition-section edition-contact wrap" id="contact" aria-labelledby="contact-title">
    ${sectionHeader('contact-title','05','GET IN TOUCH','LET’S MAKE ','SOMETHING.')}
    <div class="edition-contact-row"><div><p>For engineering roles, collaborations, or a good conversation about art and technology.</p><a class="edition-button" href="mailto:${e(profile.email)}">EMAIL ME ${arrow}</a></div><div class="edition-socials"><a href="${e(profile.github)}" target="_blank" rel="noopener noreferrer">GitHub ${arrow}</a><a href="${e(profile.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn ${arrow}</a><a href="${e(profile.instagram)}" target="_blank" rel="noopener noreferrer">Instagram ${arrow}</a></div></div>
  </section>`;
  return layout({title:'Paila Akash — Code, Canvas & Camera',description:'The portfolio of Paila Akash: computer science student, developer, artist, and photographer in Hyderabad.',path:'/',active:'home',body,profile,siteUrl,bodyClass:'portfolio-home portrait-edition',extraCss:'/editorial.css'});
}
