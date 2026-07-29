import { getAccent } from '../../three/materials.js';

// Potted plant — pot uses the swap material; foliage is a cluster of leaf
// spheres in fixed greens. ~0.5 footprint, ~1.2 tall.
const LEAVES = [
  [0, 0.85, 0, 0.26, '#3f6f43'],
  [0.16, 0.98, 0.05, 0.2, '#4a7d4c'],
  [-0.14, 0.95, -0.06, 0.19, '#365d3a'],
  [0.05, 1.12, -0.1, 0.17, '#568a54'],
  [-0.08, 1.08, 0.12, 0.16, '#43764a'],
  [0.12, 0.78, -0.14, 0.15, '#3a6a40'],
];

export default function Plant({ material }) {
  const soil = { color: '#2c2118', roughness: 1 };
  const stem = getAccent('darkMetal');
  return (
    <group>
      {/* pot */}
      <mesh position={[0, 0.2, 0]} material={material} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.4, 24]} />
      </mesh>
      {/* soil */}
      <mesh position={[0, 0.39, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.03, 24]} />
        <meshStandardMaterial {...soil} />
      </mesh>
      {/* stem */}
      <mesh position={[0, 0.6, 0]} material={stem}>
        <cylinderGeometry args={[0.02, 0.025, 0.5, 8]} />
      </mesh>
      {/* foliage */}
      {LEAVES.map(([x, y, z, r, c], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r, 14, 12]} />
          <meshStandardMaterial color={c} roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}
