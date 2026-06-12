const { useState, useRef, useEffect, useCallback } = React;

/* ---------- Fongo-style butterfly ---------- */
function Butterfly({ size = 30, green = '#8CC63F', blue = '#27AAE1' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <g>
        {/* upper wings (blue) */}
        <path d="M32 30 C26 12 14 6 7 12 C2 16 4 27 14 31 C22 34 29 33 32 30Z" fill={blue}/>
        <path d="M32 30 C38 12 50 6 57 12 C62 16 60 27 50 31 C42 34 35 33 32 30Z" fill={blue} opacity="0.92"/>
        {/* lower wings (green) */}
        <path d="M32 32 C27 44 17 54 10 50 C5 47 6 38 16 35 C24 33 30 30 32 32Z" fill={green}/>
        <path d="M32 32 C37 44 47 54 54 50 C59 47 58 38 48 35 C40 33 34 30 32 32Z" fill={green} opacity="0.92"/>
        {/* body + antennae */}
        <path d="M30 8 C26 10 25 13 27 16" stroke="#3a4a52" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M34 8 C38 10 39 13 37 16" stroke="#3a4a52" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <rect x="30.4" y="16" width="3.2" height="30" rx="1.6" fill="#3a4a52"/>
      </g>
    </svg>
  );
}

/* ---------- Confetti burst ---------- */
let _confettiRaf = null;
let _confettiTimer = null;
function fireConfetti(colors) {
  const canvas = document.getElementById('confetti');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (_confettiRaf) cancelAnimationFrame(_confettiRaf);
  if (_confettiTimer) clearTimeout(_confettiTimer);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const W = window.innerWidth, H = window.innerHeight;
  const cx = W / 2, cy = H * 0.46;
  const N = 150;
  const parts = [];
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 5 + Math.random() * 12;
    parts.push({
      x: cx, y: cy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 6,
      g: 0.22 + Math.random() * 0.15,
      s: 5 + Math.random() * 7,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      c: colors[(Math.random() * colors.length) | 0],
      shape: Math.random() < 0.35 ? 'circle' : 'rect',
      life: 1,
    });
  }
  let raf;
  const start = performance.now();  function frame(now) {
    const t = now - start;
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of parts) {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.rot += p.vr;
      if (t > 1400) p.life -= 0.03;
      if (p.life > 0 && p.y < H + 40) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, 7); ctx.fill(); }
        else ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66);
        ctx.restore();
      }
    }
    if (alive) _confettiRaf = requestAnimationFrame(frame);
    else { ctx.clearRect(0, 0, W, H); _confettiRaf = null; }
  }
  if (_confettiRaf) cancelAnimationFrame(_confettiRaf);
  _confettiRaf = requestAnimationFrame(frame);
  // Hard cleanup in case rAF is throttled (background tab / capture) and never
  // reaches the natural clear — guarantees no stuck confetti.
  _confettiTimer = setTimeout(() => {
    if (_confettiRaf) cancelAnimationFrame(_confettiRaf);
    _confettiRaf = null;
    ctx.clearRect(0, 0, W, H);
  }, 2800);
}

/* ---------- Background butterflies ---------- */
function BgButterflies() {
  const specs = [
    { top: '12%', left: '8%', size: 34, dur: 7, delay: 0, g: '#8CC63F', b: '#27AAE1' },
    { top: '22%', left: '82%', size: 26, dur: 9, delay: 1.2, g: '#A4D65E', b: '#5cc4ec' },
    { top: '68%', left: '14%', size: 30, dur: 8, delay: 0.6, g: '#8CC63F', b: '#27AAE1' },
    { top: '78%', left: '78%', size: 22, dur: 10, delay: 2, g: '#A4D65E', b: '#27AAE1' },
    { top: '46%', left: '92%', size: 18, dur: 11, delay: 0.3, g: '#8CC63F', b: '#5cc4ec' },
    { top: '88%', left: '46%', size: 20, dur: 9.5, delay: 1.6, g: '#A4D65E', b: '#27AAE1' },
  ];
  return specs.map((s, i) => (
    <div key={i} className="bg-fly" style={{ top: s.top, left: s.left, animationDuration: s.dur + 's', animationDelay: s.delay + 's' }}>
      <Butterfly size={s.size} green={s.g} blue={s.b} />
    </div>
  ));
}

