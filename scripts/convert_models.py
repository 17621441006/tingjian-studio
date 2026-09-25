"""Convert user-supplied OBJ assets; preserve UVs, geometry and reference-scale provenance."""
from pathlib import Path
import sys,json,io
import numpy as np,trimesh
from PIL import Image
source=Path(sys.argv[1]);out=Path(__file__).resolve().parents[1]/'dist/assets/models';out.mkdir(parents=True,exist_ok=True)
items=[('model-3','sofa','木框双人沙发',2.10,.88),('model-2','lounge','弧形单椅',.78,.92),('model-1','table','黑漆矮茶几',1.12,.34),('chair','chair','原木靠背椅',.46,.72)]
report=[]
for folder,id,name,width,roughness in items:
 p=source/folder
 if id=='chair':
  lines=(p/'Chair.obj').read_text().splitlines();group='';new=[]
  for line in lines:
   if line.startswith('o '):group=line[2:]
   if line.startswith('usemtl') and group in ['Legs','Cover']:line='usemtl '+group
   new.append(line)
  (p/'fixed.obj').write_text('\n'.join(new))
  (p/'Chair.mtl').write_text('newmtl Legs\nKd 1 1 1\nmap_Kd Chair-1.jpg\nnewmtl Cover\nKd 1 1 1\nmap_Kd Chair-2.jpg\nnewmtl wire_088177027\nKd 1 1 1\n')
  original=trimesh.load(p/'fixed.obj',force='scene',process=False)
  geometries={k:m for k,m in original.geometry.items() if len(m.faces)>50}
 else:
  original=trimesh.load(p/'model.obj',force='scene',process=False);geometries=original.geometry
 bb=np.array([np.min([m.bounds[0]for m in geometries.values()],axis=0),np.max([m.bounds[1]for m in geometries.values()],axis=0)])
 ext=bb[1]-bb[0];scale=width/ext[0];center=np.array([bb[:,0].mean(),bb[0,1],bb[:,2].mean()]);s=trimesh.Scene()
 for k,m in geometries.items():
  m=m.copy();m.vertices=(m.vertices-center)*scale
  image=m.visual.material.image.convert('RGB');image.thumbnail((2048,2048),Image.Resampling.LANCZOS)
  # Reopen JPEG so glTF embeds compact JPEG rather than large PNG.
  f=io.BytesIO();image.save(f,format='JPEG',quality=93,subsampling=0);f.seek(0);image=Image.open(f);image.load()
  material=trimesh.visual.material.PBRMaterial(name=id+'-'+k,baseColorTexture=image,metallicFactor=0.0,roughnessFactor=roughness,doubleSided=True)
  m.visual=trimesh.visual.TextureVisuals(uv=m.visual.uv,material=material)
  s.add_geometry(m,node_name=id+'-'+k)
 data=trimesh.exchange.gltf.export_glb(s,include_normals=True);(out/(id+'.glb')).write_bytes(data)
 dims=(ext*scale).tolist();report.append({'id':id,'name':name,'file':id+'.glb','width':round(dims[0],4),'height':round(dims[1],4),'depth':round(dims[2],4),'source':folder,'vertices':sum(len(m.vertices)for m in geometries.values()),'triangles':sum(len(m.faces)for m in geometries.values()),'bytes':len(data),'dimensionsVerified':False,'scaleBasis':'Unverified reference width; original model units not documented','materials':'Original supplied color textures; roughness is a preview estimate'})
 im=Image.open(p/'inspect.jpg').crop((0,0,512,512)).resize((384,384),Image.Resampling.LANCZOS);im.save(out/(id+'.jpg'),quality=93)
 print(id,len(data),dims,flush=True)
(out/'catalog.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
