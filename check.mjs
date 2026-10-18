import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url));
const dist=path.join(root,'dist');
async function filesIn(directory){const files=[];for(const entry of await readdir(directory,{withFileTypes:true})){const name=path.join(directory,entry.name);files.push(...entry.isDirectory()?await filesIn(name):[name]);}return files;}
const files=await filesIn(dist);let checked=0;const titles=new Set();
for(const file of files){
  if(file.endsWith('.js')){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);}
  if(!file.endsWith('.html'))continue;
  const html=await readFile(file,'utf8');
  const title=html.match(/<title>(.*?)<\/title>/)?.[1];if(!title||titles.has(title))throw Error(`Missing or duplicate title: ${file}`);titles.add(title);
  if(!html.includes('name="description"')||!html.includes('rel="canonical"'))throw Error(`Missing SEO metadata: ${file}`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);if(new Set(ids).size!==ids.length)throw Error(`Duplicate IDs: ${file}`);
  for(const [,reference] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(/^(https?:|mailto:|data:|tel:)/.test(reference))continue;
    const [pathname,fragment]=reference.split('#');
    let target=pathname?path.resolve(pathname.startsWith('/')?dist:path.dirname(file),'.'+(pathname.startsWith('/')?pathname:'/'+pathname)):file;
    if(!pathname.startsWith('/')&&pathname)target=path.resolve(path.dirname(file),pathname);
    if(pathname.endsWith('/'))target=path.join(target,'index.html');
    if(pathname==='')target=file;
    await access(target).catch(()=>{throw Error(`Broken local reference ${reference} in ${file}`);});
    if(fragment&&target.endsWith('.html')){const targetHtml=target===file?html:await readFile(target,'utf8');if(!targetHtml.includes(`id="${fragment}"`))throw Error(`Missing anchor ${reference} in ${file}`);}
  }
  for(const image of html.matchAll(/<img\b[^>]*>/g)){if(!/\balt="/.test(image[0]))throw Error(`Image has no alt: ${file}`);}
  checked++;
}
console.log(`Verified ${checked} HTML pages: unique metadata, local links/assets, anchors, image descriptions, unique IDs. All browser JavaScript parses.`);
