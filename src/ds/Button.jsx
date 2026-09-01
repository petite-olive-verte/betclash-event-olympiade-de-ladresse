// Port fidèle de components/core/Button.jsx du design system Claude Design.
const sizes = {
  sm: { padding: '8px 14px', fontSize: 13.5 },
  md: { padding: '12px 18px', fontSize: 15 },
  lg: { padding: '16px 22px', fontSize: 16.5 },
}

const variants = {
  primary:   { background: 'var(--gold)',      color: '#181205',     border: '1px solid var(--gold)' },
  secondary: { background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--line-strong)' },
  ghost:     { background: 'transparent',      color: 'var(--text)', border: '1px solid var(--line)' },
  danger:    { background: 'var(--error)',     color: '#fff',        border: '1px solid var(--error)' },
  success:   { background: 'var(--success)',   color: '#06231d',     border: '1px solid var(--success)' },
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  onClick,
  href,
  target,
}) {
  const v = variants[variant] || variants.primary
  const s = sizes[size] || sizes.md

  const style = {
    ...v,
    ...s,
    width: fullWidth ? '100%' : undefined,
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    borderRadius: 'var(--radius-pill)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    letterSpacing: '.01em',
    transition: 'transform var(--dur-fast) var(--ease-out), filter var(--dur-fast)',
  }

  const press = {
    onMouseDown: (e) => { if (!disabled) e.currentTarget.style.transform = 'scale(.97)' },
    onMouseUp: (e) => { e.currentTarget.style.transform = 'scale(1)' },
    onMouseLeave: (e) => { e.currentTarget.style.transform = 'scale(1)' },
  }

  // Variante lien : même rendu, sémantique correcte quand l'action navigue.
  // `rel` accompagne toujours une ouverture dans un autre onglet : sans lui, la
  // page ouverte garde une prise sur celle-ci.
  if (href && !disabled) {
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        style={{ ...style, display: 'inline-block', textDecoration: 'none' }}
        {...press}
      >
        {children}
      </a>
    )
  }

  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={style} {...press}>
      {children}
    </button>
  )
}
