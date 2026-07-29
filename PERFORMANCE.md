# Performance — measured, not estimated

All numbers below are **measured on the development machine**, not projected.
Method and caveats are stated so they can be reproduced or challenged.

## Test machine

| | |
|---|---|
| GPU | **Intel UHD Graphics (CML GT2)** — integrated, via ANGLE / Mesa, OpenGL 4.6 |
| WebGL | WebGL 2 |
| CPU threads | 8 |
| RAM | 16 GB |
| Browser | Chrome |
| Canvas | 1366 × 561 CSS px |

This is **integrated graphics — below the "mid-range laptop GPU" target**, so
these figures are a floor, not a best case.

## Frame cost

Measured by driving R3F's own frame loop (`state.advance()` → full scene +
postprocessing) and forcing a GPU sync (`gl.finish()`) after each frame, so the
timing includes GPU work rather than just CPU submission. 90 frames per sample
after a 15-frame warm-up.

### Bedroom — heaviest scene (High quality: 3 shadow-casting lights + planar mirror + all effects)

| Device pixel ratio | Median frame | Mean frame | Median FPS | Mean FPS |
|---|---|---|---|---|
| 1.0 (1366 × 561) | **4.90 ms** | 4.94 ms | **~204** | ~202 |
| 2.0 (2732 × 1122) | **4.60 ms** | 6.06 ms | **~217** | ~165 |

This is the worst case: it runs the window sun-shaft shadow map, the key-light
shadow map, a shadow-casting lamp point light (a 6-face cube render) *and* a
planar mirror that re-renders the room from a second camera — and still lands
around 200 fps on integrated graphics.

### Living Room (measured before the lighting overhaul, for comparison)

| Device pixel ratio | Median frame | Median FPS |
|---|---|---|
| 1.0 | 4.4 ms | ~227 |
| 2.0 | 4.8 ms | ~208 |

**Result: comfortably above the ≥ 55 fps target**, at full 2× DPR, with
postprocessing on, on integrated graphics.

**Honest caveat:** the tab was backgrounded/occluded during automated
measurement, which throttles `requestAnimationFrame` and inflates the *mean* via
occasional stalled frames — hence mean ≫ median. The **median** is the
representative figure; both are reported rather than only the flattering one.

## Scene complexity

| | Bedroom (current) | Living Room (pre-overhaul) |
|---|---|---|
| Draw calls | 283 | 273 |
| Triangles | 87,177 | 100,786 |
| Meshes | 52 | 67 + 1 instanced |
| Lights | 5 (**3 shadow-casting**) | 4 |

Draw calls are several times the object count because each frame renders the
main pass, one shadow map per shadow-casting light (the lamp's point light
costs six faces), the mirror's reflection pass and the effect composer.

## Asset budget — target < 8 MB per room on first load

| | |
|---|---|
| **Binary assets shipped** (`.glb`/`.hdr`/`.exr`/`.png`/`.jpg`/`.ktx2`) | **0** |
| Total `dist/` | 1.5 MB raw |
| **First load, gzipped (critical path)** | **~416 KB** |
| — `three` | 734 KB raw / **189 KB gz** |
| — `@react-three/*` | 641 KB raw / **224 KB gz** |
| — app + CSS + HTML | 42 KB raw / **14 KB gz** |
| Per-room chunk | 0.43–0.47 KB gz |
| Per-furniture chunk | 0.34–0.80 KB gz |

**~416 KB gzipped ≈ 5 % of the 8 MB budget.** Because all art is procedural,
adding a room or a furniture piece costs well under 1 KB.

## What was actually done

- [x] **Zero binary assets** — geometry from primitives, textures drawn to
      canvas, IBL baked from `<Lightformer>`s. Nothing to compress because
      there is nothing to download.
- [x] **Shared, cached materials** — `src/three/materials.js` caches one THREE
      material per swatch and reuses it across every mesh; a material swap is a
      reference reassignment, never a clone. Selection highlighting therefore
      uses a separate ring mesh, never a mutation of a shared material.
- [x] **Cached procedural textures** — cached by pattern+colour+role, so each
      distinct surface is generated once (256–512 px, 4× anisotropy).
- [x] **`InstancedMesh`** for the only repeated geometry in the app — the 28
      books on the bookshelf, 28 draw calls → 1.
