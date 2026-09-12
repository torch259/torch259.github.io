#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本地程序化生成美术素材（纯 Python 标准库，无外网、无第三方依赖）。

产出（写入 assets/textures/）：
  noise.png          128x128 可平铺白色噪点（低 alpha），叠加在深色底上做颗粒感
  halftone-fade.png  256x256 网点渐变（左疏右密），用于色块/卡片装饰
  stripe-red.png     24x24   45° 红色斜条纹，可平铺
  ray-red.png        512x512 放射线（burst），用于 Hero 背景

用法：python tools/gen_textures.py
"""

import os
import random
import struct
import zlib

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "textures")

P5_RED = (230, 0, 18)
WHITE = (255, 255, 255)


def write_png(path, width, height, rows):
    """rows: list[bytearray]，每行 width*4 字节，RGBA。"""

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    raw = b"".join(b"\x00" + bytes(r) for r in rows)  # filter type 0
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(raw, 9))
           + chunk(b"IEND", b""))
    with open(path, "wb") as f:
        f.write(png)
    return len(png)


def blank(width, height):
    return [bytearray(width * 4) for _ in range(height)]


def put(rows, x, y, rgba):
    w = len(rows[0]) // 4
    if 0 <= x < w and 0 <= y < len(rows):
        i = x * 4
        rows[y][i:i + 4] = bytes(rgba)


def gen_noise(path, size=128, seed=42, max_alpha=26):
    rnd = random.Random(seed)
    rows = blank(size, size)
    # 用整数运算生成可平铺的白噪（逐像素随机，平铺无接缝问题）
    for y in range(size):
        row = rows[y]
        for x in range(size):
            a = rnd.randint(0, max_alpha)
            i = x * 4
            row[i] = WHITE[0]
            row[i + 1] = WHITE[1]
            row[i + 2] = WHITE[2]
            row[i + 3] = a
    return write_png(path, size, size, rows)


def gen_halftone_fade(path, size=256, cell=8, color=P5_RED):
    """网点渐变：点半径随 x 增大，形成左疏右密。抗锯齿用覆盖率近似。"""
    rows = blank(size, size)
    for cy in range(size):
        for cx in range(size):
            t = cx / (size - 1)                     # 0..1 从左到右
            r = (cell * 0.62) * t                   # 半径 0 -> 最大
            # 当前像素到所在网格中心的距离
            mx = (cx % cell) - (cell - 1) / 2.0
            my = (cy % cell) - (cell - 1) / 2.0
            d = (mx * mx + my * my) ** 0.5
            if r <= 0:
                continue
            if d <= r - 0.5:
                a = 255
            elif d >= r + 0.5:
                continue
            else:
                a = int(255 * (r + 0.5 - d))    # 边缘 1px 软过渡
            put(rows, cx, cy, (color[0], color[1], color[2], a))
    return write_png(path, size, size, rows)


def gen_stripe(path, size=24, period=12, color=P5_RED):
    rows = blank(size, size)
    for y in range(size):
        for x in range(size):
            if ((x + y) % period) < period // 2:   # 45° 斜条纹
                put(rows, x, y, (color[0], color[1], color[2], 255))
    return write_png(path, size, size, rows)


def gen_rays(path, size=512, count=24, color=P5_RED):
    """放射线：以中心为原点，按角度切分成扇区，交替着色，边缘随半径淡出。"""
    import math
    rows = blank(size, size)
    c = (size - 1) / 2.0
    for y in range(size):
        for x in range(size):
            dx, dy = x - c, y - c
            dist = (dx * dx + dy * dy) ** 0.5
            if dist > c or dist < 12:
                continue
            ang = math.atan2(dy, dx)
            seg = int(((ang + math.pi) / (2 * math.pi)) * count)
            if seg % 2:
                continue
            fade = 1.0 - dist / c
            a = int(200 * fade * fade)
            if a > 0:
                put(rows, x, y, (color[0], color[1], color[2], a))
    return write_png(path, size, size, rows)


def verify_png(path):
    """纯标准库校验：签名 / IHDR 尺寸 / IDAT 解压后行字节数 / CRC。"""
    data = open(path, "rb").read()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", "bad signature"
    pos, idat, w, h = 8, b"", 0, 0
    while pos < len(data):
        (ln,) = struct.unpack(">I", data[pos:pos + 4])
        tag = data[pos + 4:pos + 8]
        body = data[pos + 8:pos + 8 + ln]
        crc = struct.unpack(">I", data[pos + 8 + ln:pos + 12 + ln])[0]
        assert crc == zlib.crc32(tag + body) & 0xFFFFFFFF, "bad crc " + tag.decode()
        if tag == b"IHDR":
            w, h = struct.unpack(">II", body[:8])
        elif tag == b"IDAT":
            idat += body
        pos += 12 + ln
    raw = zlib.decompress(idat)
    assert len(raw) == h * (1 + w * 4), "unexpected raw length"
    return w, h


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    jobs = [
        ("noise.png", gen_noise),
        ("halftone-fade.png", gen_halftone_fade),
        ("stripe-red.png", gen_stripe),
        ("ray-red.png", gen_rays),
    ]
    for name, fn in jobs:
        path = os.path.join(OUT_DIR, name)
        size = fn(path)
        w, h = verify_png(path)
        print("%-20s %4dx%-5d %7d bytes  verified" % (name, w, h, size))


if __name__ == "__main__":
    main()
