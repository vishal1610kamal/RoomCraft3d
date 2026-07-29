// RoomCraft 3D — parametric room shell
//
// Builds floor + two walls + skirting + a real window from a room def
// (data/rooms.js). Two solid walls (-x, -z) form a "dollhouse" diorama an orbit
// camera can look into.
//
// The window is a genuine opening, not a glowing decal: the wall is built from
// four segments around a hole (below / above / left / right of the glass). That
// matters because a `<SunShaft>` light sits outside the wall aiming in, so the
// solid wall segments block it and light only reaches the room *through the
// hole* — casting a real, correctly-shaped sun patch on the floor that moves
// with the geometry. Draw the curtains and they occlude that same light, so the
// patch fades and every shadow in the room softens. None of that is scripted;
// it falls out of the shadow map.

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSurface } from '../three/materials.js';
import { useSceneStore } from '../store/useSceneStore.js';
import Curtains from '../components/environment/Curtains.jsx';

const T = 0.12; // wall thickness

/**
 * Split a wall of length L and height H into the four solid segments that
 * surround a window hole. Coordinates are wall-local: u along the wall, y up.
 */
function wallSegments(L, H, win) {
  if (!win) return [{ u: 0, y: H / 2, w: L, h: H }];
  const u0 = win.u - win.w / 2;
  const u1 = win.u + win.w / 2;
  const y0 = win.sill;
  const y1 = win.sill + win.h;
  const segs = [];
  // below the window (full width)
  if (y0 > 0) segs.push({ u: 0, y: y0 / 2, w: L, h: y0 });
  // above the window (full width)
  if (y1 < H) segs.push({ u: 0, y: (y1 + H) / 2, w: L, h: H - y1 });
  // left of the window
  const leftW = u0 - -L / 2;
  if (leftW > 0.001) segs.push({ u: (-L / 2 + u0) / 2, y: (y0 + y1) / 2, w: leftW, h: y1 - y0 });
  // right of the window
  const rightW = L / 2 - u1;
  if (rightW > 0.001) segs.push({ u: (u1 + L / 2) / 2, y: (y0 + y1) / 2, w: rightW, h: y1 - y0 });
  return segs;
}

