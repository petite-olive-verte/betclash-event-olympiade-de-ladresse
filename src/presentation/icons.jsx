// Icônes reprises telles quelles de la maquette Claude Design.
const g = 'var(--gold)'

export function IconTarget({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={g} strokeWidth="1.6" />
      <circle cx="12" cy="12" r="5.5" stroke={g} strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2" fill={g} />
    </svg>
  )
}

export function IconTeam({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" fill={g} />
      <path d="M2.5 20c0-3.9 2.9-6.8 6.5-6.8s6.5 2.9 6.5 6.8" stroke={g} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17.5" cy="9" r="2.3" fill={g} opacity=".55" />
      <path d="M15.5 20c.2-3 2.1-5.2 4.6-5.7" stroke={g} strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
    </svg>
  )
}

export function IconDice({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke={g} strokeWidth="1.6" />
      <circle cx="7.5" cy="7.5" r="1.3" fill={g} />
      <circle cx="16.5" cy="7.5" r="1.3" fill={g} />
      <circle cx="12" cy="12" r="1.3" fill={g} />
      <circle cx="7.5" cy="16.5" r="1.3" fill={g} />
      <circle cx="16.5" cy="16.5" r="1.3" fill={g} />
    </svg>
  )
}

export function IconMedal({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.5 2.5 5.5 10l2.7.9L11 10 8.5 2.5z" fill={g} opacity=".6" />
      <path d="M15.5 2.5 18.5 10l-2.7.9L13 10l2.5-7.5z" fill={g} opacity=".6" />
      <circle cx="12" cy="15" r="6" stroke={g} strokeWidth="1.6" />
      <path d="M12 12.3l1.1 2.2 2.4.35-1.75 1.7.4 2.4L12 17.8l-2.15 1.15.4-2.4-1.75-1.7 2.4-.35L12 12.3z" fill={g} />
    </svg>
  )
}

export function IconTrophy({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3h10v4.5a5 5 0 0 1-10 0V3z" stroke={g} strokeWidth="1.6" />
      <path d="M7 4.5H4.5a2.5 2.5 0 0 0 2.5 4" stroke={g} strokeWidth="1.6" />
      <path d="M17 4.5h2.5a2.5 2.5 0 0 1-2.5 4" stroke={g} strokeWidth="1.6" />
      <path d="M10 12.5v3M14 12.5v3" stroke={g} strokeWidth="1.6" />
      <rect x="8" y="15.5" width="8" height="2" rx="1" fill={g} />
      <rect x="6.5" y="19" width="11" height="2" rx="1" fill={g} />
    </svg>
  )
}

export function IconGear({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke={g} strokeWidth="1.6" />
      <path
        d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"
        stroke={g} strokeWidth="1.6" strokeLinecap="round"
      />
    </svg>
  )
}

export function IconBook({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4.5c1.6-.8 4-1 6 0v14c-2-1-4.4-.8-6 0v-14z" stroke={g} strokeWidth="1.6" />
      <path d="M20 4.5c-1.6-.8-4-1-6 0v14c2-1 4.4-.8 6 0v-14z" stroke={g} strokeWidth="1.6" />
    </svg>
  )
}

export function IconClock({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={g} strokeWidth="1.6" />
      <path d="M12 7v5l3.5 2" stroke={g} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
