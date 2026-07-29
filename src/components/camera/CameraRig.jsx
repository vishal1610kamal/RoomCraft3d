// RoomCraft 3D — camera rig
// Orbit mode: damped OrbitControls with limits that keep the camera above the
// floor and inside a sane distance band. Switching rooms — or returning from
// walk mode — flies the camera to that room's authored framing instead of
// snapping. Walk mode swaps in first-person controls.
//
// The fly-to is driven by R3F's own useFrame loop (frame-rate-independent
// exponential damping) rather than a second animation library's ticker. A
// separate ticker can desync from — or stall independently of — the render
// loop (e.g. it stops in a backgrounded tab while the scene keeps its own
// state), which left the camera stranded mid-transition. One loop, one source
// of truth.
//
// OrbitControls is `makeDefault` so drei's TransformControls automatically
// suspends orbiting while a furniture gizmo is being dragged.

import { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../../store/useSceneStore.js';
import { roomDef } from '../../data/rooms.js';
import { useKeys } from '../../hooks/useKeys.js';
import WalkControls from './WalkControls.jsx';

const EPS = 0.02;

export default function CameraRig() {
  const activeRoom = useSceneStore((s) => s.activeRoom);
  const cameraMode = useSceneStore((s) => s.cameraMode);
  const camera = useThree((s) => s.camera);
  const room = roomDef(activeRoom);
  const controls = useRef();
  const walk = cameraMode === 'walk';
  const keys = useKeys(walk);

  // Desired framing + whether we're currently flying to it.
  const goal = useRef({
    pos: new THREE.Vector3(...room.camera.position),
    target: new THREE.Vector3(...room.camera.target),
    flying: false,
  });

  // Request a fly-to whenever the room changes or we come back from walk mode.
  useEffect(() => {
    if (walk) return;
    goal.current.pos.set(...room.camera.position);
    goal.current.target.set(...room.camera.target);
    goal.current.flying = true;
  }, [activeRoom, walk, room.camera.position, room.camera.target]);

  // Any manual interaction cancels the fly-to so we never fight the user.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const cancel = () => {
      goal.current.flying = false;
    };
    c.addEventListener('start', cancel);
    return () => c.removeEventListener('start', cancel);
  }, [walk]);

  useFrame((_, dt) => {
    const g = goal.current;
    if (!g.flying || walk) return;
    const c = controls.current;
    const d = Math.min(dt, 0.05);
    // lambda ~3.2 → a little under a second to settle, ease-out feel.
    const k = 3.2;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, g.pos.x, k, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, g.pos.y, k, d);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, g.pos.z, k, d);
    if (c) {
      c.target.x = THREE.MathUtils.damp(c.target.x, g.target.x, k, d);
      c.target.y = THREE.MathUtils.damp(c.target.y, g.target.y, k, d);
      c.target.z = THREE.MathUtils.damp(c.target.z, g.target.z, k, d);
      c.update();
    }
    if (camera.position.distanceTo(g.pos) < EPS && (!c || c.target.distanceTo(g.target) < EPS)) {
      camera.position.copy(g.pos);
      if (c) {
        c.target.copy(g.target);
        c.update();
      }
      g.flying = false;
    }
  });

  if (walk) return <WalkControls keys={keys} />;

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={2.2}
      maxDistance={14}
      maxPolarAngle={Math.PI * 0.495}
      minPolarAngle={0.12}
      enablePan
      panSpeed={0.6}
      zoomSpeed={0.8}
      rotateSpeed={0.7}
    />
  );
}
