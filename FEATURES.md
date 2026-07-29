# Features — as built

Everything below is implemented and was verified in a real browser.

## Rooms — 3

| Room | Size (m) | Window | Distinctive detail | Default pieces |
|---|---|---|---|---|
| Living Room | 6.4 × 5.2 × 3.0 | back wall | framed wall art | 7 |
| Bedroom | 5.4 × 4.8 × 3.0 | left wall | **real reflective mirror** | 6 |
| Home Office | 5.2 × 4.4 × 3.0 | back wall | **clock showing your real time** | 6 |

Each room is a lazy-loaded chunk with its own palette, floor tone, window
placement, camera framing and authored starting layout. Switching rooms flies
the camera to that room's framing rather than cutting.

## Furniture catalog — 12 types, 6 categories

| Category | Pieces | Material families offered |
|---|---|---|
| Seating | Sofa, Armchair, Office Chair | Fabric, Leather (+ Metal on the chair) |
| Tables | Coffee Table, Desk, Nightstand | Wood, Metal |
| Storage | Bookshelf, Wardrobe | Wood (+ Metal on the shelf) |
| Sleeping | Bed | Fabric, Leather, Wood |
| Lighting | Floor Lamp | Metal, Wood |
| Rugs & Decor | Rug, Plant | Fabric / Metal |

Each piece is its own lazy-loaded chunk (0.34–0.80 KB gzipped) fetched the first
time it is used — hovering its catalog button prefetches it. The catalog filters
itself to the pieces that belong in the current room.

Material families are restricted per piece so the options stay plausible — you
can't upholster a coffee table in leather.

## Materials — 13 swatches, 4 families

| Family | Swatches |
|---|---|
| Wood | Oak, Walnut, Ash |
| Fabric | Linen, Teal, Rust, Slate |
| Leather | Cognac, Onyx, Camel |
| Metal | Brass, Steel, Charcoal |

Each swatch is a physically-plausible PBR preset (colour, roughness, metalness;
leather adds clearcoat) paired with a procedurally-generated albedo + bump map.
Materials are **cached and shared** across meshes, so a swap is a reference
reassignment rather than a per-mesh clone.

## Interactions

- [x] **Click-to-place** — add any piece from the catalog; it spawns selected
      and clamped inside the room.
- [x] **Click-to-select** — with a glowing floor ring (bloom makes it pop) and a
      context panel. Clicking empty space deselects.
- [x] **Drag to move / rotate** — a `TransformControls` gizmo, snapped to 10 cm
      and 7.5°. Orbiting is suspended while dragging. Position is committed to
      the store on release, so dragging never touches React per-frame.
- [x] **Rotate by 15° buttons**, **duplicate**, **delete**.
- [x] **Bounds clamping** — pieces can't be pushed through the walls.
- [x] **Material swap** — family tabs + swatch grid, applied instantly.
- [x] **Room switching** — with a camera fly-to.
- [x] **Day / night toggle** — animated sun/moon switch.
- [x] **Curtain toggle** — open/draw the curtains; the lighting responds.
- [x] **Orbit and walk camera modes.**
- [x] **Save / reset layout** — auto-persisted; reset restores the room default.
- [x] **Quality toggle** — High / Lite, plus an automatic fallback.

## Windows, sunlight and curtains

The windows are **real openings**, not glowing decals. Each wall is built from
four segments around a hole, and a sun light sits *outside* aiming in — so the
solid wall blocks it and daylight only reaches the room through the gap,
throwing a correctly-shaped bright patch across the floor.

That one decision makes the curtains genuinely physical:

- [x] **Draw the curtains** and the cloth moves into the light path. Because the
      panels cast shadows, the sun patch fades, furniture shadows soften and the
      room drops into shade — **none of it scripted**, it is the shadow map
      reacting to geometry.
- [x] Curtains are cloth-like: a subdivided plane with sine-wave folds that
      deepen toward the free-hanging hem, and they **bunch** toward their side
      as they open rather than merely sliding, so the folds compress.
- [x] The motion is damped per-frame, so it has weight instead of snapping.

The window sun is deliberately the *primary* daylight source, with the ambient
directional light dialled back to a soft fill — otherwise a second,
un-blockable sun would keep the room lit and closing the curtains would mean
nothing.

## Shadows — real, never stale

Every shadow is a real shadow map re-rendered from the live scene each frame:

| Light | Casts shadows | Purpose |
|---|---|---|
| Window sun-shaft | ✔ | primary daylight, blocked by curtains |
| Directional key | ✔ | soft ambient fill, frustum fitted per room |
| Floor lamp point light | ✔ (High profile) | warm pool of light after dark |

- [x] **Move a lamp** and every piece around it is re-lit and re-shadowed live.
- [x] **Delete a piece** and its shadow disappears on the very next frame.

An earlier build used a baked contact-shadow texture for grounding; it could
retain stale content when the scene changed, leaving soft blobs on the floor
with nothing above them. It was removed in favour of shadow maps, which cannot
go stale by construction.

## Real mirror

The bedroom mirror uses planar reflection — the room is re-rendered from the
mirrored camera each frame, so **anything you move in front of it actually
appears in the reflection**, including yourself in walk mode.

## Placement constraints

- [x] Pieces are clamped inside the walls.
- [x] Pieces **cannot be dragged into each other** — each footprint is pushed
      out of its neighbours along the shallowest axis, so a nightstand stops
      against the bed instead of burying itself in it. Applies to dragging,
      adding and duplicating. Rugs are exempt, because furniture stands on them.
- [x] Declared footprints match the real geometry (the armchair's arms, the
      plant's foliage spread, the chair's casters and the bed's headboard all
      extend past the naive box, and the catalog accounts for it).

## Day / night

Not a lighting preset swap — everything cross-fades over ~1 s in `useFrame`:

- the IBL environment re-bakes between a warm-sun and a moonlit `<Lightformer>`
  arrangement;
- key light dims and shifts from warm sun to cool moon; hemisphere and ambient
  follow;
- background sky and fog colour and depth lerp;
- window panes fade from bright sky to deep moonlit blue;
- **floor lamps brighten** — emissive shade intensity and their point-light
  intensity ramp up, so lamps actually light the room after dark.

No reload, no asset swap, no flash.

## Camera

**Orbit** — damped, with limits that keep it above the floor and within a
2.2–14 m band. Flies to the room's authored framing on room change or on
returning from walk mode, using frame-rate-independent damping in `useFrame`
(any manual input cancels the fly-to so it never fights the user).

**Walk** — pointer-lock look + WASD (Shift to run) at 1.6 m eye height.
Movement is clamped to the room interior and pushed out of each piece's
footprint circle, so you cannot walk through walls or furniture. Releasing the
pointer lock returns you to orbit. Editing UI hides in walk mode.

## UI

A glassmorphic 2D overlay — backdrop blur, hairline borders, warm amber accent —
built entirely in HTML/CSS. **Nothing is rendered in 3D space.** The overlay is
`pointer-events: none` so the canvas stays fully interactive; only the panels
capture input. Layout collapses for narrow viewports, and an intro splash covers
the initial WebGL warm-up.

## Explicit non-goals — not built, by design

- Multi-user / collaborative editing
- Physics engine (walk mode uses simple geometric push-out, not simulation)
- Custom uploaded rooms or models
- Backend, auth, accounts
