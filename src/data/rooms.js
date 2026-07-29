// RoomCraft 3D — room definitions + default layouts
// Coordinate convention: origin at room centre, floor at y = 0, +y up.
// x is the width axis, z the depth axis. The two solid walls sit at -x (left)
// and -z (back); the room opens toward +x / +z so an orbit camera can look in.
// Furniture faces +z at rotation 0. Rotations are authored in degrees below.

const d2r = (deg) => (deg * Math.PI) / 180;

export const ROOMS = {
  living: {
    id: 'living',
    label: 'Living Room',
    icon: '🛋️',
    dims: { w: 6.4, d: 5.2, h: 3.0 },
    palette: {
      floor: { texture: 'wood', color: '#b78e5c', repeat: [6, 5], roughness: 0.55, bump: 0.006 },
      wall: { texture: 'plaster', color: '#d3cabc' },
      trim: { color: '#efe9df' },
    },
    windows: [{ wall: 'back', offset: 1.5, w: 2.0, h: 1.5, sill: 0.9 }],
    camera: { position: [5.6, 3.6, 6.0], target: [0, 0.9, -0.2] },
    defaultLayout: [
      { type: 'rug', position: [0.1, 0, 0.2], rotation: d2r(0), material: 'teal' },
      { type: 'sofa', position: [0.1, 0, -1.8], rotation: d2r(0), material: 'slate' },
      { type: 'coffeeTable', position: [0.1, 0, -0.3], rotation: d2r(0), material: 'walnut' },
      { type: 'armchair', position: [2.1, 0, 0.6], rotation: d2r(-125), material: 'rust' },
      { type: 'bookshelf', position: [-2.85, 0, -1.1], rotation: d2r(90), material: 'walnut' },
      { type: 'floorLamp', position: [-2.5, 0, 1.5], rotation: d2r(0), material: 'brass' },
      { type: 'plant', position: [2.6, 0, -1.9], rotation: d2r(0), material: 'charcoal' },
    ],
  },

  bedroom: {
    id: 'bedroom',
    label: 'Bedroom',
    icon: '🛏️',
    dims: { w: 5.4, d: 4.8, h: 3.0 },
    palette: {
      floor: { texture: 'wood', color: '#cbb391', repeat: [5, 4], roughness: 0.6, bump: 0.006 },
      wall: { texture: 'plaster', color: '#cdc8c4' },
      trim: { color: '#eae6e0' },
    },
    windows: [{ wall: 'left', offset: 0.7, w: 1.8, h: 1.4, sill: 0.9 }],
    camera: { position: [5.0, 3.3, 5.2], target: [0, 0.8, -0.2] },
    defaultLayout: [
      { type: 'rug', position: [0, 0, 0.7], rotation: d2r(0), material: 'linen' },
      { type: 'bed', position: [0, 0, -1.1], rotation: d2r(0), material: 'slate' },
      { type: 'nightstand', position: [-1.35, 0, -1.7], rotation: d2r(0), material: 'ash' },
      { type: 'nightstand', position: [1.35, 0, -1.7], rotation: d2r(0), material: 'ash' },
      { type: 'wardrobe', position: [-1.9, 0, 0.9], rotation: d2r(90), material: 'oak' },
      { type: 'floorLamp', position: [1.9, 0, 1.4], rotation: d2r(0), material: 'steel' },
    ],
  },

  office: {
    id: 'office',
    label: 'Home Office',
    icon: '🖥️',
    dims: { w: 5.2, d: 4.4, h: 3.0 },
    palette: {
      floor: { texture: 'wood', color: '#7d5a3c', repeat: [5, 4], roughness: 0.5, bump: 0.006 },
      wall: { texture: 'plaster', color: '#c6c8cb' },
      trim: { color: '#e7e8ea' },
    },
    windows: [{ wall: 'back', offset: -1.2, w: 1.8, h: 1.5, sill: 0.9 }],
    camera: { position: [4.8, 3.2, 5.0], target: [0, 0.8, -0.3] },
    defaultLayout: [
      { type: 'rug', position: [0, 0, 0.3], rotation: d2r(0), material: 'slate' },
      { type: 'desk', position: [0, 0, -1.35], rotation: d2r(0), material: 'oak' },
      { type: 'officeChair', position: [0, 0, -0.4], rotation: d2r(180), material: 'onyx' },
      { type: 'bookshelf', position: [-1.95, 0, -0.8], rotation: d2r(90), material: 'walnut' },
      { type: 'armchair', position: [1.6, 0, 1.1], rotation: d2r(-145), material: 'teal' },
      { type: 'floorLamp', position: [1.9, 0, -1.4], rotation: d2r(0), material: 'brass' },
    ],
  },
};

export const ROOM_LIST = Object.values(ROOMS);
export const ROOM_IDS = Object.keys(ROOMS);

export function roomDef(id) {
  return ROOMS[id] || ROOMS.living;
}
