import { RoundedBox } from '@react-three/drei';
import { getAccent } from '../../three/materials.js';

// Bed — footprint ~1.8 × 2.1. Headboard at -z. Frame uses swap material,
// mattress + duvet + pillows use soft off-white bedding accents.
export default function Bed({ material }) {
  const bedding = { color: '#eae3d6', roughness: 0.9, metalness: 0 };
  const pillow = { color: '#f3eee4', roughness: 0.85 };
  return (
    <group>
      {/* frame base */}
      <RoundedBox args={[1.8, 0.28, 2.1]} radius={0.03} position={[0, 0.2, 0]} material={material} castShadow receiveShadow />
      {/* headboard */}
      <RoundedBox args={[1.8, 0.7, 0.12]} radius={0.04} position={[0, 0.5, -1.05]} material={material} castShadow />
      {/* mattress */}
      <RoundedBox args={[1.66, 0.2, 1.9]} radius={0.06} position={[0, 0.44, 0.04]} castShadow>
        <meshStandardMaterial {...bedding} />
      </RoundedBox>
      {/* duvet */}
      <RoundedBox args={[1.68, 0.12, 1.2]} radius={0.06} position={[0, 0.54, 0.35]} castShadow>
        <meshStandardMaterial color="#d9cdb8" roughness={0.92} />
      </RoundedBox>
      {/* pillows */}
      {[-0.4, 0.4].map((x, i) => (
        <RoundedBox key={i} args={[0.66, 0.16, 0.42]} radius={0.08} position={[x, 0.6, -0.72]} rotation={[0.1, 0, 0]} castShadow>
          <meshStandardMaterial {...pillow} />
        </RoundedBox>
      ))}
    </group>
  );
}