// Glass: barely-there during the day (you see the sky through the hole), with a
// cool moonlit tint after dark so the opening still reads at night.
function Glass({ w, h }) {
  const ref = useRef();
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const target = timeOfDay === 'day'
    ? { color: new THREE.Color('#dcecff'), opacity: 0.12, emissive: 0.05 }
    : { color: new THREE.Color('#31456b'), opacity: 0.4, emissive: 0.5 };
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    const a = 1 - Math.exp(-3 * Math.min(dt, 0.05));
    m.color.lerp(target.color, a);
    m.emissive.lerp(target.color, a);
    m.opacity = THREE.MathUtils.lerp(m.opacity, target.opacity, a);
    m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, target.emissive, a);
  });
  return (
    <mesh>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial
        ref={ref}
        color="#dcecff"
        emissive="#dcecff"
        emissiveIntensity={0.05}
        transparent
        opacity={0.12}
        roughness={0.05}
        metalness={0}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// Frame + mullions around the opening. Local frame: XY plane, facing +z.
function WindowFrame({ w, h }) {
  const frame = getSurface('plaster', '#efe9df', { roughness: 0.6 });
  const b = 0.08;
  const bars = [
    [0, h / 2, w + b * 2, b],
    [0, -h / 2, w + b * 2, b],
    [-w / 2, 0, b, h],
    [w / 2, 0, b, h],
    [0, 0, b * 0.55, h],
    [0, 0, w, b * 0.55],
  ];
  return (
    <group>
      {bars.map(([x, y, fw, fh], i) => (
        <mesh key={i} position={[x, y, 0]} material={frame} castShadow receiveShadow>
          <boxGeometry args={[fw, fh, T * 1.2]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * A directional light placed OUTSIDE the window, aimed into the room. The wall
 * segments occlude it, so it only gets in through the opening. Its shadow
 * camera is fitted tightly to the room, which is what makes the sun patch
 * crisp. Fades out at night.
 */
function SunShaft({ room, win, quality }) {
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const lightRef = useRef();
  // The light needs a target Object3D that actually lives in the scene, so its
  // world matrix updates and the light knows which way to point.
  const target = useMemo(() => new THREE.Object3D(), []);
  const { w, d } = room.dims;

  // Sit the sun outside the window and aim it down through the opening at a
  // steep enough angle that the shaft lands as a clear bright patch on the
  // floor a couple of metres inside — a shallow, near-horizontal angle throws
  // the patch to the far wall where it reads as nothing.
  const isBack = win.wall === 'back';
  const up = win.sill + win.h + 1.8;
  const pos = isBack
    ? [win.worldU + 1.2, up, -d / 2 - 2.6]
    : [-w / 2 - 2.6, up, win.worldU + 1.2];
  const aim = isBack
    ? [win.worldU - 0.8, 0, -d / 2 + 2.2]
    : [-w / 2 + 2.2, 0, win.worldU - 0.8];

  const targetIntensity = timeOfDay === 'day' ? 4.6 : 0.08;
  useFrame((_, dt) => {
    const l = lightRef.current;
    if (!l) return;
    l.intensity = THREE.MathUtils.damp(l.intensity, targetIntensity, 3, Math.min(dt, 0.05));
  });

  const extent = 0.5 * Math.hypot(w, d) + 1.5;
  return (
    <>
      <primitive object={target} position={aim} />
      <directionalLight
        ref={lightRef}
        position={pos}
        target={target}
        intensity={0.01}
        color="#ffe9c2"
        castShadow
        shadow-mapSize={quality === 'high' ? [2048, 2048] : [1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={22}
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
    </>
  );
}

export default function RoomShell({ room }) {
  const { dims, palette, windows = [] } = room;
  const { w, d, h } = dims;
  const quality = useSceneStore((s) => s.quality);

  const floorMat = getSurface(palette.floor.texture, palette.floor.color, {
    repeat: palette.floor.repeat,
    roughness: palette.floor.roughness,
    bump: palette.floor.bump,
    size: 512,
  });
  const wallMat = getSurface(palette.wall.texture, palette.wall.color, { roughness: 0.9, repeat: [2, 1] });
  const trimMat = getSurface('plaster', palette.trim.color, { roughness: 0.6 });

  // Normalise each window into wall-local coordinates.
  const walls = useMemo(() => {
    const backWin = windows.find((x) => x.wall === 'back');
    const leftWin = windows.find((x) => x.wall === 'left');
    return {
      back: backWin ? { ...backWin, u: backWin.offset, worldU: backWin.offset } : null,
      // Local +X maps to world -Z once the wall group is rotated 90° about Y,
      // so a window authored at world z = offset lives at local u = -offset.
      left: leftWin ? { ...leftWin, u: -leftWin.offset, worldU: leftWin.offset } : null,
    };
  }, [windows]);

  const primary = walls.back || walls.left;

  const renderWall = (win, L) => (
    <>
      {wallSegments(L, h, win).map((s, i) => (
        <mesh key={i} position={[s.u, s.y, 0]} material={wallMat} castShadow receiveShadow>
          <boxGeometry args={[s.w, s.h, T]} />
        </mesh>
      ))}
      {win && (
        <group position={[win.u, win.sill + win.h / 2, 0]}>
          <WindowFrame w={win.w} h={win.h} />
          <Glass w={win.w} h={win.h} />
          <Curtains width={win.w} height={win.h} />
        </group>
      )}
    </>
  );

  return (
    <group>
      {/* floor */}
      <mesh position={[0, -0.05, 0]} receiveShadow material={floorMat}>
        <boxGeometry args={[w, 0.1, d]} />
      </mesh>

      {/* back wall (-z), built around its window opening */}
      <group position={[0, 0, -d / 2 - T / 2]}>{renderWall(walls.back, w)}</group>

      {/* left wall (-x) — rotated so local +X runs along world -Z */}
      <group position={[-w / 2 - T / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {renderWall(walls.left, d)}
      </group>

      {/* skirting boards */}
      <mesh position={[0, 0.05, -d / 2 + 0.01]} material={trimMat} receiveShadow>
        <boxGeometry args={[w, 0.1, 0.04]} />
      </mesh>
      <mesh position={[-w / 2 + 0.01, 0.05, 0]} material={trimMat} receiveShadow>
        <boxGeometry args={[0.04, 0.1, d]} />
      </mesh>

      {primary && <SunShaft room={room} win={primary} quality={quality} />}
    </group>
  );
}
