// RoomCraft 3D — useFurnitureLoader
// Resolves a furniture `type` to its (lazy) component + catalog definition.
// This is the single seam between "placeholder" and "real asset": today it
// returns a primitive-built component; to use a real model you'd give the
// catalog entry a `model` path and load it here with drei's useGLTF (and call
// useGLTF.preload in preloadFurniture) — nothing else in the app changes.

import { FURNITURE_COMPONENTS, preloadFurniture, preloadRoomFurniture } from '../components/furniture/registry.js';
import { catalogItem } from '../data/catalog.js';

export function useFurnitureLoader(type) {
  const def = catalogItem(type);
  const Component = FURNITURE_COMPONENTS[type] || null;
  // Real-asset path (future):
  //   if (def?.model) { const { scene } = useGLTF(def.model); return { def, scene }; }
  return { Component, def, isPlaceholder: true };
}

export { preloadFurniture, preloadRoomFurniture };
