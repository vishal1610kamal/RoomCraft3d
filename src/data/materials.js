// RoomCraft 3D — material catalog
// Each "swatch" is a physically-plausible PBR preset. Swatches are grouped into
// four families (Wood / Fabric / Leather / Metal) to match the feature spec.
// A furniture item stores only a swatch id (e.g. "walnut"); the material factory
// (src/three/materials.js) turns that into a real THREE material with a
// procedurally-generated texture. Swapping to a real GLTF later means pointing
// the same swatch id at a loaded map — the data contract does not change.

export const SWATCHES = {
  // — Wood —
  oak: { id: 'oak', label: 'Oak', family: 'wood', color: '#c69c6d', roughness: 0.6, metalness: 0, texture: 'wood' },
  walnut: { id: 'walnut', label: 'Walnut', family: 'wood', color: '#6b4630', roughness: 0.5, metalness: 0, texture: 'wood' },
  ash: { id: 'ash', label: 'Ash', family: 'wood', color: '#d8c3a1', roughness: 0.65, metalness: 0, texture: 'wood' },

  // — Fabric —
  linen: { id: 'linen', label: 'Linen', family: 'fabric', color: '#d7cbb4', roughness: 0.95, metalness: 0, texture: 'fabric' },
  teal: { id: 'teal', label: 'Teal', family: 'fabric', color: '#2f6d68', roughness: 0.9, metalness: 0, texture: 'fabric' },
  rust: { id: 'rust', label: 'Rust', family: 'fabric', color: '#a65438', roughness: 0.92, metalness: 0, texture: 'fabric' },
  slate: { id: 'slate', label: 'Slate', family: 'fabric', color: '#4a5560', roughness: 0.92, metalness: 0, texture: 'fabric' },

  // — Leather —
  cognac: { id: 'cognac', label: 'Cognac', family: 'leather', color: '#8a4a29', roughness: 0.45, metalness: 0, texture: 'leather', clearcoat: 0.35, clearcoatRoughness: 0.6 },
  onyx: { id: 'onyx', label: 'Onyx', family: 'leather', color: '#232322', roughness: 0.4, metalness: 0, texture: 'leather', clearcoat: 0.4, clearcoatRoughness: 0.5 },
  camel: { id: 'camel', label: 'Camel', family: 'leather', color: '#b07d4f', roughness: 0.5, metalness: 0, texture: 'leather', clearcoat: 0.3, clearcoatRoughness: 0.6 },

  // — Metal —
  brass: { id: 'brass', label: 'Brass', family: 'metal', color: '#c08f43', roughness: 0.32, metalness: 1, texture: 'metal' },
  steel: { id: 'steel', label: 'Steel', family: 'metal', color: '#9fa4a9', roughness: 0.35, metalness: 1, texture: 'metal' },
  charcoal: { id: 'charcoal', label: 'Charcoal', family: 'metal', color: '#3b3d40', roughness: 0.45, metalness: 0.9, texture: 'metal' },
};

export const FAMILIES = [
  { id: 'wood', label: 'Wood', swatches: ['oak', 'walnut', 'ash'] },
  { id: 'fabric', label: 'Fabric', swatches: ['linen', 'teal', 'rust', 'slate'] },
  { id: 'leather', label: 'Leather', swatches: ['cognac', 'onyx', 'camel'] },
  { id: 'metal', label: 'Metal', swatches: ['brass', 'steel', 'charcoal'] },
];

export const FAMILY_BY_ID = Object.fromEntries(FAMILIES.map((f) => [f.id, f]));

export function swatch(id) {
  return SWATCHES[id] || SWATCHES.oak;
}

// Fixed accent materials used for non-swappable parts (e.g. metal legs, lamp cord).
export const ACCENTS = {
  darkMetal: { color: '#2c2d30', roughness: 0.4, metalness: 0.85, texture: 'metal' },
  blackMetal: { color: '#1a1a1c', roughness: 0.5, metalness: 0.7, texture: 'metal' },
  brassAccent: { color: '#b98a3e', roughness: 0.3, metalness: 1, texture: 'metal' },
  lampShade: { color: '#f3e7c9', roughness: 0.8, metalness: 0, emissive: '#ffd9a0' },
};
