"""Encode approved imagegen interiors for the site; no compositing or content edits."""
from pathlib import Path
from PIL import Image
from io import BytesIO
import sys, json, hashlib

scheme, room, source = sys.argv[1:4]
assert scheme in ('voyage-atelier', 'nocturne')
assert room in ('living', 'living2', 'master', 'bedroom', 'hero')
im = Image.open(source).convert('RGB')
if room == 'hero':
    size = (1376, 768)
    thumb_width = 768
    dest = Path('dist/designs-v54/featured')
    name = 'nocturne-hero'
else:
    size = (1200, 896) if scheme == 'nocturne' and room in ('living', 'bedroom') else (1536, 1024)
    thumb_width = 768 if scheme == 'nocturne' else 480
    dest = Path('dist/designs-v54/schemes') / scheme
    name = room
assert abs(im.width / im.height - size[0] / size[1]) < .01, im.size
dest.mkdir(parents=True, exist_ok=True)
thumb_size = (thumb_width, round(size[1] * thumb_width / size[0]))
records = []
for suffix, dimensions, quality in [('', size, 77), ('-768' if scheme == 'nocturne' else '-thumb', thumb_size, 81)]:
    target = dest / (name + suffix + '.webp')
    buf = BytesIO()
    im.resize(dimensions, Image.Resampling.LANCZOS).save(buf, format='WEBP', quality=quality, method=6)
    raw = buf.getvalue()
    target.write_bytes(raw)
    records.append(dict(path=str(target), room=room, scheme=scheme, thumb=bool(suffix), width=dimensions[0], height=dimensions[1], bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest()))
out = Path('verification/v54/generated')
out.mkdir(parents=True, exist_ok=True)
(out / (scheme + '-' + room + '.json')).write_text(json.dumps(dict(room=room, scheme=scheme, source=source, assets=records), ensure_ascii=False, indent=2) + '\n')
print(json.dumps(dict(scheme=scheme, room=room, bytes=sum(a['bytes'] for a in records))))
