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
    presentation.css   composition + responsive
```

Les fichiers de `ds/tokens/` sont copiés à l'identique de Claude Design, à une
exception près : le bloc `encres d'icône` de `colors.css`, ajouté ici et marqué
comme tel. À reporter en amont en cas de resynchronisation.

## Trois principes hérités du design system

**Les rôles de couleur sont séparés.** `--jeton` n'est pas `--success`,
`--market-down` n'est pas `--error`. Un solde en jetons et une action validée ne
partagent pas de token, même s'ils sont visuellement proches.

**Une encre par rôle, pas par jolie couleur.** Les icônes sont colorées par ce
qu'elles désignent : `dice` porte `--ink-jeton` parce qu'il s'agit du marché,
`target` et `team` partagent `--ink-terrain` parce que duels et équipes
alimentent le même classement. La couleur redit la règle d'or plutôt que de
décorer. Les encres sont assombries en thème clair : les teintes sémantiques
sont réglées pour un fond sombre et plafonnent à 1,6:1 sur blanc.

**Tout chiffre qui bouge est en `tabular-nums`** (classe `.tnum`) : cotes,
soldes, décompte. Sans ça l'interface tremble à chaque tick.

## Rejouable d'une édition à l'autre

Aucun effectif, nombre de tours ou nombre d'équipes n'est codé en dur. Le
contenu de l'édition vit dans `content.jsx`, les mises en page utilisent des
grilles qui refluent (`auto-fit`/`minmax`) plutôt que des colonnes comptées :
une troisième édition se monte en éditant un seul fichier.

## Déploiement

Chaque push sur `main` déclenche `.github/workflows/deploy.yml`, qui construit
le site et le publie sur GitHub Pages. Le `base` de Vite vaut
`/betclash-event-olympiade-de-ladresse/` : la page est servie depuis un
sous-chemin, pas depuis la racine du domaine.
