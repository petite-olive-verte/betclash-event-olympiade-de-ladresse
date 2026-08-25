// Tout ce qui change d'un évènement à l'autre vit ici.
// La page ne code en dur ni un effectif, ni un nombre de tours, ni un nombre d'équipes.
//
// Version synthétique : chaque section dense a été ramenée à un schéma et à
// une ou deux phrases. Ce qui a disparu du fil de lecture n'a pas été jeté —
// les justifications vivent dans les `why`, dépliables sous le schéma. Un
// règlement doit rester consultable ; il n'a pas à être lu en entier pour être
// compris.

export const event = {
  app: "BetClash",
  name: ["Olympiade", "de l'adresse"],
  edition: "Édition 2",
  datesLabel: "10 & 11 octobre",
  startsAt: "2026-10-10T10:00:00+02:00",
  tagline:
    "Des duels, des équipes, des paris. Cinq titres à prendre, et une seule règle qui compte vraiment.",
  footerNote:
    "Le règlement peut encore bouger d'ici le jour J. Les questions et les contestations, c'est dans le groupe.",
}

export const stats = [
  { v: "2", k: "jours" },
  { v: "5", k: "tours de duels" },
  { v: "100", k: "jetons au départ" },
  { v: "5", k: "titres" },
]

export const navItems = [
  { href: "#regle", icon: "book", label: "La règle qui compte" },
  { href: "#samedi", icon: "target", label: "Samedi" },
  { href: "#paris", icon: "dice", label: "Jetons & paris" },
  { href: "#dimanche", icon: "team", label: "Dimanche" },
  { href: "#prix", icon: "medal", label: "Meilleur jeu" },
  { href: "#titres", icon: "trophy", label: "Les titres" },
  { href: "#proposer", icon: "gear", label: "Proposer un jeu" },
]

/* ─────────────────────────────────────────────── LE WEEK-END EN BREF
   Trois cartes de prose racontaient un déroulé — or un déroulé se lit dans
   l'ordre, pas en colonnes. La frise le montre : quatre moments sur un rail,
   et les paris en bande sous les quatre, parce que c'est exactement leur
   portée. La bande dit « tout le week-end » mieux qu'une phrase qui le dit. */
export const weekend = {
  moments: [
    { when: "Samedi", icon: "target", what: "Les duels", sub: "cinq tours, un contre un" },
    { when: "Samedi soir", icon: "trophy", what: "Le draft", sub: "les premiers font les équipes" },
    { when: "Dimanche", icon: "team", what: "Les équipes", sub: "chacune contre toutes" },
    { when: "Dimanche soir", icon: "medal", what: "Les titres", sub: "cinq à prendre" },
  ],
  band: {
    icon: "dice",
    what: "Les paris",
    sub: "tout le week-end, sur les duels des autres",
  },
}

/* ───────────────────────────────────────────────────── LA RÈGLE QUI COMPTE
   Le schéma `oneway` portait déjà la règle ; quatre paragraphes la
   redisaient. Il ne reste que l'énoncé et la chute — le raisonnement passe
   sous le pli, où il attend celui qui veut contester. */
export const goldenRule = {
  headline: [
    "Gagner des duels rapporte des jetons.",
    "Gagner des paris ne rapporte aucun point.",
  ],
  lead: (
    <>
      Deux classements, <strong>une seule passerelle</strong>, et elle ne va que dans un sens :
      le terrain remplit la cagnotte, la cagnotte ne remplit jamais le terrain.
    </>
  ),
  kicker: "Ça ne vaut jamais le coup. C'est fait pour.",
  why: {
    q: "Pourquoi deux classements séparés",
    a: [
      <>
        <strong>Ils ne mesurent pas la même chose.</strong> Les duels mesurent ton adresse au jeu,
        les paris ta lecture des joueurs. Savoir qui va gagner n'a rien à voir avec savoir gagner :
        deux talents, donc deux titres.
      </>,
      <>
        <strong>Et les mélanger casserait les deux.</strong> L'an dernier, parier rapportait plus
        que jouer — il devenait rentable de miser contre soi puis de perdre son duel exprès. Cette
        année, perdre volontairement coûte des points bien réels contre une monnaie qui ne les rend
        pas.
      </>,
    ],
  },
}

