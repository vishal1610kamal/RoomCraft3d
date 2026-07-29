# RoomCraft 3D — Hackathon Submission Form Content

Everything below is ready to copy-paste into the submission form, field by field.
All figures are **measured**, not estimated (see `PERFORMANCE.md` for method).

---

## 1. Project name

> **Field limit: 60 characters**

```
RoomCraft 3D — A Room Where Nothing Was Downloaded
```

*50 characters.*

**Alternatives, if you prefer a different angle:**

| Option | Chars | Angle |
|---|---|---|
| `RoomCraft 3D — Sunlight, Curtains, and No Assets` | 48 | leads on the curtain/light trick |
| `RoomCraft 3D — An Interior Drawn Entirely by Code` | 49 | leads on the craft |
| `RoomCraft 3D` | 12 | clean and plain |

---

## 2. Elevator pitch

> **Field limit: 200 characters**

```
A sunlit room you can rearrange, relight and walk through — where every model, texture and light is drawn by code. No 3D files at all. 420 KB. Draw the curtains and the room really does go dark.
```

*193 characters.*

---

## 3. About the project

> Paste everything inside the code block below into the "About the project" field.
> It is already formatted as Markdown.

```markdown
## Inspiration

Every 3D website I love has the same quiet problem: a loading bar. Somewhere
behind it, tens of megabytes of models, textures and HDRI maps are coming down
the wire before you're allowed to feel anything.

So I set myself a constraint that sounded like a joke: **build a warm, sunlit,
furnished interior — and don't download a single 3D asset.** No `.glb`, no
`.hdr`, no `.png`. If it's on screen, it was drawn by code at runtime.

The constraint turned out to be the creative engine. When you can't reach for a
photoscanned oak texture, you have to ask what oak actually *looks* like — long
grain streaks, plank seams, a warm base that shifts lighter and darker along the
fibre — and then draw that. You end up understanding the material instead of
importing it.

## What it does

RoomCraft 3D is a furniture placement studio for three rooms — a living room, a
bedroom and a home office.

- **Rearrange it.** Click any piece to select it, drag its gizmo to move or
  rotate it, duplicate it, delete it. Pieces can't be pushed through walls, and
  they can't be buried inside each other.
- **Restyle it.** 13 material swatches across Wood, Fabric, Leather and Metal,
  restricted per piece so the options stay plausible — you can't upholster a
  coffee table in leather.
- **Relight it.** Flip day to night and the image-based lighting, sun colour,
  fog, sky and window glass all cross-fade while the lamps come up.
- **Walk through it.** Pointer-lock first-person mode with WASD, at eye height,
  that won't let you clip through the wardrobe.
- **Draw the curtains.** More on this below — it's the part I'm proudest of.

## The detail I'm proudest of

Most web scenes fake a window: a glowing rectangle painted on a wall.

Mine is **an actual hole**. Each wall is built from four segments around an
opening, and the sun is a real light sitting *outside* the building, aiming in.
The solid wall blocks it. Light only gets in through the gap — which is why it
lands on the floor as a correctly-shaped bright patch rather than a decal.

That one structural decision is what makes the curtains mean something. The
curtain panels are real shadow-casting cloth. Draw them, and they move into the
light path: the sun patch fades, every shadow in the room softens, the space
falls into shade. **None of that is animated by hand.** It's the shadow map
reacting to geometry that moved.

The same idea runs through everything else:

- Drag a **floor lamp** across the room at night and every piece around it is
  genuinely re-lit and re-shadowed, because it's a real shadow-casting light.
- The **bedroom mirror** is a planar reflection — put something in front of it
  and it shows up, including yourself in walk mode.
- The **office wall clock** runs on *your* system clock, second hand sweeping.

Make it real, then let the physics happen.

## How I built it

**React Three Fiber 9 + three.js r185 + drei 10**, with Zustand for scene state
and Vite for the build. React 19 throughout.

The interesting parts are the ones that replaced assets:

**Textures** are drawn to a `<canvas>` at runtime and cached per colour — wood
grain with plank seams, woven fabric cross-hatch, mottled leather with pores,
brushed metal streaks — then used as both albedo and bump map.

**Lighting** is genuine image-based lighting with no `.hdr` file: the
environment map is baked at runtime from `<Lightformer>` panels arranged into a
warm-sun daytime rig and a cool moonlit night rig.

**Furniture** is assembled from primitives at true real-world dimensions, behind
the exact prop interface a GLTF-loaded component would expose — so swapping in a
real model later is a one-file change, not a rewrite.

**Everything is code-split.** Each room *and* each furniture type is its own
lazy chunk (0.3–0.8 KB gzipped), prefetched when you hover its button.

## Challenges I ran into

Four bugs were genuinely hard, and three of them lie to you about what's wrong.

**1. drei's `<SoftShadows>` silently destroys three r185.** Its PCSS patch
injects shader functions that no longer exist; the fragment shader fails to
compile and **every lit surface renders as the flat background colour**. It
presents as an exposure problem, so I spent a long time adjusting fog, tone
mapping and IBL intensity — all of which did nothing, because the geometry,
materials and lights were fine the whole time. I only found it by bisecting the
scene component by component.

**2. An `<EffectComposer>` disables the renderer's tone mapping.** It sets
`NoToneMapping` and expects a `<ToneMapping>` effect in the chain. Without one,
highlights clip straight to white.

**3. `<ContactShadows>` went stale.** Soft shadow blobs sat on the floor with
nothing above them. I raycast their world positions and they matched *the
previous room's* furniture — the render target was retaining old content across
room switches and deletions. Rather than patch it, I deleted the component and
moved all grounding to real shadow maps, which are re-rendered from the live
scene every frame and therefore **cannot** go stale. That fixed the ghosts and
made every shadow dynamic as a side effect.

**4. `MeshReflectorMaterial` renders solid black** if you set its depth-blending
props in a scene whose composer runs without a normal/depth pass —
indistinguishable from a reflection that simply doesn't work.

I also cut **GSAP**, which was in my original plan for camera transitions. It
drives its own animation ticker, which can stall independently of the render
loop and strand the camera mid-flight. Camera moves now use frame-rate-
independent damping inside R3F's own `useFrame`: one loop, one source of truth,
and ~100 KB less JavaScript.

## What I learned

- **Constraints beat libraries.** "No assets" forced me to learn what materials
  and light actually do, and the result loads instantly and works offline.
- **Build the real thing and the magic is free.** I never wrote a line of code
  that says "when curtains close, dim the room." I made a hole, put a light
  outside it, and hung cloth in the way.
- **Symptoms lie.** Three separate bugs all looked like "the lighting is wrong."
  Bisection beats theorising every time.
- **A fake is only worth it until it desyncs.** Baked shadows were cheaper right
  up to the moment they showed furniture that wasn't there any more.

## Accomplishments

Measured, not estimated — on **Intel UHD integrated graphics**, which is *weaker*
than a mid-range laptop GPU:

| | |
|---|---|
| First load | **~420 KB gzipped** |
| 3D asset files shipped | **0** |
| Frame time, heaviest room, 2× DPR, all effects | **4.6 ms median (~217 fps)** |
| Shadow-casting lights in that room | 3 |
| Console errors | 0 |

## What's next

Real GLTF furniture as an *optional* upgrade — the loader seam is already built
and documented, so a real model is a one-file swap. Beyond that: saveable
multiple layouts, a top-down floor-plan view, and export to a shareable link.
```

