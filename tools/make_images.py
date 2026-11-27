#!/usr/bin/env python3
"""Generates the 1200x630 social preview image. Re-run after changing brand text/colours."""
import os
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "img")
DEEP, IND, LIGHT = (30, 27, 75), (79, 70, 229), (129, 140, 248)

def font(bold, size):
    p = "/usr/share/fonts/opentype/inter/Inter-%s.otf" % ("Bold" if bold else "Regular")
    if not os.path.exists(p):
        p = "/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf" % ("-Bold" if bold else "")
    return ImageFont.truetype(p, size)

def mark(d, x, y, s):
    """Draw the P + triangle mark inside a box of size s at x,y (matches icon.svg proportions)."""
    k = s / 512.0
    P = lambda px, py: (x + px * k, y + py * k)
    d.polygon([P(150,120),P(270,120),P(270,176),P(208,176),P(208,392),P(150,392)], fill="white")
    d.pieslice([P(184,120)[0], P(184,120)[1], P(356,120+152)[0], P(356,120+152)[1]], -90, 90, fill="white")
    d.polygon([P(300,392),P(362,306),P(412,392)], fill=LIGHT)

def icon(size, pad=0.0):
    im = Image.new("RGBA", (size, size), DEEP + (255,))
    d = ImageDraw.Draw(im)
    s = size * (1 - 2 * pad)
    mark(d, size * pad, size * pad, s)
    return im

def rounded(im, r):
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, im.size[0]-1, im.size[1]-1], r, fill=255)
    out = Image.new("RGBA", im.size, (0,0,0,0)); out.paste(im, (0,0), m); return out


# --- OG image ---
W, H = 1200, 630
og = Image.new("RGB", (W, H), DEEP)
px = og.load()
for yy in range(H):
    for xx in range(W):
        t = (xx / W * 0.6 + yy / H * 0.4)
        px[xx, yy] = tuple(int(DEEP[i] + (IND[i] - DEEP[i]) * t) for i in range(3))
d = ImageDraw.Draw(og)
tile = rounded(icon(120), 28); og.paste(tile, (72, 64), tile)
d.text((212, 84), "ProEase Labs", font=font(True, 44), fill="white")
d.text((72, 220), "Enterprise-grade operations.", font=font(True, 72), fill="white")
d.text((72, 306), "Priced for SMEs.", font=font(True, 72), fill=(199, 210, 254))
d.text((72, 418), "SAP-inspired procedures in lean software:", font=font(False, 34), fill=(224, 231, 255))
d.text((72, 462), "ERP  •  HRM  •  Internal Email  •  Custom Builds", font=font(True, 34), fill="white")
d.rounded_rectangle([72, 540, 72 + 520, 540 + 52], 26, fill=(255, 255, 255))
d.text((96, 549), "ProEase+  —  3-in-1 SME suite", font=font(True, 28), fill=DEEP)
og.save(os.path.join(OUT, "og-image.png"), optimize=True)
print("images ok")
