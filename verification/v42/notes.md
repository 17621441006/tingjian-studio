# v42 review

The homepage is still the restored triptych and original GSAP entrance. Only branding, ordering, the seventh panel, and the workbench cue were changed. The source entrance timeline is unchanged; its event test now traverses the seventh panel and checks both ends.

Images were individually viewed. Five Nocturne spaces now use a light white/grey base, emerald accents, charcoal outlines and brass details. Their existing walls, doors, windows and primary furniture arrangement were used as editing references. These remain concept visualizations, not surveyed architectural records.

Three reverse living views were generated for Nocturne, Stillwood and Inkcourt. Dusk, Cinnabar, Verdigris and Amber reuse their existing `designs-v26` reverse images. Cinnabar's secondary room reuses `layouts-v37/schemes/chinese/second.webp`: a narrow bed along the left wall, desk on the right, straight room boundaries and the end window. Amber uses the original `amber` home assets including v16 refreshed rooms, not `amber-stone`.

Each proposal still contains eight room cards. The living room provides two labeled view buttons. The lightbox has nine images and follows the selected view, while room navigation and storage remain eight rooms. Original material pointer-follow effects and scroll transitions remain. Supporting text and onward navigation received targeted styling only.

`images.json` records all 27 new prepared WebP assets and Git blob hashes. All were decoded with Pillow before upload and compared with returned GitHub blob hashes. `generated-images.json` records the eight image-generation prompts and reference sources. Full images are immutable CDN assets with alternate routes; previews and scripts use the existing hosting strategy. No 3D regeneration or extra WebGL contexts were added.

Build, DOM routes, actual interaction event handlers and privacy isolation checks passed. Browser layout, real mobile GPU behavior, and pixel-level screenshot comparisons were not tested in this managed environment.
