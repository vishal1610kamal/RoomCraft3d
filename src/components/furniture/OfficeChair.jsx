import { RoundedBox } from '@react-three/drei';
import { getAccent } from '../../three/materials.js';

// Office chair — swivel base + gas lift + seat + back. ~0.65 footprint, ~1.15 tall.
export default function OfficeChair({ material }) {
  const metal = getAccent('darkMetal');
  return (
    <group>
      {/* star base spokes */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.16, 0.05, Math.sin(a) * 0.16]} rotation={[0, -a, 0]} material={metal} castShadow>
            <boxGeometry args={[0.34, 0.05, 0.06]} />
          </mesh>
        );
      })}
      {/* casters */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.3, 0.03, Math.sin(a) * 0.3]} material={metal} castShadow>
            <sphereGeometry args={[0.035, 10, 10]} />
          </mesh>
        );
      })}
      {/* gas lift */}
      <mesh position={[0, 0.28, 0]} material={metal} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 12]} />
      </mesh>
      {/* seat */}
      <RoundedBox args={[0.5, 0.1, 0.5]} radius={0.04} position={[0, 0.5, 0]} material={material} castShadow />
      {/* backrest */}
      <RoundedBox args={[0.48, 0.55, 0.09]} radius={0.05} position={[0, 0.82, -0.24]} material={material} castShadow />
    </group>
  );
}
