# Assets Still Needed

**Status: the app is complete and runs with zero missing files.**

Every visual in RoomCraft 3D is generated at runtime — there is not a single
`.glb`, `.hdr`, `.exr`, `.png` or `.jpg` in the repo or the build output
(verified: `find dist public -name '*.glb' -o -name '*.hdr' … | wc -l` → **0**).

Nothing in this file is required to run, build, or demo the project. It is the
upgrade path for anyone who wants to swap the procedural placeholders for
authored art, plus an exact statement of what is a placeholder today.

> No asset listed below has been downloaded, bundled, or stubbed with a fake
> file. Every path under "Expected path" is currently **absent by design**.

---

## Why it ships procedurally

Real furniture models and HDRI environment maps are binary files that could not
be fetched in the environment this was built in, and inventing them was not an
option. Rather than ship broken `useGLTF` paths, every component was built
against primitives **behind the same prop interface a GLTF-backed component
would expose**, so replacing one is a local change.

Two upsides that turned out to be worth keeping:

- **Offline / zero-latency.** No CDN fetch, no 404s, no loading spinner for art.
- **Tiny.** ~416 KB gzipped total first load — about 5 % of the 8 MB budget.

---

## 1. Furniture models (optional upgrade)

Drop-in replacements for `src/components/furniture/*.jsx`. Each placeholder is a
primitive assembly with the correct real-world footprint already dialled in, so
a replacement model just needs to match the size and face **+Z** at rotation 0,
with its origin **centred on the floor** (`y = 0`).

| Component (today) | Expected path | Approx. size (w × h × d, m) | Suggested source |
|---|---|---|---|
| `Sofa.jsx` | `public/models/sofa.glb` | 2.10 × 0.85 × 0.95 | Sketchfab (CC0/CC-BY), Poly Pizza, or Blender original |
| `Armchair.jsx` | `public/models/armchair.glb` | 0.95 × 0.90 × 0.95 | ” |
| `OfficeChair.jsx` | `public/models/office-chair.glb` | 0.65 × 1.15 × 0.65 | ” |
| `CoffeeTable.jsx` | `public/models/coffee-table.glb` | 1.20 × 0.42 × 0.60 | ” |
| `Desk.jsx` | `public/models/desk.glb` | 1.40 × 0.75 × 0.70 | ” |
| `Nightstand.jsx` | `public/models/nightstand.glb` | 0.50 × 0.50 × 0.40 | ” |
| `Bookshelf.jsx` | `public/models/bookshelf.glb` | 1.00 × 1.80 × 0.35 | ” |
| `Wardrobe.jsx` | `public/models/wardrobe.glb` | 1.40 × 2.00 × 0.60 | ” |
| `Bed.jsx` | `public/models/bed.glb` | 1.80 × 0.90 × 2.10 | ” |
| `FloorLamp.jsx` | `public/models/floor-lamp.glb` | 0.40 × 1.60 × 0.40 | ” |
| `Rug.jsx` | `public/models/rug.glb` | 2.60 × 0.02 × 1.80 | ” |
| `Plant.jsx` | `public/models/plant.glb` | 0.50 × 1.20 × 0.50 | ” |

**License requirement:** CC0, CC-BY (with attribution recorded in
`CREDITS.md`), or original work. Anything that forbids redistribution or
commercial use is not eligible under hackathon rules 3 and 8. Record the exact
source URL and licence for each file you add.

**Export settings:** glTF-Binary (`.glb`), **Draco** or **meshopt** compressed,
Y-up, metres, textures ≤ 2K (KTX2/Basis preferred), transforms applied.

### How to swap one in

The seam is deliberately one file — `src/hooks/useFurnitureLoader.js` — plus a
`model` field on the catalog entry. The commented branch is already there:

```js
// src/data/catalog.js
sofa: { …, model: '/models/sofa.glb' },

// src/hooks/useFurnitureLoader.js
if (def?.model) {
  const { scene } = useGLTF(def.model);   // + useGLTF.preload(def.model)
  return { def, scene, isPlaceholder: false };
}
```

The furniture component then renders that `scene` and applies the material it is
already handed. **Selection, drag/rotate, room bounds, material swapping,
persistence and the day/night response all keep working untouched** — none of
them know or care whether the geometry came from a primitive or a `.glb`.

---

## 2. HDRI environment maps (optional upgrade)

Lighting today is **real image-based lighting** — it is not faked. The
environment map is baked at runtime from `<Lightformer>` panels
(`src/components/environment/StudioEnvironment.jsx`), giving genuine IBL
reflections and ambient bounce with no file to download, in a day and a night
variant.

| Purpose | Expected path | Suggested source |
|---|---|---|
| Day interior | `public/hdri/day.hdr` | Poly Haven — e.g. an interior/overcast sky, 2K |
| Night interior | `public/hdri/night.hdr` | Poly Haven — e.g. a moonlit/night sky, 2K |

**License:** Poly Haven is CC0. **Size:** 2K `.hdr` is plenty at ~1–3 MB each;
4K is a waste here and would eat most of the 8 MB budget for no visible gain.

To use them, swap the `<Environment>` children for a `files` prop:

```jsx
<Environment files={timeOfDay === 'day' ? '/hdri/day.hdr' : '/hdri/night.hdr'} />
```

Keep `environmentIntensity` around its current value (0.42 day / 0.50 night) —
a full-strength HDRI will blow out the mid-tones under ACES tone-mapping.

---

## 3. PBR textures (optional upgrade)

Wood grain, woven fabric, mottled leather and brushed metal are drawn to a
`<canvas>` at runtime and cached per colour (`src/three/textures.js`), then used
as both albedo and bump. To use photographic maps instead, add files below and
change the loader in `src/three/materials.js` — the swatch contract in
`src/data/materials.js` (id → colour/roughness/metalness/family) does not change.

| Material family | Expected paths | Suggested source |
|---|---|---|
| Wood | `public/textures/wood_diff.jpg`, `_nor.jpg`, `_rough.jpg` | Poly Haven (CC0) |
| Fabric | `public/textures/fabric_diff.jpg`, `_nor.jpg`, `_rough.jpg` | Poly Haven (CC0) |
| Leather | `public/textures/leather_diff.jpg`, `_nor.jpg`, `_rough.jpg` | Poly Haven (CC0) |
| Metal | `public/textures/metal_diff.jpg`, `_nor.jpg`, `_rough.jpg` | Poly Haven (CC0) |

Prefer **1–2K, KTX2/Basis**, one atlas per family rather than per piece.

---

## 4. Submission media (the only genuinely missing items)

These are the only entries a human must actually produce, because they are
recordings of the finished app:

| Item | Expected path | Notes |
|---|---|---|
| Screenshot 1 | `screenshots/1.png` | Living room, day, a piece selected |
| Screenshot 2 | `screenshots/2.png` | Bedroom at night with the lamp lit |
| Screenshot 3 | `screenshots/3.png` | Walk mode, first person |
| Demo video | external link | Optional |
| Live URL | — | Any static host; `npm run build` → deploy `dist/` |

`SUBMISSION.md` references these paths and still needs the live URL and team
name filled in.
