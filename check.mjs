import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { deploymentConfig } from './lib/paths.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const dist=path.join(root,'dist');
const {basePath,siteUrl}=deploymentConfig();
async function filesIn(directory){const files=[];for(const entry of await readdir(directory,{withFileTypes:true})){const name=path.join(directory,entry.name);files.push(...entry.isDirectory()?await filesIn(name):[name]);}return files;}
const files=await filesIn(dist);let checked=0;const titles=new Set();
async function checkReference(reference,file,html=''){
  if(/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference))return;
  const [urlPath,fragment]=reference.split('#');
  let pathname=urlPath.split('?')[0];
  if(basePath&&pathname.startsWith('/')){
    if(pathname!==basePath&&!pathname.startsWith(basePath+'/'))throw Error(`Unprefixed root URL ${reference} in ${file}; expected ${basePath}/`);
    pathname=pathname.slice(basePath.length)||'/';
  }
  let target=pathname?(pathname.startsWith('/')?path.resolve(dist,'.'+pathname):path.resolve(path.dirname(file),pathname)):file;
  if(pathname.endsWith('/'))target=path.join(target,'index.html');
  const relative=path.relative(dist,target);
  if(relative.startsWith('..')||path.isAbsolute(relative))throw Error(`Local reference escapes dist: ${reference} in ${file}`);
  await access(target).catch(()=>{throw Error(`Broken local reference ${reference} in ${file}`);});
  if(fragment&&target.endsWith('.html')){const targetHtml=target===file&&html?html:await readFile(target,'utf8');if(!targetHtml.includes(`id="${fragment}"`))throw Error(`Missing anchor ${reference} in ${file}`);}
}
function rootReferences(value){
  if(typeof value==='string')return /^\/(?!\/)/.test(value)?[value]:[];
  if(Array.isArray(value))return value.flatMap(rootReferences);
  if(value&&typeof value==='object')return Object.values(value).flatMap(rootReferences);
  return [];
}
for(const file of files){
  if(file.endsWith('.js')){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);}
  if(!file.endsWith('.html'))continue;
  const html=await readFile(file,'utf8');
  const title=html.match(/<title>(.*?)<\/title>/)?.[1];if(!title||titles.has(title))throw Error(`Missing or duplicate title: ${file}`);titles.add(title);
  if(!html.includes('name="description"')||!html.includes('rel="canonical"'))throw Error(`Missing SEO metadata: ${file}`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);if(new Set(ids).size!==ids.length)throw Error(`Duplicate IDs: ${file}`);
  const relative=path.relative(dist,file).split(path.sep).join('/');
  const pagePath='/'+relative.replace(/index\.html$/,'');
  const expectedUrl=siteUrl+pagePath;
  const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const ogUrl=html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
  if(canonical!==expectedUrl||ogUrl!==expectedUrl)throw Error(`Incorrect canonical or og:url in ${file}; expected ${expectedUrl}`);
  const ogImage=html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  if(!ogImage?.startsWith(siteUrl+'/'))throw Error(`Incorrect og:image site path in ${file}`);
  await checkReference(new URL(ogImage).pathname,file,html);
  for(const [,reference] of html.matchAll(/\b(?:href|src|poster|data-gallery-source)="([^"]+)"/g))await checkReference(reference,file,html);
  for(const [,srcset] of html.matchAll(/\bsrcset="([^"]+)"/g))for(const candidate of srcset.split(','))await checkReference(candidate.trim().split(/\s+/)[0],file,html);
  for(const [,json] of html.matchAll(/<script\b[^>]*\btype="application\/json"[^>]*>([\s\S]*?)<\/script>/g))for(const reference of rootReferences(JSON.parse(json)))await checkReference(reference,file,html);
  for(const image of html.matchAll(/<img\b[^>]*>/g)){if(!/\balt="/.test(image[0]))throw Error(`Image has no alt: ${file}`);}
  checked++;
}
const projectDataFile=path.join(dist,'project-data.js');
const projectData=(await readFile(projectDataFile,'utf8')).match(/^window\.portfolioProjects = ([\s\S]*);\s*$/)?.[1];
if(!projectData)throw Error('Missing generated project data.');
for(const reference of rootReferences(JSON.parse(projectData)))await checkReference(reference,projectDataFile);
const sitemap=await readFile(path.join(dist,'sitemap.xml'),'utf8');
for(const [,location] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)){
  if(!location.startsWith(siteUrl+'/'))throw Error(`Incorrect sitemap URL: ${location}`);
  await checkReference(new URL(location).pathname,path.join(dist,'sitemap.xml'));
}
const robots=await readFile(path.join(dist,'robots.txt'),'utf8');
if(!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`))throw Error('Incorrect robots sitemap URL.');
console.log(`Verified ${checked} HTML pages at ${basePath||'/'}: metadata, local links/assets and srcsets, gallery data, project links, anchors, image descriptions, unique IDs, sitemap. All browser JavaScript parses.`);
