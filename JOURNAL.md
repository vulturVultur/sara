# Journal de bord — SARA

## 2026-08-03 (2) — en-tête collant sur la Carte + pastille qui vole
**Fait** : l'en-tête devient `sticky` sur la page Carte uniquement (prop
`sticky`, ombre au défilement) ; au clic sur « Commander », une pastille rouge
part du bouton et rejoint l'icône panier en cloche, puis la pastille du compteur
fait un petit sursaut. Le tiroir ne s'ouvre plus automatiquement à chaque ajout :
l'animation sert de confirmation.
**Suivant** : inchangé (connexion, tunnel, suivi, compte — bloqués sur `.env`).
**Décisions** :
- En-tête collant sur la Carte seulement : c'est là qu'on ajoute des plats et
  que la cible du vol doit rester visible. Une ligne à changer pour l'étendre
  à tout le site (`<Header sticky={isMenu} />` → `sticky`).
- L'animation respecte `prefers-reduced-motion` et s'abstient si la cible est
  hors écran — elle est décorative, l'ajout au panier a déjà eu lieu.
- **Piège de capture** : Chrome headless annonce `prefers-reduced-motion:
  reduce`. Toute animation correctement codée s'y désactive, et la capture
  paraît « cassée » sans raison. Forcer `Emulation.setEmulatedMedia` avant de
  photographier une animation.

## 2026-08-03 — fusion backend + panier fonctionnel (non poussé)
**Fait** : `origin/main` (backend Phases 0-5) fusionné dans
`design/charte-graphique` — les deux partaient du même commit `a4c1f76`,
c'étaient des branches sœurs. Un seul recouvrement réel, `src/SaraSite.jsx`.
Puis étape 1-2 du brief frontend : tiroir panier + bouton « Commander » sur
chaque plat. 3 commits d'avance sur `origin/main`, rien de poussé.
**En cours** : rien.
**Suivant** : connexion/inscription, tunnel de commande (`placeOrder` cash et
`createStripeCheckout` carte — `@stripe/react-stripe-js` pas encore installé),
suivi de commande, espace `/compte`. Bloqué sur les valeurs `.env` (Supabase +
Stripe test) à demander à Ayoub.
**Décisions** :
- **La consigne « garder `sara.red/cream/orange/brown` » du brief frontend est
  périmée** : elle a été écrite avant la charte du patron et désigne des jetons
  supprimés. La charte vert/or/rouge est conservée. À confirmer avec Ayoub.
- `featured` n'entre pas dans `menuItems.ts` (fichier partagé avec le backend) :
  la mise en avant est une décision d'affichage → constante `FEATURED_ID`.
- Le bouton « Passer commande » du panier reste inactif tant que le tunnel
  n'existe pas — un lien vers une route absente serait pire.
- **Piège d'API** : `removeItem(ligne)` et `updateQty(ligne, qty)` prennent la
  ligne entière, pas un id (comparaison `sameLine`). Un id ne lève aucune
  erreur et ne fait rien.

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
