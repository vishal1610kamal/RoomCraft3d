// RoomCraft 3D — postprocessing
// Kept deliberately light (per the performance budget): mipmap Bloom so the
// lamps and window glow at night, ACES tone-mapping INSIDE the composer, a soft
// Vignette to focus the eye, and SMAA for clean edges.
//
// IMPORTANT: an EffectComposer disables the renderer's own tone-mapping
// (sets NoToneMapping) and expects a ToneMapping effect in the chain. Without
// it, linear HDR values clip straight to white and the whole scene washes out.
// The <ToneMapping> effect below is that step. No SSR/SSAO — ContactShadows
// already grounds the scene and those passes blow the frame budget. On the
// "low" quality profile the composer is skipped and the renderer's default
// ACES tone-mapping (set in App onCreated) takes over.

import { EffectComposer, Bloom, Vignette, SMAA, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useSceneStore } from '../../store/useSceneStore.js';

export default function Effects() {
  const quality = useSceneStore((s) => s.quality);
  if (quality === 'low') return null;
  return (
    <EffectComposer disableNormalPass multisampling={0}>
      <Bloom mipmapBlur intensity={0.42} luminanceThreshold={0.9} luminanceSmoothing={0.25} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette eskil={false} offset={0.28} darkness={0.55} />
      <SMAA />
    </EffectComposer>
  );
}
