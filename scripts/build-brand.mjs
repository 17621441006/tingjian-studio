import fs from 'node:fs/promises';
import {webManifest} from '../src/brand/meta.mjs';

// Commit ready-to-use exports so normal builds need no image processing dependency.
await fs.mkdir('dist/icons', {recursive:true});
await fs.cp('src/brand/icons', 'dist/icons', {recursive:true});
await fs.writeFile('dist/manifest.webmanifest', JSON.stringify(webManifest, null, 2)+'\n');
await fs.copyFile('src/brand/icons/nocturne-v43-180.png', 'dist/apple-touch-icon.png');
await fs.copyFile('src/brand/icons/nocturne-v43-180.png', 'dist/apple-touch-icon-precomposed.png');
await fs.copyFile('src/brand/icons/nocturne-v43.ico', 'dist/favicon.ico');
// Retain the old URL as an alias for bookmarked or cached documents.
await fs.mkdir('dist/collection', {recursive:true});
await fs.copyFile('src/brand/icons/nocturne-v43.svg', 'dist/collection/icon.svg');
console.log('Built NOCTURNE app identity: Apple touch icon, browser icons and web manifest.');
