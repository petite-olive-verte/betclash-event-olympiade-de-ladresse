// Sons de synthèse plutôt que fichiers : la page est servie depuis GitHub
// Pages, chaque octet est un aller-retour réseau, et un tir dure 120 ms. Trois
// oscillateurs coûtent moins qu'une requête.

let ctx = null

// Le contexte audio ne peut naître que d'un geste de l'utilisateur. Comme le
// premier son est toujours la conséquence d'un clic, on le crée à ce
// moment-là — jamais au chargement.
function audio() {
  if (ctx) return ctx
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  return ctx
}

// Souffle blanc mis en cache : un tir en rafale ne doit pas recréer le buffer.
let noise = null
function noiseBuffer(c) {
  if (noise) return noise
  const n = Math.floor(c.sampleRate * 0.4)
  noise = c.createBuffer(1, n, c.sampleRate)
  const d = noise.getChannelData(0)
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1
  return noise
}

function env(c, node, peak, attack, decay) {
  const g = c.createGain()
  const t = c.currentTime
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
  node.connect(g)
  return { g, stopAt: t + attack + decay + 0.02 }
}

/** Le coup : une claque de souffle filtrée, plus un coup sourd qui descend. */
export function playShot() {
  const c = audio()
  if (!c) return
  if (c.state === 'suspended') c.resume()
  const t = c.currentTime

  // la claque
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c)
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.setValueAtTime(1800, t)
  bp.frequency.exponentialRampToValueAtTime(420, t + 0.09)
  bp.Q.value = 0.9
  src.connect(bp)
  const { g: g1, stopAt } = env(c, bp, 0.32, 0.004, 0.1)
  g1.connect(c.destination)
  src.start(t)
  src.stop(stopAt)

  // le coup sourd, qui donne le poids
  const osc = c.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(170, t)
  osc.frequency.exponentialRampToValueAtTime(48, t + 0.11)
  const { g: g2, stopAt: s2 } = env(c, osc, 0.5, 0.003, 0.12)
  g2.connect(c.destination)
  osc.start(t)
  osc.stop(s2)
}

/** La recharge : deux petits clics mécaniques. */
export function playReload() {
  const c = audio()
  if (!c) return
  if (c.state === 'suspended') c.resume()
  for (const [i, delay] of [0, 0.11].entries()) {
    const src = c.createBufferSource()
    src.buffer = noiseBuffer(c)
    const hp = c.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 2400
    src.connect(hp)
    const g = c.createGain()
    const t = c.currentTime + delay
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(i ? 0.16 : 0.12, t + 0.002)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035)
    hp.connect(g); g.connect(c.destination)
    src.start(t); src.stop(t + 0.06)
  }
}

/** Le carton plein : trois notes qui montent. */
export function playPerfect() {
  const c = audio()
  if (!c) return
  if (c.state === 'suspended') c.resume()
  ;[0, 0.1, 0.2].forEach((delay, i) => {
    const osc = c.createOscillator()
    osc.type = 'triangle'
    const t = c.currentTime + delay
    osc.frequency.setValueAtTime([523.25, 659.25, 987.77][i], t)
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + (i === 2 ? 0.5 : 0.16))
    osc.connect(g); g.connect(c.destination)
    osc.start(t); osc.stop(t + 0.6)
  })
}
