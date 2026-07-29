// RoomCraft 3D — curtains
//
// Two cloth panels either side of the window. They are real shadow-casting
// geometry, so drawing them closed physically occludes the <SunShaft> light
// coming through the window opening: the sun patch on the floor fades out and
// every shadow in the room softens. Nothing about that is animated by hand —
// it is the shadow map responding to the geometry moving into the light path.
//
// The cloth is procedural rather than simulated (a physics solver is an
// explicit non-goal). Each panel is a subdivided plane whose vertices are
// displaced on Z by a sine wave, giving vertical folds, and tapered slightly at
// the top so it reads as gathered on the rail. Opening does what a real curtain
// does: the panel bunches toward its side rather than merely sliding, so the
// folds compress and deepen. That's driven by an animated `open` value, damped
// per-frame so the motion has weight.

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../../store/useSceneStore.js';

const SEGS_X = 28;
const SEGS_Y = 6;
const FOLDS = 5;

// A plane with sine folds baked into Z, gathered slightly toward the top.
function useCurtainGeometry(width, height) {
  return useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height, SEGS_X, SEGS_Y);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const u = (v.x / width) + 0.5; // 0..1 across the panel
      const t = (v.y / height) + 0.5; // 0..1 bottom..top
      // Folds deepen toward the bottom where the cloth hangs free.
      const depth = 0.028 * (0.45 + 0.55 * (1 - t));
      v.z += Math.sin(u * Math.PI * 2 * FOLDS) * depth;
      // A touch of drift so the hem isn't a perfect rectangle.
      v.x += Math.sin(u * Math.PI * FOLDS) * 0.004 * (1 - t);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, [width, height]);
}

function Panel({ width, height, side, openRef }) {
  const geometry = useCurtainGeometry(width, height);
  const ref = useRef();

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const open = openRef.current;
    // Bunch toward the outer edge as it opens: narrow the panel and slide it
    // out, so the folds visibly compress instead of the cloth just vanishing.
    const squeeze = THREE.MathUtils.lerp(1, 0.26, open);
    g.scale.x = squeeze;
    g.position.x = side * ((width / 2) * (1 - squeeze));
    // Deepen the folds as the cloth gathers.
    g.scale.z = THREE.MathUtils.lerp(1, 2.6, open);
  });

  return (
    <group ref={ref} position={[side * 0, 0, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#cbbba4"
          roughness={0.94}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function Curtains({ width, height }) {
  const curtainsOpen = useSceneStore((s) => s.curtainsOpen);
  // Animated 0 (closed) → 1 (open), shared by both panels via a ref so the
  // per-frame work never re-renders React.
  const openRef = useRef(curtainsOpen ? 1 : 0);

  useFrame((_, dt) => {
    const goal = curtainsOpen ? 1 : 0;
    openRef.current = THREE.MathUtils.damp(openRef.current, goal, 4, Math.min(dt, 0.05));
  });

  // Each panel covers just over half the opening so they meet in the middle
  // when closed, with a little overlap like real curtains.
  const panelW = width * 0.54;
  const rail = width * 0.5 - panelW * 0.5;

  return (
    <group position={[0, 0, 0.1]}>
      {/* rail */}
      <mesh position={[0, height / 2 + 0.07, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, width + 0.24, 10]} />
        <meshStandardMaterial color="#3a3a3d" roughness={0.4} metalness={0.8} />
      </mesh>
      <group position={[-rail, 0, 0]}>
        <Panel width={panelW} height={height} side={-1} openRef={openRef} />
      </group>
      <group position={[rail, 0, 0]}>
        <Panel width={panelW} height={height} side={1} openRef={openRef} />
      </group>
    </group>
  );
}
