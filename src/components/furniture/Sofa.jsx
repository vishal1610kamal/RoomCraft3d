import { RoundedBox } from '@react-three/drei';
import { Legs, Cushion } from './parts.jsx';

// Sofa — footprint ~2.1 × 0.95, seat faces +z.
export default function Sofa({ material }) {
  return (
    <group>
      {/* frame / base */}
      <RoundedBox args={[2.0, 0.32, 0.9]} radius={0.05} position={[0, 0.28, 0]} material={material} castShadow receiveShadow />
      {/* backrest */}
      <RoundedBox args={[2.0, 0.5, 0.16]} radius={0.05} position={[0, 0.56, -0.37]} material={material} castShadow />
      {/* arms */}
      <RoundedBox args={[0.2, 0.42, 0.9]} radius={0.06} position={[0.9, 0.5, 0]} material={material} castShadow />
      <RoundedBox args={[0.2, 0.42, 0.9]} radius={0.06} position={[-0.9, 0.5, 0]} material={material} castShadow />
      {/* seat cushions */}
      <Cushion position={[-0.42, 0.5, 0.03]} size={[0.74, 0.18, 0.72]} material={material} />
      <Cushion position={[0.42, 0.5, 0.03]} size={[0.74, 0.18, 0.72]} material={material} />
      {/* back cushions */}
      <Cushion position={[-0.42, 0.72, -0.28]} size={[0.74, 0.34, 0.16]} material={material} radius={0.05} />
      <Cushion position={[0.42, 0.72, -0.28]} size={[0.74, 0.34, 0.16]} material={material} radius={0.05} />
      <Legs w={1.9} d={0.8} h={0.14} r={0.028} inset={0.12} />
    </group>
  );
}
