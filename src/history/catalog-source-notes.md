# CC0 furniture and surface asset pack

Production assets: 20,824,776 bytes (20.82 MB), 35 files. Copy only `models/`, `materials/`, and `previews/` into the app. All glTF dependencies use relative paths.

## License and provenance

All seven assets are from Poly Haven. Their [official license](https://polyhaven.com/license) identifies their HDRIs, textures and 3D models as CC0; commercial use and redistribution are allowed without required attribution. Verified 24 September 2026. The individual asset pages also display CC0.

The model previews in `previews/` are original local EGL/Pyrender renders; the material swatches are resized from the CC0 diffuse maps. They can be used in the app. Poly Haven website example renders are not included in the production folders. No live API is needed by the app.

## Source pages

| Asset | Official source | Author(s) |
|---|---|---|
| Sofa 03 | https://polyhaven.com/a/sofa_03 | Fran Calvente |
| Sofa 02 | https://polyhaven.com/a/sofa_02 | Kirill Sannikov |
| Coffee Table Round 01 | https://polyhaven.com/a/coffee_table_round_01 | Ulan Cabanilla |
| Curly Teddy Natural | https://polyhaven.com/a/curly_teddy_natural | colormass, Rico Cilliers |
| Poly Wool Herringbone | https://polyhaven.com/a/poly_wool_herringbone | colormass, Rico Cilliers |
| Wooden Floor 02 | https://polyhaven.com/a/wooden_floor_02 | Charlotte Baglioni, Rico Cilliers |
| Marble 01 | https://polyhaven.com/a/marble_01 | Rob Tuytel |

## Models

All models use meters with +Y up, +Z front, X width and Z depth. Both sofas face +Z, visually verified in their renders. The coffee table is rotationally symmetric. UV0 and normals are present on every primitive. Tangents are not supplied.

| Model | Entry file | Width × depth × height (m) | Triangles | Meshes / primitives / materials |
|---|---|---|---:|---|
| Sofa 03 | `models/sofa_03/sofa_03_2k.gltf` | 2.731177 × 0.925084 × 1.118264 | 8,004 | 1 / 2 / 2 |
| Sofa 02 | `models/sofa_02/sofa_02_2k.gltf` | 1.807167 × 0.817751 × 0.709489 | 2,728 | 2 / 2 / 1 |
| Coffee Table Round 01 | `models/coffee_table_round_01/coffee_table_round_01_2k.gltf` | 1.301301 × 1.301302 × 0.491009 | 4,044 | 1 / 1 / 1 |

Sofa 03 received one repair: its original glTF fringe material pointed to a JPEG without alpha. The pack combines the source diffuse JPEG with the official source opacity PNG into `textures/sofa_03_fringe_rgba_2k.png`, and sets the fringe material to alpha MASK (cutoff 0.5). The original glTF and opacity map are archived in `_metadata/`. Geometry is unchanged. Sofa 02 and Coffee Table Round 01 remain as downloaded.

Exact bounds and optional offsets for floor-centered placement are in `manifest.json`. Source API dimensions are in millimeters; actual glTF dimensions are in meters.

## Surface materials

Each material includes three 1K maps: `_diff_1k.jpg` (base color, sRGB), `_nor_gl_1k.jpg` (OpenGL +Y normal, linear), and `_arm_1k.jpg` (R=ambient occlusion, G=roughness, B=metalness, linear). No displacement geometry is required. Use the physical tile dimensions below to set UV repeats.

| Material folder | Map pixels | Physical tile width × height (m) |
|---|---|---|
| `materials/curly_teddy_natural/` | 1024 × 1009 | 0.335804 × 0.330900 |
| `materials/poly_wool_herringbone/` | 1024 × 1045 | 0.270079 × 0.275700 |
| `materials/wooden_floor_02/` | 1024 × 1024 | 1.942000 × 1.942000 |
| `materials/marble_01/` | 1024 × 1024 | 1.500000 × 1.500000 |

## Previews and verification

Furniture images are 960 × 720 JPEGs. Texture swatches are 512 × 512 JPEGs. `preview-contact-sheet.jpg` gives a quick overview. `manifest.json` lists every production source file, URL, current checksum, source checksum and processing note. All downloads passed the MD5 values supplied by the official API. All glTF images and buffers resolve locally.
