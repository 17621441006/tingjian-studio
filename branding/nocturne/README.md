# NOCTURNE / 夜廊 — v43 identity

The user selected the first uploaded black-and-white mark (classic bold geometry) as the installed app icon on 2026-10-16.

## Deliverables

- `masters/nocturne-01-classic-4096.png`: classic black / white, 4096 × 4096.
- `masters/nocturne-02-light-4096.png`: lighter black / white, 4096 × 4096.
- `masters/nocturne-03-purple-gold-4096.png`: purple / pale gold, 4096 × 4096.
- Matching SVG files contain traced contour paths, including the lettering; they do not depend on installed fonts or embed raster artwork.
- `src/brand/icons/` contains the symbol-only app icon, browser icons and maskable export.

The supplied approved images are recorded by SHA-256 in `source-record.json`. The app-icon reference was generated from the first approved image with only the wordmark removal and centered square framing requested. The final artwork uses flat vector contours and a clean outlined Roman-serif wordmark; these are vector exports, not new native 4K generative images.

`scripts/export-brand.mjs` is the optional authoring step and requires `sharp`. All generated files are committed; the standard build requires no new dependencies. `src/brand/meta.mjs` owns the shared HTML metadata and manifest. `scripts/build-brand.mjs` copies the production icon assets to `dist/`.

High-resolution masters are outside `dist/` and are not loaded or included in the hosted site. No service worker or offline cache was added. The original homepage design and animations are unchanged.
