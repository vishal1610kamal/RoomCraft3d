// RoomCraft 3D — material picker. Shows the material families allowed for the
// selected piece, then the swatches within the chosen family. Selecting a
// swatch updates the piece's material in real time. All material knowledge
// lives behind useMaterialSwap — this component only renders it.
import { useState } from 'react';
import { useMaterialSwap } from '../../hooks/useMaterialSwap.js';

export default function MaterialPicker({ item }) {
  const { current, families, swatchesFor, setMaterial } = useMaterialSwap(item);
  const [family, setFamily] = useState(
    families.includes(current?.family) ? current.family : families[0],
  );

  // If the selection changed to a piece that doesn't accept the open family,
  // fall back to one it does.
  const activeFamily = families.includes(family) ? family : families[0];
  const swatches = swatchesFor(activeFamily);

  return (
    <div>
      <div className="panel-sub">Material</div>
      {families.length > 1 && (
        <div className="families">
          {families.map((fid) => (
            <button
              key={fid}
              className="family-btn"
              data-active={activeFamily === fid}
              onClick={() => setFamily(fid)}
            >
              {fid.charAt(0).toUpperCase() + fid.slice(1)}
            </button>
          ))}
        </div>
      )}
      <div className="swatches" style={{ marginTop: 12 }}>
        {swatches.map((sw) => (
          <button
            key={sw.id}
            className="swatch"
            data-active={item.material === sw.id}
            style={{ background: sw.color }}
            onClick={() => setMaterial(sw.id)}
            title={sw.label}
            aria-label={sw.label}
          />
        ))}
      </div>
    </div>
  );
}
