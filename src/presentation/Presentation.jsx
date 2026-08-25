import { createContext, useContext, useEffect, useId, useRef, useState } from 'react'
import { Button, Countdown } from '../ds'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Icon } from './icons.jsx'
import { ShootableTitle, ShootingRange } from './ShootingRange.jsx'
import {
  event, stats, navItems, brief, points, jetonSources, bettingRules,
  bettingExample, titles, constraints, proposalFormat, roles,
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
   et un groupe oublié se voit tout de suite, il n'apparaît simplement pas. */
const REVEAL = '.section-head, .autogrid, .split, .card.list, .panel-gold, .bullets, .panel-error, .example'

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

  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting), { threshold: 0 })
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  return (
    <div className={`stickybar${shown ? ' is-shown' : ''}`} data-theme="dark" aria-hidden={!shown}>
      <div className="stickybar-in">
        <a className="stickybar-brand" href="#hero">{event.name.join(' ')}</a>
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
    </div>
  )
}

/* ------------------------------------------------------------ SECTIONS */
function Brief() {
  return (
    <Section id="bref" icon="clock" title="Le week-end en bref" sub="Ce qu'il faut savoir avant de lire le reste.">
      <div className="autogrid c260">
        {brief.map((b) => (
          <div key={b.day} className="card pad" style={{ padding: 28 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>{b.day}</div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 'var(--lh-loose)' }}>{b.text}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

function GoldenRule() {
  return (
    <Section
      id="regle" icon="book" title="Une règle importante"
      moment
    >
      <div className="panel-gold">
        <p className="rule-headline">
          Gagner des duels rapporte des jetons.<br />Gagner des paris ne rapporte aucun point.
        </p>
        <p className="prose">
          Il y a deux classements, et <strong>une seule passerelle entre eux</strong>. Elle ne va que dans
          un sens : le terrain remplit la cagnotte, la cagnotte ne remplit jamais le terrain.
        </p>

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

        <div className="eyebrow" style={{ marginTop: 'var(--sp-6)' }}>Pourquoi deux classements séparés</div>

        <p className="prose">
          <strong>Parce qu'ils ne mesurent pas la même chose.</strong> Le classement des duels mesure ton
          adresse au jeu. Le classement des parieurs mesure ta lecture des joueurs : savoir qui va gagner
          n'a rien à voir avec savoir gagner. Deux talents, donc deux titres.
        </p>
        <p className="prose">
          <strong>Et parce que les mélanger casserait les deux.</strong> Si les paris alimentaient le
          classement des duels, on pourrait y grimper sans jouer. Pire : il deviendrait rentable de miser
          contre soi puis de perdre son duel exprès. C'est exactement ce qui s'est passé l'an dernier —
          parier rapportait plus que jouer.
        </p>
        <p className="prose">
          Cette année, si tu perds volontairement, tu perds des points bien réels et tu gagnes une monnaie
          qui ne te fera pas remonter.
        </p>
        <p className="rule-kicker">Ça ne vaut jamais le coup. C'est fait pour.</p>
      </div>
    </Section>
  )
}

function Saturday() {
  return (
    <Section
      id="samedi" icon="target" title="Samedi — les duels"
      badge="Jour 1 · samedi 10 octobre"
      sub="Un contre un, cinq tours, tout le monde joue jusqu'au bout."
    >
      <div className="split">
        <div>
          <p className="prose">
            On joue en <strong>système suisse</strong> : à chaque tour, l'appli t'apparie avec quelqu'un
            qui a à peu près ton niveau, sur un jeu que tu n'as pas encore fait.{' '}
            <strong>Personne n'est éliminé</strong>, tout le monde joue les cinq tours.
          </p>
          <p className="prose">
            Un duel se joue en <strong>deux manches gagnantes</strong>. Chaque duel gagné rapporte en plus{' '}
            <strong style={{ color: 'var(--ink-jeton)' }}>10 jetons</strong> pour parier.
          </p>
          <p className="prose muted" style={{ marginBottom: 'var(--sp-7)' }}>
            Le point de consolation à 1–2 n'est pas décoratif : sur cinq tours, il fait la différence entre
            la cinquième et la dixième place. Accrochez-vous même mal partis.
          </p>
          <div className="eyebrow">Le draft, samedi soir</div>
          <p className="prose last">
            Les <strong>premiers du classement</strong> deviennent capitaines — autant qu'il y aura
            d'équipes — et choisissent leurs joueurs à tour de rôle, devant tout le monde. D'où l'intérêt de
            bien finir la journée.
          </p>
        </div>

        <div className="card list">
          <div className="card-label">Les points</div>
          {points.map((p) => (
            <Row key={p.k} k={p.k} v={p.v} color={p.strong ? 'var(--ink-brand)' : 'var(--text-muted)'} />
          ))}
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
        Ce qui est misé sur chaque camp, les <span className="tnum">5</span> jetons que la
        maison pose de chaque côté compris. Les <span className="tnum">{pot}</span> jetons vont
        au camp gagnant, partagés au prorata des mises.
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
            Personne ne fixe les cotes. Tout le monde mise, et la cagnotte du duel est partagée entre les
            gagnants au prorata de leur mise.
          </p>
          <div className="formula">
            cote = cagnotte du duel ÷ ce qui est misé sur ce camp<br />
            gain = ta mise × la cote
          </div>
        </div>
      </div>

      <p className="prose" style={{ maxWidth: 820, marginBottom: 'var(--sp-7)' }}>
        C'est tout. Il n'y a pas d'autre source, et <strong>ils ne se transforment jamais en points</strong>.
        Les gains sont <strong>arrondis au jeton supérieur</strong> : la maison absorbe les centimes, jamais
        toi. Plus il y a de monde sur un joueur, moins il paie.{' '}
        <strong>Miser sur l'outsider quand personne n'y croit, c'est là que ça paie.</strong> Les cotes
        bougent en direct dans l'appli au fur et à mesure des mises.
      </p>

      <BettingExample />

      <div className="eyebrow" style={{ marginBottom: 'var(--sp-4)' }}>Les quatre règles</div>
      <ul className="bullets">
        {bettingRules.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
      <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: '0 0 var(--sp-7)' }}>
        Égalité, forfait, blessure : <strong>tout le monde est remboursé</strong>.
      </p>

      <div className="panel-error">
        <div style={{
          fontFamily: 'var(--font-display)', textTransform: 'uppercase',
          fontSize: 14, color: 'var(--error)', marginBottom: 10,
        }}>
          Match arrangé
        </div>
        <p style={{ fontSize: 15, lineHeight: 'var(--lh-loose)', margin: '0 0 10px' }}>
          Si un duel n'est visiblement pas joué sérieusement, le commissaire l'annule.{' '}
          <strong>Tous les paris sont remboursés</strong>, le duel est rejoué, et celui qui a fait le malin
          prend <strong>−3 points</strong>.
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
          Le remboursement est le cœur du truc : un match truqué ne peut structurellement rien rapporter à
          personne.
        </p>
      </div>
    </Section>
  )
}

function Sunday() {
  return (
    <Section
      id="dimanche" icon="team" title="Dimanche — les équipes"
      badge="Jour 2 · dimanche 11 octobre"
      sub="Chacune contre toutes, et celle qui se repose tient le marché."
    >
      <div className="split">
        <div>
          <p className="prose">
            Chaque équipe affronte toutes les autres. À chaque match,{' '}
            <strong>au moins une équipe ne joue pas</strong> : c'est elle le public, et{' '}
            <strong>c'est elle qui parie.</strong>
          </p>
          <p className="prose muted">
            Ce n'est pas un détail d'organisation. Une équipe qui parie sur un match qu'elle ne dispute pas
            ne peut pas en influencer le résultat — le marché reste propre par construction, sans qu'on ait
            besoin d'une seule règle en plus.
          </p>
          <p className="prose last">
            On fixera le nombre d'équipes une fois qu'on saura combien on est. Le principe, lui, ne bouge pas.
          </p>
        </div>
        <div className="card pad" style={{ padding: 28 }}>
          <div className="eyebrow" style={{ fontSize: 14, marginBottom: 10 }}>Paris annexes</div>
          <p style={{ fontSize: 15, lineHeight: 'var(--lh-loose)', margin: 0 }}>
            En plus du vainqueur, on ouvre des paris sur le score exact, l'écart, le meilleur joueur du
            match. C'est ce qui sauve l'intérêt quand un match est joué d'avance.
          </p>
        </div>
      </div>
    </Section>
  )
}

function BestGame() {
  return (
    <Section id="prix" icon="medal" title="Le prix du meilleur jeu" sub="Concevoir un bon jeu est une façon de gagner à part entière.">
      <p className="prose" style={{ maxWidth: 820, marginBottom: 'var(--sp-7)' }}>
        Deux votes : <strong>meilleur jeu de duel</strong> samedi soir au moment du draft,{' '}
        <strong>meilleur jeu d'équipe</strong> dimanche à la remise des prix. Chacun classe ses{' '}
        <strong>trois jeux préférés</strong> — 3, 2 et 1 points.{' '}
        <strong>Interdit de voter pour le sien.</strong>
      </p>

      <div className="eyebrow" style={{ marginBottom: 'var(--sp-4)' }}>On vote sur deux questions</div>
      <ul className="bullets">
        <li><strong>Lequel tu remets l'an prochain ?</strong></li>
        <li><strong>Lequel est le mieux réglé ?</strong> Règles claires, score incontestable, équilibré.</li>
      </ul>

      <p className="prose muted" style={{ maxWidth: 820, fontSize: 15, marginBottom: 'var(--sp-7)' }}>
        La deuxième question n'est pas là pour décorer. Un jeu où seul son parrain gagne, ça se voit en deux
        duels, et ça coûte le prix.{' '}
        <strong>Inventez des jeux justes, pas des jeux où vous gagnez.</strong>
      </p>

      <div style={{
        background: 'var(--gold-wash)', border: '1px solid var(--gold-line)',
        borderRadius: 'var(--radius-md)', padding: 'var(--sp-6)', maxWidth: 820, marginBottom: 'var(--sp-5)',
      }}>
        <p style={{ fontSize: 15, lineHeight: 'var(--lh-loose)', margin: 0 }}>
          Le gagnant de samedi touche <strong style={{ color: 'var(--ink-jeton)' }}>50 jetons</strong>,
          utilisables dès dimanche. C'est autant que si tu avais gagné tous tes duels de la journée.
        </p>
      </div>

      <p style={{ fontSize: 14, color: 'var(--text-faint)', maxWidth: 820, margin: 0 }}>
        À noter — ces points vont au <strong>classement des créateurs</strong>, pas au classement des duels.
        Le champion des duels se gagne sur le terrain, jamais par un vote.
      </p>
    </Section>
  )
}

function Titles() {
  return (
    <Section id="titres" icon="trophy" title="Les cinq titres" sub="Cinq façons de gagner. Il y en a forcément une pour toi.">
      <div className="autogrid c220" style={{ marginBottom: 'var(--sp-7)' }}>
        {titles.map((t) => (
            <div
              key={t.name}
              className={`title-card${t.highlight ? '' : ' card'}`}
              data-icon={t.icon}
              style={{
                borderRadius: 'var(--radius-md)',
                padding: 'var(--sp-6)',
                ...(t.highlight
                  ? { background: 'var(--gold-wash)', border: '1px solid var(--gold-line)' }
                  : {}),
              }}
            >
              <div className="title-card-icon"><Icon name={t.icon} size={40} /></div>
              <div style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: 16, marginBottom: 4 }}>
                {t.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.meta}</div>
            </div>
        ))}
      </div>
      <p className="prose muted last" style={{ fontSize: 15, maxWidth: 720 }}>
        Nul aux jeux d'adresse mais bon lecteur de joueurs ? Il y a un titre pour toi. Mauvais parieur mais bon
        inventeur ? Aussi.
      </p>
    </Section>
  )
}

function Propose() {
  return (
    <Section id="proposer" icon="gear" title="Proposer un jeu" sub="Un jeu par personne. Connu ou inventé, peu importe.">
      <div className="split" style={{ gridTemplateColumns: '1.2fr 1fr', marginBottom: 'var(--sp-7)' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 'var(--sp-4)' }}>Les contraintes — lisez-les vraiment</div>
          <ul className="bullets" style={{ marginBottom: 0 }}>
            {constraints.map((c, i) => <li key={i}>{c}</li>)}
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

      <p className="prose last" style={{ fontSize: 15, maxWidth: 820 }}>
        Si votre jeu est retenu, vous en êtes le <strong>parrain</strong> : vous apportez le matos et vous
        expliquez la règle le jour J. Et vous démarrez avec{' '}
        <strong style={{ color: 'var(--ink-jeton)' }}>10 jetons de bonus</strong>.
      </p>
    </Section>
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
      <Brief />
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
