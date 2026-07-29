import { RoundedBox } from '@react-three/drei';
import { getAccent } from '../../three/materials.js';

// Coffee table — footprint ~1.2 × 0.6, ~0.42 tall. Top uses swap material.
export default function CoffeeTable({ material }) {
  const legMat = getAccent('darkMetal');
  return (
    <group>
      <RoundedBox args={[1.2, 0.07, 0.6]} radius={0.02} position={[0, 0.4, 0]} material={material} castShadow receiveShadow />
      {/* lower shelf */}
      <RoundedBox args={[1.06, 0.04, 0.5]} radius={0.015} position={[0, 0.14, 0]} material={material} castShadow />
      {/* legs (frame) */}
      {[
        [0.54, 0.26],
        [-0.54, 0.26],
        [0.54, -0.26],
        [-0.54, -0.26],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} material={legMat} castShadow>
          <boxGeometry args={[0.05, 0.4, 0.05]} />
        </mesh>
      ))}
    </group>
  );
}
