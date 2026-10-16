// Optional export tool; requires sharp. Normal builds copy committed production assets.
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)('sharp');
for(const name of ['01-classic','02-light','03-purple-gold']){
 const file='branding/nocturne/masters/nocturne-'+name;
 await sharp(await fs.readFile(file+'.svg')).resize(4096,4096).removeAlpha().png({compressionLevel:9}).toFile(file+'-4096.png');
}
const iconSvg=await fs.readFile('src/brand/icons/nocturne-v43.svg','utf8');
for(const size of [16,32,48,180,192,512])await sharp(Buffer.from(iconSvg)).resize(size,size).removeAlpha().png({compressionLevel:9}).toFile(`src/brand/icons/nocturne-v43-${size}.png`);
// Keep all essential strokes inside the central 80%-diameter maskable safe circle.
const endBg=iconSvg.indexOf('/>',iconSvg.indexOf('<rect'))+2;
const mask=iconSvg.slice(0,endBg)+'<g transform="translate(150.48,150.48) scale(.76)">'+iconSvg.slice(endBg).replace('</svg>','</g></svg>');
await sharp(Buffer.from(mask)).resize(512,512).removeAlpha().png({compressionLevel:9}).toFile('src/brand/icons/nocturne-v43-maskable-512.png');
const icoImages=await Promise.all([16,32,48].map(s=>fs.readFile(`src/brand/icons/nocturne-v43-${s}.png`)));
const head=Buffer.alloc(6+16*icoImages.length);head.writeUInt16LE(1,2);head.writeUInt16LE(icoImages.length,4);let offset=head.length;
icoImages.forEach((b,i)=>{const at=6+16*i;head[at]=[16,32,48][i];head[at+1]=head[at];head.writeUInt16LE(1,at+4);head.writeUInt16LE(32,at+6);head.writeUInt32LE(b.length,at+8);head.writeUInt32LE(offset,at+12);offset+=b.length;});
await fs.writeFile('src/brand/icons/nocturne-v43.ico',Buffer.concat([head,...icoImages]));
console.log('Exported three 4096×4096 PNGs, vector contour masters and production app icons.');
