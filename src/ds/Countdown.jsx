// Port fidèle de components/moment/Countdown.jsx du design system Claude Design.
import { useState, useEffect } from 'react'

function remaining(target) {
  const diff = target - Date.now()
  if (diff <= 0) return null
  const mins = Math.floor(diff / 60000)
  return {
    d: Math.floor(mins / 1440),
    h: Math.floor(mins / 60) % 24,
    m: mins % 60,
  }
}

export function Countdown({
  target,
  variant = 'hero',
  label = 'Il reste',
  startedLabel = "C'est maintenant",
}) {
  const targetMs = typeof target === 'string' ? new Date(target).getTime() : target
  const [t, setT] = useState(() => remaining(targetMs))

  useEffect(() => {
    setT(remaining(targetMs))
    const id = setInterval(() => setT(remaining(targetMs)), 1000)
    return () => clearInterval(id)
  }, [targetMs])

  if (!t) {
    return (
      <div
        style={{
          fontFamily: 'var(--font-display)',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          fontSize: variant === 'hero' ? 'var(--display-sm)' : 20,
          textAlign: 'center',
        }}
      >
        {startedLabel}
      </div>
    )
  }

  const cells = [
    { v: t.d, u: 'jours' },
    { v: t.h, u: 'heures' },
    { v: t.m, u: 'minutes' },
  ]

  if (variant === 'compact') {
    return (
      <div className="tnum" style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8, fontFamily: 'var(--font-body)' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          {label}
        </span>
        {cells.map((c) => (
          <span key={c.u} style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--gold)' }}>
            {c.v}
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--text-muted)', marginLeft: 2 }}>
              {c.u[0]}
            </span>
          </span>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, fontFamily: 'var(--font-body)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.17em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div
        className="tnum cd-grid"
        style={{
          display: 'flex',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        {cells.map((c, i) => (
          <div
            key={c.u}
            className="cd-cell"
            style={{ flex: 1, padding: '18px 22px', textAlign: 'center', borderLeft: i > 0 ? '1px solid var(--line)' : 'none' }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, lineHeight: 1, color: 'var(--gold)' }}>{c.v}</div>
            <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 8 }}>
              {c.u}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
