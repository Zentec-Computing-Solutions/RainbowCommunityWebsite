import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const names = (await readdir(root)).filter(name => name.endsWith('.html'));
const pages = new Map(await Promise.all(names.map(async name => [name, await readFile(path.join(root, name), 'utf8')])));
const errors = [];
let links = 0;
const attributes = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

for (const [name, html] of pages) {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  if (new Set(ids).size !== ids.length) errors.push(`${name}: duplicate IDs`);
  for (const needed of [/<title>.+<\/title>/, /name="description"/, /name="viewport"/, /<html lang="en-NZ"/, /<main id="main"/]) {
    if (!needed.test(html)) errors.push(`${name}: missing ${needed}`);
  }
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    if (attributes(tag, 'alt') === undefined) errors.push(`${name}: missing image alt text`);
    if (!attributes(tag, 'width') || !attributes(tag, 'height')) errors.push(`${name}: missing image dimensions`);
  }
  for (const [tag] of html.matchAll(/<(?:input|select|textarea)\b[^>]*>/g)) {
    const id = attributes(tag, 'id');
    if (!id || !html.includes(`for="${id}"`)) errors.push(`${name}: unlabelled form control`);
  }
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = match[1].replaceAll('&amp;', '&');
    if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
    links++;
    const [urlPath, anchor] = url.split('#');
    const destination = decodeURIComponent(urlPath.split('?')[0]) || name;
    const resolved = path.resolve(root, destination);
    if (!resolved.startsWith(root + path.sep)) { errors.push(`${name}: path outside site: ${url}`); continue; }
    try { await access(resolved); } catch { errors.push(`${name}: missing target: ${url}`); continue; }
    if (anchor && destination.endsWith('.html') && !pages.get(destination)?.includes(`id="${anchor}"`)) errors.push(`${name}: missing anchor: ${url}`);
    if (anchor && destination.endsWith('.svg') && !(await readFile(resolved, 'utf8')).includes(`id="${anchor}"`)) errors.push(`${name}: missing SVG symbol: ${url}`);
  }
}

const css = await readFile(path.join(root, 'styles.css'), 'utf8');
for (const match of css.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) {
  try { await access(path.join(root, match[1])); } catch { errors.push(`styles.css: missing asset: ${match[1]}`); }
}

const javascript = spawnSync(process.execPath, ['--check', path.join(root, 'script.js')], { encoding: 'utf8' });
if (javascript.status !== 0) errors.push(javascript.stderr);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Passed: ${pages.size} pages, ${links} local references, labels, alt text, metadata, unique IDs, and JavaScript syntax.`);
