'use strict';
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeNavigation(restore=false) { menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open menu'); nav.classList.remove('menu-open'); if(restore) menu.focus(); }
menu.addEventListener('click',()=>{ const open=menu.getAttribute('aria-expanded')!=='true'; menu.setAttribute('aria-expanded',String(open)); menu.setAttribute('aria-label',open?'Close menu':'Open menu'); nav.classList.toggle('menu-open',open); });
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>closeNavigation()));
document.addEventListener('keydown',event=>{ if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true')closeNavigation(true); });
matchMedia('(min-width:761px)').addEventListener('change',event=>{if(event.matches)closeNavigation();});
document.querySelector('#year').textContent=new Date().getFullYear();
const reduce=matchMedia('(prefers-reduced-motion:reduce)');
let off=reduce.matches;
const motion=document.querySelector('#motion-toggle');
function applyMotion(){document.documentElement.classList.toggle('motion-off',off);motion.textContent=off?'Motion off':'Motion on';motion.setAttribute('aria-pressed',String(off));}
applyMotion();
motion.addEventListener('click',()=>{document.documentElement.classList.toggle('motion-override',off);off=!off;applyMotion();});
reduce.addEventListener('change',event=>{off=event.matches;document.documentElement.classList.remove('motion-override');applyMotion();});
