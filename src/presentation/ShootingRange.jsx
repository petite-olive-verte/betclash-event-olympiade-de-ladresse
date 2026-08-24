import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Crosshair, RotateCcw } from 'lucide-react'
import { Button, Countdown } from '../ds'
import { event } from './content.jsx'
import { playFail, playMiss, playPerfect, playReload, playShot } from './shotSound.js'
import './shooting.css'

const RangeCtx = createContext(null)

const MUTE_KEY = 'olympiade:stand-muet'
const readMuted = () => { try { return localStorage.getItem(MUTE_KEY) === '1' } catch { return false } }

// Trajectoire de chute déterministe : la même lettre part toujours du même
// côté. Tirée au sort à chaque rendu, elle ferait sauter les débris en vol.
function spray(i) {
  const n = Math.sin((i + 1) * 12.9898) * 43758.5453
  const r = n - Math.floor(n)
  return { '--fly-x': `${(r - 0.5) * 220}px`, '--fly-r': `${(r - 0.5) * 120}deg`, '--fly-d': `${420 + r * 240}ms` }
}

// Plus il reste peu de lettres, plus elles filent. Le dernier tir se mérite.
const SPEED_MIN = 95      // px/s au premier tir
const SPEED_MAX = 460     // px/s sur la dernière lettre

// Parties du même point, les lettres forment un pâté blanc et restent
// indistinctes plusieurs secondes à vitesse de croisière. Une détente initiale
// les écarte d'un coup, puis s'éteint : on voit une dispersion, et le jeu
// retrouve tout de suite un rythme jouable.
const BURST = 4.5         // multiplicateur au premier instant
const BURST_TAU = 0.34    // s — constante d'amortissement

// Six balles de marge sur vingt lettres : de quoi rater sans que la partie
// soit jouée d'avance, et pas de quoi arroser jusqu'à ce que ça tombe.
const MARGE = 6

// Viser une lettre qui file avec un doigt, sans viseur qui suit, est plus dur
// qu'avec une souris. Le chargeur tactile est plus généreux d'autant.
const MARGE_TACTILE = 5
const estTactile = () => typeof window !== 'undefined'
  && window.matchMedia('(pointer: coarse)').matches

