// RoomCraft 3D — global scene store (Zustand + localStorage persistence)
// Single source of truth for: active room, time-of-day, camera mode, render
// quality, the per-room furniture layout, and the current selection. Furniture
// drag uses the live Object3D during the gesture and commits back here only on
// release, so this store stays out of the per-frame hot path.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ROOMS, ROOM_IDS, roomDef } from '../data/rooms.js';
import { CATALOG, catalogItem } from '../data/catalog.js';

const uid = () =>
  (globalThis.crypto && crypto.randomUUID && crypto.randomUUID()) ||
  'id-' + Math.random().toString(36).slice(2, 10);

// Axis-aligned half-extents of a piece's footprint, accounting for rotation.
function halfExtents(type, rotation = 0) {
  const def = catalogItem(type) || { size: [0.6, 0.6, 0.6] };
  const [w, , d] = def.size;
  const c = Math.abs(Math.cos(rotation));
  const s = Math.abs(Math.sin(rotation));
  return [(w * c + d * s) / 2, (w * s + d * c) / 2];
}

// Clamp an item so its footprint stays inside the room walls (with margin).
export function clampToRoom(roomId, type, [x, y, z], rotation = 0) {
  const { dims } = roomDef(roomId);
  const [ew, ed] = halfExtents(type, rotation);
  const margin = 0.06;
  const hx = Math.max(0, dims.w / 2 - ew - margin);
  const hz = Math.max(0, dims.d / 2 - ed - margin);
  return [
    Math.max(-hx, Math.min(hx, x)),
    y,
    Math.max(-hz, Math.min(hz, z)),
  ];
}

/**
 * Keep furniture from occupying the same floor space.
 *
 * This is a placement constraint, not a physics simulation (a solver remains an
 * explicit non-goal): each piece is treated as an axis-aligned footprint, and a
 * piece that ends up inside another is pushed out along whichever axis it is
 * least deep into — the standard minimum-translation resolution. A few
 * iterations settle the common case of being nudged between two neighbours, and
 * the result is re-clamped to the room so a piece can never be squeezed through
 * a wall. Flat items (rugs) are ignored, because furniture is supposed to stand
 * on them.
 */
export function resolvePlacement(roomId, items, movingId, type, [x, y, z], rotation = 0) {
  const def = catalogItem(type);
  if (!def) return [x, y, z];
  let [px, , pz] = clampToRoom(roomId, type, [x, y, z], rotation);
  if (def.flat) return [px, y, pz];

  const [aw, ad] = halfExtents(type, rotation);
  const blockers = items
    .filter((it) => it.id !== movingId)
    .map((it) => {
      const d = catalogItem(it.type);
      if (!d || d.flat) return null;
      const [bw, bd] = halfExtents(it.type, it.rotation || 0);
      return { x: it.position[0], z: it.position[2], hw: bw, hd: bd };
    })
    .filter(Boolean);

  const GAP = 0.02; // hairline breathing room so pieces don't z-fight
  for (let pass = 0; pass < 4; pass++) {
    let moved = false;
    for (const b of blockers) {
      const dx = px - b.x;
      const dz = pz - b.z;
      const ox = aw + b.hw + GAP - Math.abs(dx);
      const oz = ad + b.hd + GAP - Math.abs(dz);
      if (ox > 0 && oz > 0) {
        // Push out along the shallower axis.
        if (ox < oz) px += (dx >= 0 ? ox : -ox);
        else pz += (dz >= 0 ? oz : -oz);
        moved = true;
      }
    }
    const c = clampToRoom(roomId, type, [px, y, pz], rotation);
    px = c[0];
    pz = c[2];
    if (!moved) break;
  }
  return [px, y, pz];
}

function makeItem(type, overrides = {}) {
  const def = CATALOG[type];
  return {
    id: uid(),
    type,
    position: [0, 0, 0],
    rotation: 0,
    material: def ? def.defaultMaterial : 'oak',
    ...overrides,
  };
}

// Turn a room's authored defaultLayout into live items (fresh ids).
function seedLayout(roomId) {
  return roomDef(roomId).defaultLayout.map((entry) =>
    makeItem(entry.type, {
      position: [...entry.position],
      rotation: entry.rotation || 0,
      material: entry.material,
    }),
  );
}

function seedAllLayouts() {
  return ROOM_IDS.reduce((acc, id) => {
    acc[id] = seedLayout(id);
    return acc;
  }, {});
}

// Immutably map over the active room's items.
function mapActive(state, fn) {
  const room = state.activeRoom;
  return { layouts: { ...state.layouts, [room]: state.layouts[room].map(fn) } };
}

