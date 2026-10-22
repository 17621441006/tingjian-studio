// Approved selection: ③ 夜紫香槟. Rounded presentation is CSS-only;
// installation assets are opaque square artwork, with no baked-in outer rim.
export const brandMark=(className='')=>`<img class="brand-mark ${className}" src="/icons/nocturne-v55-${className.includes('intro-mark')?'512':'192'}.png" width="48" height="48" alt="" aria-hidden="true" style="border-radius:22%;object-fit:contain"${className.includes('intro-mark')?' fetchpriority="high"':''}>`;
