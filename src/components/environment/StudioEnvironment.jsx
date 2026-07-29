// RoomCraft 3D — procedural image-based lighting
// Builds the scene's environment map from drei <Lightformer> panels instead of
// an .hdr file. This gives real IBL reflections + ambient bounce with ZERO
// external assets, and works offline. The map re-bakes once when day/night
// toggles (cheap, frames={1}); the smooth part of the transition is carried by
// the real lights + background (see Lighting.jsx / BackgroundFog.jsx).

import { Environment, Lightformer } from '@react-three/drei';

const SETUPS = {
  day: [
    // broad soft skylight from above
    { key: 'sky', position: [0, 6, 1], rotation: [-Math.PI / 2, 0, 0], scale: [12, 12, 1], color: '#ffffff', intensity: 0.55, form: 'rect' },
    // warm key "sun" coming through the window side
    { key: 'sun', position: [5, 4.5, 4], scale: [4, 7, 1], color: '#ffe4b0', intensity: 1.1, form: 'rect', target: [0, 1, 0] },
    // cool sky fill from the opposite side
    { key: 'fill', position: [-6, 3.5, -3], scale: [7, 7, 1], color: '#cfe0ff', intensity: 0.35, form: 'rect', target: [0, 1, 0] },
    // warm floor bounce
    { key: 'bounce', position: [0, -2, 0], rotation: [Math.PI / 2, 0, 0], scale: [12, 12, 1], color: '#c69a6a', intensity: 0.22, form: 'rect' },
  ],
  night: [
    // faint cool moon wash from above
    { key: 'moonTop', position: [0, 6, 0], rotation: [-Math.PI / 2, 0, 0], scale: [12, 12, 1], color: '#33425f', intensity: 0.35, form: 'rect' },
    // cool moonlight through the window
    { key: 'moon', position: [5, 4.5, 3], scale: [3, 5, 1], color: '#8fb0e6', intensity: 0.7, form: 'rect', target: [0, 1, 0] },
    // warm interior lamp spill
    { key: 'lampWarm', position: [-3, 1.6, 2], scale: [3, 3, 1], color: '#ffb765', intensity: 0.8, form: 'rect', target: [0, 1, 0] },
    // very low ground fill
    { key: 'ground', position: [0, -2, 0], rotation: [Math.PI / 2, 0, 0], scale: [12, 12, 1], color: '#241a12', intensity: 0.25, form: 'rect' },
  ],
};

export default function StudioEnvironment({ timeOfDay = 'day' }) {
  const formers = SETUPS[timeOfDay] || SETUPS.day;
  // environmentIntensity scales the IBL contribution live (drei sets
  // scene.environmentIntensity). Kept modest so image-based light fills the
  // room without washing mid-tones out under ACES tone-mapping.
  return (
    <Environment key={timeOfDay} resolution={256} frames={1} environmentIntensity={timeOfDay === 'day' ? 0.42 : 0.5}>
      {formers.map(({ key, form, ...props }) => (
        <Lightformer key={key} form={form} {...props} />
      ))}
    </Environment>
  );
}
