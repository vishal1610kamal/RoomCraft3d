// RoomCraft 3D — 2D overlay UI root.
// All chrome lives here in HTML/CSS (glassmorphic), never in 3D space, per the
// brief. `.ui-root` is pointer-events:none so the 3D canvas stays interactive;
// individual panels re-enable pointer events.
import RoomSelector from './RoomSelector.jsx';
import DayNightToggle from './DayNightToggle.jsx';
import CurtainToggle from './CurtainToggle.jsx';
import CameraModeToggle from './CameraModeToggle.jsx';
import FurniturePicker from './FurniturePicker.jsx';
import SelectionPanel from './SelectionPanel.jsx';
import Toolbar from './Toolbar.jsx';
import { useSceneStore } from '../../store/useSceneStore.js';

function Hint() {
  return (
    <div className="hint glass">
      <b>Drag</b> to orbit · <b>scroll</b> to zoom · <b>click</b> a piece to select, then drag its gizmo to move. Add pieces from the left.
    </div>
  );
}

function WalkBanner() {
  return (
    <div className="walk-banner glass">
      <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move</span>
      <span>🖱 look around</span>
      <span><kbd>Esc</kbd> release cursor</span>
    </div>
  );
}

export default function Overlay() {
  const walk = useSceneStore((s) => s.cameraMode === 'walk');
  return (
    <div className="ui-root">
      <div className="topbar">
        <div className="brand glass">
          Room<b>Craft</b> <span>3D</span>
        </div>
        <div className="cluster">
          <RoomSelector />
          <DayNightToggle />
          <CurtainToggle />
          <CameraModeToggle />
        </div>
      </div>

      <FurniturePicker />
      <SelectionPanel />
      <Toolbar />
      {walk ? <WalkBanner /> : <Hint />}
    </div>
  );
}