/* ─────────────────────────────────────────────────────────────── SAMEDI
   Quatre paragraphes décrivaient un emboîtement : une manche dans un duel,
   un duel dans un tour, cinq tours dans un classement, un classement dans un
   draft. Les étapes numérotées le montrent d'un coup d'œil, en zoom arrière.
   Le barème reste un tableau : trois colonnes de chiffres n'ont rien à gagner
   à devenir un dessin. */
export const saturday = {
  lead: (
    <>
      <strong>Système suisse</strong> : l'appli te trouve un adversaire de ton niveau, sur un
      jeu que tu n'as pas encore fait.
    </>
  ),
  steps: [
    { icon: "target", k: "Un duel", t: "Deux manches gagnantes.", s: "Le gagnant empoche des points et 10 jetons." },
    { icon: "target", k: "Cinq tours", t: "Personne n'est éliminé." },
    { icon: "trophy", k: "Le classement", t: "Samedi soir.", s: "Il fait les capitaines." },
    { icon: "team", k: "Le draft", t: "Les capitaines choisissent leurs joueurs.", s: "Devant tout le monde." },
  ],
  pointsNote: "Le point à 1–2 compte vraiment : il sépare la cinquième de la dixième place.",
}

export const points = [
  { k: "Victoire 2 – 0", v: "4 pts", strong: true },
  { k: "Victoire 2 – 1", v: "3 pts", strong: true },
  { k: "Défaite 1 – 2", v: "1 pt", strong: false },
  { k: "Défaite 0 – 2", v: "0 pt", strong: false },
]

/* ────────────────────────────────────────────────────── JETONS ET PARIS
   L'exemple chiffré est déjà le schéma de la section : il montre la cote, le
   gain et la perte sur un cas concret. Le pavé de prose qui le précédait
   disait la même chose en mots — il est parti. Les quatre règles gardent leur
   « pourquoi », mais sous le pli et d'un bloc : quatre lignes grises sous
   quatre règles, c'était refaire le paragraphe en le découpant. */
export const jetonSources = [
  { k: "Au départ", v: "100" },
  { k: "Chaque duel gagné", v: "+10" },
  { k: "Ton jeu est retenu", v: "+10" },
  { k: "Ton jeu élu meilleur jeu", v: "+50" },
]

export const bettingIntro =
  "Personne ne fixe les cotes : ce sont les mises qui les font."


export const bettingRounding =
  "Les gains sont arrondis au jeton supérieur : la maison absorbe les centimes, jamais toi."

export const bettingKicker = (
  <>
    Plus il y a de monde sur un camp, moins il paie.{' '}
    <strong>Miser sur l'outsider quand personne n'y croit, c'est là que ça paie.</strong>
  </>
)

