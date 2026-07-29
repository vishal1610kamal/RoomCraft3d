// RoomCraft 3D — orbit / walk camera mode toggle.
import { useSceneStore } from '../../store/useSceneStore.js';

export default function CameraModeToggle() {
  const cameraMode = useSceneStore((s) => s.cameraMode);
  const toggle = useSceneStore((s) => s.toggleCameraMode);
  const walk = cameraMode === 'walk';
  return (
    <button
      className="pill-btn"
      data-active={walk}
      onClick={toggle}
      title={walk ? 'Switch to orbit view' : 'Walk through the room (first person)'}
    >
      <span style={{ fontSize: '1.1rem' }}>{walk ? '🚶' : '🧭'}</span>
      {walk ? 'Walking' : 'Orbit'}
    </button>
  );
}
