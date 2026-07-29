// RoomCraft 3D — material factory
// Turns a swatch spec (data/materials.js) into a real, cached THREE material
// with a procedural albedo + bump map. Materials are cached and SHARED across
// meshes for performance — swapping a piece's material at runtime is just a
// reference reassignment (see useMaterialSwap), never a per-mesh clone. Because
// materials are shared, selection highlighting is done with a postprocessing
// Outline effect, never by mutating a shared material's emissive.

import * as THREE from 'three';
import { SWATCHES, ACCENTS } from '../data/materials.js';
import { getTexture } from './textures.js';

const cache = new Map();

// Per-family texture tuning: tile density + how much micro-relief (bump).
const FAMILY_TUNING = {
  wood: { repeat: [1, 1], bump: 0.012, size: 512 },
  fabric: { repeat: [4, 4], bump: 0.03, size: 256 },
  leather: { repeat: [2, 2], bump: 0.02, size: 256 },
  metal: { repeat: [1, 1], bump: 0.004, size: 256 },
};

function buildMaterial(spec) {
  const family = spec.family || 'wood';
  const tuning = FAMILY_TUNING[family] || FAMILY_TUNING.wood;
  const tex = getTexture(spec.texture || family, spec.color, {
    size: tuning.size,
    repeat: tuning.repeat,
    role: 'map',
  });

  const common = {
    map: tex,
    bumpMap: tex,
    bumpScale: tuning.bump,
    color: new THREE.Color(spec.color),
    roughness: spec.roughness ?? 0.6,
    metalness: spec.metalness ?? 0,
  };

  let mat;
  if (spec.clearcoat) {
    mat = new THREE.MeshPhysicalMaterial({
      ...common,
      clearcoat: spec.clearcoat,
      clearcoatRoughness: spec.clearcoatRoughness ?? 0.5,
    });
  } else {
    mat = new THREE.MeshStandardMaterial(common);
  }
  if (spec.emissive) {
    mat.emissive = new THREE.Color(spec.emissive);
    mat.emissiveIntensity = 0;
  }
  mat.envMapIntensity = spec.metalness ? 1.1 : 0.75;
  mat.name = spec.id || spec.texture || family;
  return mat;
}

/** Cached material for a swatch id (as stored on a furniture item). */
export function getMaterial(swatchId) {
  const key = `sw:${swatchId}`;
  let mat = cache.get(key);
  if (!mat) {
    const spec = SWATCHES[swatchId] || SWATCHES.oak;
    mat = buildMaterial(spec);
    cache.set(key, mat);
  }
  return mat;
}

/** Cached fixed accent material (legs, cords, lamp shades…). */
export function getAccent(name) {
  const key = `ac:${name}`;
  let mat = cache.get(key);
  if (!mat) {
    const spec = ACCENTS[name] || ACCENTS.darkMetal;
    mat = buildMaterial({ ...spec, family: spec.texture || 'metal', id: name });
    cache.set(key, mat);
  }
  return mat;
}

/** Cached surface material for room shells (floor / walls). */
export function getSurface(texture, color, opts = {}) {
  const key = `su:${texture}:${color}:${opts.repeat || ''}`;
  let mat = cache.get(key);
  if (!mat) {
    const tex = getTexture(texture, color, {
      size: opts.size || 512,
      repeat: opts.repeat || [1, 1],
      role: 'map',
    });
    mat = new THREE.MeshStandardMaterial({
      map: tex,
      bumpMap: tex,
      bumpScale: opts.bump ?? 0.01,
      color: new THREE.Color(color),
      roughness: opts.roughness ?? 0.85,
      metalness: opts.metalness ?? 0,
    });
    mat.envMapIntensity = 0.6;
    cache.set(key, mat);
  }
  return mat;
}

export function disposeMaterialCache() {
  cache.forEach((m) => m.dispose());
  cache.clear();
}
