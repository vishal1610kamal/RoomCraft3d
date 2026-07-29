// RoomCraft 3D — shared furniture parts
// Small reusable sub-meshes so the individual pieces stay short. Every piece is
// built from primitives around a local origin at floor level (y = 0), facing +z,
// and receives its swappable `material` from FurniturePiece. Fixed parts (legs,
// hardware) use cached accent materials so a material swap only affects the
// intended surfaces — exactly how you'd swap one map on a real GLTF.

import { RoundedBox } from '@react-three/drei';
import { getAccent } from '../../three/materials.js';

// Four cylindrical legs at the corners of a w×d footprint.
export function Legs({ w, d, h = 0.12, r = 0.03, inset = 0.08, material, y = null }) {
  const mat = material || getAccent('darkMetal');
  const hx = w / 2 - inset;
  const hz = d / 2 - inset;
  const cy = y == null ? h / 2 : y;
  return (
    <group>
      {[
        [hx, hz],
        [-hx, hz],
        [hx, -hz],
        [-hx, -hz],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, cy, z]} material={mat} castShadow>
          <cylinderGeometry args={[r, r * 0.85, h, 12]} />
        </mesh>
      ))}
    </group>
  );
}

// Angled hairpin-ish metal legs alternative (simple splayed cylinders).
export function SplayLegs({ w, d, h = 0.18, r = 0.018, inset = 0.06 }) {
  const mat = getAccent('blackMetal');
  const hx = w / 2 - inset;
  const hz = d / 2 - inset;
  return (
    <group>
      {[
        [hx, hz, 0.12, 0.12],
        [-hx, hz, -0.12, 0.12],
        [hx, -hz, 0.12, -0.12],
        [-hx, -hz, -0.12, -0.12],
      ].map(([x, z, tx, tz], i) => (
        <mesh key={i} position={[x, h / 2, z]} rotation={[tz * 0.6, 0, -tx * 0.6]} material={mat} castShadow>
          <cylinderGeometry args={[r, r, h * 1.1, 10]} />
        </mesh>
      ))}
    </group>
  );
}

export function Cushion({ position, size, material, radius = 0.06 }) {
  return (
    <RoundedBox position={position} args={size} radius={radius} smoothness={4} material={material} castShadow receiveShadow />
  );
}
