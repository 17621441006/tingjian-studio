"""Convert the two supplied OBJ rugs, retaining their UVs and material maps."""
import os, sys, json, math, hashlib
from pathlib import Path
os.environ['PYOPENGL_PLATFORM']='egl'
sys.path.insert(0,'/workspace/scratch/aa0f93406d63/_asset-render-deps')
import numpy as np
np.infty=np.inf
import trimesh, pyrender
from PIL import Image
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals
root=Path('/workspace/scratch/aa0f93406d63/rug-v5')
out=Path('/workspace/sites/tingjian-studio/dist/tour/user-assets');out.mkdir(exist_ok=True)
assets=[]
for aid,folder,long in [('rug-kilim','carpet',2.60),('rug-medallion','rect',2.40)]:
 p=next((root/folder).rglob('*.obj'))
 mesh=trimesh.load(p,force='mesh',process=False)
 if aid=='rug-kilim':
  tex=root/'carpet/textures'
  color=Image.open(tex/'Untitled_6_Mat_1_BaseColor.png').convert('RGB')
  normal=Image.open(tex/'Untitled_6_Mat_1_Normal.png').convert('RGB')
  rough=Image.open(tex/'Untitled_6_Mat_1_Roughness.png').convert('L')
  zero=Image.new('L',rough.size,0)
  arm=Image.merge('RGB',(Image.new('L',rough.size,255),rough,zero))
  material=PBRMaterial(name='Supplied_Kilim_PBR',baseColorTexture=color,normalTexture=normal,metallicRoughnessTexture=arm,metallicFactor=0,roughnessFactor=1,doubleSided=True)
 else:
  color=Image.open(next((root/folder).rglob('*diffuse.jpg'))).convert('RGB')
  material=PBRMaterial(name='Supplied_Medallion_Diffuse',baseColorTexture=color,metallicFactor=0,roughnessFactor=.98,doubleSided=True)
  mesh.apply_transform(trimesh.transformations.rotation_matrix(-math.pi/2,[1,0,0]))
  mesh.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[0,1,0]))
 uv=mesh.visual.uv.copy()
 mesh.visual=TextureVisuals(uv=uv,material=material)
 mesh.apply_scale(long/mesh.extents[2])
 center=mesh.bounds.mean(0);mesh.apply_translation([-center[0],-mesh.bounds[0,1],-center[2]])
 scene=trimesh.Scene(mesh)
 if mesh.extents[1]<.001:
  backing=trimesh.creation.box([mesh.extents[0]*.997,.005,mesh.extents[2]*.997])
  backing.apply_translation([0,.0025,0]);mesh.apply_translation([0,.006,0])
  backing.visual.material=PBRMaterial(name='Estimated_6mm_backing',baseColorFactor=[55,39,24,255],roughnessFactor=1,metallicFactor=0)
  scene=trimesh.Scene([mesh,backing])
 dest=out/(aid+'.glb');scene.export(dest)
 assets.append({'id':aid,'file':dest.name,'triangles':sum(len(m.faces) for m in scene.geometry.values()),'dimensionsCm':(scene.extents[[0,2,1]]*100).round(3).tolist(),'source':str(p),'dimensionStatus':'Visual trial; manufacturer size not supplied','notes':'Original UV mapping preserved; 6 mm backing estimated for zero-thickness plane' if aid=='rug-kilim' else 'Original mesh and diffuse map; metallic 0, high roughness assumption'})
 # Honest thumbnail: render the actual imported UV-mapped mesh, not a swatch.
 def look(eye,target):
  z=np.array(eye,dtype=float)-np.array(target,dtype=float);z/=np.linalg.norm(z);x=np.cross([0.,1.,0.],z);x/=np.linalg.norm(x);y=np.cross(z,x);m=np.eye(4);m[:3,:3]=np.stack([x,y,z],axis=1);m[:3,3]=eye;return m
 rs=pyrender.Scene(bg_color=[.93,.918,.894,1],ambient_light=[.55,.55,.55])
 for name in scene.graph.nodes_geometry:
  trans,geom=scene.graph[name];rs.add(pyrender.Mesh.from_trimesh(scene.geometry[geom],smooth=False),pose=trans)
 rs.add(pyrender.OrthographicCamera(xmag=long*.61,ymag=long*.46,znear=.01,zfar=20),pose=look([.35,3.3,1.75],[0,0,0]))
 rs.add(pyrender.DirectionalLight(color=[1.,.98,.94],intensity=1.5),pose=look([-3,6,4],[0,0,0]))
 renderer=pyrender.OffscreenRenderer(960,720);c,d=renderer.render(rs);renderer.delete()
 Image.fromarray(c).convert('RGB').save(out/(aid+'.jpg'),quality=94)
 print(assets[-1])
(out/'manifest.json').write_text(json.dumps({'assets':assets},indent=2))
