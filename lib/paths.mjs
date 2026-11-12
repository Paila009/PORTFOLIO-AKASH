const defaultSiteUrl = 'https://aakash-reddie.pailaakash041.chatgpt.site';

export function normalizeBasePath(value = '') {
  const basePath = String(value).trim().replace(/^\/+|\/+$/g, '');
  if (!basePath) return '';
  if (/[\s?#\\<>"']/.test(basePath) || basePath.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new Error('BASE_PATH must be a URL path such as /PORTFOLIO-AKASH, without a query or fragment.');
  }
  return '/' + basePath;
}

export function deploymentConfig(env = process.env) {
  const basePath = normalizeBasePath(env.BASE_PATH);
  const site = new URL(env.SITE_URL || defaultSiteUrl + basePath);
  if (!/^https?:$/.test(site.protocol) || site.search || site.hash || site.username || site.password) {
    throw new Error('SITE_URL must be an HTTP(S) site URL without credentials, a query, or a fragment.');
  }
  if (normalizeBasePath(site.pathname) !== basePath) {
    throw new Error('SITE_URL must include the same project path as BASE_PATH.');
  }
  return { basePath, siteUrl: site.href.replace(/\/+$/, '') };
}

export function withBasePath(reference, basePath) {
  if (!basePath || typeof reference !== 'string' || !/^\/(?!\/)/.test(reference)) return reference;
  if (reference === basePath || reference.startsWith(basePath + '/')) return reference;
  return basePath + reference;
}

export function prefixRootStrings(value, basePath) {
  if (typeof value === 'string') return withBasePath(value, basePath);
  if (Array.isArray(value)) return value.map(item => prefixRootStrings(item, basePath));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key,item]) => [key,prefixRootStrings(item,basePath)]));
  return value;
}

// Keep templates portable: only URL-bearing attributes/data are rewritten.
export function prefixHtml(html, basePath) {
  if (!basePath) return html;
  return html
    .replace(/\b(href|src|poster|data-gallery-source)="([^"]*)"/g, (_,attribute,value) => `${attribute}="${withBasePath(value,basePath)}"`)
    .replace(/\bsrcset="([^"]*)"/g, (_,value) => `srcset="${value.split(',').map(candidate => candidate.replace(/^(\s*)(\S+)/, (_match,space,reference) => space + withBasePath(reference,basePath))).join(',')}"`)
    .replace(/(<script\b[^>]*\btype="application\/json"[^>]*>)([\s\S]*?)(<\/script>)/g, (_,open,json,close) => open + JSON.stringify(prefixRootStrings(JSON.parse(json),basePath)).replaceAll('<','\\u003c') + close);
}
