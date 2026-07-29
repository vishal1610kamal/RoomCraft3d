// RoomCraft 3D — first-person walk mode.
// Pointer-lock look + WASD movement at eye height. Movement is clamped to the
// room's interior (so you can't walk through walls) and pushed out of each
// piece of furniture's footprint circle (so you can't walk through the sofa).
// This is deliberately simple geometry, not a physics engine — collision is an
// explicit non-goal, but "don't clip through things" is part of camera polish.

import { useEffect, useRef } from 'react';
import { PointerLockControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore, useActiveItems } from '../../store/useSceneStore.js';
import { roomDef } from '../../data/rooms.js';
import { catalogItem } from '../../data/catalog.js';

const EYE = 1.6;
const SPEED = 2.6;
const RUN = 4.4;
const BODY = 0.32; // player radius

export default function WalkControls({ keys }) {
  const camera = useThree((s) => s.camera);
  const activeRoom = useSceneStore((s) => s.activeRoom);
  const setCameraMode = useSceneStore((s) => s.setCameraMode);
  const items = useActiveItems();
  const room = roomDef(activeRoom);
  const controls = useRef();
  const vel = useRef(new THREE.Vector3());

  // Drop the camera into the room at eye height when walk mode starts.
  useEffect(() => {
    camera.position.set(0, EYE, room.dims.d / 2 - 0.9);
    camera.lookAt(0, EYE, -1);
  }, [camera, activeRoom, room.dims.d]);

  // Esc releases pointer lock; once the user has actually *had* the lock,
  // losing it returns them to orbit so they are never stuck in a mode with no
  // visible controls. We require a prior successful lock first — otherwise a
  // browser that refuses the lock request would bounce straight back out of
  // walk mode, and WASD would never get a chance to work.
  const hadLock = useRef(false);
  useEffect(() => {
    const onLockChange = () => {
      if (document.pointerLockElement) {
        hadLock.current = true;
        return;
      }
      if (!hadLock.current) return;
      setTimeout(() => {
        if (!document.pointerLockElement && useSceneStore.getState().cameraMode === 'walk') {
          setCameraMode('orbit');
        }
      }, 120);
    };
    document.addEventListener('pointerlockchange', onLockChange);
    return () => document.removeEventListener('pointerlockchange', onLockChange);
  }, [setCameraMode]);

  // Solid footprints to push out of (rugs are walkable).
  const blockers = items
    .filter((it) => {
      const def = catalogItem(it.type);
      return def && !def.flat;
    })
    .map((it) => {
      const def = catalogItem(it.type);
      return { x: it.position[0], z: it.position[2], r: Math.max(def.size[0], def.size[2]) * 0.42 };
    });

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const k = keys.current;
    const dir = vel.current.set(0, 0, 0);
    if (k.forward) dir.z -= 1;
    if (k.back) dir.z += 1;
    if (k.left) dir.x -= 1;
    if (k.right) dir.x += 1;
    if (dir.lengthSq() === 0) return;

    dir.normalize().multiplyScalar((k.run ? RUN : SPEED) * d);
    // Move relative to where the camera is looking (ignoring pitch).
    const yaw = new THREE.Euler(0, camera.rotation.y, 0, 'YXZ');
    dir.applyEuler(yaw);

    let nx = camera.position.x + dir.x;
    let nz = camera.position.z + dir.z;

    // Keep inside the walls.
    const hx = room.dims.w / 2 - BODY;
    const hz = room.dims.d / 2 - BODY;
    nx = THREE.MathUtils.clamp(nx, -hx, hx);
    nz = THREE.MathUtils.clamp(nz, -hz, hz);

    // Push out of furniture footprints.
    for (const b of blockers) {
      const dx = nx - b.x;
      const dz = nz - b.z;
      const min = b.r + BODY;
      const dist = Math.hypot(dx, dz);
      if (dist < min && dist > 1e-4) {
        nx = b.x + (dx / dist) * min;
        nz = b.z + (dz / dist) * min;
      }
    }

    camera.position.set(nx, EYE, nz);
  });

  // Default behaviour: clicking the canvas engages pointer lock.
  return <PointerLockControls ref={controls} makeDefault />;
}
