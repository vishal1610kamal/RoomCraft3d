// RoomCraft 3D — tiny keyboard hook for walk mode.
// Returns a ref whose .current is a set of movement flags, updated from
// keydown/keyup. A ref (not state) so reads happen in the render loop without
// causing re-renders.
import { useEffect, useRef } from 'react';

const MAP = {
  KeyW: 'forward', ArrowUp: 'forward',
  KeyS: 'back', ArrowDown: 'back',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  ShiftLeft: 'run', ShiftRight: 'run',
};

export function useKeys(enabled = true) {
  const keys = useRef({ forward: false, back: false, left: false, right: false, run: false });
  useEffect(() => {
    if (!enabled) {
      keys.current = { forward: false, back: false, left: false, right: false, run: false };
      return;
    }
    const down = (e) => {
      const k = MAP[e.code];
      if (k) {
        keys.current[k] = true;
        if (['forward', 'back', 'left', 'right'].includes(k)) e.preventDefault();
      }
    };
    const up = (e) => {
      const k = MAP[e.code];
      if (k) keys.current[k] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [enabled]);
  return keys;
}
