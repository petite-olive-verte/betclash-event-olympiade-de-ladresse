# BetClash

Application web de tournoi et de paris entre amis. Générique : elle héberge des
évènements, chacun avec son nom, ses dates et ses réglages.

**Premier évènement : Olympiade de l'adresse**, 10 & 11 octobre 2026.

👉 **[Voir la page](https://petite-olive-verte.github.io/jeux-de-l-adresse/)**

```bash
npm install
npm run dev
```

## Structure

```
src/
  ds/                  design system importé de Claude Design
    tokens/            colors · typography · spacing · effects (copiés à l'identique)
    Button.jsx         port fidèle de components/core/Button.jsx
    Countdown.jsx      port fidèle de components/moment/Countdown.jsx
  presentation/
    content.jsx        tout ce qui change d'un évènement à l'autre
    Presentation.jsx   la page
    presentation.css   composition + responsive
```

## Deux principes hérités du design system

**Les rôles de couleur sont séparés.** `--jeton` n'est pas `--success`,
`--market-down` n'est pas `--error`. Un solde en jetons et une action validée ne
partagent pas de token, même s'ils sont visuellement proches.

**Tout chiffre qui bouge est en `tabular-nums`** (classe `.tnum`) : cotes,
soldes, décompte. Sans ça l'interface tremble à chaque tick.

## Générique par construction

Aucun effectif, nombre de tours ou nombre d'équipes n'est codé en dur. Le contenu
vit dans `content.jsx`, les mises en page utilisent des grilles qui refluent
(`auto-fit`/`minmax`) plutôt que des colonnes comptées.

## Déploiement

Chaque push sur `main` déclenche `.github/workflows/deploy.yml`, qui construit
le site et le publie sur GitHub Pages. Le `base` de Vite vaut
`/jeux-de-l-adresse/` : la page est servie depuis un sous-chemin, pas depuis la
racine du domaine.
