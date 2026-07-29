import { Suspense, useCallback, useState } from 'react';
import { TransformControls } from '@react-three/drei';
import { useFurnitureLoader } from '../../hooks/useFurnitureLoader.js';
import { useMaterialSwap } from '../../hooks/useMaterialSwap.js';
import { useSceneStore, resolvePlacement } from '../../store/useSceneStore.js';

// A single placed furniture item: positions it, applies the swappable material,
// handles click-to-select, and — when selected in orbit mode — attaches a
// TransformControls gizmo to move (XZ) or rotate (Y) it. The gizmo mutates the
// live Object3D during the gesture; we only commit back to the store on release,
// so the store stays out of the per-frame path. A glowing floor ring marks the
// current selection (postprocessing Bloom makes it pop).
export default function FurniturePiece({ item }) {
  const { Component, def } = useFurnitureLoader(item.type);
  const { material } = useMaterialSwap(item);
  const selected = useSceneStore((s) => s.selectedId === item.id);
  const cameraMode = useSceneStore((s) => s.cameraMode);
  const transformMode = useSceneStore((s) => s.transformMode);
  const select = useSceneStore((s) => s.select);
  const updateItem = useSceneStore((s) => s.updateItem);
  const activeRoom = useSceneStore((s) => s.activeRoom);
  const [obj, setObj] = useState(null);

  const editable = cameraMode === 'orbit';

  const onClick = useCallback(
    (e) => {
      if (!editable) return;
      e.stopPropagation();
      select(item.id);
    },
    [editable, select, item.id],
  );

  const onOver = useCallback(
    (e) => {
      if (!editable) return;
      e.stopPropagation();
      document.body.style.cursor = 'pointer';
    },
    [editable],
  );
  const onOut = useCallback(() => {
    document.body.style.cursor = 'auto';
  }, []);

  // Commit the gizmo's live transform back to the store, pushed clear of the
  // walls and of any other piece. Writing the resolved position straight back
  // onto the live object means the gizmo visibly stops against its neighbour
  // instead of letting you bury a nightstand inside the bed.
  const commit = useCallback(() => {
    if (!obj) return;
    const rot = obj.rotation.y;
    const others = useSceneStore.getState().layouts[activeRoom];
    const pos = resolvePlacement(activeRoom, others, item.id, item.type, [obj.position.x, 0, obj.position.z], rot);
    obj.position.set(pos[0], 0, pos[2]);
    updateItem(item.id, { position: pos, rotation: rot });
  }, [obj, activeRoom, item.type, item.id, updateItem]);

  if (!Component) return null;
  const size = def?.size || [1, 1, 1];
  const ringR = Math.max(size[0], size[2]) / 2 + 0.12;

  return (
    <>
      <group
        ref={setObj}
        position={item.position}
        rotation={[0, item.rotation, 0]}
        onClick={onClick}
        onPointerOver={onOver}
        onPointerOut={onOut}
      >
        <Suspense fallback={null}>
          <Component material={material} def={def} />
        </Suspense>

        {selected && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
            <ringGeometry args={[ringR, ringR + 0.05, 56]} />
            <meshBasicMaterial color="#ffcf8f" transparent opacity={0.95} toneMapped={false} depthWrite={false} />
          </mesh>
        )}
      </group>

      {selected && editable && obj && (
        <TransformControls
          object={obj}
          mode={transformMode}
          showX={transformMode === 'translate'}
          showZ={transformMode === 'translate'}
          showY={transformMode === 'rotate'}
          size={0.75}
          translationSnap={0.1}
          rotationSnap={Math.PI / 24}
          onObjectChange={commit}
          onMouseUp={commit}
        />
      )}
    </>
  );
}
