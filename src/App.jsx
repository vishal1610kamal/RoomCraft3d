import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Experience from './components/Experience.jsx';
import Overlay from './components/ui/Overlay.jsx';
import IntroSplash from './components/ui/IntroSplash.jsx';
import { useSceneStore } from './store/useSceneStore.js';
import { roomDef } from './data/rooms.js';

export default function App() {
  // Frame the camera for whichever room was persisted from a previous session.
  const initialRoom = roomDef(useSceneStore.getState().activeRoom);
  const [ready, setReady] = useState(false);

  return (
    <div className="app">
      <Canvas
        // Built-in PCF shadow map. (We deliberately avoid drei <SoftShadows>/
        // PCSS, which globally patches the shadow shader and is incompatible
        // with three r185 — it blows every surface out to the background
        // colour. PCFSoftShadowMap is also deprecated in r185, so we pin
        // PCFShadowMap explicitly and lean on ContactShadows for soft grounding.)
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 2]}
        gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
        camera={{ position: initialRoom.camera.position, fov: 45, near: 0.1, far: 100 }}
        onCreated={(state) => {
          state.gl.toneMappingExposure = 0.95;
          // Dev-only handle for inspecting the live scene from the console.
          if (import.meta.env.DEV) window.__rc = state;
        }}
        onPointerMissed={() => useSceneStore.getState().clearSelection()}
      >
        <Suspense fallback={null}>
          <Experience onReady={() => setReady(true)} />
        </Suspense>
      </Canvas>

      <Overlay />
      <IntroSplash ready={ready} />
    </div>
  );
}
