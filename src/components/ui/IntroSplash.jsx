// RoomCraft 3D — intro splash. Covers the initial WebGL/chunk warm-up and fades
// out once the scene reports ready (see Experience → ReadySignal).
export default function IntroSplash({ ready }) {
  return (
    <div className={`intro ${ready ? 'intro--hidden' : ''}`} aria-hidden={ready}>
      <div className="intro__inner">
        <div className="intro__logo">
          Room<span>Craft</span> <em>3D</em>
        </div>
        <div className="intro__tag">Design your space in real time</div>
        <div className="intro__bar">
          <span />
        </div>
      </div>
    </div>
  );
}
