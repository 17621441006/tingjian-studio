from pathlib import Path
from PIL import Image
from io import BytesIO
import sys, json, hashlib
design,room,source=sys.argv[1:4]
im=Image.open(source).convert('RGB')
assert abs(im.width/im.height-1.5)<.02, (source, im.size)
dest=Path('dist/designs-v51/schemes')/design
dest.mkdir(parents=True,exist_ok=True)
records=[]
def save(target,size,quality,thumb,role):
    target.parent.mkdir(parents=True,exist_ok=True)
    image=im.resize(size,Image.Resampling.LANCZOS)
    buf=BytesIO();image.save(buf,format='WEBP',quality=quality,method=6)
    raw=buf.getvalue();assert len(raw)>5000
    tmp=target.with_suffix('.tmp');tmp.write_bytes(raw);tmp.replace(target)
    records.append(dict(path=str(target),design=design,room=role,thumb=thumb,width=size[0],height=size[1],bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest()))
save(dest/(room+'.webp'),(1536,1024),82,False,room)
save(dest/(room+'-thumb.webp'),(480,320),81,True,room)
if design=='silver-retreat' and room=='living':save(Path('dist/designs-v51/featured/flora-768.webp'),(768,512),84,True,'hero')
out=Path('verification/v51/generated');out.mkdir(parents=True,exist_ok=True)
(out/(design+'-'+room+'.json')).write_text(json.dumps(dict(design=design,room=room,source=source,assets=records),ensure_ascii=False,indent=2)+'\n')
print(json.dumps(dict(design=design,room=room,assets=len(records),bytes=sum(a['bytes'] for a in records))))
