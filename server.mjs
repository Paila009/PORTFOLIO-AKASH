import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeBasePath } from './lib/paths.mjs';
const root = fileURLToPath(new URL('./dist/', import.meta.url));
const basePath = normalizeBasePath(process.env.BASE_PATH);
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.pdf': 'application/pdf', '.xml':'application/xml', '.txt':'text/plain' };
http.createServer(async (request, response) => {
  try {
    let requested = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (basePath) {
      if (requested === basePath) { response.writeHead(308, {Location: basePath + '/'}); response.end(); return; }
      if (!requested.startsWith(basePath + '/')) throw new Error('Outside site base path');
      requested = requested.slice(basePath.length);
    }
    let file = path.resolve(root, '.' + (requested === '/' ? '/index.html' : requested));
    const relative = path.relative(root,file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) { response.writeHead(403); response.end('Forbidden'); return; }
    if ((await stat(file)).isDirectory()) file=path.join(file,'index.html');
    const data = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); response.end(data);
  } catch { response.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}); response.end(await readFile(path.join(root,'404.html')).catch(()=>Buffer.from('Page not found'))); }
}).listen(port, '127.0.0.1', () => console.log(`Portfolio preview: http://127.0.0.1:${port}${basePath}/`));
