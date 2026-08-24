import { useCallback, useEffect, useRef, useState } from 'react'
import './shooting.css'

// Trajectoire déterministe : la même lettre part toujours du même côté, d'un
// rendu à l'autre. Une trajectoire tirée au sort à chaque rendu ferait sauter
// les débris déjà en vol.
function spray(i) {
  const n = Math.sin((i + 1) * 12.9898) * 43758.5453
  const r = n - Math.floor(n)
  return {
    '--fly-x': `${(r - 0.5) * 160}px`,
    '--fly-r': `${(r - 0.5) * 90}deg`,
    '--fly-d': `${380 + r * 220}ms`,
  }
}

export function ShootableTitle({ lines }) {
  const [hits, setHits] = useState(() => new Set())
  const [armed, setArmed] = useState(false)   // le viseur ne sert qu'à la souris
  const [open, setOpen] = useState(false)     // les fenêtres de ligne se rouvrent
  const hostRef = useRef(null)
  const rafRef = useRef(0)

  // Chaque lettre porte un index continu sur l'ensemble des lignes.
  let n = 0
  const grid = lines.map((line) => [...line].map((ch) => ({ ch, i: ch === ' ' ? -1 : n++ })))
  const total = n

  // Les lignes montent derrière une fenêtre qui les découpe. Tant qu'elle
  // découpe, un débris qui s'envole est coupé net : on ne rouvre qu'une fois
  // l'entrée terminée.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const inners = host.querySelectorAll('.h1-line > span')
    if (!inners.length) return setOpen(true)
    let left = inners.length
    const done = () => { if (--left <= 0) setOpen(true) }
    for (const el of inners) {
      // Pas d'animation en cours (mouvement réduit, ou déjà finie) : rien à attendre.
      if (!el.getAnimations().length) return setOpen(true)
      el.addEventListener('animationend', done, { once: true })
    }
    return () => { for (const el of inners) el.removeEventListener('animationend', done) }
  }, [])

  // Le viseur suit à la fréquence de l'écran. Le passer par un état React
  // relancerait le rendu de tout le hero à chaque pixel parcouru.
  const track = useCallback((e) => {
    const host = hostRef.current
    if (!host) return
    cancelAnimationFrame(rafRef.current)
    const { clientX, clientY } = e
    rafRef.current = requestAnimationFrame(() => {
      const r = host.getBoundingClientRect()
      host.style.setProperty('--aim-x', `${clientX - r.left}px`)
      host.style.setProperty('--aim-y', `${clientY - r.top}px`)
    })
  }, [])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const shoot = (i) => {
    if (i < 0) return
    setHits((prev) => {
      if (prev.has(i)) return prev
      const next = new Set(prev)
      next.add(i)
      return next
    })
  }

  const recoil = () => {
    const host = hostRef.current
    if (!host) return
    host.classList.remove('is-firing')
    void host.offsetWidth          // force la reprise de l'animation
    host.classList.add('is-firing')
  }

  const done = hits.size >= total && total > 0

  return (
    <div
      ref={hostRef}
      className={`range${armed ? ' is-armed' : ''}${open ? ' is-open' : ''}`}
      onPointerMove={(e) => { if (e.pointerType === 'mouse') { setArmed(true); track(e) } }}
      onPointerLeave={() => setArmed(false)}
      onPointerDown={recoil}
    >
      {/* Le titre reste un titre : son nom accessible porte le texte entier,
          et le damier de lettres est masqué aux technologies d'assistance. */}
      <h1 aria-label={lines.join(' ')}>
        {grid.map((chars, li) => (
          <span key={li} className="h1-line" style={{ '--line-i': li }} aria-hidden="true">
            <span>
              {chars.map(({ ch, i }, ci) =>
                ch === ' ' ? (
                  <span key={ci} className="h1-space"> </span>
                ) : (
                  <span
                    key={ci}
                    className={`h1-char${hits.has(i) ? ' is-hit' : ''}`}
                    style={spray(i)}
                    onPointerDown={() => shoot(i)}
                  >
                    {ch}
                  </span>
                ),
              )}
            </span>
          </span>
        ))}
      </h1>

      <div className="crosshair" aria-hidden="true">
        <span className="ring" /><span className="tick t" /><span className="tick r" />
        <span className="tick b" /><span className="tick l" /><span className="dot" />
      </div>

      {/* Le tableau de score n'apparaît qu'au premier tir : avant, le hero n'a
          pas à porter l'interface d'un jeu que personne n'a encore lancé. */}
      {hits.size > 0 && (
        <p className="range-score">
          <span className="tnum">{hits.size} / {total}</span>
          <span className="range-label">{done ? 'carton plein' : 'lettres dégommées'}</span>
          <button type="button" className="range-reset" onClick={() => setHits(new Set())}>
            Remettre les lettres
          </button>
        </p>
      )}
    </div>
  )
}