export const useSceneStore = create(
  persist(
    (set, get) => ({
      // — scene settings —
      activeRoom: 'living',
      timeOfDay: 'day', // 'day' | 'night'
      curtainsOpen: true, // drawn curtains physically block the window sunlight
      cameraMode: 'orbit', // 'orbit' | 'walk'
      quality: 'high', // 'high' | 'low'
      transformMode: 'translate', // 'translate' | 'rotate'
      showHelp: true,

      // — data —
      layouts: seedAllLayouts(),
      selectedId: null,

      // — room / settings actions —
      setRoom: (activeRoom) => {
        if (!ROOMS[activeRoom]) return;
        set({ activeRoom, selectedId: null });
      },
      setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
      toggleTimeOfDay: () => set((s) => ({ timeOfDay: s.timeOfDay === 'day' ? 'night' : 'day' })),
      toggleCurtains: () => set((s) => ({ curtainsOpen: !s.curtainsOpen })),
      setCameraMode: (cameraMode) => set({ cameraMode, selectedId: cameraMode === 'walk' ? null : get().selectedId }),
      toggleCameraMode: () => set((s) => ({ cameraMode: s.cameraMode === 'orbit' ? 'walk' : 'orbit', selectedId: null })),
      setQuality: (quality) => set({ quality }),
      setTransformMode: (transformMode) => set({ transformMode }),
      dismissHelp: () => set({ showHelp: false }),

      // — selection —
      select: (selectedId) => set({ selectedId }),
      clearSelection: () => set({ selectedId: null }),

      // — item CRUD —
      addItem: (type) => {
        const room = get().activeRoom;
        const def = catalogItem(type);
        if (!def || !def.rooms.includes(room)) return;
        // Spawn toward the open corner, then push clear of anything already there.
        const jitter = (Math.random() - 0.5) * 0.6;
        const pos = resolvePlacement(room, get().layouts[room], null, type, [0.6 + jitter, 0, 1.0 + jitter]);
        const item = makeItem(type, { position: pos });
        set((s) => ({
          layouts: { ...s.layouts, [room]: [...s.layouts[room], item] },
          selectedId: item.id,
        }));
      },
      removeItem: (id) =>
        set((s) => ({
          layouts: { ...s.layouts, [s.activeRoom]: s.layouts[s.activeRoom].filter((it) => it.id !== id) },
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),
      removeSelected: () => {
        const id = get().selectedId;
        if (id) get().removeItem(id);
      },
      duplicateSelected: () => {
        const s = get();
        const src = s.layouts[s.activeRoom].find((it) => it.id === s.selectedId);
        if (!src) return;
        const copy = makeItem(src.type, {
          position: resolvePlacement(
            s.activeRoom,
            s.layouts[s.activeRoom],
            null,
            src.type,
            [src.position[0] + 0.5, 0, src.position[2] + 0.5],
            src.rotation,
          ),
          rotation: src.rotation,
          material: src.material,
        });
        set((st) => ({
          layouts: { ...st.layouts, [st.activeRoom]: [...st.layouts[st.activeRoom], copy] },
          selectedId: copy.id,
        }));
      },

      // Commit a moved/rotated item (called on transform release).
      updateItem: (id, patch) =>
        set((s) => mapActive(s, (it) => (it.id === id ? { ...it, ...patch } : it))),

      setItemMaterial: (id, material) =>
        set((s) => mapActive(s, (it) => (it.id === id ? { ...it, material } : it))),

      setSelectedMaterial: (material) => {
        const id = get().selectedId;
        if (id) get().setItemMaterial(id, material);
      },

      rotateSelected: (deltaDeg) => {
        const id = get().selectedId;
        if (!id) return;
        const rad = (deltaDeg * Math.PI) / 180;
        set((s) => mapActive(s, (it) => (it.id === id ? { ...it, rotation: it.rotation + rad } : it)));
      },

      // — layout management —
      resetRoom: () =>
        set((s) => ({ layouts: { ...s.layouts, [s.activeRoom]: seedLayout(s.activeRoom) }, selectedId: null })),
      clearRoom: () =>
        set((s) => ({ layouts: { ...s.layouts, [s.activeRoom]: [] }, selectedId: null })),
    }),
    {
      name: 'roomcraft-3d',
      version: 1,
      // `quality` is deliberately NOT persisted: it can be lowered
      // automatically by the performance safety net, and a single transient
      // dip should not permanently downgrade the visuals on every future
      // visit. Every session starts at High and re-evaluates.
      partialize: (s) => ({
        layouts: s.layouts,
        activeRoom: s.activeRoom,
        timeOfDay: s.timeOfDay,
      }),
    },
  ),
);

// — convenience selectors —
export const useActiveItems = () => useSceneStore((s) => s.layouts[s.activeRoom]);
export const useSelectedItem = () =>
  useSceneStore((s) => s.layouts[s.activeRoom].find((it) => it.id === s.selectedId) || null);
