# Olympiade de l'adresse

La page web de l'évènement : le règlement, le décompte jusqu'au jour J, les cinq
titres à prendre. **10 & 11 octobre 2026**, deuxième édition.

👉 **[Voir la page](https://petite-olive-verte.github.io/betclash-event-olympiade-de-ladresse/)**

Ce dépôt ne contient que cette page. **BetClash** — l'application de tournoi et
de paris — est un projet distinct : c'est elle qui fera tourner l'évènement le
jour J, avec les duels, la cagnotte de jetons et les cotes en direct. La page
l'annonce, elle ne l'implémente pas. Le design system vient d'ailleurs de
BetClash, pour que l'annonce et l'appli se ressemblent.

```bash
npm install
npm run dev
```

## Structure

```
src/
  ds/                  design system importé de Claude Design
    tokens/            colors · typography · spacing · effects
    Button.jsx         port fidèle de components/core/Button.jsx
    Countdown.jsx      port fidèle de components/moment/Countdown.jsx
  presentation/
    content.jsx        tout le texte et les réglages de l'évènement
    Presentation.jsx   la page
    icons.jsx          Lucide, encré par rôle
    ShootingRange.jsx  le titre, et le stand de tir qui va avec
    shotSound.js       les sons, synthétisés — aucun fichier
    presentation.css   composition + responsive
    shooting.css       viseur, lettres lâchées, panneau latéral
```

Le titre s'appelle « Olympiade de l'adresse », alors on peut lui tirer dessus :
un viseur suit la souris, un clic dégomme une lettre. Au premier tir le reste
du hero s'efface, les lettres se rassemblent au centre de l'écran et s'en
dispersent — de plus en plus vite à mesure qu'elles tombent.

Le chargeur est limité : une balle par coup, touché ou manqué. Toutes les
lettres à terre, c'est « Oh wow » et le décompte jusqu'au jour J ; le chargeur
vide avant, c'est « Bouu ». Les deux proposent de reprendre la lecture, et une
flèche sur le côté remet la page comme avant à tout moment.

Le temps d'une partie la page ne défile plus : les lettres sont ancrées à la
fenêtre et le décor a disparu, défiler ne montrerait qu'un vide. Le défilement
est rendu, à la position exacte où il avait été pris, dès qu'on quitte.

Le jeu ne se déclenche qu'au clic, le titre garde son nom accessible, et sans
souris, sans JS ou sous `prefers-reduced-motion`, il reste un titre.

Les fichiers de `ds/tokens/` sont copiés à l'identique de Claude Design, à une
exception près : le bloc `encres d'icône` de `colors.css`, ajouté ici et marqué
comme tel. À reporter en amont en cas de resynchronisation. Il contient depuis
`--ink-loss`, l'encre d'une mise perdue : `--market-down` n'a pas de variante
claire et plafonne à 2,5:1 sur `--surface`.

Deux choses restent à remonter en amont. `--jeton-wash` est teinté en thème
clair avec le rgb de `--success`, pas celui de `--jeton` — il jure avec
`--ink-jeton` posé à côté. Et les encres claires sont calibrées pour des icônes
(3,2:1) : `--ink-jeton` ne tient pas les 4,5:1 d'un petit texte, ce qui interdit
de poser un mot en vert sur un fond teinté. Sur cette page l'anneau porte la
couleur et le mot porte le contraste.

## Deux registres

Le design system de BetClash en définit deux, et la page se servait d'un seul.

Le **registre « marché »** — dense, clair, `--text-*`, cartes et listes — porte
le règlement : c'est là que vivent les tableaux, les schémas et le peu de prose
qui reste.

Le **registre « moment »** — `--moment-bg`, `--display-xl`, `--shadow-gold-glow`,
décrit dans les tokens comme des fonds saturés pleine largeur et du texte « lu à
3 mètres » — porte le hero et la règle qui compte. Ce sont les deux endroits où la page
annonce plutôt qu'elle n'explique.

Une section repasse dans le registre sombre avec `data-theme="dark"`. Ça
supposait un changement dans `colors.css` : la palette sombre vivait sur `:root`
seul, donc impossible à retrouver une fois entré dans un sous-arbre clair.

## Des schémas plutôt que des paragraphes

Les sections expliquaient en prose ce qu'elles auraient pu montrer. Six schémas
ont pris la place du texte, et la prose courante est passée de **1 065 mots à
602** — de 36 paragraphes à 25.

| Schéma | Section | Ce qu'il montre que la phrase ne montrait pas |
|---|---|---|
| **La frise** | Le week-end | Quatre moments dans l'ordre, et les paris en bande *sous* les quatre : leur portée se voit au lieu de s'annoncer. |
| **La passerelle** | La règle | Déjà là. Ce sont les quatre paragraphes qui la redisaient qui sont partis. |
| **Les étapes** | Samedi | L'emboîtement manche → duel → tour → classement → draft, en zoom arrière. |
| **L'exemple chiffré** | Les paris | Déjà là, et c'est lui le schéma de la section : le pavé qui le précédait disait la même chose en mots. |
| **La rotation** | Dimanche | Que le rôle *tourne*. Un paragraphe ne peut que l'affirmer. |
| **La convergence** | Meilleur jeu, Les titres | Que le cinquième titre est fait des quatre autres. Cinq cartes égales le cachaient. |

Tous sont en HTML, aucun en SVG. Le texte ayant été coupé, le schéma porte
l'information : il doit être lu par un lecteur d'écran, refluer sur un
téléphone et changer de thème avec la page. Un SVG ne fait bien aucune des
trois.

Ils partagent une grammaire, apprise une fois : une encre de rôle
(`data-icon`) donne la couleur, un rail porte l'ordre, un trait plein est ce
qui joue, un trait tireté ce qui observe. La convergence sert deux fois — deux
votes qui font un classement, quatre classements qui font un champion — et se
relit sans effort la seconde.

### Ce qui a été coupé n'a pas été jeté

Les justifications — pourquoi deux classements, pourquoi ces quatre règles,
pourquoi le remboursement — vivent sous un pli (`<details class="why">`),
replié par défaut. Le lecteur pressé ne les voit pas, celui qui conteste les
trouve. Un règlement doit rester consultable ; il n'a pas à être lu en entier
pour être compris. **251 mots** sont sous le pli plutôt que dans le fil.

`<details>` plutôt qu'un bouton et un état : le contenu existe dans le document
même sans JS, la recherche du navigateur le trouve, et l'impression le déplie.

### Les entrées en scène se déclarent par attribut

Ajouter un schéma supposait de l'inscrire dans une liste de sélecteurs JS *et*
dans quatre listes CSS. Deux attributs remplacent tout ça : `data-reveal` pour
un bloc qui entre d'un coup, `data-stagger` pour un groupe dont les enfants se
suivent (`data-stagger="tight"` pour les rangées serrées, qui ne changent pas
d'échelle). Une liste où il faut penser à s'inscrire est une liste où on oublie
de le faire.

## Trois principes hérités du design system

**Les rôles de couleur sont séparés.** `--jeton` n'est pas `--success`,
`--market-down` n'est pas `--error`. Un solde en jetons et une action validée ne
partagent pas de token, même s'ils sont visuellement proches.

**Une encre par rôle, pas par jolie couleur.** Les icônes sont colorées par ce
qu'elles désignent : `dice` porte `--ink-jeton` parce qu'il s'agit du marché,
`target` et `team` partagent `--ink-terrain` parce que duels et équipes
alimentent le même classement. La couleur redit la règle centrale de
l'évènement plutôt que de décorer. Les encres sont assombries en thème clair : les teintes sémantiques
sont réglées pour un fond sombre et plafonnent à 1,6:1 sur blanc.

**Tout chiffre qui bouge est en `tabular-nums`** (classe `.tnum`) : cotes,
soldes, décompte. Sans ça l'interface tremble à chaque tick.

## Rejouable d'une édition à l'autre

Aucun effectif, nombre de tours ou nombre d'équipes n'est codé en dur. Le
contenu de l'édition vit dans `content.jsx`, les mises en page utilisent des
grilles qui refluent (`auto-fit`/`minmax`) plutôt que des colonnes comptées :
une troisième édition se monte en éditant un seul fichier.

Le schéma du dimanche calcule ses appariements à partir de la liste des
équipes, et prélève les trois lignes montrées à intervalle régulier : prises
dans l'ordre, elles feraient jouer trois fois la première équipe, et un schéma
censé montrer que le rôle tourne montrerait le contraire.

L'exemple chiffré des paris suit la même règle, poussée un cran plus loin :
`bettingExample` ne contient que les deux mises. La cagnotte, les cotes, les
gains arrondis et **les largeurs du schéma** — passées en `fr` — s'en déduisent
tous. La barre est donc le rapport des mises, pas une image du rapport : on ne
peut pas changer un chiffre sans que le dessin suive.

Ses deux onglets ne changent pas le marché — mêmes mises, mêmes cotes, même
barre — seulement son dénouement. C'est le but : la cote est fixée par les
mises, pas par le résultat, et le même pari vaut **+26 ou −10** selon un duel
qui n'a pas encore été joué. Un exemple qui ne montrerait que le gain serait la
façon habituelle de mentir sur un pari.

## Déploiement

Chaque push sur `main` déclenche `.github/workflows/deploy.yml`, qui construit
le site et le publie sur GitHub Pages. Le `base` de Vite vaut
`/betclash-event-olympiade-de-ladresse/` : la page est servie depuis un
sous-chemin, pas depuis la racine du domaine.
