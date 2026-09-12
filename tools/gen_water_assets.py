#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成水面流动纹理（纯 Python 标准库，无外网、无第三方依赖）。

产出：
  assets/textures/water-flow.png   384x384  可四向无缝平铺的水面流动纹理
                                    = 大块不规则波光（低频场的高值区）
                                    + 细密焦散光网（高频场的过零亮线）
  refs/shots/preview-flow.png       平铺合成到水体蓝底上的预览图，便于肉眼判断

说明：气泡不使用贴图。静态纹理无法表达"随时间淡入淡出"的生命周期，
      把路径烘焙进空间只会得到一串重叠的圆环链条（已实测失败）。
      气泡改由 DOM 元素 + CSS 动画实现，见 css/style.css 的「水泡」章节。

用法：python tools/gen_water_assets.py
"""

import math
import os
import struct
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEX_DIR = os.path.join(ROOT, "assets", "textures")
PREVIEW_DIR = os.path.join(ROOT, "refs", "shots")

# 水体蓝底（与 css 中 --water-* 一致），仅用于预览合成
WATER_TOP = (42, 180, 240)
WATER_BOTTOM = (5, 23, 107)


def write_png(path, width, height, rows, sub_filter=False):
    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    stride = width * 4
    parts = []
    for r in rows:
        if sub_filter:
            # PNG 滤波类型 1（Sub）：水平平滑的图压得更小
            line = bytearray(stride)
            for i in range(stride):
                left = r[i - 4] if i >= 4 else 0
                line[i] = (r[i] - left) & 0xFF
            parts.append(b"\x01" + bytes(line))
        else:
            parts.append(b"\x00" + bytes(r))
    raw = b"".join(parts)
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(raw, 9))
           + chunk(b"IEND", b""))
    with open(path, "wb") as f:
        f.write(png)
    return len(png)


def blank(w, h):
    return [bytearray(w * 4) for _ in range(h)]


def clamp01(v):
    return 0.0 if v < 0.0 else (1.0 if v > 1.0 else v)


def gen_water_flow(path, n=384):
    """大块不规则波光 + 细密焦散光网；整数空间频率保证四向无缝平铺。"""
    buf = blank(n, n)
    tau = 2.0 * math.pi
    for y in range(n):
        row = buf[y]
        for x in range(n):
            b = (math.sin(tau * (2 * x) / n + 1.1)
                 + math.sin(tau * (2 * y) / n + 0.4)
                 + math.sin(tau * (1 * x + 1 * y) / n + 2.2)
                 + math.sin(tau * (1 * x - 2 * y) / n + 0.9))
            # 大块波光：低频场的高值区 → 不规则大亮块
            a_broad = 170.0 * clamp01((b - 1.35) / 1.85) ** 1.15

            f = (math.sin(tau * (5 * x + 2 * y) / n)
                 + math.sin(tau * (-3 * x + 6 * y) / n + 1.7)
                 + math.sin(tau * (4 * x - 5 * y) / n + 0.6)
                 + math.sin(tau * (7 * y) / n + 2.9)
                 + math.sin(tau * (6 * x) / n + 1.3))
            # 细密焦散：高频场过零附近 → 细亮线网
            a_fine = 135.0 * clamp01(1.0 - abs(f) / 0.85) ** 2.0

            a = a_broad + a_fine
            if a > 1.0:
                a = min(255.0, a)
                a = float(int(a / 8) * 8)          # 量化 alpha，提升压缩率
                if a > 0:
                    i = x * 4
                    row[i] = 216
                    row[i + 1] = 248
                    row[i + 2] = 255
                    row[i + 3] = int(a)
    return write_png(path, n, n, buf)


def water_bg(w, h):
    rows = blank(w, h)
    for y in range(h):
        t = y / (h - 1.0)
        r = int(WATER_TOP[0] + (WATER_BOTTOM[0] - WATER_TOP[0]) * t)
        g = int(WATER_TOP[1] + (WATER_BOTTOM[1] - WATER_TOP[1]) * t)
        b = int(WATER_TOP[2] + (WATER_BOTTOM[2] - WATER_TOP[2]) * t)
        row = rows[y]
        for x in range(w):
            i = x * 4
            row[i] = r
            row[i + 1] = g
            row[i + 2] = b
            row[i + 3] = 255
    return rows


def read_png_rgba(path):
    """读回 8bit RGBA PNG（支持滤波类型 0/1/2）。"""
    data = open(path, "rb").read()
    pos, idat, w, h = 8, b"", 0, 0
    while pos < len(data):
        (ln,) = struct.unpack(">I", data[pos:pos + 4])
        tag = data[pos + 4:pos + 8]
        body = data[pos + 8:pos + 8 + ln]
        if tag == b"IHDR":
            w, h = struct.unpack(">II", body[:8])
        elif tag == b"IDAT":
            idat += body
        pos += 12 + ln
    raw = zlib.decompress(idat)
    stride = w * 4
    rows, prev = [], bytearray(stride)
    for y in range(h):
        ft = raw[y * (stride + 1)]
        line = bytearray(raw[y * (stride + 1) + 1:(y + 1) * (stride + 1)])
        if ft == 1:
            for i in range(4, stride):
                line[i] = (line[i] + line[i - 4]) & 0xFF
        elif ft == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        rows.append(line)
        prev = line
    return w, h, rows


def preview_tile(tex_path, out_path, tile_w, tile_h, times_x=2, times_y=2):
    """把纹理按平铺方式合成到水体蓝底上，便于肉眼判断效果。"""
    tw, th, trows = read_png_rgba(tex_path)
    W, H = tile_w * times_x, tile_h * times_y
    canvas = water_bg(W, H)
    for ty in range(times_y):
        for tx in range(times_x):
            ox, oy = tx * tile_w, ty * tile_h
            for y in range(th):
                sy = int(y * tile_h / th)
                dy = oy + sy
                if dy < 0 or dy >= H:
                    continue
                trow, crow = trows[y], canvas[dy]
                for x in range(tw):
                    i = x * 4
                    sa = trow[i + 3]
                    if sa == 0:
                        continue
                    dx = ox + int(x * tile_w / tw)
                    if dx >= W:
                        continue
                    j = dx * 4
                    a = sa / 255.0
                    ia = 1.0 - a
                    crow[j] = int(trow[i] * a + crow[j] * ia + 0.5)
                    crow[j + 1] = int(trow[i + 1] * a + crow[j + 1] * ia + 0.5)
                    crow[j + 2] = int(trow[i + 2] * a + crow[j + 2] * ia + 0.5)
    return write_png(out_path, W, H, canvas, sub_filter=True)


def main():
    os.makedirs(TEX_DIR, exist_ok=True)
    os.makedirs(PREVIEW_DIR, exist_ok=True)

    f = os.path.join(TEX_DIR, "water-flow.png")
    print("water-flow.png      384x384  %7d bytes" % gen_water_flow(f))
    print("preview-flow.png   1152x768  %7d bytes"
          % preview_tile(f, os.path.join(PREVIEW_DIR, "preview-flow.png"), 384, 384, 3, 2))

    # 已废弃：静态长条纹理无法表达气泡生命周期，删除以免误用
    dead = os.path.join(TEX_DIR, "bubbles-tall.png")
    if os.path.exists(dead):
        os.remove(dead)
        print("removed bubbles-tall.png（方案作废）")


if __name__ == "__main__":
    main()
