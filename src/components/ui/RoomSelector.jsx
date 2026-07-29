// RoomCraft 3D — room selector (segmented glass control).
// Hovering a room warms its furniture chunks so the switch feels instant.
import { useSceneStore } from '../../store/useSceneStore.js';
import { ROOM_LIST } from '../../data/rooms.js';
import { preloadRoomFurniture } from '../../hooks/useFurnitureLoader.js';

export default function RoomSelector() {
  const activeRoom = useSceneStore((s) => s.activeRoom);
  const setRoom = useSceneStore((s) => s.setRoom);
  return (
    <div className="segmented glass" role="tablist" aria-label="Room">
      {ROOM_LIST.map((room) => (
        <button
          key={room.id}
          className="seg-btn"
          role="tab"
          data-active={activeRoom === room.id}
          onClick={() => setRoom(room.id)}
          onPointerEnter={() => preloadRoomFurniture(room.id)}
        >
          <span className="emoji">{room.icon}</span>
          {room.label}
        </button>
      ))}
    </div>
  );
}
