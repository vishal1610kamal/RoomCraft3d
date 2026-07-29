// RoomCraft 3D — real (analytic) scene lights, smoothly cross-faded day↔night.
//
// A directional key light casts the room's shadows; a hemisphere light gives
// sky/ground bounce; a low ambient lifts the shadows. On a day/night toggle the
// intensities and colours are damped toward their targets every frame, so the
// change reads as a smooth sunset rather than a hard cut. (Lamp point-lights
// are emitted by the FloorLamp pieces; the window sun-shaft lives in RoomShell.)
//
// Shadows are REAL shadow maps, not a baked contact-shadow texture. That is a
// deliberate choice: a render-target-based fake can retain stale content when
// the scene composition changes (switching rooms, deleting a piece), leaving
// shadows on the floor with nothing above them. A shadow map is re-rendered
// from the live scene graph every frame, so a deleted object's shadow is gone
// on the very next frame — always correct, never stale.
//
// The shadow camera is fitted to the *current room's* footprint so the texels
// are spent only where they can be seen: a tight frustum on a 5 m room gives
// roughly 5 mm per texel at 2048, which is what makes the shadows read as sharp
// contact at the legs and soft further away.

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../../store/useSceneStore.js';
import { roomDef } from '../../data/rooms.js';

// The window sun-shaft (RoomShell) is the *primary* daylight source, so this
// directional light is deliberately dialled back to a soft fill. That is what
// makes drawing the curtains actually mean something: block the window and the
// room really does fall into shade, instead of a second, un-blockable sun
// continuing to light everything from the open side of the diorama.
const PARAMS = {
  day: {
    key: { color: '#fff1d4', intensity: 0.42 },
    hemi: { sky: '#dce8ff', ground: '#c7ad86', intensity: 0.24 },
    ambient: 0.07,
  },
  night: {
    key: { color: '#9cb6e6', intensity: 0.28 },
    hemi: { sky: '#28374f', ground: '#0d0b09', intensity: 0.12 },
    ambient: 0.05,
  },
};

const damp = THREE.MathUtils.damp;
const TMP = new THREE.Color();
function dampColor(col, hex, lambda, dt) {
  col.lerp(TMP.set(hex), 1 - Math.exp(-lambda * dt));
}

export default function Lighting() {
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const quality = useSceneStore((s) => s.quality);
  const activeRoom = useSceneStore((s) => s.activeRoom);
  const keyRef = useRef();
  const hemiRef = useRef();
  const ambRef = useRef();
  const t = PARAMS[timeOfDay] || PARAMS.day;
  const shadowSize = quality === 'high' ? 2048 : 1024;

  // Fit the shadow frustum to this room so texel density stays high.
  const { dims } = roomDef(activeRoom);
  const extent = useMemo(() => {
    const radius = 0.5 * Math.hypot(dims.w, dims.d);
    return radius + 1.2; // margin for tall pieces leaning out of the box
  }, [dims.w, dims.d]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    if (keyRef.current) {
      keyRef.current.intensity = damp(keyRef.current.intensity, t.key.intensity, 4, d);
      dampColor(keyRef.current.color, t.key.color, 4, d);
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = damp(hemiRef.current.intensity, t.hemi.intensity, 4, d);
      dampColor(hemiRef.current.color, t.hemi.sky, 4, d);
      dampColor(hemiRef.current.groundColor, t.hemi.ground, 4, d);
    }
    if (ambRef.current) {
      ambRef.current.intensity = damp(ambRef.current.intensity, t.ambient, 4, d);
    }
  });

  return (
    <>
      <hemisphereLight ref={hemiRef} args={['#dce8ff', '#c7ad86', 0.6]} />
      <ambientLight ref={ambRef} intensity={0.22} />
      <directionalLight
        ref={keyRef}
        position={[5.5, 7.5, 4.5]}
        intensity={2.4}
        color="#fff1d4"
        castShadow
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-camera-near={0.5}
        shadow-camera-far={26}
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
        shadow-bias={-0.0002}
        shadow-normalBias={0.025}
      />
    </>
  );
}
