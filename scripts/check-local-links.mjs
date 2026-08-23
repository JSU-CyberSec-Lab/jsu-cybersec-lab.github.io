import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = [
  'index.html',
  'research-directions/index.html',
  'research-results/index.html',
  'team/index.html',
  'join-us/index.html',
  'contact/index.html'
];
const missing = [];
let checked = 0;

function isExternal(reference) {
  return reference.startsWith('#')
    || reference.startsWith('//')
    || /^[a-z][a-z\d+.-]*:/i.test(reference);
}

function checkReference(sourceFile, reference) {
  if (!reference || isExternal(reference)) return;

  const cleanReference = decodeURIComponent(reference.split('#')[0].split('?')[0]);
  if (!cleanReference) return;

  const sourcePath = path.join(root, sourceFile);
  const targetPath = cleanReference.startsWith('/')
    ? path.join(root, cleanReference)
    : path.resolve(path.dirname(sourcePath), cleanReference);
  const resolvedTarget = cleanReference.endsWith('/')
    ? path.join(targetPath, 'index.html')
    : targetPath;

  checked += 1;
  if (!fs.existsSync(resolvedTarget)) {
    missing.push(`${sourceFile}: ${reference} -> ${path.relative(root, resolvedTarget)}`);
  }
}

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const referencePattern = /\b(?:href|src)=["']([^"']+)["']/g;
  for (const match of html.matchAll(referencePattern)) {
    checkReference(page, match[1]);
  }
}

const stylesheet = 'assets/css/site.css';
const css = fs.readFileSync(path.join(root, stylesheet), 'utf8');
const cssUrlPattern = /url\(["']?([^"')]+)["']?\)/g;
for (const match of css.matchAll(cssUrlPattern)) {
  checkReference(stylesheet, match[1]);
}

if (missing.length) {
  console.error(`Found ${missing.length} missing local reference(s):`);
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Checked ${checked} local references across ${pages.length} pages and the shared stylesheet; no missing files found.`);
