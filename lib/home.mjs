import { layout, escapeHtml as e } from './layout.mjs';

const arrow = '<span aria-hidden="true">↗</span>';
const icon = (name) => {
  const paths = {
    search: '<circle cx="10" cy="10" r="5"/><path d="m14 14 5 5"/>',
    idea: '<path d="M8 15c0-3-3-3-3-7a7 7 0 0 1 14 0c0 4-3 4-3 7M8 18h8M9 21h6M12 4v3"/>',
    code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>',
    send: '<path d="m3 3 18 7-8 3-3 8-7-18Zm0 0 10 10"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 6 9 7 9-7"/>',
    camera: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="m7 6 2-3h6l2 3"/><circle cx="12" cy="13" r="4"/>',
    pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.code}</svg>`;
};

export function renderHome({ profile, projects, siteUrl }) {
  const titles = {'signal-lab':'SIGNAL LAB',lilnest:'LILNEST',motionbeatz:'MOTIONBEATZ'};
  const categories = {'signal-lab':'RF INTELLIGENCE / MACHINE LEARNING',lilnest:'FULL-STACK / MATERNAL HEALTHCARE',motionbeatz:'COMPUTER VISION / MUSIC'};
  const skills = ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Computer vision', 'Machine learning', 'Git & GitHub'];
  const process = [
    ['search', 'Discover', 'Start with a question worth asking. Understand the people and the problem.'],
    ['idea', 'Explore', 'Connect ideas. Sketch the possibilities. Find a direction.'],
    ['code', 'Build', 'Turn the idea into something you can use, see, or experience.'],
    ['check', 'Refine', 'Test the details. Learn what works. Make the next version better.'],
  ];
  const body = `
  <section class="cover wrap" aria-labelledby="cover-name">
    <div class="cover-topline"><span>ENGINEERING MIND.<br><b>CREATIVE INSTINCT.</b></span><a href="#contact">LET’S CREATE SOMETHING ${arrow}</a></div>
    <div class="cover-stage">
      <div class="cover-billboard" aria-hidden="true">PORTFOLIO</div>
      <div class="cover-visual" aria-hidden="true">
        <div class="cover-halo"></div>
        <picture><source type="image/webp" srcset="/assets/crimson-sculpture-480.webp 480w, /assets/crimson-sculpture-900.webp 900w, /assets/crimson-sculpture-1254.webp 1254w" sizes="(max-width: 600px) 92vw, 65vw"><img class="cover-sculpture" src="/assets/crimson-sculpture.png" alt="" width="1254" height="1254" fetchpriority="high"></picture>
        <span class="visual-coordinate">LOGIC × INSTINCT</span>
      </div>
      <div class="cover-intro">
        <span class="handwritten">Hello, I’m</span>
        <h1 id="cover-name">PAILA<br>AKASH<span class="name-period">.</span></h1>
        <p class="cover-role">DEVELOPER.<br>ARTIST. PHOTOGRAPHER.</p>
        <p class="cover-description">I turn curiosity into code, ideas into art, and everyday moments into frames worth keeping.</p>
        <a class="cover-cta" href="#work">EXPLORE MY WORK <span aria-hidden="true">↘</span></a>
      </div>
      <aside class="cover-aside" aria-label="At a glance">
        <div class="cover-note"><span aria-hidden="true">✦</span><p>Code, canvas<br>& camera.<br>One curious mind.</p></div>
        <dl class="cover-facts"><div><dt>${e(profile.cgpa.split("/")[0].trim())}<span>/10</span></dt><dd>CGPA AT<br> K L UNIVERSITY</dd></div><div><dt>${String(Math.min(projects.length,3)).padStart(2,"0")}</dt><dd>FEATURED<br> CODE PROJECTS</dd></div><div><dt>∞</dt><dd>WAYS TO<br> STAY CURIOUS</dd></div></dl>
      </aside>
    </div>
    <div class="cover-bottom"><span><i></i> ${e(profile.location.toUpperCase())}</span><span class="cover-motto">BUILT WITH LOGIC. SEEN WITH FEELING.</span><a href="${e(profile.resumePath)}" download>DOWNLOAD RÉSUMÉ <span aria-hidden="true">↓</span></a></div>
  </section>

  <section class="selected-work wrap" id="work" aria-labelledby="selected-title">
    <div class="editorial-heading"><h2 id="selected-title">SELECTED PROJECTS</h2><span class="heading-rule"></span><a href="/code/">VIEW ALL PROJECTS ${arrow}</a></div>
    <div class="selected-grid">${projects.slice(0,3).map((project,index)=>`<article class="selected-card"><a class="selected-image" href="/code/${e(project.slug)}/" aria-label="Explore ${e(project.title)}"><img src="${e(project.image)}" alt="${e(project.imageAlt)}" width="1200" height="800" loading="lazy"><span>INTERFACE CONCEPT</span><div class="selected-view">EXPLORE PROJECT ${arrow}</div></a><a class="selected-caption" href="/code/${e(project.slug)}/"><span class="project-number">0${index+1}</span><div><h3>${e(titles[project.slug] || project.title)}</h3><p>${e(categories[project.slug] || project.kicker)}</p></div>${arrow}</a></article>`).join('')}</div>
  </section>

  <section class="editorial-details wrap" aria-label="Education, skills, and approach">
    <div class="education-panel"><h2>EDUCATION & SKILLS</h2><span class="panel-label">EDUCATION</span><div class="education-entry"><h3>B.Tech · Computer Science & Engineering</h3><p>Generative AI specialization<br>${e(profile.college)}</p><div><span>${e(profile.year.toUpperCase())}</span><strong>${e(profile.cgpa)} CGPA</strong></div></div><span class="panel-label">THE TOOLKIT</span><div class="editorial-skills">${skills.map(skill=>`<span>${e(skill)}</span>`).join('')}</div><a class="small-link" href="/about/">MORE ABOUT ME ${arrow}</a></div>
    <div class="process-panel"><h2>HOW I APPROACH IT</h2><ol class="process-list">${process.map(([symbol,title,description],index)=>`<li><span class="process-number">0${index+1}</span><span class="process-icon">${icon(symbol)}</span><div><h3>${title}</h3><p>${description}</p></div></li>`).join('')}</ol></div>
    <div class="statement-panel"><span class="quote-symbol" aria-hidden="true">“</span><p>Different tools.<br>Different perspectives.<br><em>The same<br>curiosity.</em></p><span class="signature">Akash</span><div class="statement-bottom">CODE.<br>CANVAS.<br>CAMERA.<span aria-hidden="true">✦</span></div></div>
  </section>

  <section class="creative-edit wrap" aria-labelledby="creative-title"><div class="editorial-heading"><h2 id="creative-title">BEYOND THE CODE</h2><span class="heading-rule"></span><a href="${e(profile.instagram)}" target="_blank" rel="noopener noreferrer">@AAKASH.REDDIE ${arrow}</a></div><div class="creative-edit-grid"><div class="creative-edit-copy"><span class="panel-label">A DIFFERENT KIND OF EXPRESSION</span><h3>Some ideas<br>don’t need<br><span>a keyboard.</span></h3><p>Art and photography are how I slow down, look closer, and see things differently.</p><a class="small-link" href="${e(profile.instagram)}" target="_blank" rel="noopener noreferrer">FOLLOW MY VISUAL DIARY ${arrow}</a></div><a class="creative-tile canvas-tile" href="/art/"><span class="tile-top">01 / ART & EXPRESSION ${arrow}</span><div class="canvas-motif" aria-hidden="true"><i></i><i></i><i></i></div><div class="tile-bottom"><h3>CANVAS</h3><p>Explore the art space<br><span>Personal artwork coming soon</span></p></div></a><a class="creative-tile camera-tile" href="/photography/"><span class="tile-top">02 / PHOTOGRAPHY ${arrow}</span><div class="camera-motif" aria-hidden="true"><i></i><i></i><span>LOOK CLOSER</span></div><div class="tile-bottom"><h3>CAMERA</h3><p>Explore the photo space<br><span>Personal photographs coming soon</span></p></div></a></div></section>

  <section class="editorial-contact wrap" id="contact" aria-labelledby="contact-title"><div class="contact-lead"><h2 id="contact-title">LET’S WORK<br>TOGETHER<span aria-hidden="true">✦</span></h2><p>A project, a collaboration, or a fresh perspective. Let’s create something that means something.</p><a class="contact-invite" href="mailto:${e(profile.email)}"><span aria-hidden="true">↗</span> START A CONVERSATION</a></div><div class="contact-directory"><a href="mailto:${e(profile.email)}"><span class="directory-icon">${icon('mail')}</span><span><small>EMAIL</small>${e(profile.email)}</span>${arrow}</a><a href="${e(profile.instagram)}" target="_blank" rel="noopener noreferrer"><span class="directory-icon">${icon('camera')}</span><span><small>INSTAGRAM</small>@aakash.reddie</span>${arrow}</a><a href="${e(profile.github)}" target="_blank" rel="noopener noreferrer"><span class="directory-icon">${icon('code')}</span><span><small>GITHUB</small>Paila009</span>${arrow}</a><div><span class="directory-icon">${icon('pin')}</span><span><small>BASED IN</small>${e(profile.location)}</span></div></div><a class="contact-art" href="mailto:${e(profile.email)}" aria-label="Email Akash to create something together"><span>YOUR NEXT IDEA.<br>OUR NEXT CONVERSATION.</span><b aria-hidden="true">A<span>↗</span></b><span>LET’S MAKE IT HAPPEN.</span></a></section>`;
  return layout({title:'Paila Akash — Code, Canvas & Camera',description:'The portfolio of Paila Akash: developer, artist, and photographer. Explore projects in AI, full-stack development, computer vision, and creative work.',path:'/',body,profile,siteUrl,bodyClass:'portfolio-home',extraCss:'/editorial.css'});
}
