import { escapeHtml as e } from './layout.mjs';

export function renderAbout(profile) {
  const credentials = [...(profile.certifications || []).map(item=>`${item.issuer} · ${item.name}`), ...(profile.achievements || [])];
  return `
  <section class="wrap page-intro about-page-intro"><span class="eyebrow">THE PERSON / CODE, CANVAS & CAMERA</span><h1>More than<br><em>one thing.</em></h1><p>${e(profile.role)}.<br>Based in ${e(profile.location)}.</p></section>
  <section class="wrap about-page-grid">
    <div class="about-page-statement"><figure class="about-portrait"><img src="/assets/portrait-seated-900.webp" srcset="/assets/portrait-seated-480.webp 480w, /assets/portrait-seated-900.webp 900w" sizes="(max-width: 760px) 86vw, 38vw" alt="Paila Akash seated with a camera, lenses, and prints" width="900" height="1200" loading="lazy"><figcaption><span>FRAME 02 / THE PERSON</span><span>CODE · CANVAS · CAMERA</span></figcaption></figure></div>
    <div class="about-page-bio">${profile.bio.map(paragraph=>`<p>${e(paragraph)}</p>`).join('')}
      <div class="education-box"><span class="eyebrow">EDUCATION</span><h3>${e(profile.college)}</h3><p>${e(profile.degree)}<br>${e(profile.year)} · CGPA ${e(profile.cgpa)}</p></div>
      ${credentials.length?`<h3>Credentials & milestones</h3><ul class="about-credential-list">${credentials.map(item=>`<li>${e(item)}</li>`).join('')}</ul>`:''}
      <a class="button button-outline" href="${e(profile.resumePath)}" download>Download résumé ↓</a>
    </div>
  </section>
  <section class="wrap about-contact section-space" id="contact"><span class="eyebrow">GOOD THINGS START WITH A CONVERSATION</span><h2>Let's make<br><em>something matter.</em></h2><a class="email-link" href="mailto:${e(profile.email)}">${e(profile.email)} ↗</a><p>A project, a collaboration, or just a hello.</p><div class="about-socials"><a href="${e(profile.github)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="${e(profile.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="${e(profile.instagram)}" target="_blank" rel="noopener noreferrer">Instagram / @aakash.reddie ↗</a></div></section>`;
}