---

## 4. Built with

> **Field limit: 25 tags.** These 15 are all accurate — nothing is claimed that
> isn't actually in the build.

```
react
three.js
react-three-fiber
drei
react-three-postprocessing
zustand
vite
webgl2
javascript
html5
css3
canvas-api
pointer-lock-api
localstorage
node.js
```

**Do not add** `gsap` (it was removed), `blender`, `draco`, `ktx2`, `spline`, or
`webgpu` — none are used, and a judge who checks would find that out.

---

## 5. "Try it out" links

| Label | URL |
|---|---|
| Live site | `https://vishal1610kamal.github.io/RoomCraft3d/` |
| Source code | `https://github.com/vishal1610kamal/RoomCraft3d` |

---

## 6. Image gallery

The form requires **at least 3 screenshots** (3:2 ratio works best).
Recommended shots, in this order — they tell the story on their own:

1. **Living room, curtains open, daylight.** Sun patch visible on the floor, one
   piece selected showing its glow ring + gizmo, full glass UI in frame.
   *This is your cover image.*
2. **Bedroom at night.** Floor lamp lighting the room, warm pool on the floor,
   deep-blue window.
3. **Bedroom, same angle, curtains drawn.** Paired with #2 this makes the
   physical light-blocking legible in a still image.
4. *(optional)* **Walk mode, first person**, close enough to read the wood grain
   on the wardrobe.
5. *(optional)* **Home Office** with the working clock and the material picker
   open.

---

## 7. Video demo (optional, 1–5 min)

If you record one, this order demos best:

1. Open on the living room in daylight, orbit slowly (5s)
2. Click the sofa → swap Fabric → Leather → Cognac (10s)
3. Drag the armchair — show it stopping against another piece (10s)
4. **Draw the curtains** — hold on the floor so the sun patch fading is visible (10s)
5. Toggle to night — lamps come up (10s)
6. Drag the floor lamp around and let the shadows swing with it (10s)
7. Switch to Bedroom — camera flies, show the mirror reflecting (10s)
8. Enter walk mode, walk toward the window (15s)
9. Home Office — zoom the clock, note it's the viewer's real time (10s)

---

## 8. Deployment

Deploys automatically to GitHub Pages from `main` via
`.github/workflows/deploy.yml`. Push, and ~2 minutes later the site is live at
`https://vishal1610kamal.github.io/RoomCraft3d/`.

**One-time setup:** repo **Settings → Pages → Build and deployment → Source:
"GitHub Actions"**. Without this the workflow build succeeds but the deploy step
fails.

### Final checklist

- [ ] Deploy and paste the live URL into "Try it out"
- [ ] Push source to a public repo and paste that URL too
- [ ] Upload at least 3 screenshots
- [ ] Paste project name, elevator pitch, story and tags from this file
- [ ] Open the live URL in a fresh browser and confirm it loads and the console
      is clean *(one upstream warning from R3F/drei about `THREE.Clock` being
      deprecated is expected and harmless — it is not from this codebase)*

---

## Notes on accuracy

Every claim in the copy above is backed by something in the repo:

| Claim | Where it's verified |
|---|---|
| 0 asset files | `find` over repo + `dist/` returns 0 `.glb/.hdr/.png/.jpg` |
| ~420 KB gzipped | measured per-chunk with `gzip -c \| wc -c` |
| 4.6 ms median @ 2× DPR | timed over 90 frames with a GPU sync, `PERFORMANCE.md` |
| Intel UHD test GPU | `WEBGL_debug_renderer_info` |
| 3 shadow-casting lights | counted by traversing the live scene graph |
| The four bugs | each documented with cause and fix in `PERFORMANCE.md` |

The hackathon explicitly permits AI tools; how you credit that is your call, so
the story is written in plain first person for you to adjust as you see fit.
