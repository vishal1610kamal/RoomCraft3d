import { RoundedBox } from '@react-three/drei';
import { getAccent } from '../../three/materials.js';

// Wardrobe — footprint ~1.4 × 0.6, ~2.0 tall. Two doors.
export default function Wardrobe({ material }) {
  const handle = getAccent('brassAccent');
  return (
    <group>
      {/* carcass */}
      <RoundedBox args={[1.4, 2.0, 0.6]} radius={0.02} position={[0, 1.0, 0]} material={material} castShadow receiveShadow />
      {/* door split + panels */}
      {[-0.35, 0.35].map((x, i) => (
        <mesh key={i} position={[x, 1.0, 0.31]} material={material} castShadow>
          <boxGeometry args={[0.66, 1.9, 0.02]} />
        </mesh>
      ))}
      {/* handles */}
      {[-0.05, 0.05].map((x, i) => (
        <mesh key={i} position={[x, 1.0, 0.34]} material={handle} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.3, 10]} />
        </mesh>
      ))}
      {/* plinth */}
      <mesh position={[0, 0.05, 0.0]} material={getAccent('darkMetal')}>
        <boxGeometry args={[1.36, 0.1, 0.58]} />
      </mesh>
    </group>
  );
}
