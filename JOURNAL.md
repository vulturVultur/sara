# Journal de bord — SARA

## 2026-08-02 — refonte de la charte graphique (terminée, non committée)
**Fait** : nouvelle charte appliquée à tout le site (vert `#203818`, or
`#B67614`, rouge `#C60101`) sur la branche `design/charte-graphique` — jetons
Tailwind, `sara.css`, `SaraSite.jsx`, `index.html`, README. Logo officiel enfin
affiché (en-tête + favicon) ; il existait dans `public/img/` mais n'était pas
utilisé. Vérifié : build OK, `verif-site` propre, parcours réels exercés
(filtres carte, accordéon FAQ, carrousels, tiroir mobile), captures 1280 et 375.
**En cours** : rien.
**Suivant** : commit + push (attend l'accord) ; puis les écrans de commande du
brief (panier, tunnel, espace client, suivi) qui hériteront de ces jetons ;
`seo-fondations` pour JSON-LD LocalBusiness + sitemap ; og:image à passer en URL
absolue au déploiement.
**Décisions** :
- **Répartition des couleurs (correction du patron en cours de session)** : le
  blanc cassé `sara.paper` porte la page, le vert et l'or sont les fonds des
  BANDES pleine largeur (hero, chicha, CTA, pied), le rouge reste un point.
  Une première version tout-en-vert étouffait les photos — ne pas y revenir.
- Une seule carte de la grille menu est remplie de couleur (`featured`) : c'est
  l'accent. Au-delà d'une, il se dilue.
- Structure visuelle conservée telle quelle (vagues, grilles, marquee, arche,
  damier) : la mission était la cohérence chromatique, pas la mise en page.
- Orthographe « Pizzeraya » (enseigne) retenue contre « Pizzerya » (logo PDF) —
  à confirmer avec le patron.
- Coordonnées encore placeholder (adresse Lyon, téléphone, prix en CHF).
