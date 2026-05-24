/**
 * Generates placeholder PNG assets for Expo (icon + splash) using only Node.js builtins.
 * Output: assets/icon.png (1024×1024), assets/adaptive-icon.png (1024×1024), assets/splash.png (1080×1920)
 *
 * Color scheme: ink (#1A1208) background, gold (#D4A847) mark.
 * Real production assets should replace these.
 */

import { writeFileSync, mkdirSync } from "fs";
import { deflateSync } from "zlib";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "assets");
mkdirSync(OUT, { recursive: true });

function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return ((crc ^ 0xffffffff) >>> 0);
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const lenBuf = u32(data.length);
  const crcBuf = u32(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

function makePng(width, height, rgbFn) {
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;   // bit depth
  ihdrData[9] = 2;   // color type: RGB
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  // Raw image data (filter byte 0 per row + RGB pixels)
  const raw = Buffer.alloc(height * (1 + width * 3));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const [r, g, b] = rgbFn(x, y, width, height);
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
    }
  }

  const idatData = deflateSync(raw, { level: 1 });

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdrData),
    chunk("IDAT", idatData),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Ink background color
const INK   = [0x1A, 0x12, 0x08];
const GOLD  = [0xD4, 0xA8, 0x47];
const INK2  = [0x2A, 0x1E, 0x10];

// icon.png: 1024×1024 — ink background with centered gold ring mark
function iconPixel(x, y, w, h) {
  const cx = w / 2, cy = h / 2;
  const dx = x - cx, dy = y - cy;
  const r = Math.sqrt(dx * dx + dy * dy);
  const maxR = w * 0.3;
  const ringInner = maxR * 0.6, ringOuter = maxR * 0.8;
  if (r >= ringInner && r <= ringOuter) return GOLD;
  if (r < ringInner * 0.35) return GOLD;
  return INK;
}

// adaptive-icon.png: 1024×1024 — same design, slightly more padding
function adaptivePixel(x, y, w, h) {
  return iconPixel(x, y, w, h);
}

// splash.png: 1080×1920 — ink background with small centered mark
function splashPixel(x, y, w, h) {
  const cx = w / 2, cy = h / 2;
  const dx = x - cx, dy = y - cy;
  const r = Math.sqrt(dx * dx + dy * dy);
  const maxR = Math.min(w, h) * 0.08;
  if (r < maxR) return GOLD;
  return INK;
}

console.log("Generating icon.png (1024×1024)…");
writeFileSync(join(OUT, "icon.png"), makePng(1024, 1024, iconPixel));

console.log("Generating adaptive-icon.png (1024×1024)…");
writeFileSync(join(OUT, "adaptive-icon.png"), makePng(1024, 1024, adaptivePixel));

console.log("Generating splash.png (1080×1920)…");
writeFileSync(join(OUT, "splash.png"), makePng(1080, 1920, splashPixel));

console.log("Done → assets/");
