// RoomCraft 3D — Home Office scene (lazy-loaded / code-split)
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import RoomShell from './RoomShell.jsx';
import { roomDef } from '../data/rooms.js';
import { getAccent } from '../three/materials.js';

const room = roomDef('office');

// A working wall clock, driven by the viewer's own system time. Hands are
// rotated every frame from Date(), so it always shows the real local time and
// the second hand sweeps continuously (sub-second precision via getMilliseconds,
// which is what makes it glide rather than tick in steps).
//
// Rotation convention: each hand's pivot is at the clock centre and the hand
// geometry points "up" (+Y) at rotation 0, i.e. 12 o'clock. Clock hands run
// clockwise, which is negative rotation about +Z when the face looks down +Z.
function ClockHands() {
  const hourRef = useRef();
  const minRef = useRef();
  const secRef = useRef();

  useFrame(() => {
    const now = new Date();
    const ms = now.getMilliseconds() / 1000;
    const sec = now.getSeconds() + ms;
    const min = now.getMinutes() + sec / 60;
    const hr = (now.getHours() % 12) + min / 60;

    if (secRef.current) secRef.current.rotation.z = -(sec / 60) * Math.PI * 2;
    if (minRef.current) minRef.current.rotation.z = -(min / 60) * Math.PI * 2;
    if (hourRef.current) hourRef.current.rotation.z = -(hr / 12) * Math.PI * 2;
  });

  const dark = getAccent('blackMetal');
  return (
    <group position={[0, 0, 0.05]}>
      {/* hour hand — pivot at centre, geometry offset so it extends upward */}
      <group ref={hourRef}>
        <mesh position={[0, 0.055, 0]} material={dark} castShadow>
          <boxGeometry args={[0.022, 0.11, 0.008]} />
        </mesh>
      </group>
      {/* minute hand */}
      <group ref={minRef}>
        <mesh position={[0, 0.08, 0.004]} material={dark} castShadow>
          <boxGeometry args={[0.016, 0.16, 0.008]} />
        </mesh>
      </group>
      {/* second hand */}
      <group ref={secRef}>
        <mesh position={[0, 0.085, 0.009]}>
          <boxGeometry args={[0.007, 0.175, 0.006]} />
          <meshStandardMaterial color="#c0442f" roughness={0.5} />
        </mesh>
      </group>
      {/* centre cap */}
      <mesh position={[0, 0, 0.014]} material={dark}>
        <cylinderGeometry args={[0.016, 0.016, 0.012, 12]} />
      </mesh>
    </group>
  );
}

function WallClock() {
  const rim = getAccent('darkMetal');
  const tick = getAccent('blackMetal');
  return (
    <group position={[1.7, 1.9, -room.dims.d / 2 + 0.08]}>
      {/* rim */}
      <mesh material={rim} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.05, 36]} />
      </mesh>
      {/* face */}
      <mesh position={[0, 0, 0.03]} receiveShadow>
        <circleGeometry args={[0.25, 36]} />
        <meshStandardMaterial color="#f3f1ea" roughness={0.65} />
      </mesh>
      {/* hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r = 0.21;
        const major = i % 3 === 0;
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * r, Math.cos(a) * r, 0.04]}
            rotation={[0, 0, -a]}
            material={tick}
          >
            <boxGeometry args={[major ? 0.016 : 0.008, major ? 0.045 : 0.025, 0.006]} />
          </mesh>
        );
      })}
      <ClockHands />
    </group>
  );
}

export default function HomeOffice() {
  return (
    <group>
      <RoomShell room={room} />
      <WallClock />
    </group>
  );
}
