import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);

function read(path) {
  return fs.readFileSync(new URL(path, root), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const html = read('index.html');
const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
assert(inlineScripts.length > 0, 'index.html has no inline script to check');
inlineScripts.forEach((script, index) => {
  new vm.Script(script, { filename: `index-inline-${index + 1}.js` });
});

const symbolMaster = JSON.parse(read('data/symbol-master.json'));
assert(Array.isArray(symbolMaster.us), 'symbol-master.json must include us array');
assert(Array.isArray(symbolMaster.jp), 'symbol-master.json must include jp array');
assert(symbolMaster.us.length > 0, 'US symbol master is empty');
assert(symbolMaster.jp.length > 0, 'JP symbol master is empty');
new vm.Script(read('data/symbol-master.js'), { filename: 'symbol-master.js' });

const proxySource = read('api/proxy.js');
assert(proxySource.includes('ALLOWED_HOSTS'), 'proxy must keep an explicit host allowlist');
assert(proxySource.includes("target.protocol !== 'https:'"), 'proxy must require https targets');
assert(proxySource.includes("redirect: 'manual'"), 'proxy must block upstream redirects');
new vm.Script(
  proxySource.replace(/export\s+default\s+async\s+function\s+handler/, 'async function handler'),
  { filename: 'api/proxy.js' },
);
for (const apiFile of ['api/config.js', 'api/market-data.js']) {
  new vm.Script(
    read(apiFile).replace(/export\s+default\s+async\s+function\s+handler/, 'async function handler')
      .replace(/export\s+default\s+function\s+handler/, 'function handler'),
    { filename: apiFile },
  );
}

const vercelConfig = JSON.parse(read('vercel.json'));
assert(Array.isArray(vercelConfig.headers), 'vercel.json must define headers');
assert(JSON.stringify(vercelConfig.headers).includes('Content-Security-Policy'), 'security headers missing CSP');
assert(!/\b(alert|confirm|prompt)\s*\(/.test(html), 'native alert/confirm/prompt should use app dialog helpers');

const schema = read('supabase/schema.sql').toLowerCase();
assert(schema.includes('enable row level security'), 'Supabase schema must enable RLS');
assert(schema.includes('to authenticated'), 'Supabase policies must be scoped to authenticated users');
assert(schema.includes('drop policy if exists'), 'Supabase schema should be safe to re-run');
assert(schema.includes('create table if not exists app_state'), 'Supabase schema must include app_state sync table');

console.log(`kabu_web static checks passed (${symbolMaster.us.length} US / ${symbolMaster.jp.length} JP symbols).`);
