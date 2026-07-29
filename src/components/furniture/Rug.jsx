import { RoundedBox } from '@react-three/drei';

// Rug — a thin soft slab (~2.6 × 1.8) lying on the floor. Uses the swap fabric
// material; receives shadows from furniture above it. A slightly darker border
// gives it a woven-edge read.
export default function Rug({ material }) {
  return (
    <group>
      {/* border */}
      <RoundedBox args={[2.6, 0.02, 1.8]} radius={0.01} position={[0, 0.011, 0]} material={material} receiveShadow castShadow />
      {/* inset field, lifted a hair to avoid z-fighting */}
      <mesh position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.36, 1.56]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.12} roughness={1} />
      </mesh>
    </group>
  );
}
