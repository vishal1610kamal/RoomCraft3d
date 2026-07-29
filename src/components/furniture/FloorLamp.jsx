import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getAccent } from '../../three/materials.js';
import { useSceneStore } from '../../store/useSceneStore.js';

// Floor lamp — footprint ~0.4, ~1.6 tall. The shade is emissive and the bulb
// drives a REAL shadow-casting point light, so the lamp genuinely lights the
// room: drag it next to the bed and the bed's shadow swings round with it, and
// every other piece is re-lit in real time. `material` is the swap material for
// the stem.
//
// Point-light shadows cost a 6-face cube render, so they are enabled only on
// the High quality profile — the Lite profile keeps the light, drops the
// shadow. Radius/bias are tuned for a ~1.5 m pool of light without acne.

export default function FloorLamp({ material }) {
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const quality = useSceneStore((s) => s.quality);
  const shadeRef = useRef();
  const lightRef = useRef();
  const target = timeOfDay === 'night' ? { emissive: 2.4, light: 7 } : { emissive: 0.35, light: 0.9 };

  useFrame((_, dt) => {
    const a = 1 - Math.exp(-3 * Math.min(dt, 0.05));
    if (shadeRef.current) {
      shadeRef.current.emissiveIntensity = THREE.MathUtils.lerp(shadeRef.current.emissiveIntensity, target.emissive, a);
    }
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, target.light, a);
    }
  });

  const base = getAccent('darkMetal');
  return (
    <group>
      {/* base */}
      <mesh position={[0, 0.02, 0]} material={base} castShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.04, 24]} />
      </mesh>
      {/* stem */}
      <mesh position={[0, 0.8, 0]} material={material} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 1.55, 16]} />
      </mesh>
      {/* shade */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.28, 24, 1, true]} />
        <meshStandardMaterial
          ref={shadeRef}
          color="#f3e7c9"
          emissive="#ffd9a0"
          emissiveIntensity={0.35}
          side={THREE.DoubleSide}
          roughness={0.7}
          toneMapped={false}
        />
      </mesh>
      {/* bulb glow disc (faces down toward the floor) */}
      <mesh position={[0, 1.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 20]} />
        <meshStandardMaterial color="#fff1cf" emissive="#ffe6b0" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 1.45, 0]}
        intensity={0.9}
        distance={7}
        decay={2}
        color="#ffcf8f"
        castShadow={quality === 'high'}
        shadow-mapSize={[512, 512]}
        shadow-camera-near={0.12}
        shadow-camera-far={7}
        shadow-bias={-0.005}
        shadow-normalBias={0.03}
      />
    </group>
  );
}
