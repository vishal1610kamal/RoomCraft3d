// RoomCraft 3D — furniture catalog (left dock). Click a piece to drop it into
// the current room; it spawns selected so you can immediately place/style it.
import { useSceneStore } from '../../store/useSceneStore.js';
import { catalogForRoom, CATEGORIES } from '../../data/catalog.js';
import { preloadFurniture } from '../../hooks/useFurnitureLoader.js';

export default function FurniturePicker() {
  const activeRoom = useSceneStore((s) => s.activeRoom);
  const cameraMode = useSceneStore((s) => s.cameraMode);
  const addItem = useSceneStore((s) => s.addItem);
  if (cameraMode === 'walk') return null;

  const items = catalogForRoom(activeRoom);
  const groups = CATEGORIES.map((cat) => ({
    ...cat,
    pieces: items.filter((it) => it.category === cat.id),
  })).filter((g) => g.pieces.length);

  return (
    <aside className="dock-left glass">
      <div className="dock-head">＋ Add furniture</div>
      <div className="catalog">
        {groups.map((group) => (
          <div key={group.id}>
            <div className="cat-group-label">{group.label}</div>
            <div className="cat-grid">
              {group.pieces.map((piece) => (
                <button
                  key={piece.type}
                  className="cat-item"
                  onClick={() => addItem(piece.type)}
                  onPointerEnter={() => preloadFurniture(piece.type)}
                  title={`Add ${piece.label}`}
                >
                  <span className="emoji">{piece.icon}</span>
                  {piece.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
