<div align="center">

# RoomCraft 3D

### A sunlit room you can rearrange, relight and walk through — where nothing was downloaded.

**No `.glb`. No `.hdr`. No `.png`. Zero 3D asset files.**
Every model, every texture and the lighting environment itself is drawn by code at runtime.

**~420 KB gzipped · ~217 fps on integrated graphics · works offline**

</div>

---

## 🔗 Live site

> _Not deployed yet._ `npm run build` produces `dist/`, which runs on any static
> host as-is (the build already uses a relative `base`). See
> [Deploying](#-deploying).

---

## The idea

Every 3D website has the same quiet problem: a loading bar, with tens of
megabytes of models and textures behind it.

So the constraint here was deliberately absurd — **build a warm, furnished,
sunlit interior and download nothing.** If it's on screen, code drew it.

That constraint became the creative engine. You can't reach for a photoscanned
oak texture, so you have to work out what oak actually looks like — long grain
streaks, plank seams, a base tone that shifts along the fibre — and draw it.

## What it does

- **Three rooms** — Living Room, Bedroom, Home Office. Each has its own
  proportions, palette, window placement, camera framing and starting layout,
  and is lazy-loaded on first visit.
- **12 furniture types** across 6 categories, every one its own code-split chunk
  (0.3–0.8 KB gzipped) prefetched on hover.
- **13 material swatches** across Wood / Fabric / Leather / Metal, restricted
  per piece so the options stay plausible — you can't upholster a coffee table
  in leather.
- **Direct manipulation** — click to select, drag the gizmo to move (snapped to
  10 cm) or rotate (7.5°), duplicate, delete.
- **Two camera modes** — damped orbit that flies between rooms, and pointer-lock
  first-person walk with WASD at eye height.
- **Layouts persist** to `localStorage`; reset any room to its default.
- **Adaptive quality** — falls back to a lighter profile if the GPU struggles.

## The parts that make it feel real

Four things in here are not faked, and that's the whole point.

### 🪟 The window is an actual hole

Most web scenes paint a glowing rectangle on a wall and call it a window. Here,
each wall is built from **four segments around a real opening**, and the sun is
a light sitting *outside* the building, aiming in. The solid wall blocks it, so
daylight only reaches the room **through the gap** — landing on the floor as a
correctly-shaped bright patch instead of a decal.

That structural decision is what makes the curtains mean something. The panels
are real shadow-casting cloth; draw them and they move into the light path, so
the sun patch fades, shadows soften and the room falls into shade. **None of it
is scripted** — it's the shadow map reacting to geometry that moved.

### 💡 Shadows that can never be wrong

Every shadow is a real shadow map, re-rendered from the live scene each frame:

| Light | Shadows | Role |
|---|---|---|
| Window sun-shaft | ✔ | primary daylight, blocked by curtains |
| Directional key | ✔ | soft fill, frustum fitted per room |
| Floor lamp point light | ✔ *(High profile)* | warm pool after dark |

Drag a lamp at night and everything around it is genuinely re-lit and
re-shadowed. Delete a piece and its shadow is gone on the very next frame.

### 🪞 The mirror actually reflects

Planar reflection — the room is re-rendered from the mirrored camera each frame,
so anything you put in front of the bedroom mirror shows up in it, including
yourself in walk mode.

### 🕐 The clock tells the time

The Home Office wall clock runs on **your** system clock, second hand sweeping
continuously.

---

## 🎨 How it looks like anything without assets

| Normally | Here |
|---|---|
| HDRI `.hdr` environment map | IBL baked at runtime from drei `<Lightformer>` panels, in a warm-sun day rig and a cool moonlit night rig |
| PBR texture sets | Drawn to a `<canvas>` at runtime — wood grain with plank seams, woven fabric, mottled leather, brushed metal — cached per colour, used as albedo **and** bump |
| GLTF furniture models | Primitive assemblies at true real-world dimensions, behind the exact prop interface a GLTF component would expose |

Because the art is procedural, **adding a room or a furniture piece costs well
under 1 KB.**

Want real models later? The swap seam is one file and already documented —
see [`ASSETS_NEEDED.md`](./ASSETS_NEEDED.md).

---

## 🛠 Tech stack

| | |
|---|---|
| React | 19.2.8 |
| three.js | 0.185.1 (r185) |
| @react-three/fiber | 9.6.1 |
| @react-three/drei | 10.7.7 |
| @react-three/postprocessing | 3.0.4 |
| zustand | 5.0.14 |
| Vite | 6.4.3 + @vitejs/plugin-react 4.7.0 |

**Node ≥ 18 required** (`.nvmrc` → 22). Vite 6 is pinned deliberately: Vite 7/8
require Node ≥ 20.19/22.12, while Vite 6 runs cleanly on 18, 20 and 22. It's
build tooling only and does not touch the 3D runtime, which uses the current
stable release of every rendering library.

**No GSAP.** It was in the original plan for camera transitions and was removed
after testing: it drives its own animation ticker, which can stall
independently of the render loop and strand the camera mid-flight. Camera moves
now use frame-rate-independent damping inside R3F's own `useFrame` — one loop,
one source of truth, and ~100 KB less JavaScript.

---

## 🚀 Getting started

```bash
nvm use            # or any Node >= 18
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # -> dist/
npm run preview
```

### 📦 Deploying

`dist/` is a plain static bundle with a relative `base`, so it works anywhere:

| Host | Command |
|---|---|
| **Netlify Drop** | drag `dist/` onto [netlify.com/drop](https://app.netlify.com/drop) |
| **Vercel** | `npx vercel deploy dist --prod` |
| **GitHub Pages** | push `dist/` to `gh-pages`, enable Pages in settings |

---

## 📁 Project structure

```
/src
  /scenes           LivingRoom, Bedroom, HomeOffice (lazy) + RoomShell
  /components
    /furniture      12 pieces + registry (lazy) + FurniturePiece + layer
    /ui             Overlay, RoomSelector, MaterialPicker, DayNightToggle,
                    CurtainToggle, FurniturePicker, SelectionPanel, Toolbar
    /environment    StudioEnvironment (IBL), Lighting, BackgroundFog, Curtains
    /camera         CameraRig (orbit + fly-to), WalkControls
    /effects        Effects (bloom, ACES tone-mapping, vignette, SMAA)
    Experience.jsx  everything inside the <Canvas>
  /store            useSceneStore.js (zustand + persist + placement rules)
  /hooks            useFurnitureLoader, useMaterialSwap, useKeys
  /three            materials.js (cached PBR), textures.js (procedural maps)
  /data             rooms.js, catalog.js, materials.js
/public
  /models  /hdri    intentionally empty — see ASSETS_NEEDED.md
```

---

## ⚡ Performance

Measured on **Intel UHD integrated graphics** — *weaker* than the mid-range
laptop target, so these are a floor, not a best case.

| | |
|---|---|
| Frame time, heaviest room, 2× DPR, all effects | **4.60 ms median (~217 fps)** |
| Draw calls / triangles | 283 / 87,177 |
| Shadow-casting lights | 3 |
| First load (gzipped) | **~420 KB** |
| Binary assets shipped | **0** |
| Console errors | **0** |

Full method, per-chunk sizes and a reproduction snippet are in
[`PERFORMANCE.md`](./PERFORMANCE.md).

---

## ⚠️ Gotchas worth knowing (four real bugs, found and fixed)

These cost real time and all but one lie about what's actually wrong:

1. **drei's `<SoftShadows>` (PCSS) is incompatible with three r185.** Its shader
   patch fails to compile and **every lit surface renders as the flat background
   colour** — it looks exactly like an exposure bug. Replaced with three's
   built-in PCF shadow map.
2. **An `<EffectComposer>` sets `NoToneMapping`** and expects a `<ToneMapping>`
   effect in the chain; without one, highlights clip to white.
3. **`<ContactShadows>` retained stale content**, leaving shadow blobs on the
   floor with nothing above them — their world positions matched the *previous*
   room's furniture. Removed in favour of real shadow maps, which can't
   desynchronise from the scene.
4. **`MeshReflectorMaterial` renders solid black** if its depth-blending props
   are set in a scene whose composer runs without a normal/depth pass.

All four are written up with cause and fix in [`PERFORMANCE.md`](./PERFORMANCE.md).

---

## 🖥 Console output

The app runs with **zero console errors**. One warning remains and is **not from
this codebase** — `@react-three/fiber` / `drei` use `THREE.Clock` internally,
which three r185 deprecated. It is harmless and can only be fixed upstream.

## 👥 Team

Solo build.

## 📄 License / attribution

All visuals are original and procedural — **no third-party assets are bundled**,
so there is no third-party licence obligation to satisfy. Library credits in
[`CREDITS.md`](./CREDITS.md).
