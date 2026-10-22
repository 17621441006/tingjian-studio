# NOCTURNE — v55 夜紫香槟

User selection: **③ 夜紫香槟**, corrected from an image-order-based selection.

The approved single ribbon N replaces the earlier four-way emblem. The production
master is an opaque, full-bleed square: no white/grey outer frame, no pre-rendered
rounded corners. iOS applies its own icon mask. On-page branding uses CSS rounding.

`night-purple-champagne.webp` is a lossless copy of the approved production master.
Regenerate platform exports with `python scripts/export-brand-v55.py` (Pillow).
Normal site builds use committed exports and require no image-processing dependency.

The homepage opening surface and manifest launch background are white. Existing
entrance animation, gallery layout, proposal order and all interior imagery remain
unchanged. Versioned v55 image URLs invalidate old asset URLs; existing installed
iOS shortcuts may still require removal and re-adding through Safari.

The previous v43 source assets remain in Git for rollback; only the current exports
are included in the published build.
