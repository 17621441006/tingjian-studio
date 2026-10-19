from PIL import Image
from pathlib import Path
import json,hashlib,io
root=Path('.')
record=json.loads((root/'verification/v48/generation-prompts.json').read_text())
assets=[]
for item in record['schemes']:
    im=Image.open(item['path']).convert('RGB')
    if im.size!=(1536,1024):
        raise ValueError((item['path'],im.size))
    folder=root/'dist/designs-v48/schemes'/item['design']
    folder.mkdir(parents=True,exist_ok=True)
    for thumb in [False,True]:
        out=im.resize((480,320),Image.Resampling.LANCZOS) if thumb else im
        dest=folder/(item['room']+('-thumb' if thumb else '')+'.webp')
        buffer=io.BytesIO()
        out.save(buffer,'WEBP',quality=78 if thumb else 82,method=6)
        data=buffer.getvalue()
        temp=dest.with_suffix('.webp.tmp')
        temp.write_bytes(data)
        temp.replace(dest)
        assets.append(dict(path=dest.as_posix(),design=item['design'],room=item['room'],thumb=thumb,width=out.width,height=out.height,bytes=len(data),sha256=hashlib.sha256(data).hexdigest()))
(root/'verification/v48/assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'files':len(assets),'bytes':sum(a['bytes'] for a in assets),'maxMainBytes':max(a['bytes'] for a in assets if not a['thumb'])}))
