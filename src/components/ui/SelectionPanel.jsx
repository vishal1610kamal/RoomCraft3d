// RoomCraft 3D — selection panel (right dock). Appears when a piece is selected
// in orbit mode: swap its material, switch the gizmo between move/rotate, nudge
// its rotation, duplicate, or delete it.
import { useSceneStore, useSelectedItem } from '../../store/useSceneStore.js';
import { catalogItem } from '../../data/catalog.js';
import MaterialPicker from './MaterialPicker.jsx';

export default function SelectionPanel() {
  const item = useSelectedItem();
  const cameraMode = useSceneStore((s) => s.cameraMode);
  const transformMode = useSceneStore((s) => s.transformMode);
  const setTransformMode = useSceneStore((s) => s.setTransformMode);
  const rotateSelected = useSceneStore((s) => s.rotateSelected);
  const duplicateSelected = useSceneStore((s) => s.duplicateSelected);
  const removeSelected = useSceneStore((s) => s.removeSelected);
  const clearSelection = useSceneStore((s) => s.clearSelection);

  if (!item || cameraMode === 'walk') return null;
  const def = catalogItem(item.type);

  return (
    <aside className="dock-right glass">
      <div className="panel-title">
        <span className="emoji">{def?.icon}</span>
        {def?.label}
        <button className="icon-btn" style={{ marginLeft: 'auto', width: 30, height: 30, fontSize: '0.9rem' }} onClick={clearSelection} title="Deselect">✕</button>
      </div>

      <MaterialPicker item={item} />

      <div>
        <div className="panel-sub">Transform</div>
        <div className="segmented glass" style={{ width: '100%' }}>
          <button className="seg-btn" style={{ flex: 1, justifyContent: 'center' }} data-active={transformMode === 'translate'} onClick={() => setTransformMode('translate')}>✥ Move</button>
          <button className="seg-btn" style={{ flex: 1, justifyContent: 'center' }} data-active={transformMode === 'rotate'} onClick={() => setTransformMode('rotate')}>↻ Rotate</button>
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn" onClick={() => rotateSelected(-15)} title="Rotate left">⟲ 15°</button>
          <button className="btn" onClick={() => rotateSelected(15)} title="Rotate right">15° ⟳</button>
        </div>
      </div>

      <div className="row">
        <button className="btn" onClick={duplicateSelected}>⧉ Duplicate</button>
        <button className="btn btn--danger" onClick={removeSelected}>🗑 Delete</button>
      </div>
    </aside>
  );
}
