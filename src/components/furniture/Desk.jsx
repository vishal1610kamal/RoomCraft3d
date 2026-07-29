import { RoundedBox } from '@react-three/drei';
import { getAccent } from '../../three/materials.js';

// Desk — footprint ~1.4 × 0.7, ~0.75 tall. Top uses swap material.
export default function Desk({ material }) {
  const legMat = getAccent('darkMetal');
  return (
    <group>
      <RoundedBox args={[1.4, 0.06, 0.7]} radius={0.02} position={[0, 0.73, 0]} material={material} castShadow receiveShadow />
      {/* side panels as legs */}
      {[0.64, -0.64].map((x, i) => (
        <mesh key={i} position={[x, 0.36, 0]} material={legMat} castShadow>
          <boxGeometry args={[0.05, 0.72, 0.6]} />
        </mesh>
      ))}
      {/* modesty panel */}
      <mesh position={[0, 0.5, -0.3]} material={legMat} castShadow>
        <boxGeometry args={[1.2, 0.32, 0.03]} />
      </mesh>
      {/* drawer block */}
      <RoundedBox args={[0.42, 0.5, 0.58]} radius={0.02} position={[0.44, 0.44, 0]} material={material} castShadow />
      {[0.6, 0.42, 0.24].map((y, i) => (
        <mesh key={i} position={[0.44, y, 0.3]} material={legMat}>
          <boxGeometry args={[0.16, 0.02, 0.02]} />
        </mesh>
      ))}
    </group>
  );
}