/* ---------- The gift card (payload) ---------- */
function GiftCard({ t }) {
  return (
    <div className="card">
      <div className="card-top">
        <div className="brandline">
          <Butterfly size={40} green="#8CC63F" blue="#27AAE1" />
          <div>
            <div className="wordmark"><span className="b">f</span><span className="g">o</span><span className="b">n</span><span className="g">g</span><span className="b">o</span></div>
            <div className="subbrand"><span className="a">Home</span><span className="b">Phone</span></div>
          </div>
        </div>
        <div className="yearstamp"><b>1</b><span>an</span></div>
      </div>
      <div className="card-body">
        <div className="kicker">Mon cadeau pour toi</div>
        <h1 className="headline">Téléphone maison <em>illimité</em></h1>
        <p className="tagline">{t.tagline}</p>

        <div className="phoneshow">
          <img src="images/phone.png" alt="Téléphone résidentiel classique" />
          <div className="cap"><b>Un vrai téléphone à la maison</b> — simple à utiliser, exactement comme avant.</div>
        </div>

        <div className="mail">
          <div className="ic">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="#1B8FC4" strokeWidth="1.8"/><path d="M3 7l9 6 9-6" stroke="#1B8FC4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <h3>Ça s'en vient par la poste 📦</h3>
            <p>Un petit adaptateur Fongo. Tu le branches dans Internet, tu branches ton téléphone… et c'est parti. Aucun contrat, rien à gérer.</p>
          </div>
        </div>

        <div className="note"><p>{t.message}</p></div>

        <div className="signoff">
          <div className="who">Pour<b>{t.toName}</b></div>
          <div className="heart">avec amour ♥</div>
          <div className="who" style={{ textAlign: 'right' }}>De<b>{t.fromName}</b></div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Covers ---------- */
function WrappedGift({ open, onOpen }) {
  return (
    <div className={'gift' + (open ? ' open' : '')} onClick={onOpen}>
      <div className="glow"></div>
      <div className="base"><div className="vrib"></div></div>
      <div className="lid"><div className="vrib"></div></div>
      <div className="bow">
        <span className="loop l"></span><span className="loop r"></span><span className="knot"></span>
      </div>
      {!open && <div className="tap-hint">Touche le cadeau pour l'ouvrir ✨</div>}
    </div>
  );
}

function Envelope({ open, onOpen }) {
  return (
    <div className={'env' + (open ? ' open' : '')} onClick={onOpen}>
      <div className="body"></div>
      <div className="inner-card">
        <Butterfly size={36} />
        <div className="inner-brand">Pour toi, Maman</div>
      </div>
      <div className="pocket"></div>
      <div className="flap"></div>
      <div className="seal"><Butterfly size={26} green="#fff" blue="#eafff0" /></div>
      {!open && <div className="tap-hint">Touche l'enveloppe pour l'ouvrir 💌</div>}
    </div>
  );
}

function FlipCard({ open, onOpen, t }) {
  return (
    <div className={'flip' + (open ? ' open' : '')} onClick={onOpen}>
      <div className="flip-inner">
        <div className="flip-face flip-front">
          <Butterfly size={66} green="#fff" blue="#eafff5" />
          <div className="ttl">Pour Maman</div>
          <div className="sub">Touche pour retourner la carte →</div>
        </div>
        <div className="flip-face flip-back">
          <GiftCard t={t} />
        </div>
      </div>
    </div>
  );
}

/* ---------- App ---------- */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "reveal": "gift",
  "accent": ["#8CC63F", "#27AAE1"],
  "bg": "ciel",
  "toName": "Maman",
  "fromName": "Gabriel",
  "message": "Joyeux anniversaire! Ce sera plus simple de se parler, comme dans le bon vieux temps.",
  "tagline": "Des appels illimités partout au Canada, comme une vraie ligne fixe. Et c'est moi qui m'occupe de tout pendant un an."
}/*EDITMODE-END*/;

const BG = {
  ciel: { '--bg1': '#eaf7ff', '--bg2': '#f3fbe9', '--bg3': '#fffdf6' },
  menthe: { '--bg1': '#e6f8ee', '--bg2': '#edfbe4', '--bg3': '#f7fff4' },
  creme: { '--bg1': '#fff4e6', '--bg2': '#fffaf0', '--bg3': '#fffdf8' },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const accent = Array.isArray(t.accent) ? t.accent : ['#8CC63F', '#27AAE1'];

  // apply theme vars
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--accent', accent[0]);
    r.setProperty('--accent2', accent[1] || accent[0]);
    const bg = BG[t.bg] || BG.ciel;
    Object.entries(bg).forEach(([k, v]) => r.setProperty(k, v));
  }, [accent[0], accent[1], t.bg]);

  // reset reveal when switching styles
  useEffect(() => { setOpen(false); setRevealed(false); }, [t.reveal]);

  const doOpen = useCallback(() => {
    if (open) return;
    setOpen(true);
    fireConfetti([accent[0], accent[1] || accent[0], '#A4D65E', '#5cc4ec', '#ffffff', '#ffd34d']);
    setTimeout(() => {
      setRevealed(true);
      const st = document.querySelector('.stage');
      if (st) st.scrollTo({ top: 0, behavior: 'smooth' });
    }, t.reveal === 'flip' ? 500 : 650);
  }, [open, accent, t.reveal]);

  const replay = () => { setOpen(false); setRevealed(false); };

  const isFlip = t.reveal === 'flip';
  // for flip: the card lives on the back face. for gift/env: card sits behind cover.
  return (
    <div className="stage">
      <BgButterflies />
      <div className="spacer"></div>

      <div className="scene">
        {isFlip ? (
          <FlipCard open={open} onOpen={doOpen} t={t} />
        ) : (
          <React.Fragment>
            <div className={'card-wrap ' + (revealed ? 'show' : 'idle')}>
              <GiftCard t={t} />
            </div>
            {!revealed && (
              <div className="cover">
                {t.reveal === 'gift'
                  ? <WrappedGift open={open} onOpen={doOpen} />
                  : <Envelope open={open} onOpen={doOpen} />}
              </div>
            )}
          </React.Fragment>
        )}
      </div>

      <div className="spacer"></div>

      <TweaksPanel>
        <TweakSection label="La révélation" />
        <TweakRadio label="Style" value={t.reveal}
          options={[{ value: 'gift', label: 'Cadeau' }, { value: 'env', label: 'Enveloppe' }, { value: 'flip', label: 'Carte' }]}
          onChange={(v) => setTweak('reveal', v)} />
        <TweakButton label="Rejouer l'ouverture" onClick={replay} />

        <TweakSection label="Couleurs" />
        <TweakColor label="Palette" value={t.accent}
          options={[['#8CC63F', '#27AAE1'], ['#27AAE1', '#8CC63F'], ['#ff7eb6', '#27AAE1'], ['#f6a623', '#8CC63F'], ['#7a5ae0', '#27AAE1']]}
          onChange={(v) => setTweak('accent', v)} />
        <TweakRadio label="Fond" value={t.bg}
          options={[{ value: 'ciel', label: 'Ciel' }, { value: 'menthe', label: 'Menthe' }, { value: 'creme', label: 'Crème' }]}
          onChange={(v) => setTweak('bg', v)} />

        <TweakSection label="Le message" />
        <TweakText label="Pour" value={t.toName} onChange={(v) => setTweak('toName', v)} />
        <TweakText label="De" value={t.fromName} onChange={(v) => setTweak('fromName', v)} />
        <TweakText label="Mot personnel" value={t.message} multiline onChange={(v) => setTweak('message', v)} />
        <TweakText label="Description" value={t.tagline} multiline onChange={(v) => setTweak('tagline', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