- [x] **Shadow frusta fitted per room.** The key light's orthographic shadow
      camera is sized to the current room's diagonal rather than a fixed box,
      so texels are spent only where they can be seen (~5 mm/texel at 2048 in a
      5 m room). Point-light shadows run at 512 and only on the High profile,
      because each one is a six-face cube render.
- [x] **Mirror resolution scales with the quality profile** (512 → 256) and its
      depth-aware blending is off, which is both cheaper and correct here.
- [x] **Code-splitting / lazy loading** — every room *and* every furniture type
      is a `React.lazy` chunk behind `<Suspense>`; hovering a catalog or room
      button prefetches it. `three` and `@react-three/*` are split into
      separate long-lived cacheable chunks.
- [x] **`<Preload all />`** — compiles every shader and uploads every texture
      before the first frame is presented, so placing furniture later never
      stutters.
- [x] **DPR capped at 2** (`dpr={[1, 2]}`) plus drei `<AdaptiveDpr>` to drop
      resolution during interaction.
- [x] **`<PerformanceMonitor>` fallback** — if the GPU can't hold the frame
      budget, quality drops to Lite (no postprocessing, half-resolution shadow
      map) and stays there. Deliberately one-way: auto-upgrading would
      oscillate, since removing the effects is what restored the frame rate.
      Quality is **not** persisted, so one bad session never permanently
      degrades future visits.
- [x] **Light postprocessing only** — Bloom + ACES tone-mapping + Vignette +
      SMAA. No SSAO/SSR (contact shadows already ground the scene).
- [x] **Store kept out of the hot path** — dragging mutates the live Object3D
      and commits to the store only on release.
- [x] **`antialias: false`** on the WebGL context (SMAA handles it in the
      composer), `stencil: false`, `powerPreference: 'high-performance'`.

## Four rendering bugs found and fixed

**1. `<SoftShadows>` is broken on three r185.** drei's PCSS implementation
patches the shadow-map fragment shader with `unpackRGBAToDepth` /
`vogelDiskSample` / `PENUMBRA_FILTER_SIZE`; on r185 the shader fails to compile
and **every lit surface renders as the flat background colour.** It presents as
an exposure or tone-mapping problem, which is misleading — the geometry,
materials and lights are all fine, and draw calls are still issued. Fixed by
dropping `<SoftShadows>` for three's built-in PCF shadow map
(`shadows={{ type: THREE.PCFShadowMap }}` — note `PCFSoftShadowMap` is itself
deprecated in r185 and warns) plus `<ContactShadows>` for soft grounding.

**2. An `<EffectComposer>` disables the renderer's tone mapping.** It sets
`NoToneMapping` and expects a `<ToneMapping>` effect in the chain; without one,
linear HDR values clip straight to white. Fixed by adding
`<ToneMapping mode={ToneMappingMode.ACES_FILMIC} />` inside the composer.

**3. `<ContactShadows>` retained stale content across scene changes.** Switching
rooms or deleting a piece could leave soft shadow blobs on the floor with
nothing above them — the blobs' world positions matched *the previous room's*
furniture. It was diagnosed by elimination: hiding the contact-shadow plane
removed them while disabling the light's shadow map did not. Fixed by deleting
the component and doing grounding with real shadow maps, which are re-rendered
from the live scene graph every frame and therefore cannot desynchronise from
it. This also delivered genuinely dynamic lighting (move a lamp, everything
re-shadows).

**4. `MeshReflectorMaterial` renders solid black with depth-aware blending.**
Setting `depthScale` / `minDepthThreshold` / `maxDepthThreshold` enables a
depth-buffer-driven blend; this scene's composer runs with `disableNormalPass`
and does not supply what that path expects, so the material resolved to black —
indistinguishable from a broken reflection. Fixed by dropping those three props;
plain `mirror` + a light tint is both correct and cheaper.

## Reproducing these numbers

```js
// In the browser console, with the app running (dev build exposes window.__rc):
const s = window.__rc, gl = s.gl, ctx = gl.getContext();
gl.setPixelRatio(2);
for (let i = 0; i < 15; i++) s.advance(performance.now());   // warm up
const t = [];
for (let i = 0; i < 90; i++) {
  const a = performance.now();
  s.advance(performance.now());
  ctx.finish();
  t.push(performance.now() - a);
}
t.sort((x, y) => x - y);
console.log('median', t[45], 'ms  mean', t.reduce((x, y) => x + y) / t.length, 'ms');
```

Bundle sizes: `npm run build`, then `gzip -c dist/assets/<file> | wc -c`.
