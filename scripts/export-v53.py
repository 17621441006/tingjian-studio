from pathlib import Path
from PIL import Image
from io import BytesIO
import sys, json, hashlib

room, source = sys.argv[1:3]
assert room in ('living', 'living2', 'dining')
im = Image.open(source).convert('RGB')
assert abs(im.width / im.height - 1.5) < .02, im.size
dest = Path('dist/designs-v53/schemes/voyage-atelier')
dest.mkdir(parents=True, exist_ok=True)
records = []
for suffix, size, quality in [('', (1536, 1024), 78), ('-thumb', (480, 320), 81)]:
    target = dest / (room + suffix + '.webp')
    buf = BytesIO()
    im.resize(size, Image.Resampling.LANCZOS).save(buf, format='WEBP', quality=quality, method=6)
    raw = buf.getvalue()
    target.write_bytes(raw)
    records.append(dict(path=str(target), room=room, thumb=bool(suffix), width=size[0], height=size[1], bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest()))
out = Path('verification/v53/generated')
out.mkdir(parents=True, exist_ok=True)
(out / (room + '.json')).write_text(json.dumps(dict(room=room, source=source, assets=records), ensure_ascii=False, indent=2) + '\n')
print(json.dumps(dict(room=room, assets=len(records), bytes=sum(a['bytes'] for a in records))))
