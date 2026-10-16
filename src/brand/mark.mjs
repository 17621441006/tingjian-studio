import {readFileSync} from 'node:fs';

// Reuse the approved first emblem. The website uses its paths without the
// app icon's white tile or safe-area padding; colour follows each placement.
const icon=readFileSync(new URL('./icons/nocturne-v43.svg',import.meta.url),'utf8');
const path=icon.match(/<path\b[^>]*\/>/)[0].replace('fill="#101010"','fill="currentColor"');
export const brandMark=(className='')=>`<svg class="brand-mark ${className}" xmlns="http://www.w3.org/2000/svg" viewBox="210 198 834 834" width="48" height="48" aria-hidden="true" focusable="false">${path}</svg>`;
