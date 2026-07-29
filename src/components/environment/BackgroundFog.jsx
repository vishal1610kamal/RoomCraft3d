// RoomCraft 3D — background + fog, cross-faded with day/night.
// Owns scene.background and scene.fog so the transition is smooth (lerped) and
// there's a single source of truth for the sky colour. Subtle fog adds depth
// and hides the open edges of the diorama.

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../../store/useSceneStore.js';

// Fog is deliberately gentle: the whole room sits within ~13 m of the camera,
// so fog only begins well beyond it — just enough to soften the open diorama
// edges against the sky, never to wash out the room itself.
const TARGET = {
  day: { bg: '#e7e1d6', fog: '#ded7c8', near: 16, far: 52 },
  night: { bg: '#0c0e14', fog: '#0a0c12', near: 13, far: 42 },
};

export default function BackgroundFog() {
  const scene = useThree((s) => s.scene);
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const bg = useRef(new THREE.Color(TARGET.day.bg));
  const fogCol = useRef(new THREE.Color(TARGET.day.fog));

  useEffect(() => {
    scene.background = bg.current;
    scene.fog = new THREE.Fog(fogCol.current, TARGET.day.near, TARGET.day.far);
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene]);

  const t = TARGET[timeOfDay] || TARGET.day;
  useFrame((_, dt) => {
    const a = 1 - Math.exp(-4 * Math.min(dt, 0.05));
    bg.current.lerp(TMP.set(t.bg), a);
    fogCol.current.lerp(TMP.set(t.fog), a);
    if (scene.fog) {
      scene.fog.near = THREE.MathUtils.lerp(scene.fog.near, t.near, a);
      scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, t.far, a);
    }
  });

  return null;
}

const TMP = new THREE.Color();
