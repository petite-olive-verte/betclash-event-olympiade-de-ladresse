import { createContext, useContext, useEffect, useId, useRef, useState } from 'react'
import { Button, Countdown } from '../ds'
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react'
import { Icon } from './icons.jsx'
import { ShootableTitle, ShootingRange } from './ShootingRange.jsx'
import {
  event, stats, navItems, weekend, goldenRule, saturday, points,
  jetonSources, bettingIntro, bettingRounding, bettingKicker, bettingRules,
  bettingRulesWhy, refund, fixedMatch, bettingExample, sunday, bestGame,
  titles, constraints, proposalFormat, sponsorNote, signup, roles,
} from './content.jsx'
import './presentation.css'

// Quelle section est sous les yeux du lecteur. La nav et l'icône de section
// s'allument à partir de cette seule valeur, ce qui évite de désynchroniser
// les deux états.
const CurrentSection = createContext(null)

function useSectionSpy(ids) {
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    const seen = new Map()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e)
        // La section active est la plus haute de celles qui coupent la bande
        // de lecture : en défilement lent, deux sections s'y croisent.
        const visible = [...seen.values()]
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length) setCurrent(visible[0].target.id)
      },
      // Une bande étroite au tiers supérieur : la section « courante » est
      // celle qu'on lit, pas celle qui occupe le plus de pixels.
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 },
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [ids])

  return current
}

/* Les groupes qui entrent en scène. Passer par des sélecteurs plutôt que par
   une prop sur chaque bloc évite d'avoir à baliser une trentaine d'endroits —
   et un groupe oublié se voit tout de suite, il n'apparaît simplement pas.

   Les schémas ajoutés depuis se déclarent par attribut plutôt que par classe :
   `data-reveal` pour un bloc qui entre d'un coup, `data-stagger` pour un
   groupe dont les enfants se suivent. Une classe de plus à ajouter ici *et*
   dans quatre listes de sélecteurs CSS, c'était la garantie d'en oublier une. */
const REVEAL = '.section-head, .autogrid, .split, .card.list, .panel-gold, .bullets, .panel-error, .example, [data-reveal], [data-stagger]'

function useReveal() {
  useEffect(() => {
    // Personne ne doit se retrouver devant une page vide : l'état masqué n'est
    // posé qu'une fois l'observateur en place, et jamais si le lecteur a
    // demandé qu'on lui épargne les animations.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.documentElement
    root.classList.add('reveal-ready')

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-revealed')
          io.unobserve(e.target)   // une entrée en scène ne se rejoue pas
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    )
    for (const el of document.querySelectorAll(REVEAL)) io.observe(el)

    return () => { io.disconnect(); root.classList.remove('reveal-ready') }
  }, [])
}

