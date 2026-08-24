import { createContext, useContext, useEffect, useState } from 'react'
import { Button, Countdown } from '../ds'
import { Icon } from './icons.jsx'
import {
  event, stats, navItems, brief, points, jetonSources, bettingRules,
  titles, constraints, proposalFormat, roles,
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

function Section({ id, icon, title, sub, badge, children }) {
  const active = useContext(CurrentSection) === id
  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`}>
      <div className="wrap">
        <div className={`section-rule${active ? ' is-active' : ''}`} data-icon={icon}>
          <span className="section-icon"><Icon name={icon} size={22} /></span>
          <div className="bar" />
        </div>
        {badge && <div className="day-badge">{badge}</div>}
        <h2 id={`${id}-title`}>{title}</h2>
        <p className="sub">{sub}</p>
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
    <header className="hero">
      <div className="brandmark">{event.app}</div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <span className="kicker">{event.edition} · {event.datesLabel}</span>
        <h1>
          {event.name.map((line, i) => (
            <span key={line} style={{ display: 'block' }}>{line}</span>
          ))}
        </h1>
        <p className="tagline">{event.tagline}</p>
      </div>

      <Countdown target={event.startsAt} variant="hero" label="Il reste" />

      <div className="stats">
        {stats.map((s) => (
          <div key={s.k} style={{ textAlign: 'center' }}>
            <div className="stat-v tnum">{s.v}</div>
            <div className="stat-k">{s.k}</div>
          </div>
        ))}
      </div>

      <div className="actions">
        <Button variant="primary" size="lg" href="#proposer">Rejoindre l'évènement</Button>
        <Button variant="ghost" size="lg" href="#regle">Voir le règlement</Button>
      </div>

      <nav className="pills" aria-label="Sections du règlement">
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
    </header>
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
    <Section id="regle" icon="book" title="La règle d'or" sub="Si vous ne lisez qu'un paragraphe, c'est celui-là.">
      <div className="panel-gold">
        <p style={{
          fontFamily: 'var(--font-display)', textTransform: 'uppercase',
          fontSize: 'clamp(20px,2.6vw,28px)', lineHeight: 'var(--lh-snug)', margin: '0 0 24px',
        }}>
          Gagner des duels rapporte des jetons.<br />Gagner des paris ne rapporte aucun point.
        </p>
        <p className="prose">
          Les deux classements sont totalement séparés. Il n'y a pas de passerelle, et elle ne va que dans
          un sens : le terrain alimente la cagnotte, jamais l'inverse.
        </p>
        <p className="prose">
          L'an dernier c'était le contraire : parier rapportait plus que jouer, et il pouvait devenir
          rentable de perdre un duel exprès. Cette année, si tu perds volontairement, tu perds des points
          bien réels et tu gagnes une monnaie qui ne te fera jamais remonter au classement.
        </p>
        <p style={{
          fontFamily: 'var(--font-display)', textTransform: 'uppercase',
          fontSize: 19, color: 'var(--gold)', margin: 0,
        }}>
          Ça ne vaut jamais le coup. C'est fait pour.
        </p>
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
            <strong style={{ color: 'var(--jeton)' }}>10 jetons</strong> pour parier.
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
            <Row key={p.k} k={p.k} v={p.v} color={p.strong ? 'var(--gold)' : 'var(--text-muted)'} />
          ))}
        </div>
      </div>
    </Section>
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
              <span className="tnum" style={{ color: 'var(--jeton)', fontWeight: 700 }}>{s.v}</span>
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
          Le gagnant de samedi touche <strong style={{ color: 'var(--jeton)' }}>50 jetons</strong>,
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
        Nul aux jeux d'adresse mais bon lecteur de gens ? Il y a un titre pour toi. Mauvais parieur mais bon
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
        <strong style={{ color: 'var(--jeton)' }}>10 jetons de bonus</strong>.
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
  return (
    <CurrentSection value={current}>
    <div data-theme="light" style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', overflowX: 'hidden' }}>
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
