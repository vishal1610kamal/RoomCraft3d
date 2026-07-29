// RoomCraft 3D — procedural textures
// Canvas-drawn albedo + roughness maps so every material looks like a real
// surface (wood grain, woven fabric, mottled leather, brushed metal) without
// shipping a single texture file. Generated lazily and cached by cache-key so
// only the swatches actually used pay any cost. Replace with real KTX2/Basis
// maps later by swapping the loader in src/three/materials.js — the material
// contract does not change.

import * as THREE from 'three';

const cache = new Map();

function makeCanvas(size) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  return c;
}

// Cheap value noise helpers -------------------------------------------------
function rand(x, y, seed = 0) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function shade(hex, amt) {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, THREE.MathUtils.clamp(hsl.l + amt, 0, 1));
  return `#${c.getHexString()}`;
}

// — Wood: warm base + long grain streaks + subtle plank seams —
function drawWood(ctx, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 220; i++) {
    const y = rand(i, 3) * size;
    const w = 0.5 + rand(i, 7) * 2.2;
    const light = rand(i, 11) > 0.5;
    ctx.strokeStyle = shade(color, light ? 0.06 : -0.09);
    ctx.globalAlpha = 0.25 + rand(i, 5) * 0.4;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size; x += 16) {
      ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 2.2 + (rand(x, i) - 0.5) * 2);
    }
    ctx.stroke();
  }
  // plank seams
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = shade(color, -0.22);
  ctx.lineWidth = 1.5;
  for (let p = 1; p < 4; p++) {
    const y = (p / 4) * size;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// — Fabric: flat base + fine woven cross-hatch —
function drawFabric(ctx, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  const step = 4;
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const warp = (x / step + y / step) % 2 === 0;
      ctx.fillStyle = shade(color, warp ? 0.05 : -0.05);
      ctx.globalAlpha = 0.35;
      ctx.fillRect(x, y, step - 1, step - 1);
    }
  }
  // subtle fibre speckle
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = shade(color, (rand(i, 2) - 0.5) * 0.18);
    ctx.globalAlpha = 0.12;
    ctx.fillRect(rand(i, 9) * size, rand(i, 4) * size, 1, 1);
  }
  ctx.globalAlpha = 1;
}

// — Leather: base + soft mottled cells + pores —
function drawLeather(ctx, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 90; i++) {
    const x = rand(i, 1) * size;
    const y = rand(i, 2) * size;
    const r = 14 + rand(i, 6) * 40;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const tone = shade(color, (rand(i, 8) - 0.5) * 0.14);
    g.addColorStop(0, tone);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = shade(color, (rand(i, 3) - 0.5) * 0.25);
    ctx.globalAlpha = 0.1;
    ctx.fillRect(rand(i, 5) * size, rand(i, 7) * size, 1, 1);
  }
  ctx.globalAlpha = 1;
}

// — Metal: base + vertical brushed streaks —
function drawMetal(ctx, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 900; i++) {
    const x = rand(i, 1) * size;
    ctx.strokeStyle = shade(color, (rand(i, 2) - 0.5) * 0.22);
    ctx.globalAlpha = 0.08;
    ctx.lineWidth = 0.5 + rand(i, 3) * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (rand(i, 4) - 0.5) * 3, size);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// — Plaster wall: flat base + faint large-scale mottle —
function drawPlaster(ctx, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = shade(color, (rand(i, 6) - 0.5) * 0.05);
    ctx.globalAlpha = 0.2;
    ctx.fillRect(rand(i, 1) * size, rand(i, 2) * size, 2, 2);
  }
  ctx.globalAlpha = 1;
}

const DRAWERS = {
  wood: drawWood,
  fabric: drawFabric,
  leather: drawLeather,
  metal: drawMetal,
  plaster: drawPlaster,
};

/**
 * Return a cached CanvasTexture for a given pattern + color.
 * @param {string} type  one of DRAWERS keys
 * @param {string} color css color
 * @param {object} opts  { size, repeat:[x,y], role:'map'|'rough' }
 */
export function getTexture(type, color, opts = {}) {
  const size = opts.size || 256;
  const repeat = opts.repeat || [1, 1];
  const role = opts.role || 'map';
  const key = `${type}|${color}|${size}|${role}`;
  let tex = cache.get(key);
  if (!tex) {
    const canvas = makeCanvas(size);
    const ctx = canvas.getContext('2d');
    (DRAWERS[type] || drawPlaster)(ctx, size, color);
    tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    tex.colorSpace = role === 'map' ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.needsUpdate = true;
    cache.set(key, tex);
  }
  // Textures are cached & shared; clone only the transform via a lightweight
  // wrapper is unnecessary here because every consumer of the same key wants
  // the same repeat. Callers needing a distinct repeat pass a distinct size.
  tex.repeat.set(repeat[0], repeat[1]);
  return tex;
}

export function disposeTextureCache() {
  cache.forEach((t) => t.dispose());
  cache.clear();
}
