// RoomCraft 3D — curtain open/close toggle.
// Closing the curtains physically occludes the window sunlight, so the sun
// patch on the floor fades and the room's shadows soften in real time.
import { useSceneStore } from '../../store/useSceneStore.js';

export default function CurtainToggle() {
  const open = useSceneStore((s) => s.curtainsOpen);
  const toggle = useSceneStore((s) => s.toggleCurtains);
  return (
    <button
      className="pill-btn"
      data-active={!open}
      onClick={toggle}
      title={open ? 'Draw the curtains (blocks the sunlight)' : 'Open the curtains (lets the sunlight in)'}
    >
      <span style={{ fontSize: '1.05rem' }}>{open ? '🪟' : '🎦'}</span>
      {open ? 'Curtains open' : 'Curtains drawn'}
    </button>
  );
}
