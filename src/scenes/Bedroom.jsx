// RoomCraft 3D — Bedroom scene (lazy-loaded / code-split)
import { MeshReflectorMaterial } from '@react-three/drei';
import RoomShell from './RoomShell.jsx';
import { roomDef } from '../data/rooms.js';
import { getAccent } from '../three/materials.js';
import { useSceneStore } from '../store/useSceneStore.js';

const room = roomDef('bedroom');

// A genuine planar mirror. MeshReflectorMaterial re-renders the room each frame
// from the mirrored camera into a texture, so anything you move in front of it
// — furniture, the lamp's glow, yourself in walk mode — actually appears in the
// reflection. (The previous version was a polished metal disc relying on the
// environment map, which reflected only the procedural IBL and read as a flat
// black hole in a dark room.)
//
// It costs one extra scene render per frame, so resolution drops on the Lite
// profile. A little blur + a low `mixStrength` keeps it reading as domestic
// glass rather than a perfect chrome portal.
function Mirror() {
  const quality = useSceneStore((s) => s.quality);
  const frame = getAccent('brassAccent');
  return (
    <group position={[1.5, 1.7, -room.dims.d / 2 + 0.06]}>
      <mesh material={frame} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.05, 40]} />
      </mesh>
      <mesh position={[0, 0, 0.032]}>
        <circleGeometry args={[0.46, 48]} />
        {/* NOTE: no depthScale / minDepthThreshold / maxDepthThreshold here.
            Those enable depth-aware blending, which needs a depth pass this
            scene does not provide (the composer runs with disableNormalPass),
            and the material resolves to solid black — it looks exactly like a
            broken reflection. Plain mirror + a light tint is both correct and
            cheaper. */}
        <MeshReflectorMaterial
          resolution={quality === 'high' ? 512 : 256}
          blur={quality === 'high' ? [90, 30] : [0, 0]}
          mixBlur={0.35}
          mixStrength={1}
          mirror={0.96}
          color="#eef2f7"
          metalness={0}
          roughness={0.08}
        />
      </mesh>
    </group>
  );
}

export default function Bedroom() {
  return (
    <group>
      <RoomShell room={room} />
      <Mirror />
    </group>
  );
}
