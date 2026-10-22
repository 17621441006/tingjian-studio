"""Reproducible production exports of the approved Night Purple / Champagne icon.

Only resizing, opaque encoding and platform safe-area padding; no redraw.
Run from the repository root: python scripts/export-brand-v55.py
"""
from pathlib import Path
from PIL import Image
import base64

root = Path(__file__).resolve().parents[1]
source = Image.open(root / 'branding/nocturne/v55/night-purple-champagne.webp').convert('RGB')
out = root / 'src/brand/icons'
out.mkdir(parents=True, exist_ok=True)

def png(im, name):
    # A shared small palette retains antialiasing and the champagne shading.
    im.quantize(colors=64, method=Image.Quantize.MAXCOVERAGE, dither=Image.Dither.NONE).save(out / name, optimize=True)

for size in (16, 32, 48, 152, 167, 180, 192, 512, 1024):
    png(source.resize((size, size), Image.Resampling.LANCZOS), f'nocturne-v55-{size}.png')

# Android and other maskable consumers need the entire glyph inside a safe circle.
# iOS gets the larger, uncropped full-bleed artwork above instead.
maskable = Image.new('RGB', (512, 512), source.getpixel((0, 0)))
inset = source.resize((400, 400), Image.Resampling.LANCZOS)
maskable.paste(inset, (56, 56))
png(maskable, 'nocturne-v55-maskable-512.png')
source.resize((48, 48), Image.Resampling.LANCZOS).save(out / 'nocturne-v55.ico', sizes=[(16,16), (32,32), (48,48)])

# Compatibility URL for older bookmarked pages; the original raster remains canonical.
encoded = base64.b64encode((out / 'nocturne-v55-192.png').read_bytes()).decode()
(out / 'nocturne-v55.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><image width="192" height="192" href="data:image/png;base64,' + encoded + '"/></svg>\n')
print('Exported v55 full-bleed app icons, maskable icon and favicon.')
