import fs from 'node:fs/promises';
import {webManifest, BRAND_VERSION} from '../src/brand/meta.mjs';

// Commit ready-to-use exports so normal builds need no image processing dependency.
await fs.rm('dist/icons', {recursive:true, force:true});
await fs.mkdir('dist/icons', {recursive:true});
for (const name of await fs.readdir('src/brand/icons')) {
  if (name.startsWith(`nocturne-${BRAND_VERSION}`)) await fs.copyFile(`src/brand/icons/${name}`, `dist/icons/${name}`);
}
await fs.writeFile('dist/manifest.webmanifest', JSON.stringify(webManifest, null, 2)+'\n');
await fs.copyFile(`src/brand/icons/nocturne-${BRAND_VERSION}-180.png`, 'dist/apple-touch-icon.png');
await fs.copyFile(`src/brand/icons/nocturne-${BRAND_VERSION}-180.png`, 'dist/apple-touch-icon-precomposed.png');
await fs.copyFile(`src/brand/icons/nocturne-${BRAND_VERSION}.ico`, 'dist/favicon.ico');
// Retain the old URL as an alias for bookmarked or cached documents.
await fs.mkdir('dist/collection', {recursive:true});
await fs.copyFile(`src/brand/icons/nocturne-${BRAND_VERSION}.svg`, 'dist/collection/icon.svg');
console.log('Built NOCTURNE app identity: Apple touch icon, browser icons and web manifest.');
