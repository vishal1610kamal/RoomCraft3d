import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

// Bookshelf — footprint ~1.0 × 0.35, ~1.8 tall. Carcass uses the swap material.
// The ~28 books are the only repeated geometry in the app, so they are drawn as
// a single InstancedMesh with per-instance colour and scale (28 draw calls → 1),
// per the performance checklist.
const BOOK_COLORS = ['#7c4a3a', '#3f5b57', '#8a7b52', '#4a4f63', '#9a5a3a', '#556b5a'];
const SHELF_Y = [0.35, 0.75, 1.15, 1.55];
const PER_SHELF = 7;
const COUNT = SHELF_Y.length * PER_SHELF;

function Books() {
  const ref = useRef();
  // Unit box; per-instance scale gives each book its own width/height.
  const instances = useMemo(() => {
    const out = [];
    SHELF_Y.forEach((y, s) => {
      for (let b = 0; b < PER_SHELF; b++) {
        const h = 0.22 + ((b * 7 + s) % 3) * 0.04;
        const w = 0.04 + ((b + s) % 3) * 0.012;
        const x = -0.42 + b * 0.12 + (s % 2) * 0.02;
        out.push({
          position: [x, y + h / 2 + 0.015, 0.02],
          scale: [w, h, 0.24],
          color: BOOK_COLORS[(b + s * 2) % BOOK_COLORS.length],
        });
      }
    });
    return out;
  }, []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const c = new THREE.Color();
    instances.forEach((inst, i) => {
      p.set(...inst.position);
      s.set(...inst.scale);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.set(inst.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [instances]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.8} />
    </instancedMesh>
  );
}

export default function Bookshelf({ material }) {
  return (
    <group>
      {/* sides */}
      {[0.48, -0.48].map((x, i) => (
        <mesh key={i} position={[x, 0.9, 0]} material={material} castShadow>
          <boxGeometry args={[0.04, 1.8, 0.35]} />
        </mesh>
      ))}
      {/* back */}
      <mesh position={[0, 0.9, -0.16]} material={material} receiveShadow>
        <boxGeometry args={[0.96, 1.8, 0.03]} />
      </mesh>
      {/* shelves */}
      {[0.05, ...SHELF_Y, 1.78].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} material={material} castShadow receiveShadow>
          <boxGeometry args={[0.96, 0.03, 0.34]} />
        </mesh>
      ))}
      <Books />
    </group>
  );
}
