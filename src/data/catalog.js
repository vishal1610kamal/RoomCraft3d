// RoomCraft 3D — furniture catalog
// Pure data. `component` maps to a placeholder furniture component today
// (src/components/furniture/registry.js) and to a GLTF-loaded component later —
// the rest of the app only ever references `type`, so nothing else changes.
// `size` is the approximate footprint [w, h, d] in metres, used for placement,
// bounds-clamping and the default camera framing.

export const CATEGORIES = [
  { id: 'seating', label: 'Seating' },
  { id: 'tables', label: 'Tables' },
  { id: 'storage', label: 'Storage' },
  { id: 'sleeping', label: 'Sleeping' },
  { id: 'lighting', label: 'Lighting' },
  { id: 'soft', label: 'Rugs & Decor' },
];

export const CATALOG = {
  sofa: {
    type: 'sofa', label: 'Sofa', category: 'seating', component: 'Sofa', icon: '🛋️',
    families: ['fabric', 'leather'], defaultMaterial: 'slate', size: [2.1, 0.85, 0.95], rooms: ['living'],
  },
  armchair: {
    type: 'armchair', label: 'Armchair', category: 'seating', component: 'Armchair', icon: '🪑',
    // 1.04 not 0.95: the arms sit at ±0.44 and are 0.16 wide.
    families: ['fabric', 'leather'], defaultMaterial: 'rust', size: [1.04, 0.9, 0.95], rooms: ['living', 'office'],
  },
  officeChair: {
    type: 'officeChair', label: 'Office Chair', category: 'seating', component: 'OfficeChair', icon: '💺',
    // 0.70: the star base's casters reach 0.335 from centre.
    families: ['fabric', 'leather', 'metal'], defaultMaterial: 'onyx', size: [0.7, 1.15, 0.7], rooms: ['office'],
  },
  coffeeTable: {
    type: 'coffeeTable', label: 'Coffee Table', category: 'tables', component: 'CoffeeTable', icon: '🟫',
    families: ['wood', 'metal'], defaultMaterial: 'walnut', size: [1.2, 0.42, 0.6], rooms: ['living'],
  },
  desk: {
    type: 'desk', label: 'Desk', category: 'tables', component: 'Desk', icon: '🗄️',
    families: ['wood', 'metal'], defaultMaterial: 'oak', size: [1.4, 0.75, 0.7], rooms: ['office'],
  },
  nightstand: {
    type: 'nightstand', label: 'Nightstand', category: 'tables', component: 'Nightstand', icon: '🔲',
    families: ['wood', 'metal'], defaultMaterial: 'ash', size: [0.5, 0.5, 0.4], rooms: ['bedroom'],
  },
  bookshelf: {
    type: 'bookshelf', label: 'Bookshelf', category: 'storage', component: 'Bookshelf', icon: '📚',
    families: ['wood', 'metal'], defaultMaterial: 'walnut', size: [1.0, 1.8, 0.35], rooms: ['living', 'office'],
  },
  wardrobe: {
    type: 'wardrobe', label: 'Wardrobe', category: 'storage', component: 'Wardrobe', icon: '🚪',
    families: ['wood'], defaultMaterial: 'oak', size: [1.4, 2.0, 0.6], rooms: ['bedroom'],
  },
  bed: {
    type: 'bed', label: 'Bed', category: 'sleeping', component: 'Bed', icon: '🛏️',
    // 2.16 deep: the headboard adds 0.06 behind the 2.1 frame.
    families: ['fabric', 'leather', 'wood'], defaultMaterial: 'linen', size: [1.8, 0.9, 2.16], rooms: ['bedroom'],
  },
  floorLamp: {
    type: 'floorLamp', label: 'Floor Lamp', category: 'lighting', component: 'FloorLamp', icon: '🛋',
    families: ['metal', 'wood'], defaultMaterial: 'brass', size: [0.4, 1.6, 0.4], rooms: ['living', 'bedroom', 'office'], emissive: true,
  },
  rug: {
    type: 'rug', label: 'Rug', category: 'soft', component: 'Rug', icon: '🟪',
    families: ['fabric'], defaultMaterial: 'teal', size: [2.6, 0.02, 1.8], rooms: ['living', 'bedroom', 'office'], flat: true,
  },
  plant: {
    type: 'plant', label: 'Plant', category: 'soft', component: 'Plant', icon: '🪴',
    // 0.75: the foliage spheres spread wider than the pot.
    families: ['metal'], defaultMaterial: 'charcoal', size: [0.75, 1.3, 0.75], rooms: ['living', 'bedroom', 'office'], accentOnly: true,
  },
};

export const CATALOG_LIST = Object.values(CATALOG);

/** Catalog entries that can be placed in a given room. */
export function catalogForRoom(roomId) {
  return CATALOG_LIST.filter((c) => c.rooms.includes(roomId));
}

export function catalogItem(type) {
  return CATALOG[type];
}
