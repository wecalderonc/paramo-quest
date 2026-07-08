#!/usr/bin/env python3
"""Genera íconos PWA (PNG) sin dependencias: montañas de páramo + sol frailejón."""
from __future__ import annotations

import struct
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"

BG = (10, 18, 13)          # surface-0
MOUNTAIN_BACK = (36, 77, 46)   # musgo-700
MOUNTAIN_FRONT = (59, 122, 70)  # musgo-500
SUN = (232, 200, 94)       # frailejon-400
MIST = (61, 88, 102)       # niebla-700


def make_png(size: int) -> bytes:
    px = [[BG for _ in range(size)] for _ in range(size)]
    s = size

    # sol
    cx, cy, r = int(s * 0.68), int(s * 0.30), int(s * 0.14)
    for y in range(s):
        for x in range(s):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                px[y][x] = SUN

    # niebla (banda horizontal sutil)
    for y in range(int(s * 0.48), int(s * 0.54)):
        for x in range(s):
            px[y][x] = MIST

    # montaña trasera (triángulo)
    peak_x, peak_y, base_y = int(s * 0.30), int(s * 0.28), int(s * 0.92)
    for y in range(peak_y, base_y):
        t = (y - peak_y) / (base_y - peak_y)
        half = int(t * s * 0.55)
        for x in range(max(0, peak_x - half), min(s, peak_x + half)):
            px[y][x] = MOUNTAIN_BACK

    # montaña delantera
    peak_x, peak_y = int(s * 0.62), int(s * 0.45)
    for y in range(peak_y, base_y):
        t = (y - peak_y) / (base_y - peak_y)
        half = int(t * s * 0.52)
        for x in range(max(0, peak_x - half), min(s, peak_x + half)):
            px[y][x] = MOUNTAIN_FRONT

    # base
    for y in range(base_y, s):
        for x in range(s):
            px[y][x] = MOUNTAIN_FRONT

    raw = b"".join(
        b"\x00" + b"".join(struct.pack("BBB", *px[y][x]) for x in range(s))
        for y in range(s)
    )

    def chunk(tag: bytes, data: bytes) -> bytes:
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", s, s, 8, 2, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


OUT.mkdir(parents=True, exist_ok=True)
for size in (192, 512):
    (OUT / f"icon-{size}.png").write_bytes(make_png(size))
    print(f"icon-{size}.png OK")
