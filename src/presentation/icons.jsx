// Les icônes viennent de Lucide. Elles dessinent en `currentColor`, donc la
// couleur — et surtout les états — se pilotent depuis le CSS, sans repasser
// par une prop React.
import {
  BookOpen, Clock, Dices, Medal, Settings2, Target, Trophy, Users,
} from 'lucide-react'

// Clé sémantique → icône. `content.jsx` ne connaît que la clé, ce qui permet
// de changer de jeu d'icônes sans toucher au contenu de l'évènement.
const ICONS = {
  target: Target,
  team: Users,
  dice: Dices,
  medal: Medal,
  trophy: Trophy,
  gear: Settings2,
  book: BookOpen,
  clock: Clock,
}

// Lucide dessine dans une grille 24×24 et met le trait à l'échelle avec la
// taille : à 40 px il ferait 3,3 px et écraserait tout le reste de la page.
// `absoluteStrokeWidth` fige l'épaisseur, de sorte qu'une icône de 20 et une
// de 40 aient le même poids optique.
export function Icon({ name, size = 24, ...rest }) {
  const Glyph = ICONS[name]
  if (!Glyph) return null
  return (
    <Glyph
      size={size}
      strokeWidth={1.75}
      absoluteStrokeWidth
      aria-hidden="true"
      {...rest}
    />
  )
}
