// RoomCraft 3D — everything that lives inside the <Canvas>.
// Composition order matters: shadow-softening patch first, then environment +
// lights, then the lazy room shell and furniture, then grounding shadows,
// camera and postprocessing. Rooms are React.lazy code-split so a room's
// geometry chunk only downloads when you first visit it.

import { Suspense, lazy, useEffect } from 'react';
import { AdaptiveDpr, Preload, PerformanceMonitor } from '@react-three/drei';
import { useSceneStore } from '../store/useSceneStore.js';
import BackgroundFog from './environment/BackgroundFog.jsx';
import StudioEnvironment from './environment/StudioEnvironment.jsx';
import Lighting from './environment/Lighting.jsx';
import CameraRig from './camera/CameraRig.jsx';
import Effects from './effects/Effects.jsx';
import FurnitureLayer from './furniture/FurnitureLayer.jsx';

const ROOM_COMPONENTS = {
  living: lazy(() => import('../scenes/LivingRoom.jsx')),
  bedroom: lazy(() => import('../scenes/Bedroom.jsx')),
  office: lazy(() => import('../scenes/HomeOffice.jsx')),
};

function ActiveRoom() {
  const activeRoom = useSceneStore((s) => s.activeRoom);
  const RoomComponent = ROOM_COMPONENTS[activeRoom] || ROOM_COMPONENTS.living;
  return <RoomComponent />;
}

// Fires once the suspended room + furniture have mounted, so the intro splash
// can fade out only after the scene is actually ready to show.
function ReadySignal({ onReady }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

export default function Experience({ onReady }) {
  const quality = useSceneStore((s) => s.quality);
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const setQuality = useSceneStore((s) => s.setQuality);

  return (
    <>
      {/* One-way safety net: if the GPU can't sustain the frame budget, fall
          back to the lite profile (no postprocessing, smaller shadow map) and
          stay there. Deliberately never auto-upgrades — flipping back and forth
          would oscillate, since dropping the effects is itself what restores
          the frame rate. The toolbar still lets the user choose manually. */}
      <PerformanceMonitor
        bounds={() => [45, 60]}
        flipflops={3}
        onFallback={() => setQuality('low')}
      />
      <BackgroundFog />
      <StudioEnvironment timeOfDay={timeOfDay} />
      <Lighting />

      <Suspense fallback={null}>
        <ActiveRoom />
        <FurnitureLayer />
        {/* Compile every shader / upload every texture before the first frame
            is shown, so adding furniture later never stutters. */}
        <Preload all />
        <ReadySignal onReady={onReady} />
      </Suspense>

      {/* No <ContactShadows> here on purpose. Its render target could retain
          stale content when the scene composition changed — switching rooms or
          deleting a piece left soft shadow blobs on the floor with nothing
          above them. Grounding now comes from real shadow maps (Lighting.jsx,
          the lamps and the window sun-shaft), which are re-rendered from the
          live scene every frame and therefore cannot go stale. */}

      <CameraRig />
      <Effects />
      <AdaptiveDpr pixelated />
    </>
  );
}
