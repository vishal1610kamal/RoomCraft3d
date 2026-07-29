# Asset & Tool Credits

## Third-party assets: none

**No third-party art is bundled in this project.** There are zero `.glb`,
`.gltf`, `.hdr`, `.exr`, `.png`, `.jpg` or `.ktx2` files in the repository or in
the build output. Every visual is generated at runtime from code written for
this project:

| Asset | Source | License | Used for |
|---|---|---|---|
| Furniture geometry (12 pieces) | Original — primitive assemblies in `src/components/furniture/` | Project code | All furniture |
| Room shells, windows, trim, wall décor | Original — `src/scenes/` | Project code | All three rooms |
| Wood / fabric / leather / metal / plaster textures | Original — procedurally drawn to canvas in `src/three/textures.js` | Project code | All surfaces |
| Environment lighting (day & night IBL) | Original — baked at runtime from drei `<Lightformer>` panels in `src/components/environment/StudioEnvironment.jsx` | Project code | Image-based lighting, reflections |
| UI design, glassmorphic styling, intro splash | Original — `src/index.css`, `src/components/ui/` | Project code | 2D overlay |
| Icons | Unicode emoji | Rendered by the OS/browser font; not redistributed | Catalog & toggles |

Because nothing is downloaded or redistributed, there is no third-party licence
obligation to satisfy under hackathon rules 3 and 8.

## Libraries

| Library | Version | License |
|---|---|---|
| [React](https://react.dev) | 19.2.8 | MIT |
| [three.js](https://threejs.org) | 0.185.1 | MIT |
| [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) | 9.6.1 | MIT |
| [@react-three/drei](https://github.com/pmndrs/drei) | 10.7.7 | MIT |
| [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) | 3.0.4 | MIT |
| [zustand](https://github.com/pmndrs/zustand) | 5.0.14 | MIT |
| [Vite](https://vite.dev) | 6.4.3 | MIT |
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | 4.7.0 | MIT |

## If you add real assets later

`ASSETS_NEEDED.md` lists every placeholder, the exact path a real file would go
to, a suggested source (Poly Haven for HDRIs/textures — CC0; Sketchfab or
Blender originals for furniture), and the licence requirement. **Record each
added file in the table above with its source URL and licence** before
submitting.