export const bettingRules = [
  { k: "20 % max", t: <>Tu mises ce que tu veux, <strong>jusqu'à 20 % de ta cagnotte</strong>.</> },
  { k: "+5 / +5", t: <>La maison pose <strong>5 jetons sur chaque camp</strong> à l'ouverture.</> },
  { k: "Pas le tien", t: <>Tu <strong>ne paries pas sur un duel que tu joues</strong>.</> },
  { k: "Coup d'envoi", t: <>Les paris <strong>ferment à la première manche</strong>.</> },
]

export const bettingRulesWhy = {
  q: "Pourquoi ces quatre règles",
  a: [
    <>
      <strong>Le plafond</strong> t'empêche de tout miser d'un coup : un seul pari ne fait
      jamais basculer un classement. <strong>Les 5 jetons de la maison</strong> empêchent que
      tout le monde aille sur le favori, que la cote tombe à 1 et qu'il n'y ait plus rien à
      gagner.
    </>,
    <>
      <strong>La fermeture au coup d'envoi</strong> laisse le temps de miser : les duels suivants
      sont affichés à l'avance, tu paries pendant que le duel en cours se joue.
    </>,
  ],
}

export const refund = "Égalité, forfait, blessure : tout le monde est remboursé."

export const fixedMatch = {
  title: "Match arrangé",
  text: (
    <>
      Un duel joué sans sérieux est annulé : <strong>tous les paris sont remboursés</strong>, le
      duel est rejoué, et celui qui a fait le malin prend <strong>−3 points</strong>.
    </>
  ),
  why: {
    q: "Pourquoi le remboursement plutôt que la sanction seule",
    a: [
      <>
        Le remboursement est le cœur du truc : un match truqué ne rapporte rien à personne,
        donc il n'y a rien à gagner à en organiser un. La sanction, c'est la punition en plus.
      </>,
    ],
  },
}

/* Le duel qui sert d'exemple. On ne pose que les mises : la cagnotte, les
   cotes, les gains et les largeurs du schéma s'en déduisent tous par calcul,
   donc un chiffre changé ici refait le dessin avec. Un exemple dont les
   nombres sont écrits à la main finit toujours par se contredire lui-même. */
export const bettingExample = {
  stake: 10,                                     // dans le plafond de 20 % d'une cagnotte de départ
  camps: [
    { name: 'Alice', role: 'la favorite', staked: 65 },
    // `yours` marque le camp sur lequel mise le lecteur. Un drapeau posé sur le
    // camp plutôt qu'un nom répété ailleurs : il n'y a pas deux endroits à
    // garder d'accord.
    { name: 'Bob', role: "l'outsider", staked: 25, yours: true },
  ],
  // Les deux dénouements du même pari. `won` dit si le camp du lecteur
  // l'emporte — le camp gagnant s'en déduit, donc l'onglet ne peut pas
  // annoncer l'inverse de ce qu'il montre.
  outcomes: [
    { tab: 'Pari réussi', won: true },
    { tab: 'Pari raté', won: false },
  ],
}

/* ───────────────────────────────────────────────────────────── DIMANCHE
   La règle du dimanche tient dans une rotation : deux équipes jouent, les
   autres parient. Trois lignes de schéma la montrent mieux que le paragraphe
   qui l'énonçait, et elles montrent en prime que le rôle tourne.

   `teams` n'est qu'une illustration — le nombre réel se fixe avec l'effectif.
   Le nombre de matchs affiché s'en déduit, pour que le schéma reste juste si
   on change cette liste. */
export const sunday = {
  lead: (
    <>
      Chaque équipe affronte toutes les autres. À chaque match,{' '}
      <strong>celles qui ne jouent pas sont le public — et c'est le public qui parie</strong>.
    </>
  ),
  teams: ["A", "B", "C", "D"],
  shownRows: 3,
  note: "On fixera le nombre d'équipes quand on saura combien on est ; le principe, lui, ne bouge pas.",
  side: {
    title: "Paris annexes",
    text: "Score exact, écart, meilleur joueur du match. C'est ce qui sauve l'intérêt quand un match est joué d'avance.",
  },
  why: {
    q: "Pourquoi ça suffit à tenir le marché",
    a: [
      <>
        Une équipe qui parie sur un match qu'elle ne dispute pas ne peut pas en influencer le
        résultat. Le marché reste propre tout seul, sans une seule règle de plus.
      </>,
    ],
  },
}

/* ───────────────────────────────────────────────────── LE MEILLEUR JEU
   Deux votes qui alimentent un seul classement : c'est une convergence, et
   une convergence se dessine. Le même schéma sert plus bas pour les quatre
   classements qui font le champion absolu — deux endroits, une seule idée
   visuelle, apprise une fois. */
export const bestGame = {
  lead: "Inventer un bon jeu, c'est une façon de gagner aussi.",
  votes: [
    { icon: "target", when: "Samedi soir", what: "Meilleur jeu de duel", sub: "au moment du draft" },
    { icon: "team", when: "Dimanche", what: "Meilleur jeu d'équipe", sub: "à la remise des prix" },
  ],
  target: { icon: "medal", what: "Classement des créateurs", sub: "le cumul des deux votes" },
  how: [
    { k: "3 jeux", t: "chacun classe ses trois préférés" },
    { k: "3 · 2 · 1", t: "les points, dans cet ordre" },
    { k: "Pas le tien", t: "interdit de voter pour son propre jeu" },
  ],
  criteria: [
    <><strong>Lequel tu remets l'an prochain ?</strong></>,
    <><strong>Lequel est le mieux réglé ?</strong> Règles claires, score incontestable, équilibré.</>,
  ],
  prize: (
    <>
      Le gagnant de samedi touche <strong>50 jetons</strong> utilisables dès dimanche : autant
      qu'une journée de duels gagnés.
    </>
  ),
  note: "Ces points vont au classement des créateurs, jamais à celui des duels.",
  why: {
    q: "Pourquoi une deuxième question",
    a: [
      <>
        Un jeu où seul son parrain gagne, ça se voit en deux duels — et ça coûte le prix.{' '}
        <strong>Inventez des jeux justes, pas des jeux où vous gagnez.</strong>
      </>,
    ],
  },
}

/* ────────────────────────────────────────────────────────── LES TITRES
   Cinq cartes égales cachaient que le cinquième titre est fait des quatre
   autres. Le schéma le dit sans phrase : quatre classements se rejoignent sur
   un rail, et il en tombe un champion absolu. */
export const titles = {
  rankings: [
    { icon: "target", name: "Champion des duels", meta: "Samedi, individuel" },
    { icon: "team", name: "Équipe championne", meta: "Dimanche, collectif" },
    { icon: "dice", name: "Meilleur parieur", meta: "En jetons, sur les deux jours" },
    { icon: "medal", name: "Meilleur créateur", meta: "Le cumul des deux votes" },
  ],
  absolute: {
    icon: "trophy",
    name: "Champion absolu",
    meta: "Le meilleur cumul des quatre classements",
  },
  kicker:
    "Nul aux jeux d'adresse mais bon lecteur de joueurs ? Il y a un titre pour toi. Mauvais parieur mais bon inventeur ? Aussi.",
}

/* ─────────────────────────────────────────────────────── PROPOSER UN JEU
   Cinq phrases devenues cinq contraintes chiffrées. Une contrainte se retient
   par son seuil, pas par sa formulation : « moins de 10 minutes » se lit en
   entier, « < 10 min » se retient. */
export const constraints = [
  { k: "< 10 min", t: "une manche, pas plus" },
  { k: "≤ 10 €", t: "ou du matériel déjà à la maison" },
  { k: "30 s", t: "pour expliquer la règle" },
  { k: "Adresse", t: "pas de force — tout le monde doit pouvoir jouer" },
  { k: "Score net", t: "clair et incontestable" },
]

export const proposalFormat = [
  { icon: "target", label: "Nom" },
  { icon: "gear", label: "Matériel" },
  { icon: "book", label: "Règle (3 lignes max)" },
  { icon: "trophy", label: "Comment on gagne" },
  { icon: "team", label: "Duel / Équipe / Les deux" },
  { icon: "clock", label: "Durée d'une manche" },
]

export const sponsorNote = (
  <>
    Jeu retenu, vous en êtes le <strong>parrain</strong> : le matos, la règle le jour J, et{' '}
    <strong>10 jetons de bonus</strong>.
  </>
)

export const roles = [
  { name: "Le commissaire", text: "Il tranche les litiges. Sa décision est finale, pas de débat." },
  { name: "Le greffier", text: "Il saisit les scores dans l'appli." },
  { name: "Les parrains", text: "Matériel et règles de leur jeu." },
]
