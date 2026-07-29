// RoomCraft 3D — renders every placed furniture item for the active room.
// Clicking empty space (the room shell) clears the selection; that is handled
// by the onPointerMissed on the Canvas wrapper in Experience.
import { useActiveItems } from '../../store/useSceneStore.js';
import FurniturePiece from './FurniturePiece.jsx';

export default function FurnitureLayer() {
  const items = useActiveItems();
  return (
    <>
      {items.map((item) => (
        <FurniturePiece key={item.id} item={item} />
      ))}
    </>
  );
}