function Section({ id, icon, title, sub, badge, moment, children }) {
  const active = useContext(CurrentSection) === id
  return (
    <section
      id={id}
      className={`section${moment ? ' section-moment' : ''}`}
      data-theme={moment ? 'dark' : undefined}
      aria-labelledby={`${id}-title`}
    >
      <div className="wrap">
        <div className="section-head">
          <div className={`section-rule${active ? ' is-active' : ''}`} data-icon={icon}>
            <span className="section-icon"><Icon name={icon} size={22} /></span>
            <div className="bar" />
          </div>
          {badge && <div className="day-badge">{badge}</div>}
          <h2 id={`${id}-title`}>{title}</h2>
          {/* Sans sous-titre, un paragraphe vide garderait sa marge basse et
              ouvrirait un trou sous le titre. */}
          {sub && <p className="sub">{sub}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}

function Row({ k, v, color, className = 'row' }) {
  return (
    <div className={className}>
      <span className="k">{k}</span>
      <span className="v tnum" style={{ color }}>{v}</span>
    </div>
  )
}

/* ---------------------------------------------------------------- HERO */
function Hero() {
  const current = useContext(CurrentSection)
  return (
    <header className="hero-moment" data-theme="dark" id="hero">
      <ShootingRange>
      <div className="hero">
      {/* Ce qui tient dans le premier écran d'un téléphone. Sur grand écran le
          bloc s'efface (`display: contents`) et ses enfants redeviennent des
          enfants directs du hero : la mise en page ne bouge pas d'un pixel. */}
      <div className="hero-screen">
        <div className="hero-part brandmark" style={{ '--i': 0 }}>{event.app}</div>

        <div className="hero-part hero-title" style={{ '--i': 1 }}>
          <span className="kicker">{event.edition} · {event.datesLabel}</span>
          <ShootableTitle lines={event.name} />
          <p className="tagline">{event.tagline}</p>
        </div>

        <div className="hero-part hero-cd" style={{ '--i': 2 }}>
          <Countdown target={event.startsAt} variant="hero" label="Il reste" />
        </div>
      </div>

      <div className="hero-part stats" style={{ '--i': 3 }}>
        {stats.map((s) => (
          <div key={s.k} style={{ textAlign: 'center' }}>
            <div className="stat-v tnum">{s.v}</div>
            <div className="stat-k">{s.k}</div>
          </div>
        ))}
      </div>

      <div className="hero-part actions" style={{ '--i': 4 }}>
        <Button variant="primary" size="lg" href="#proposer">Rejoindre l'évènement</Button>
        <Button variant="ghost" size="lg" href="#regle">Voir le règlement</Button>
      </div>

      <nav className="hero-part pills" style={{ '--i': 5 }} aria-label="Sections du règlement">
        {navItems.map((n) => {
          const active = current === n.href.slice(1)
          return (
            <a
              key={n.href}
              className={`pill${active ? ' is-active' : ''}`}
              href={n.href}
              data-icon={n.icon}
              aria-current={active ? 'true' : undefined}
            >
              <Icon name={n.icon} size={15} />
              {n.label}
            </a>
          )
        })}
      </nav>
      </div>
      </ShootingRange>
    </header>
  )
}

/* La barre collante n'est pas décorative : sans elle, le sommaire disparaît au
   premier défilement et l'état « section courante » ne se voit jamais. Elle
   emprunte deux pièces du design system restées inutilisées, le flou de fond
   et la variante compacte du décompte. */
function StickyBar() {
  const current = useContext(CurrentSection)
  const [shown, setShown] = useState(false)
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const toggleRef = useRef(null)
  const barRef = useRef(null)

  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return
    const io = new IntersectionObserver(([e]) => {
      const visible = !e.isIntersecting
      setShown(visible)
      // La barre qui s'en va emmène son menu avec elle. Sans ça, remonter au
      // hero laisse un panneau ouvert dans une barre invisible, qui réapparaît
      // déplié au défilement suivant. Fermé ici, à l'endroit où la barre
      // disparaît, plutôt que dans un effet qui court après son propre état.
      if (!visible) setOpen(false)
    }, { threshold: 0 })
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  // Échap referme et rend le focus au bouton — sinon il reste sur un lien qui
  // vient de quitter le document. Un appui ailleurs referme aussi : un menu
  // qu'on ne peut fermer qu'en visant le bouton est un piège sur un téléphone.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }
    const onDown = (e) => { if (!barRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  // Le bouton porte le nom de la section qu'on lit. C'est ce que faisaient les
  // pastilles, et c'est la seule chose qu'elles disaient qu'on perdrait à les
  // replier derrière une icône de menu.
  const item = navItems.find((n) => n.href.slice(1) === current)
  const label = item ? item.label : 'Le règlement'
  const icon = item ? item.icon : 'book'

  return (
    <div
      ref={barRef}
      className={`stickybar${shown ? ' is-shown' : ''}`}
      data-theme="dark"
      aria-hidden={!shown}
    >
      <div className="stickybar-in">
        <a className="stickybar-brand" href="#hero" tabIndex={shown ? undefined : -1}>
          {event.name.join(' ')}
        </a>

        {/* Deux sommaires pour un seul rôle : celui qui ne sert pas est en
            `display: none`, donc il sort aussi de l'arbre d'accessibilité —
            un lecteur d'écran n'en rencontre jamais deux. */}
        <button
          type="button"
          ref={toggleRef}
          className="stickybar-toggle"
          data-icon={icon}
          aria-expanded={open}
          aria-controls={menuId}
          tabIndex={shown ? undefined : -1}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={icon} size={16} />
          <span className="stickybar-toggle-l">{label}</span>
          <ChevronDown size={16} strokeWidth={1.75} absoluteStrokeWidth />
        </button>

        <nav className="stickybar-nav" aria-label="Sections du règlement">
          {navItems.map((n) => {
            const active = current === n.href.slice(1)
            return (
              <a
                key={n.href}
                className={`stickypill${active ? ' is-active' : ''}`}
                href={n.href}
                data-icon={n.icon}
                aria-current={active ? 'true' : undefined}
                tabIndex={shown ? undefined : -1}
                title={n.label}
              >
                <Icon name={n.icon} size={16} />
                <span>{n.label}</span>
              </a>
            )
          })}
        </nav>

        <div className="stickybar-cd">
          <Countdown target={event.startsAt} variant="compact" label="J−" />
        </div>
      </div>

      {/* Toujours dans le document, masqué par `hidden` : `aria-controls` doit
          désigner un élément qui existe, et un panneau monté à l'ouverture ne
          répond à rien tant qu'il n'est pas là. `hidden` le retire aussi bien
          de la mise en page que de la tabulation. */}
      <nav
        className="stickybar-menu"
        id={menuId}
        hidden={!open}
        aria-label="Sections du règlement"
      >
          {navItems.map((n) => {
            const active = current === n.href.slice(1)
            return (
              <a
                key={n.href}
                href={n.href}
                data-icon={n.icon}
                className={active ? 'is-active' : undefined}
                aria-current={active ? 'true' : undefined}
                onClick={() => setOpen(false)}
              >
                <Icon name={n.icon} size={18} />
                {n.label}
              </a>
            )
          })}
      </nav>
    </div>
  )
}

/* --------------------------------------------------- PIÈCES PARTAGÉES */

/* Ce qui a été coupé du fil de lecture n'a pas été jeté : chaque règle garde
   sa justification sous un pli. `<details>` plutôt qu'un bouton et un état :
   le contenu existe dans le document même sans JS, la recherche du navigateur
   le trouve, et l'impression le déplie. */
function Why({ q, a }) {
  return (
    <details className="why">
      <summary>{q}</summary>
      <div className="why-body">
        {a.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </details>
  )
}

/* Deux votes qui font un classement, quatre classements qui font un champion :
   c'est deux fois la même figure, donc un seul schéma — appris en bas de la
   section « meilleur jeu », relu sans effort dans « les titres ».

   Le rail est décoratif au sens strict. Ce qu'il montre — la cible est faite
   des sources — est écrit dans le sous-titre de la cible, sinon la relation
   n'existerait que pour ceux qui voient le dessin. */
function Converge({ sources, target }) {
  return (
    <div className="converge" style={{ '--n': sources.length }} data-stagger>
      <ul className="converge-src">
        {sources.map((s) => (
          <li key={s.what} className="converge-card" data-icon={s.icon}>
            <Icon name={s.icon} size={24} />
            {s.when && <span className="converge-when">{s.when}</span>}
            <span className="converge-what">{s.what}</span>
            {s.sub && <span className="converge-sub">{s.sub}</span>}
          </li>
        ))}
      </ul>

      <div className="converge-link" aria-hidden="true">
        {sources.map((s) => <span key={s.what} className="converge-tick" />)}
        <span className="converge-rail" />
        <span className="converge-drop" />
      </div>

      <div
        className={`converge-target${target.gold ? ' is-gold' : ' card'}`}
        data-icon={target.icon}
      >
        <Icon name={target.icon} size={32} />
        <span className="converge-what">{target.what}</span>
        <span className="converge-sub">{target.sub}</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ SECTIONS */

/* Trois cartes de prose racontaient un déroulé en colonnes — or un déroulé se
   lit dans l'ordre. Les quatre moments passent sur un axe, et les paris en
   bande sous les quatre : leur portée est le week-end entier, et c'est la
   bande qui le dit, plus la phrase « tout le week-end ». */
function Weekend() {
  return (
    <Section
      id="bref" icon="clock" title="Le week-end en bref"
      sub="Quatre moments, et des paris tout du long."
    >
      <p className="prose" data-reveal>{weekend.purpose}</p>

      <ol className="frise" data-stagger="tight">
        {weekend.moments.map((m) => (
          <li key={m.what} className="frise-step" data-icon={m.icon}>
            <span className="frise-when">{m.when}</span>
            <span className="frise-what">{m.what}</span>
            <span className="frise-sub">{m.sub}</span>
          </li>
        ))}
      </ol>

      <div className="frise-band" data-icon={weekend.band.icon} data-reveal>
        <Icon name={weekend.band.icon} size={22} />
        <div>
          <b>{weekend.band.what}</b>{' '}
          <span>{weekend.band.sub}</span>
        </div>
      </div>
    </Section>
  )
}

function GoldenRule() {
  return (
    <Section id="regle" icon="book" title="Une règle importante" moment>
      <div className="panel-gold">
        <p className="rule-headline">
          {goldenRule.headline[0]}<br />{goldenRule.headline[1]}
        </p>
        <p className="prose">{goldenRule.lead}</p>

        <div className="oneway" aria-hidden="true">
          <div className="oneway-side" data-icon="target">
            <span className="oneway-label">Le terrain</span>
            <span className="oneway-what">duels et équipes</span>
            <span className="oneway-earn">points + jetons</span>
          </div>

          <div className="oneway-link">
            <span className="oneway-arrow oneway-yes">
              <ArrowRight size={20} strokeWidth={1.75} absoluteStrokeWidth />
              <em>rapporte</em>
            </span>
            <span className="oneway-arrow oneway-no">
              <ArrowLeft size={20} strokeWidth={1.75} absoluteStrokeWidth />
              <em>jamais</em>
            </span>
          </div>

          <div className="oneway-side" data-icon="dice">
            <span className="oneway-label">La cagnotte</span>
            <span className="oneway-what">jetons et paris</span>
            <span className="oneway-earn">jetons seulement</span>
          </div>
        </div>

        <p className="rule-kicker">{goldenRule.kicker}</p>

        <Why {...goldenRule.why} />
      </div>
    </Section>
  )
}

/* Le samedi est un emboîtement : une manche dans un duel, un duel dans un
   tour, cinq tours dans un classement, un classement dans un draft. Quatre
   paragraphes le décrivaient chacun à leur tour ; les étapes numérotées le
   montrent en zoom arrière, dans l'ordre où on le vit. Le barème reste un
   tableau — trois colonnes de chiffres n'ont rien à gagner à devenir un
   dessin. */
function Saturday() {
  return (
    <Section
      id="samedi" icon="target" title="Samedi — les duels"
      badge="Jour 1 · samedi 10 octobre"
    >
      <div className="split">
        <div>
          <p className="prose">{saturday.lead}</p>

          <ol className="steps" data-stagger>
            {saturday.steps.map((s) => (
              <li key={s.k} data-icon={s.icon}>
                <span className="steps-k">{s.k}</span>
                <span className="steps-t">{s.t}</span>
                {s.s && <span className="steps-s">{s.s}</span>}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <div className="card list">
            <div className="card-label">Les points</div>
            {points.map((p) => (
              <Row key={p.k} k={p.k} v={p.v} color={p.strong ? 'var(--ink-brand)' : 'var(--text-muted)'} />
            ))}
          </div>
          <p className="note">{saturday.pointsNote}</p>
        </div>
      </div>
    </Section>
  )
}

/* La formule tient en une ligne, mais une division ne se sent pas. Le schéma
   donne à chaque camp la largeur de ce qui est misé dessus et pose sa cote
   juste dessous : large et petite, étroite et grosse — le rapport inverse se
   voit avant de se lire. Tout sort de `bettingExample`, largeurs comprises,
   passées en `fr` ; la barre est le rapport, pas une image du rapport.

   Les deux onglets ne touchent pas au marché — mêmes mises, mêmes cotes, même
   barre. Ils n'en changent que le dénouement, et c'est justement ce qu'on veut
   faire sentir : la cote est fixée par les mises, pas par le résultat, et le
   même pari vaut +26 ou −10 selon un duel qui n'a pas encore été joué. Sans le
   second onglet la page ne montrerait que les gains, ce qui est la manière
   habituelle de mentir sur un pari.

   Convention de balisage du bloc : `<b>` porte les nombres mis en avant, qui
   passent en display, et `<strong>` l'emphase de prose. Les deux ont des
   rendus différents, il faut les choisir en connaissance de cause. */
function BettingExample() {
  const { stake, camps, outcomes } = bettingExample
  const uid = useId()
  const [tab, setTab] = useState(0)
  const tabRefs = useRef([])

  const pot = camps.reduce((total, c) => total + c.staked, 0)
  const odds = camps.map((c) => pot / c.staked)
  // Les gains sont arrondis au jeton supérieur — c'est la règle de la page,
  // pas un arrondi d'affichage : 13,8 devient 14, et le lecteur peut refaire
  // le calcul sur la carte sans tomber sur un autre chiffre.
  const payouts = odds.map((o) => Math.ceil(stake * o))
  // Virgule décimale, et deux décimales même quand la seconde est nulle : deux
  // cotes côte à côte se comparent au chiffre près, pas à la longueur près.
  const cote = (n) => n.toFixed(2).replace('.', ',')

  // Un duel a deux camps. L'outsider est celui sur qui on a le moins misé — pas
  // celui qui est écrit en second : la chute reste vraie si on inverse les deux
  // mises dans `content.jsx`.
  const outsider = camps[0].staked <= camps[1].staked ? 0 : 1
  const favorite = 1 - outsider
  // Le camp du lecteur. `Math.max` garde la page debout si le drapeau saute.
  const mine = Math.max(camps.findIndex((c) => c.yours), 0)
  const { won } = outcomes[tab]
  const winner = won ? mine : 1 - mine

  // Onglets ARIA : les flèches changent d'onglet et emmènent le focus avec
  // elles. Sans ça il resterait sur un bouton qui vient de passer en
  // `tabindex="-1"`, et la tabulation suivante repartirait du début de la page.
  const select = (i) => {
    setTab(i)
    tabRefs.current[i]?.focus()
  }
  const onKeyDown = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (!step) return
    e.preventDefault()
    select((tab + step + outcomes.length) % outcomes.length)
  }

  return (
    <div className="card pad example">
      <div className="example-head">
        <span className="example-tag">Un exemple</span>
        <div
          className="example-tabs"
          role="tablist"
          aria-label="Dénouement du pari"
          onKeyDown={onKeyDown}
        >
          {outcomes.map((o, i) => (
            <button
              key={o.tab}
              ref={(el) => { tabRefs.current[i] = el }}
              type="button"
              role="tab"
              id={`${uid}-tab-${i}`}
              aria-selected={tab === i}
              aria-controls={`${uid}-panel`}
              tabIndex={tab === i ? 0 : -1}
              className="example-tab"
              onClick={() => select(i)}
            >
              {o.tab}
            </button>
          ))}
        </div>
      </div>

      <div className="example-setup">
        <p className="example-premise">
          Tu mises <span className="tnum">{stake}</span> jetons sur{' '}
          <strong>{camps[mine].name}</strong>.
        </p>
        <p className="example-pot">
          Cagnotte du duel <b className="tnum">{pot}</b> jetons
        </p>
      </div>

      {/* Décoratif au sens strict : la barre ne dit rien que les deux cartes
          ne redisent en toutes lettres, elle le dit en largeur. */}
      <div
        className="example-bar"
        style={{ gridTemplateColumns: camps.map((c) => `${c.staked}fr`).join(' ') }}
        aria-hidden="true"
      >
        {camps.map((c) => (
          <div key={c.name} className="example-seg">
            <span className="example-seg-k">{c.name}</span>
            <span className="example-seg-v tnum">{c.staked}</span>
          </div>
        ))}
      </div>
      <p className="example-caption">
        Mises de chaque camp, les <span className="tnum">5</span> jetons de la maison compris.
        Les <span className="tnum">{pot}</span> jetons vont au camp gagnant, partagés selon
        ce que chacun a misé.
      </p>

      <div
        className="example-panel"
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${tab}`}
        tabIndex={0}
      >
        <div className="example-camps">
          {camps.map((c, i) => (
            <div key={c.name} className={`example-camp${i === winner ? ' is-winner' : ''}`}>
              <div className="example-camp-head">
                <span className="example-name">{c.name}</span>
                <span className="example-verdict">{i === winner ? 'gagne' : 'perd'}</span>
              </div>
              <div className="example-role">{c.role}</div>
              <div className="example-cote tnum">{cote(odds[i])}</div>
              <div className="example-calc tnum">cote = {pot} ÷ {c.staked}</div>
              <div className="example-gain">
                {i === winner ? (
                  <>
                    Miser <span className="tnum">{stake}</span> ici rapporte{' '}
                    <b className="tnum">{payouts[i]}</b>
                  </>
                ) : (
                  <>Les mises de ce camp sont perdues.</>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={`example-result${won ? '' : ' is-lost'}`}>
          <span className="example-result-v tnum">
            {won ? `+${payouts[mine] - stake}` : `−${stake}`}
          </span>
          <p className="example-result-t">
            {won ? (
              <>
                <strong>{camps[winner].name}</strong> gagne. Tu récupères{' '}
                <span className="tnum">{payouts[mine]}</span> jetons pour ta mise de{' '}
                <span className="tnum">{stake}</span>.
              </>
            ) : (
              <>
                <strong>{camps[winner].name}</strong> gagne. Ta mise ne revient pas : ce sont les{' '}
                <span className="tnum">{camps[winner].staked}</span> jetons misés sur{' '}
                {camps[winner].name} qui se partagent les <span className="tnum">{pot}</span>.
              </>
            )}
          </p>
        </div>

        <p className="example-note">
          {won ? (
            <>
              Même mise, même risque : <b className="tnum">+{payouts[outsider] - stake}</b> sur{' '}
              {camps[outsider].role} contre <b className="tnum">+{payouts[favorite] - stake}</b> sur{' '}
              {camps[favorite].role}.
            </>
          ) : (
            <>
              Une mise perdue l'est en entier — c'est le prix de la cote à{' '}
              <span className="tnum">{cote(odds[mine])}</span>. C'est à ça que sert le plafond de{' '}
              <strong>20 %</strong> : un duel raté ne ruine personne.
            </>
          )}
        </p>
      </div>
    </div>
  )
}

/* L'exemple chiffré est déjà le schéma de la section : il montre la cote, le
   gain et la perte sur un cas qu'on peut refaire de tête. Le pavé de prose qui
   le précédait redisait tout ça en mots — il est parti. Les quatre règles
   gardent leur « pourquoi », mais en une ligne grise : c'est ce qui les rend
   acceptables, ça ne doit pas peser autant que la règle elle-même. */
function Betting() {
  return (
    <Section id="paris" icon="dice" title="Les jetons et les paris" sub="Une seule cagnotte, une seule formule, quatre règles.">
      <div className="autogrid c280" style={{ marginBottom: 'var(--sp-7)' }}>
        <div className="card list">
          <div className="card-label">D'où viennent les jetons</div>
          {jetonSources.map((s) => (
            <div key={s.k} className="row" style={{ padding: '12px 20px' }}>
              <span style={{ fontSize: 'var(--text-sm)' }}>{s.k}</span>
              <span className="tnum" style={{ color: 'var(--ink-jeton)', fontWeight: 700 }}>{s.v}</span>
            </div>
          ))}
        </div>

        <div className="card pad">
          <div className="card-label" style={{ padding: 0, marginBottom: 14 }}>Comment marchent les paris</div>
          <p style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--lh-loose)', margin: '0 0 16px' }}>
            {bettingIntro}
          </p>
          <div className="formula">
            cote = cagnotte du duel ÷ ce qui est misé sur ce camp<br />
            gain = ta mise × la cote
          </div>
          <p className="note">{bettingRounding}</p>
        </div>
      </div>

      <p className="prose" style={{ maxWidth: 820, marginBottom: 'var(--sp-7)' }}>
        <strong>{bettingKicker}</strong> Les cotes bougent en direct dans l'appli, au fur et à
        mesure des mises.
      </p>

      <BettingExample />

      <div className="eyebrow" style={{ marginBottom: 'var(--sp-4)' }}>Les quatre règles</div>
      <ul className="rulegrid" data-stagger>
        {bettingRules.map((r) => (
          <li key={r.k}>
            <span className="rulegrid-k">{r.k}</span>
            <p className="rulegrid-t">{r.t}</p>
          </li>
        ))}
      </ul>
      <p className="note">{refund}</p>
      <Why {...bettingRulesWhy} />

      <div className="panel-error">
        <div style={{
          fontFamily: 'var(--font-display)', textTransform: 'uppercase',
          fontSize: 14, color: 'var(--error)', marginBottom: 10,
        }}>
          {fixedMatch.title}
        </div>
        <p style={{ fontSize: 15, lineHeight: 'var(--lh-loose)', margin: 0 }}>
          {fixedMatch.text}
        </p>
        <Why {...fixedMatch.why} />
      </div>
    </Section>
  )
}

/* La règle du dimanche est une rotation des rôles : deux équipes jouent, les
   autres parient. Trois lignes la montrent, et elles montrent en prime qu'elle
   tourne — ce qu'un paragraphe ne peut qu'affirmer.

   Les appariements sont calculés, pas écrits : changer la liste des équipes
   dans `content.jsx` refait le schéma et le compte de matchs avec. Le nombre
   d'équipes du jour J n'est pas connu, il ne pouvait pas être codé en dur. */
function Sunday() {
  const { teams, shownRows } = sunday
  const pairs = []
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) pairs.push([i, j])
  }
  // Les trois lignes montrées sont prélevées à intervalle régulier, pas prises
  // dans l'ordre : les premiers appariements font tous jouer la première
  // équipe, et un schéma censé montrer que le rôle tourne montrerait alors
  // trois fois la même équipe sur le terrain.
  const shown = Array.from({ length: Math.min(shownRows, pairs.length) }, (_, i) =>
    pairs[Math.round((i * (pairs.length - 1)) / Math.max(shownRows - 1, 1))])

  return (
    <Section
      id="dimanche" icon="team" title="Dimanche — les équipes"
      badge="Jour 2 · dimanche 11 octobre"
      sub="Chacune contre toutes, et celles qui se reposent tiennent le marché."
    >
      <div className="split">
        <div>
          <p className="prose">{sunday.lead}</p>

          <ol className="rota" data-stagger="tight">
            {shown.map(([a, b]) => (
              <li key={`${teams[a]}-${teams[b]}`}>
                <span className="rota-group">
                  <span className="team plays">{teams[a]}</span>
                  <span className="rota-vs">vs</span>
                  <span className="team plays">{teams[b]}</span>
                </span>
                <span className="rota-group is-bets">
                  <span className="rota-label">parient</span>
                  {teams.filter((_, k) => k !== a && k !== b).map((t) => (
                    <span key={t} className="team bets">{t}</span>
                  ))}
                </span>
              </li>
            ))}
          </ol>

          <p className="note">
            <span className="tnum">{shown.length}</span> des{' '}
            <span className="tnum">{pairs.length}</span> matchs d'un tournoi à{' '}
            <span className="tnum">{teams.length}</span> équipes. {sunday.note}
          </p>

          {/* La convention plein / tireté est la même que la bande des paris de
              la frise. Elle ne s'apprend qu'une fois, mais elle s'apprend. */}
          <div className="schema-legend" aria-hidden="true">
            <span><i className="team plays" /> joue</span>
            <span><i className="team bets" /> parie</span>
          </div>

          <Why {...sunday.why} />
        </div>

        <div className="card pad" style={{ padding: 28 }}>
          <div className="eyebrow" style={{ fontSize: 14, marginBottom: 10 }}>{sunday.side.title}</div>
          <p style={{ fontSize: 15, lineHeight: 'var(--lh-loose)', margin: 0 }}>{sunday.side.text}</p>
        </div>
      </div>

      <div className="eyebrow" style={{ margin: 'var(--sp-8) 0 var(--sp-4)' }}>
        {sunday.betting.title}
      </div>
      <ul className="chips" data-stagger="tight">
        {sunday.betting.rules.map((r) => (
          <li key={r.k}>
            <span className="chips-k">{r.k}</span>
            <span className="chips-t">{r.t}</span>
          </li>
        ))}
      </ul>
    </Section>
  )
}

function BestGame() {
  return (
    <Section id="prix" icon="medal" title="Le prix du meilleur jeu" sub={bestGame.lead}>
      <Converge sources={bestGame.votes} target={bestGame.target} />

      <ul className="chips" data-stagger="tight" style={{ margin: 'var(--sp-7) 0', maxWidth: 820 }}>
        {bestGame.how.map((h) => (
          <li key={h.k}>
            <span className="chips-k">{h.k}</span>
            <span className="chips-t">{h.t}</span>
          </li>
        ))}
      </ul>

      <div className="eyebrow" style={{ marginBottom: 'var(--sp-4)' }}>On vote sur deux questions</div>
      <ul className="bullets">
        {bestGame.criteria.map((c, i) => <li key={i}>{c}</li>)}
      </ul>

      <div className="panel-prize">{bestGame.prize}</div>
      <p className="note" style={{ maxWidth: 820 }}>{bestGame.note}</p>

      <Why {...bestGame.why} />
    </Section>
  )
}

/* Cinq cartes égales cachaient que le cinquième titre est fait des quatre
   autres. Le schéma le dit sans phrase, et il ne reste qu'un seul élément doré
   dans la section — c'est là tout l'intérêt d'un accent : il ne signale que
   s'il est rare. */
function Titles() {
  return (
    <Section
      id="titres" icon="trophy" title="Les cinq titres"
      sub="Quatre classements, et un cinquième titre qui se fait des quatre."
    >
      <Converge
        sources={titles.rankings.map((r) => ({ icon: r.icon, what: r.name, sub: r.meta }))}
        target={{ ...titles.absolute, what: titles.absolute.name, sub: titles.absolute.meta, gold: true }}
      />
      <p className="prose muted last" style={{ fontSize: 15, maxWidth: 720, marginTop: 'var(--sp-7)' }}>
        {titles.kicker}
      </p>
    </Section>
  )
}

function Propose() {
  return (
    <Section id="proposer" icon="gear" title="Proposer un jeu" sub="Un jeu par personne. Connu ou inventé, peu importe.">
      <div className="split wide-left" style={{ marginBottom: 'var(--sp-7)' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 'var(--sp-4)' }}>Les contraintes — lisez-les vraiment</div>
          <ul className="chips" data-stagger="tight">
            {constraints.map((c) => (
              <li key={c.k}>
                <span className="chips-k">{c.k}</span>
                <span className="chips-t">{c.t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card list">
          <div className="card-label">Le format</div>
          {proposalFormat.map((f) => (
            <div key={f.label} className="format-row" data-icon={f.icon}>
              <Icon name={f.icon} size={20} /> {f.label}
            </div>
          ))}
        </div>
      </div>

      <p className="prose" style={{ fontSize: 15, maxWidth: 820 }}>{sponsorNote}</p>

      <Signup />
    </Section>
  )
}

/* ------------------------------------------------------------- S'INSCRIRE
   Le formulaire porte les questions ; la page n'en reprend aucune. Il n'y a
   donc rien à copier, rien à coller, et rien à tenir en double ici. */

function Signup() {
  return (
    <div className="signup card pad" data-reveal>
      <div className="eyebrow">{signup.eyebrow}</div>
      <p className="prose" style={{ fontSize: 15 }}>{signup.lead}</p>

      <div className="signup-actions">
        {/* Le formulaire est ailleurs : il s'ouvre à côté, la page reste
            ouverte derrière pour qu'on puisse y revenir vérifier une règle. */}
        <Button variant="primary" href={signup.formUrl} target="_blank">
          {signup.formLabel}
        </Button>
      </div>

      <p className="prose muted last" style={{ fontSize: 'var(--text-sm)' }}>{signup.note}</p>
    </div>
  )
}

function Roles() {
  return (
    <Section id="qui" icon="team" title="Qui fait quoi" sub="Trois rôles, et une seule voix qui tranche.">
      <div className="autogrid c240">
        {roles.map((r) => (
          <div key={r.name} className="card pad">
            <div className="eyebrow" style={{ marginBottom: 8 }}>{r.name}</div>
            <p className="prose muted last" style={{ fontSize: 'var(--text-sm)' }}>{r.text}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ PAGE */
// Figé hors du composant : passer un tableau neuf à chaque rendu relancerait
// l'observateur en boucle.
const SECTION_IDS = navItems.map((n) => n.href.slice(1))

export default function Presentation() {
  const current = useSectionSpy(SECTION_IDS)
  useReveal()
  return (
    <CurrentSection value={current}>
    <div data-theme="light" style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', overflowX: 'hidden' }}>
      <StickyBar />
      <Hero />
      <Weekend />
      <GoldenRule />
      <Saturday />
      <Betting />
      <Sunday />
      <BestGame />
      <Titles />
      <Propose />
      <Roles />

      <footer className="page-footer">
        <div style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: 18 }}>
          {event.name.join(' ')}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: 0, maxWidth: 480, lineHeight: 'var(--lh-loose)' }}>
          {event.edition} · {event.footerNote}
        </p>
      </footer>
    </div>
    </CurrentSection>
  )
}
