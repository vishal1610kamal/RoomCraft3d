// RoomCraft 3D — furniture registry
// Maps a furniture `type` to a React.lazy component so each piece's geometry is
// a separate code-split chunk that only downloads the first time that piece is
// used (verified in the network panel). This mirrors how you'd lazy-load real
// GLTF models per type; swapping a placeholder for a real asset means changing
// only the imported module, not this table's shape.

import { lazy } from 'react';
import { catalogForRoom } from '../../data/catalog.js';

const IMPORTERS = {
  sofa: () => import('./Sofa.jsx'),
  armchair: () => import('./Armchair.jsx'),
  officeChair: () => import('./OfficeChair.jsx'),
  coffeeTable: () => import('./CoffeeTable.jsx'),
  desk: () => import('./Desk.jsx'),
  nightstand: () => import('./Nightstand.jsx'),
  bookshelf: () => import('./Bookshelf.jsx'),
  wardrobe: () => import('./Wardrobe.jsx'),
  bed: () => import('./Bed.jsx'),
  floorLamp: () => import('./FloorLamp.jsx'),
  rug: () => import('./Rug.jsx'),
  plant: () => import('./Plant.jsx'),
};

export const FURNITURE_COMPONENTS = Object.fromEntries(
  Object.entries(IMPORTERS).map(([type, importer]) => [type, lazy(importer)]),
);

/** Warm the chunk for a single furniture type. */
export function preloadFurniture(type) {
  IMPORTERS[type]?.();
}

/** Warm the chunks for every piece that can appear in a room. */
export function preloadRoomFurniture(roomId) {
  catalogForRoom(roomId).forEach((c) => preloadFurniture(c.type));
}