export function ShootingRange({ children }) {
  const [hits, setHits] = useState(() => new Set())
  const [playing, setPlaying] = useState(false)
  const [armed, setArmed] = useState(false)
  const [open, setOpen] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [total, setTotal] = useState(0)
  const [ammo, setAmmo] = useState(0)
  const [chargeur, setChargeur] = useState(0)   // capacité, tactile comprise
  const [outcome, setOutcome] = useState(null)   // null | 'win' | 'lose'

  const hostRef = useRef(null)
  const aimRaf = useRef(0)
  const driftRaf = useRef(0)
  const motesRef = useRef([])       // une entrée par lettre encore debout
  const ratioRef = useRef(0)        // part de lettres abattues, lue par la boucle

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const n = host.querySelectorAll('.h1-char').length
    const capacite = n + MARGE + (estTactile() ? MARGE_TACTILE : 0)
    setTotal(n)
    setChargeur(capacite)
    setAmmo(capacite)
  }, [])

  // Les lignes du titre montent derrière une fenêtre qui les découpe. Tant
  // qu'elle découpe, une lettre qui s'échappe est coupée net : on ne rouvre
  // qu'une fois l'entrée terminée — sur `animationend` plutôt qu'après un
  // délai deviné, qui dériverait avec le chargement des polices.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const inners = host.querySelectorAll('.h1-line > span')
    if (!inners.length) return setOpen(true)
    let left = inners.length
    const done = () => { if (--left <= 0) setOpen(true) }
    for (const el of inners) {
      if (!el.getAnimations().length) return setOpen(true)
      el.addEventListener('animationend', done, { once: true })
    }
    return () => { for (const el of inners) el.removeEventListener('animationend', done) }
  }, [])

  /* ---------------------------------------------------------- LE VISEUR */
  // Écrit en propriétés CSS, jamais dans un état React : un rendu par pixel
  // parcouru relancerait tout le hero.
  const track = useCallback((e) => {
    const host = hostRef.current
    if (!host) return
    cancelAnimationFrame(aimRaf.current)
    const { clientX, clientY } = e
    aimRaf.current = requestAnimationFrame(() => {
      const r = host.getBoundingClientRect()
      host.style.setProperty('--aim-x', `${clientX - r.left}px`)
      host.style.setProperty('--aim-y', `${clientY - r.top}px`)
    })
  }, [])

  const tapRef = useRef(0)
  const [coups, setCoups] = useState(0)      // compte les tirs, pas les touches
  const dernierDoigt = useRef(null)          // où le doigt a touché, ou null

  // Le recul et le viseur au doigt s'écrivent en classes posées à la main. Or
  // React réécrit `className` dès que la chaîne rendue change — au premier
  // tir, `is-playing` apparaît et emporte tout ce qu'on avait ajouté. Les
  // poser dans un effet de mise en page, après que React a écrit, est le seul
  // ordre qui tienne. Sans ça, le tout premier coup partait sans recul et sans
  // viseur, et seuls les suivants en avaient.
  useLayoutEffect(() => {
    if (!coups) return
    const host = hostRef.current
    if (!host) return

    host.classList.remove('is-firing')
    void host.offsetWidth                     // force la reprise de l'animation
    host.classList.add('is-firing')

    const doigt = dernierDoigt.current
    if (!doigt) return
    // Au doigt il n'y a pas de survol, donc pas de viseur : le coup partirait
    // sans qu'on voie d'où. On le montre à l'endroit touché, puis il s'efface.
    const r = host.getBoundingClientRect()
    host.style.setProperty('--aim-x', `${doigt.x - r.left}px`)
    host.style.setProperty('--aim-y', `${doigt.y - r.top}px`)
    host.classList.add('is-tapped')
    clearTimeout(tapRef.current)
    tapRef.current = setTimeout(() => host.classList.remove('is-tapped'), 700)
  }, [coups])

  /* ------------------------------------------------- LES LETTRES LÂCHÉES */
  // Au premier tir, chaque lettre est détachée à l'endroit exact où elle se
  // trouve : `position: fixed` aux coordonnées mesurées. Rien ne saute, mais
  // elles cessent d'appartenir au titre et peuvent parcourir tout l'écran.
  const release = useCallback(() => {
    const host = hostRef.current
    if (!host) return
    const motes = []
    const count = host.querySelectorAll('.h1-char').length
    // Toutes les lettres se rassemblent au centre de l'écran, puis s'en
    // écartent chacune dans sa direction. Elles ne partent pas de leur place
    // dans le titre : le jeu commence par une dispersion, pas par un titre qui
    // se met doucement à flotter.
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    for (const el of host.querySelectorAll('.h1-char')) {
      const r = el.getBoundingClientRect()
      // Seules les mesures sont écrites ici. Le détachement lui-même est une
      // règle CSS conditionnée à `is-playing` : quitter la partie suffit alors
      // à tout remettre en place, sans avoir à défaire un style à la main.
      el.style.setProperty('--w', `${r.width}px`)
      el.style.setProperty('--h', `${r.height}px`)
      // Réparties sur le tour d'un cercle plutôt qu'au hasard : tirées au
      // sort, plusieurs lettres partiraient dans la même direction et le
      // paquet mettrait longtemps à se défaire.
      const i = motes.length
      const angle = (i / count) * Math.PI * 2 + 0.4
      // À vitesse égale et angles réguliers, les lettres dessinent un anneau
      // parfait — joli une seconde, puis figé. Un facteur propre à chaque
      // lettre casse la figure sans la rendre illisible.
      const a = Math.sin((i + 1) * 91.7) * 43758.5453
      const k = 0.6 + (a - Math.floor(a)) * 0.85
      const x = cx - r.width / 2
      const y = cy - r.height / 2
      el.style.setProperty('--x', `${x}px`)
      el.style.setProperty('--y', `${y}px`)
      motes.push({ el, x, y, w: r.width, h: r.height, k,
                   dx: Math.cos(angle), dy: Math.sin(angle), down: false })
    }
    motesRef.current = motes
  }, [])

  useEffect(() => {
    if (!playing) return
    // Le mouvement n'est pas porteur d'information : sous mouvement réduit les
    // lettres restent en place, et le jeu se joue sur des cibles fixes.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const t0 = performance.now()
    let last = t0
    const step = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)   // un onglet en arrière-plan
      last = now                                        // ne doit pas téléporter
      const burst = 1 + (BURST - 1) * Math.exp(-(now - t0) / 1000 / BURST_TAU)
      const speed = (SPEED_MIN + (SPEED_MAX - SPEED_MIN) * ratioRef.current) * burst
      const W = window.innerWidth, H = window.innerHeight
      for (const m of motesRef.current) {
        if (m.down) continue
        m.x += m.dx * speed * m.k * dt
        m.y += m.dy * speed * m.k * dt
        if (m.x <= 0) { m.x = 0; m.dx = Math.abs(m.dx) }
        if (m.x + m.w >= W) { m.x = W - m.w; m.dx = -Math.abs(m.dx) }
        if (m.y <= 0) { m.y = 0; m.dy = Math.abs(m.dy) }
        if (m.y + m.h >= H) { m.y = H - m.h; m.dy = -Math.abs(m.dy) }
        m.el.style.setProperty('--x', `${m.x}px`)
        m.el.style.setProperty('--y', `${m.y}px`)
      }
      driftRaf.current = requestAnimationFrame(step)
    }
    driftRaf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(driftRaf.current)
  }, [playing])

  // Tant que la partie court, la page ne défile pas : les lettres sont
  // ancrées à la fenêtre et le décor a disparu, donc défiler ne montrerait
  // qu'un vide et ferait perdre le fil du jeu.
  //
  // `overflow: hidden` sur la racine ne suffit pas — iOS continue de faire
  // glisser le corps de la page au doigt. Le seul verrou qui tienne partout
  // est de figer le corps et de compenser le défilement en cours, puis de le
  // rendre tel quel à la sortie.
  useEffect(() => {
    if (!playing) return
    const y = window.scrollY
    const body = document.body
    const memoire = {
      position: body.style.position, top: body.style.top,
      left: body.style.left, right: body.style.right, width: body.style.width,
    }
    body.style.position = 'fixed'
    body.style.top = `-${y}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'

    return () => {
      Object.assign(body.style, memoire)
      // `scroll-behavior: smooth` est posé sur la page : sans `instant`, le
      // retour à la position d'origine se ferait en glissant.
      window.scrollTo({ top: y, behavior: 'instant' })
    }
  }, [playing])

  useEffect(() => () => {
    cancelAnimationFrame(aimRaf.current)
    cancelAnimationFrame(driftRaf.current)
    clearTimeout(tapRef.current)
  }, [])

  /* ----------------------------------------------------------- LE TIR */
  const fire = useCallback((e) => {
    // Avant le premier coup la page est normale : seuls les liens et les
    // boutons répondent, et seul un clic sur une lettre ouvre la partie.
    const letter = e.target.closest?.('.h1-char')
    if (!playing && !letter) return
    if (outcome) return
    // Le panneau latéral et l'écran de fin ne sont pas le champ de tir.
    if (e.target.closest?.('.range-side, .range-end')) return

    const id = letter && !letter.classList.contains('is-hit')
      ? letter.dataset.id
      : null

    if (!playing) { release(); setPlaying(true) }
    dernierDoigt.current = e.pointerType === 'mouse'
      ? null
      : { x: e.clientX, y: e.clientY }
    setCoups((n) => n + 1)

    const left = ammo - 1
    setAmmo(left)

    if (id) {
      const next = new Set(hits)
      next.add(id)
      setHits(next)
      ratioRef.current = total ? next.size / total : 0
      const mote = motesRef.current[Number(id.slice(1))]
      if (mote) mote.down = true
      if (!muted) playShot()

      if (total && next.size >= total) {
        setOutcome('win')
        if (!muted) playPerfect()
      } else if (left <= 0) {
        setOutcome('lose')
        if (!muted) playFail()
      }
      return
    }

    // Coup manqué : la balle part quand même.
    if (!muted) playMiss()
    if (left <= 0) {
      setOutcome('lose')
      if (!muted) playFail()
    }
  }, [ammo, hits, muted, outcome, playing, release, total])

  const reload = useCallback((silencieux) => {
    // Rien à défaire : les lettres reprennent leur place dès que `is-playing`
    // tombe, puisque c'est le CSS qui les détachait.
    motesRef.current = []
    ratioRef.current = 0
    setHits(new Set())
    setPlaying(false)
    setOutcome(null)
    setAmmo(chargeur)
    if (!muted && !silencieux) playReload()
  }, [chargeur, muted])

  // « Lire la suite » : on rend la page telle qu'elle était et on amène le
  // lecteur là où il allait avant qu'on lui propose de jouer.
  const resume = () => {
    reload(true)
    // Deux images d'attente : la première laisse React démonter la partie, la
    // seconde laisse le nettoyage rendre le défilement. Viser la section avant
    // ça reviendrait à défiler une page encore figée.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.getElementById('bref')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }))
  }

  const toggleMute = () => setMuted((m) => {
    const next = !m
    try { localStorage.setItem(MUTE_KEY, next ? '1' : '0') } catch { /* navigation privée */ }
    return next
  })


  const restantes = total - hits.size

  return (
    <RangeCtx.Provider value={{ hits, fire, playing, outcome }}>
      <div
        ref={hostRef}
        className={`range${armed ? ' is-armed' : ''}${open ? ' is-open' : ''}`
          + `${playing ? ' is-playing' : ''}${outcome ? ` is-${outcome}` : ''}`}
        onPointerMove={(e) => { if (e.pointerType === 'mouse') { setArmed(true); track(e) } }}
        onPointerLeave={() => setArmed(false)}
        onPointerDown={fire}
      >
        {children}

        <div className="crosshair" aria-hidden="true">
          <span className="ring" /><span className="tick t" /><span className="tick r" />
          <span className="tick b" /><span className="tick l" /><span className="dot" />
        </div>

        {/* Le panneau n'existe qu'une fois la partie lancée : avant, le hero
            n'a pas à porter l'interface d'un jeu que personne n'a ouvert. */}
        {playing && (
          <div className="range-side">
            <p className="range-gauge">
              <span className="tnum">{hits.size}<span>/{total}</span></span>
              <span className="range-tag">lettres</span>
            </p>
            <p className={`range-gauge${ammo <= 3 ? ' is-low' : ''}`}>
              <span className="tnum">{Math.max(ammo, 0)}</span>
              <span className="range-tag">balles</span>
            </p>
            <button type="button" className="range-icon" onClick={() => reload()}
                    title="Remettre la page comme avant" aria-label="Remettre la page comme avant">
              <RotateCcw size={20} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
            </button>
            <button type="button" className="range-icon range-mute" onClick={toggleMute}
                    aria-pressed={muted} title={muted ? 'Rétablir le son' : 'Couper le son'}
                    aria-label={muted ? 'Rétablir le son' : 'Couper le son'}>
              {muted ? '🔇' : '🔊'}
            </button>
          </div>
        )}

        {outcome && (
          <div className="range-end" role="dialog" aria-modal="true" aria-labelledby="fin-titre">
            <div className="range-card">
              <p className="range-verdict" id="fin-titre">
                {/* Le damier de lettres est décoratif : son espace n'en est
                    pas une pour un lecteur d'écran, qui entendrait « Ohwow ».
                    Le texte lu est donc porté à part — ce paragraphe nomme la
                    boîte de dialogue, il ne peut pas se permettre d'être
                    approximatif. */}
                <span className="visuallyhidden">{outcome === 'win' ? 'Oh wow' : 'Bouu'}</span>
                {[...(outcome === 'win' ? 'Oh wow' : 'Bouu')].map((c, i) =>
                  // Le verdict est une rangée en flex : une espace dans un
                  // span n'y prend aucune largeur. Il lui faut sa propre case.
                  c === ' '
                    ? <span key={i} className="verdict-sp" aria-hidden="true" />
                    : <span key={i} className="verdict-l" style={{ '--l': i }} aria-hidden="true">{c}</span>,
                )}
              </p>

              <p className="range-line">
                {outcome === 'win'
                  ? <>Ça m'étonne de toi, mais bravo.</>
                  : <>T'es nulll.</>}
              </p>

              <Countdown target={event.startsAt} variant="hero"
                         label={outcome === 'win' ? 'Il reste' : 'Il ne te reste que'} />

              {outcome === 'lose' && (
                <p className="range-line range-line-sub">
                  {restantes === 1
                    ? 'Une lettre est restée debout.'
                    : `${restantes} lettres sont restées debout.`}
                </p>
              )}

              <div className="range-actions">
                <Button variant="primary" size="lg" onClick={resume}>Lire la suite</Button>
                <Button variant="ghost" size="lg" onClick={() => reload()}>
                  <span className="range-again">
                    <Crosshair size={17} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
                    {outcome === 'win' ? 'Rejouer' : 'Une autre partie'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RangeCtx.Provider>
  )
}

/* ------------------------------------------------------------ LE TITRE */
export function ShootableTitle({ lines }) {
  const range = useContext(RangeCtx)
  let n = 0
  const grid = lines.map((line) => [...line].map((ch) => ({ ch, i: ch === ' ' ? -1 : n++ })))

  // Au survol, le viseur dit tout seul qu'on peut tirer. Un écran tactile n'a
  // pas de survol : sans un mot, le jeu reste invisible pour qui n'essaie pas
  // de toucher le titre par hasard. L'indice ne s'affiche donc que là où il
  // manque quelque chose, et disparaît au premier coup.
  const indice = !range?.playing && !range?.outcome

  return (
    <div className="title-wrap">
    {/* Le titre reste un titre : son nom accessible porte le texte entier, et
        le damier de lettres est masqué aux technologies d'assistance. */}
    <h1 aria-label={lines.join(' ')}>
      {grid.map((chars, li) => (
        <span key={li} className="h1-line" style={{ '--line-i': li }} aria-hidden="true">
          <span>
            {chars.map(({ ch, i }, ci) =>
              i < 0 ? (
                <span key={ci} className="h1-space"> </span>
              ) : (
                // Pas de gestionnaire ici : le tir est écouté par le stand,
                // seul endroit d'où l'on puisse voir qu'un coup n'a rien
                // touché.
                <span
                  key={ci}
                  data-id={`c${i}`}
                  className={`h1-char${range?.hits.has(`c${i}`) ? ' is-hit' : ''}`}
                  style={{ ...spray(i), '--pulse': i }}
                >
                  {ch}
                </span>
              ),
            )}
          </span>
        </span>
      ))}
    </h1>
    {indice && (
      <span className="range-hint" aria-hidden="true">
        <Crosshair size={15} strokeWidth={2} absoluteStrokeWidth />
        Tire sur les lettres
      </span>
    )}
    </div>
  )
}
