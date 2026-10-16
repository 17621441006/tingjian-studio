// One identity for the gallery, workbench, proposal pages and installed app.
export const BRAND_VERSION = 'v43';
export const brandHead = `<link rel="icon" type="image/png" sizes="32x32" href="/icons/nocturne-v43-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/nocturne-v43-16.png">
<link rel="icon" type="image/svg+xml" href="/icons/nocturne-v43.svg">
<link rel="shortcut icon" href="/favicon.ico?v=43">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/nocturne-v43-180.png">
<link rel="manifest" href="/manifest.webmanifest?v=43" crossorigin="use-credentials">
<meta name="application-name" content="NOCTURNE · 夜廊">
<meta name="apple-mobile-web-app-title" content="夜廊">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">`;

export const webManifest = {
  id: '/',
  name: '夜廊 · 陈天涌私宅设计 — NOCTURNE',
  short_name: '夜廊',
  description: 'NOCTURNE 私宅设计：精选风格提案与全套方案工作台。',
  lang: 'zh-CN',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#0d0c0b',
  icons: [
    {src: '/icons/nocturne-v43-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
    {src: '/icons/nocturne-v43-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
    {src: '/icons/nocturne-v43-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
  ],
};
