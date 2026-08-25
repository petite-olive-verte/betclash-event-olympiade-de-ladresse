// Tout ce qui change d'un évènement à l'autre vit ici.
// La page ne code en dur ni un effectif, ni un nombre de tours, ni un nombre d'équipes.

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

export const brief = [
  {
    day: "Samedi",
    text: "On ne joue que des duels, un contre un, sur des jeux d'adresse apportés par vous. Cinq tours, personne n'est éliminé. Le classement du samedi soir décide des capitaines.",
  },
  {
    day: "Dimanche",
    text: "On passe en équipes. Chacune affronte toutes les autres. Le nombre d'équipes dépend du nombre de participants : on le fixera quand on saura combien on est.",
  },
  {
    day: "Tout le week-end",
    text: "Tout le monde parie sur les autres avec une cagnotte de jetons. Les cotes bougent en direct dans l'appli. Et il y a cinq façons de gagner — dont une qui ne demande même pas d'être bon aux jeux d'adresse.",
  },
]

export const points = [
  { k: "Victoire 2 – 0", v: "4 pts", strong: true },
  { k: "Victoire 2 – 1", v: "3 pts", strong: true },
  { k: "Défaite 1 – 2", v: "1 pt", strong: false },
  { k: "Défaite 0 – 2", v: "0 pt", strong: false },
]

export const jetonSources = [
  { k: "Au départ", v: "100" },
  { k: "Chaque duel gagné", v: "+10" },
  { k: "Ton jeu est retenu", v: "+10" },
  { k: "Ton jeu élu meilleur jeu", v: "+50" },
]

export const bettingRules = [
  <>Tu mises <strong>ce que tu veux, jusqu'à 20 % de ta cagnotte</strong>. Pas de tapis : personne ne peut se ruiner, et un seul pari ne fait jamais basculer un classement.</>,
  <>La maison pose <strong>5 jetons sur chaque camp</strong> avant l'ouverture. Sans ça, quand tout le monde mise sur le favori, la cote tombe à 1 et il n'y a plus rien à gagner.</>,
  <>Tu <strong>ne paries pas sur un duel que tu joues</strong>.</>,
  <>Les paris <strong>ferment quand la première manche commence</strong>. Les duels suivants sont affichés à l'avance : tu paries pendant que le duel en cours se joue.</>,
]

export const titles = [
  { icon: "target", name: "Champion des duels", meta: "Samedi, individuel" },
  { icon: "team", name: "Équipe championne", meta: "Dimanche, collectif" },
  { icon: "dice", name: "Meilleur parieur", meta: "En jetons, sur les deux jours" },
  { icon: "medal", name: "Meilleur créateur", meta: "Le cumul des deux votes" },
  { icon: "trophy", name: "Champion absolu", meta: "Le meilleur cumul des quatre classements", highlight: true },
]

export const constraints = [
  <>Une manche fait <strong>moins de 10 minutes</strong>.</>,
  <>Matériel <strong>déjà à la maison, ou moins de 10 €</strong>.</>,
  <>La règle <strong>s'explique en 30 secondes</strong>.</>,
  <>C'est de <strong>l'adresse, pas de la force</strong>. Tout le monde doit pouvoir jouer.</>,
  <>Le <strong>score est clair et incontestable</strong>.</>,
]

export const proposalFormat = [
  { icon: "target", label: "Nom" },
  { icon: "gear", label: "Matériel" },
  { icon: "book", label: "Règle (3 lignes max)" },
  { icon: "trophy", label: "Comment on gagne" },
  { icon: "team", label: "Duel / Équipe / Les deux" },
  { icon: "clock", label: "Durée d'une manche" },
]

export const roles = [
  { name: "Le commissaire", text: "Il tranche les litiges. Sa décision est finale, pas de débat." },
  { name: "Le greffier", text: "Il saisit les scores dans l'appli." },
  { name: "Les parrains", text: "Matériel et règles de leur jeu." },
]
