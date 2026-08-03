# Journal de bord — SARA

## 2026-08-03 (5) — paiement carte : le brief frontend est terminé
`@stripe/react-stripe-js` installé, clés Stripe test en place. Le tunnel propose
« Sur place » ou « Carte bancaire » ; la carte ouvre l'Embedded Checkout de
Stripe (vérifié : 4 iframes Stripe chargées contre la vraie API, panier
conservé tant que le paiement n'est pas confirmé).
**Décisions** :
- Le choix « Carte » n'apparaît que si `VITE_STRIPE_PUBLISHABLE_KEY` est
  configurée — sinon le bouton mènerait à une erreur incompréhensible.
- Le panier n'est **pas** vidé au lancement du paiement : c'est le webhook
  Stripe qui crée la commande, une fois le paiement confirmé.
- **Non prouvé en local** : un paiement mené jusqu'au bout. Le webhook a besoin
  d'une URL publique ; en local la commande ne serait donc pas créée après
  paiement. Vérifié en prod par Ayoub (cf. CLAUDE.md Phase 3).
- `.gitignore` durci : `.env*` + `!.env.example`. La règle `.env` seule ne
  couvrait ni `.env.bak` ni `.env.prod` — testé sur 5 variantes.

## 2026-08-03 (4) — brief d'Ayoub terminé, prouvé contre la vraie base
`.env` rempli avec les identifiants Supabase → `/api/health` répond `{"ok":true}`.
Les 6 étapes du brief frontend sont faites, chacune **vérifiée contre la vraie
base**, données de test supprimées après coup (base laissée à 0 utilisateur,
0 commande).
**Fait** :
- étape 3 prouvée : compte réellement créé, session serveur active ;
- étape 4 `#/commande` : emporter/livraison, adresse conditionnelle, récap,
  `placeOrder()` → vraie commande en base, panier vidé, redirection vers le suivi ;
- étape 5 `#/suivi/<id>` : 4 étapes visuelles, poll 5 s, ETA, annulation client,
  « j'ai reçu ma commande ». Les 6 statuts serveur ont été **provoqués un par un**
  (accepté, prêt, livré, refusé par le resto, annulé par le client) ;
- étape 6 `#/compte` : historique, favoris (cœur sur la carte), profil, mot de
  passe — tous persistés et revérifiés côté serveur ;
- `#/reservation` et `#/reservation/chicha` : les boutons « Réserver » ne
  pointent plus vers le pied de page.
**Suivant** : paiement carte (Stripe) — seul morceau du brief non fait, il
manque `STRIPE_SECRET_KEY` + `VITE_STRIPE_PUBLISHABLE_KEY` et
`npm i @stripe/react-stripe-js @stripe/stripe-js`.
**Décisions** :
- **Réservation : aucune route serveur n'existe** (vérifié, les seules routes
  sont auth/me/orders/stripe/track/admin) et aucune table `reservations`.
  L'écran ne prétend donc rien enregistrer : il compose la demande et l'envoie
  par le **seul canal réel** — appel ou SMS pré-rempli. Le jour où Ayoub ajoute
  `POST /api/reservations`, seule la fonction d'envoi change.
- `useOrders()` créé dans `src/hooks/` : le brief laissait le choix entre un
  `fetch` direct dans l'écran et un hook. Le hook évite d'éparpiller des appels
  réseau dans le JSX, ce que le projet s'interdit par ailleurs.
- Le cœur des favoris n'apparaît **que connecté** : sans compte,
  `toggleFavorite` renverrait 401 et le clic semblerait cassé.
- **Piège de configuration** : `.env.example` livre `NODE_ENV=production`
  pré-rempli. En local, le cookie de session reçoit alors le drapeau `Secure`
  et `http://localhost` le refuse → connexion « réussie » puis déconnexion
  immédiate, sans message. La ligne est commentée dans le `.env` local.

## Le brief frontend d'Ayoub — écarts avec le dépôt réel (constaté 2026-08-03)
Trois affirmations du brief `docs/brief-frontend-collegue.md` ne sont plus vraies.
À corriger dans le brief, ou au moins à savoir avant de le suivre :
- « la clé publique est déjà dans `.env` sous `VITE_STRIPE_PUBLISHABLE_KEY` » —
  **il n'y a pas de `.env` local**, seulement `.env.example`. Et aucun code ne
  lit encore cette variable.
- « Respecte la charte Sara existante (`sara.red/cream/orange/brown`) » — ces
  jetons **n'existent plus** : la charte du patron (vert/or/rouge) les a
  remplacés, et elle est dans `main` depuis la PR #9.
- « ~ligne 582 de `SaraSite.jsx` » — le fichier fait 1322 lignes, la ligne 582
  est ailleurs. Repérer par nom de composant (`ProductCard`), pas par numéro.

Ce qui n'est **pas** dans le brief et qui compte : `removeItem(ligne)` et
`updateQty(ligne, qty)` prennent la **ligne entière**, pas un id (comparaison
`sameLine` sur nom+prix+desc). Leur passer un id ne lève aucune erreur et ne
fait rien.

## 2026-08-03 (3) — écrans connexion / inscription + passe responsive
**Fait** : routes `#/connexion` et `#/inscription` (composant `AuthPage`)
branchées sur `login()` / `register()`. Le pied du panier propose « Créez un
compte » tant que le client n'est pas connecté, et le bouton de commande
seulement une fois connecté. Icône compte de l'en-tête branchée (initiale du
prénom si session ouverte). Passe responsive vérifiée en 320 / 375 / 768 /
1024 / 1440 : zéro débordement horizontal partout.
**En cours** : rien.
**Suivant** : tunnel de commande (`placeOrder` cash, `createStripeCheckout`
carte), suivi de commande, espace `/compte` — tous bloqués sur les valeurs
`.env` (Supabase + Stripe test).
**Décisions** :
- **Pas de lien « mot de passe oublié »** : aucune route serveur ne l'implémente
  (`server/api.ts` n'a ni `forgot` ni `reset`). Un lien mort vaut moins que pas
  de lien. À demander à Ayoub s'il faut l'ajouter côté backend.
- Les messages d'erreur techniques du serveur (500 « Erreur serveur »,
  « Requête échouée ») sont remplacés par une phrase actionnable ; les messages
  métier (« Cet email est déjà utilisé ») passent tels quels.
- Zones tactiles : les points de carrousel gardent leur taille visuelle (8 px)
  mais gagnent une zone touchable étendue via `.sara-dot::after`, qui déborde
  sans occuper de place — des boutons de 44 px auraient écarté les points et
  cassé le rythme.
- **Non prouvé** : la création de compte et la connexion réelles. Le serveur
  local répond 500 faute d'identifiants Supabase. Tout le reste du parcours est
  exercé ; la variante « connecté » est vérifiée en injectant une session
  simulée au chargement (échafaudage hors dépôt).

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
