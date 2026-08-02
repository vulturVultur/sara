# Brief SARA — brancher l'interface sur le backend (pour la session Claude de [collègue])

Colle ce message tel quel comme première instruction à ton Claude Code, dans le dossier
`Sara` (repo `https://github.com/vulturVultur/sara.git`, branche `main` à jour).

⚠️ Ce brief **remplace** une version précédente écrite avant que le backend existe. Depuis,
tout le backend (Phases 0 à 5) a été construit, testé contre une vraie base de données, et
**déployé en production** sur https://sara-sd8o.onrender.com. Ton travail maintenant n'est
plus "imaginer les écrans dans l'abstrait" mais **brancher des boutons qui existent déjà et
ne font rien** sur une API qui existe déjà et fonctionne.

## Constat de départ — vérifié dans le code, pas supposé

Aucun bouton du site n'appelle le backend aujourd'hui. Dans `src/SaraSite.jsx`, les boutons
"Commander" et "Voir le produit" de chaque plat (page Menu, `#/carte`) sont des
`<button type="button">` **sans `onClick`** — ils ne font littéralement rien au clic. L'icône
panier du header est un simple lien `<a href="#/carte">`. C'est tout ce qu'il y a à corriger :
le reste du site (vitrine, navigation, animations) n'a pas besoin d'être retouché.

## Ce qui existe déjà — à consommer, pas à réinventer

- **Catalogue** : `src/data/menuItems.ts` — `MENU_ITEMS` (id, name, category, price, image,
  emoji, desc), `MENU_CATEGORIES`, helpers `categoryLabel()`, `formatChf()`. C'est déjà la
  source utilisée par la page Menu.
- **`useAuth()`** (`src/contexts/AuthContext.jsx`, déjà monté dans `src/main.jsx`) :
  ```js
  const { user, isLoading, login, register, logout, updateProfile, changePassword,
          refreshUser, toggleFavorite } = useAuth();
  // login(email, password) / register({ email, password, prenom, nom, phone?, address?, newsletter? })
  // toggleFavorite(itemId) — itemId = le champ `id` d'un MENU_ITEM, pas son nom
  // user.favorites est un tableau d'ids ; user est null si pas connecté
  ```
- **`useCart()`** (`src/contexts/CartContext.jsx`, déjà monté) :
  ```js
  const { items, addItem, removeItem, updateQty, clearCart, total, count,
          isCartOpen, openCart, closeCart, placeOrder, createStripeCheckout } = useCart();
  // addItem({ name, price, desc, emoji? }) — desc est OBLIGATOIRE même vide ("") : le panier
  //   fusionne deux lignes seulement si nom + prix + desc sont identiques. Oublier desc casse
  //   la personnalisation (bug réel déjà corrigé une fois côté Flash Pizzas, à ne pas refaire).
  // placeOrder({ orderType, address, phone, prenom, nom }) — paiement cash, vide le panier au
  //   succès, retourne { id, status }. prenom/nom seulement nécessaires si pas connecté.
  // createStripeCheckout({ orderType, address, phone }) — paiement carte, retourne
  //   { clientSecret }, NE vide PAS le panier (attend la confirmation réelle du paiement).
  ```
- **`useOrderStatus(orderId)`** (`src/hooks/useOrderStatus.js`) :
  ```js
  const { status, orderType, etaMinutes, etaReadyAt, cancelledByClient,
          markReceived, cancelOrder } = useOrderStatus(orderId);
  // poll automatique toutes les 5s. status ∈ pending|confirmed|preparing|ready|delivered|cancelled
  // cancelOrder() nécessite un compte connecté (les commandes invité ne peuvent pas s'auto-annuler)
  ```

Ces 3 hooks sont **logique/état pur, aucune UI** — c'est volontaire, exactement pour que tu
puisses construire les écrans à ta façon par-dessus.

## Ce qu'il faut brancher, dans cet ordre

1. **Panier fonctionnel** — remplacer le lien `<a href="#/carte">` du header par un vrai
   composant (drawer ou modale) piloté par `isCartOpen`/`openCart`/`closeCart`, listant
   `items`, permettant `updateQty`/`removeItem`, affichant `total`.
2. **Bouton "Commander" sur chaque plat** (page Menu, ~ligne 582 de `SaraSite.jsx`) →
   `onClick={() => addItem({ name: p.name, price: p.price, desc: '', emoji: p.emoji })}`.
   (Pas de tailles/suppléments dans le catalogue actuel — `desc: ''` suffit tant que ça reste
   le cas.)
3. **Connexion / inscription** — formulaires simples (email, mot de passe, prénom, nom,
   téléphone optionnel) → `login()`/`register()`. Pense à afficher les erreurs (les deux
   fonctions rejettent avec un message lisible en français si ça échoue, ex. "Cet email est
   déjà utilisé").
4. **Tunnel de commande** — après le panier : choix emporter/livraison, adresse+téléphone si
   livraison, récap, bouton de paiement. Deux chemins possibles à proposer : cash
   (`placeOrder`) et carte (`createStripeCheckout` + `@stripe/react-stripe-js` — **pas encore
   installé**, `npm install @stripe/react-stripe-js @stripe/stripe-js` ; la clé publique est
   déjà dans `.env` sous `VITE_STRIPE_PUBLISHABLE_KEY`, embarque le composant
   `EmbeddedCheckout` avec le `clientSecret` reçu).
5. **Suivi de commande** — après validation, écran qui utilise `useOrderStatus(orderId)` pour
   afficher une progression. Les 6 statuts n'ont pas tous le même sens à afficher :
   `pending`/`confirmed` = "en attente que le restaurant confirme", `cancelled` avec
   `cancelledByClient: true` = "tu as annulé", `cancelled` avec `false` = "le restaurant a
   refusé" (message différent).
6. **Espace `/compte`** — profil (`updateProfile`, `changePassword`), favoris (cœur sur les
   produits → `toggleFavorite(item.id)`, `user.favorites.includes(item.id)` pour l'état actif),
   historique (`GET /api/me/orders` en `credentials:'include'` — pas encore de hook dédié,
   fetch direct ou demande-moi d'en ajouter un si tu préfères).

## Contraintes à respecter

- Ne touche pas à `server/`, `supabase/`, `render.yaml`, `.env`, `vite.config.ts` — chantier
  backend séparé, un conflit ici coûte cher à réconcilier.
- Respecte la charte Sara existante (`tailwind.config.js` : `sara.red/cream/orange/brown...`,
  polices Anton/Poppins) — ne pas dériver vers la palette de Flash Pizzas.
- Le dashboard patron (Phase 5) est **hors périmètre** pour l'instant, pas prioritaire.

## Pour tester en local avec le vrai backend

```bash
npm install
cp .env.example .env   # puis demande à Ayoub les vraies valeurs (Supabase + Stripe test)
npm run dev             # http://localhost:5173, API /api/* incluse
```

Sans `.env` rempli, le site s'affiche mais tout appel à `useAuth()`/`useCart()` échouera
proprement (message d'erreur, pas de crash) — demande les clés à Ayoub plutôt que d'en créer
de nouvelles, pour éviter deux bases de données de test qui divergent.

## Référence si besoin de contexte fonctionnel plus large

Le `CLAUDE.md` à la racine du repo documente chaque endpoint, chaque décision, et ce qui a
été vérifié réellement (pas supposé) à chaque étape — utile si un comportement d'API te
semble surprenant.
