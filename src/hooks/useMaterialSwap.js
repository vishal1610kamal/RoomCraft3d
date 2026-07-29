// RoomCraft 3D — useMaterialSwap
// The single seam between "a piece's material choice" (a swatch id in the
// store) and "a real THREE material on a mesh". UI components ask this hook
// what the options are and how to change them; they never touch the material
// cache or the store's shape directly.
//
// Swapping resolves to a *shared, cached* material (src/three/materials.js) —
// no per-mesh clone — so changing a sofa from linen to cognac is a reference
// reassignment, not an allocation. If real GLTF assets are added later, only
// getMaterial() changes; this API stays identical.

import { useCallback, useMemo } from 'react';
import { useSceneStore } from '../store/useSceneStore.js';
import { catalogItem } from '../data/catalog.js';
import { FAMILY_BY_ID, SWATCHES, swatch } from '../data/materials.js';
import { getMaterial } from '../three/materials.js';

const ALL_FAMILIES = ['wood', 'fabric', 'leather', 'metal'];

/**
 * @param {object|null} item a placed furniture item from the store
 * @returns {{
 *   material: THREE.Material|null,   // live material for the item
 *   current: object|null,            // current swatch spec
 *   families: string[],              // families this piece accepts
 *   swatchesFor: (familyId: string) => object[],
 *   setMaterial: (swatchId: string) => void,
 * }}
 */
export function useMaterialSwap(item) {
  const setItemMaterial = useSceneStore((s) => s.setItemMaterial);

  const def = item ? catalogItem(item.type) : null;
  const families = useMemo(() => def?.families || ALL_FAMILIES, [def]);

  const swatchesFor = useCallback(
    (familyId) => (FAMILY_BY_ID[familyId]?.swatches || []).map((id) => SWATCHES[id]),
    [],
  );

  const setMaterial = useCallback(
    (swatchId) => {
      if (item) setItemMaterial(item.id, swatchId);
    },
    [item, setItemMaterial],
  );

  return {
    material: item ? getMaterial(item.material) : null,
    current: item ? swatch(item.material) : null,
    families,
    swatchesFor,
    setMaterial,
  };
}
