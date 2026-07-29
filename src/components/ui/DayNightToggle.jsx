// RoomCraft 3D — day/night toggle (animated sun/moon switch).
import { useSceneStore } from '../../store/useSceneStore.js';

export default function DayNightToggle() {
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const toggle = useSceneStore((s) => s.toggleTimeOfDay);
  return (
    <button
      className="daynight"
      data-mode={timeOfDay}
      onClick={toggle}
      aria-label={`Switch to ${timeOfDay === 'day' ? 'night' : 'day'}`}
      title="Toggle day / night"
    >
      <span className="knob">{timeOfDay === 'day' ? '☀️' : '🌙'}</span>
    </button>
  );
}
