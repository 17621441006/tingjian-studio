"""Create a light preview mesh from the supplied GLB, preserving its texture.

Usage: python prepare-table-lod.py <installed-python-deps-directory>
Original GLB remains untouched. Surface color is sampled onto preview vertices
after decimation. Original UV charts are tiny and cannot be merged safely;
photographic rendering always uses the untouched original textured model.
"""
import sys
if len(sys.argv) > 1:
    sys.path.insert(0, sys.argv[1])
import json
from pathlib import Path
import numpy as np
import trimesh
import fast_simplification
from scipy.spatial import cKDTree

source = trimesh.load('dist/assets/models/table.glb', force='scene', process=False)
result = trimesh.Scene()
report = []
for name, mesh in source.geometry.items():
    points, faces = fast_simplification.simplify(mesh.vertices, mesh.faces, target_count=min(28000, len(mesh.faces)))
    valid = np.flatnonzero(mesh.area_faces > 1e-12)
    candidates = valid[cKDTree(mesh.triangles_center[valid]).query(points, k=8)[1]]
    triangles = mesh.triangles[candidates.reshape(-1)]
    near = trimesh.triangles.closest_point(triangles, np.repeat(points, 8, axis=0))
    distances = np.linalg.norm(near - np.repeat(points, 8, axis=0), axis=1).reshape(-1, 8)
    nearest = np.argmin(distances, axis=1)
    chosen = candidates[np.arange(len(points)), nearest]
    bary = trimesh.triangles.points_to_barycentric(mesh.triangles[chosen], near.reshape(-1, 8, 3)[np.arange(len(points)), nearest])
    uv = np.sum(mesh.visual.uv[mesh.faces[chosen]] * bary[:, :, None], axis=1)
    assert np.isfinite(uv).all(), 'Preview UV transfer must remain finite'
    texture = np.asarray(mesh.visual.material.baseColorTexture.convert('RGB'))
    px = np.clip(np.rint(uv[:,0]*(texture.shape[1]-1)).astype(int),0,texture.shape[1]-1)
    py = np.clip(np.rint((1-uv[:,1])*(texture.shape[0]-1)).astype(int),0,texture.shape[0]-1)
    rgb = texture[py,px]/255
    linear = np.where(rgb<=.04045,rgb/12.92,((rgb+.055)/1.055)**2.4)
    colors = np.column_stack([np.rint(linear*255).astype('uint8'),np.full(len(points),255,dtype='uint8')])
    simplified = trimesh.Trimesh(points, faces, process=False,vertex_colors=colors)
    result.add_geometry(simplified, geom_name=name)
    report.append({'name': name, 'originalTriangles': len(mesh.faces), 'previewTriangles': len(faces), 'originalBounds': mesh.bounds.tolist(), 'previewBounds': simplified.bounds.tolist()})
out = Path('dist/tour/trial-assets/table-preview.glb')
out.write_bytes(result.export(file_type='glb'))
Path('verification/table-lod.json').write_text(json.dumps({'meshes': report, 'bytes': out.stat().st_size, 'colorTransfer': 'source texture sampled to linear vertex colors for interactive preview; photo renderer uses original full textured GLB'}, indent=2))
print(json.dumps({'meshes': report, 'bytes': out.stat().st_size}))
