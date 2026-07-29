import { RoundedBox } from '@react-three/drei';
import { Legs, Cushion } from './parts.jsx';

// Armchair — footprint ~0.95 × 0.95.
export default function Armchair({ material }) {
  return (
    <group>
      <RoundedBox args={[0.86, 0.3, 0.82]} radius={0.05} position={[0, 0.3, 0]} material={material} castShadow receiveShadow />
      <RoundedBox args={[0.86, 0.5, 0.14]} radius={0.05} position={[0, 0.58, -0.34]} material={material} castShadow />
      <RoundedBox args={[0.16, 0.4, 0.82]} radius={0.06} position={[0.44, 0.5, 0]} material={material} castShadow />
      <RoundedBox args={[0.16, 0.4, 0.82]} radius={0.06} position={[-0.44, 0.5, 0]} material={material} castShadow />
      <Cushion position={[0, 0.5, 0.04]} size={[0.66, 0.16, 0.66]} material={material} />
      <Cushion position={[0, 0.74, -0.26]} size={[0.66, 0.32, 0.14]} material={material} radius={0.05} />
      <Legs w={0.8} d={0.72} h={0.16} r={0.026} inset={0.1} />
    </group>
  );
}
