// RoomCraft 3D — Living Room scene (lazy-loaded / code-split)
import RoomShell from './RoomShell.jsx';
import { roomDef } from '../data/rooms.js';
import { getSurface, getAccent } from '../three/materials.js';

const room = roomDef('living');

export default function LivingRoom() {
  const canvas = getSurface('fabric', '#b98a57', { roughness: 0.9, repeat: [1, 1] });
  const frame = getAccent('darkMetal');
  const { w, d } = room.dims;
  return (
    <group>
      <RoomShell room={room} />
      {/* framed art on the back wall */}
      <group position={[-1.6, 1.7, -d / 2 + 0.04]}>
        <mesh material={frame} castShadow>
          <boxGeometry args={[1.06, 1.36, 0.05]} />
        </mesh>
        <mesh position={[0, 0, 0.031]} material={canvas}>
          <planeGeometry args={[0.92, 1.22]} />
        </mesh>
      </group>
    </group>
  );
}
