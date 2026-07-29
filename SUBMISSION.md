# RoomCraft 3D — Hackathon Submission

## 💡 Idea & Inspiration

A real-time 3D furniture placement studio — drop furniture into a room, drag it
where you want it, swap its material, walk through the space in first person,
and flip the whole room from day to night. Inspired by IKEA Place and
e-commerce 3D configurators, built to show that "useful" and "immersive" aren't
opposites.

The twist: **it contains no 3D asset files at all.** Every model, every texture
and the lighting environment itself are generated at runtime from code. The
whole experience is ~416 KB gzipped, loads offline, and runs at over 200 fps
(median) on integrated Intel graphics.

## 🌐 Live Website
_To deploy: `npm run build` and serve `dist/` on any static host (relative
`base` is already configured)._

## 📸 Screenshots
![1](./screenshots/1.png)
![2](./screenshots/2.png)
![3](./screenshots/3.png)

_Suggested shots: living room in daylight with a piece selected; the bedroom at
night with the floor lamp lit; first-person walk mode._

## 🎬 Demo Video
_Optional._

## 🧰 Technologies & Tools Used

React 19 · three.js r185 · React Three Fiber 9 · drei 10 ·
@react-three/postprocessing 3 · zustand 5 · Vite 6

**No Blender, no Poly Haven, no Draco, no GSAP** — the original plan called for
all of them, and the finished build uses none:

- **No modelling tool / no model files.** Furniture is assembled from primitives
  at true real-world dimensions, behind the same prop interface a GLTF-loaded
  component would expose — so a real `.glb` is a one-file swap
  (`ASSETS_NEEDED.md` documents exactly how).
- **No HDRI files.** Lighting is genuine image-based lighting, baked at runtime
  from `<Lightformer>` panels in a day and a night arrangement.
- **No texture files.** Wood grain, woven fabric, mottled leather and brushed
  metal are drawn to a `<canvas>` and cached per colour.
- **No Draco**, because there is no mesh data to compress.
- **No GSAP.** It was in the plan for camera transitions and was removed after
  testing — it drives its own animation ticker, which can stall independently of
  the render loop and strand the camera mid-transition. Camera moves now use
  frame-rate-independent damping inside R3F's own `useFrame`: one loop, one
  source of truth, and ~100 KB less JavaScript.

## 📊 Highlights

| | |
|---|---|
| First load | **~416 KB gzipped** (~5 % of the 8 MB budget) |
| Binary assets | **0** |
| Frame time, heaviest room, 2× DPR, all effects | **4.6 ms median (~217 fps)** |
| Test GPU | Intel UHD integrated — *below* the mid-range laptop target |
| Rooms / furniture types / material swatches | 3 / 12 / 13 |
| Shadow-casting lights in the heaviest room | 3 (sun-shaft, key, lamp) |

## 🪟 The detail I'm proudest of

The windows are **real holes in the wall**, and the sun sits outside shining
through them. That one structural decision is what makes the curtains mean
something: draw them and the cloth moves into the light path, so the sun patch
on the floor fades, the furniture shadows soften and the room falls into shade.
None of that is animated by hand — it is the shadow map reacting to geometry.
The same commitment to "make it real, then let the physics happen" runs through
the lamp that genuinely re-lights the room when you drag it, the mirror that
actually reflects what you put in front of it, and the wall clock that shows
your own local time.

## 🐛 Four real bugs found and fixed along the way

1. **drei's `<SoftShadows>` (PCSS) is incompatible with three r185** — its
   shadow-shader patch fails to compile and every lit surface renders as the
   flat background colour. It looks exactly like an exposure bug, which sends
   you hunting in the wrong place. Replaced with three's built-in PCF shadow map.
2. **An `<EffectComposer>` switches the renderer to `NoToneMapping`** and
   expects a `<ToneMapping>` effect in the chain; without one, highlights clip
   to white. Added ACES tone mapping inside the composer.
3. **`<ContactShadows>` went stale.** Switching rooms or deleting a piece could
   leave soft shadow blobs on the floor with nothing above them — their world
   positions matched the *previous* room's furniture. Diagnosed by elimination
   (hiding the shadow plane removed them; disabling the light's shadow map did
   not) and fixed by dropping the component for real shadow maps, which cannot
   desynchronise from the scene.
4. **`MeshReflectorMaterial` renders solid black** when its depth-aware blending
   props are set in a scene whose composer runs without a normal/depth pass.

All four are written up in `PERFORMANCE.md`.

## 👥 Team
Solo.
