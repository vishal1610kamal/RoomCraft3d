import { RoundedBox } from '@react-three/drei';
import { Legs } from './parts.jsx';
import { getAccent } from '../../three/materials.js';

// Nightstand — footprint ~0.5 × 0.4, ~0.5 tall.
export default function Nightstand({ material }) {
  const knob = getAccent('brassAccent');
  return (
    <group>
      <RoundedBox args={[0.5, 0.4, 0.4]} radius={0.02} position={[0, 0.34, 0]} material={material} castShadow receiveShadow />
      {/* drawer face */}
      <mesh position={[0, 0.4, 0.205]} material={material} castShadow>
        <boxGeometry args={[0.44, 0.14, 0.02]} />
      </mesh>
      <mesh position={[0, 0.4, 0.22]} material={knob}>
        <sphereGeometry args={[0.02, 12, 12]} />
      </mesh>
      <Legs w={0.42} d={0.32} h={0.16} r={0.02} inset={0.06} />
    </group>
  );
}
