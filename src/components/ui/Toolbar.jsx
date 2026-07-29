// RoomCraft 3D — bottom toolbar: reset the room to its default layout, confirm
// the (auto-saved) layout, and toggle render quality. Layout is persisted to
// localStorage automatically by the store; "Save" just gives visible feedback.
import { useState } from 'react';
import { useSceneStore } from '../../store/useSceneStore.js';

export default function Toolbar() {
  const cameraMode = useSceneStore((s) => s.cameraMode);
  const resetRoom = useSceneStore((s) => s.resetRoom);
  const quality = useSceneStore((s) => s.quality);
  const setQuality = useSceneStore((s) => s.setQuality);
  const [saved, setSaved] = useState(false);

  if (cameraMode === 'walk') return null;

  const onSave = () => {
    // Persistence is automatic (zustand persist); flash confirmation.
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  return (
    <div className="toolbar glass">
      <button className="pill-btn" onClick={resetRoom} title="Restore this room's default layout">↺ Reset</button>
      <button className="pill-btn btn--primary" onClick={onSave} style={{ color: '#1a140e' }}>
        {saved ? '✓ Saved' : '💾 Save layout'}
      </button>
      <button
        className="pill-btn"
        data-active={quality === 'high'}
        onClick={() => setQuality(quality === 'high' ? 'low' : 'high')}
        title="Toggle render quality (effects, shadow resolution)"
      >
        {quality === 'high' ? '✦ Quality: High' : '◦ Quality: Lite'}
      </button>
    </div>
  );
}
