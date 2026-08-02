# Sara — Guide pour Claude

## Présentation
Site vitrine + (à terme) commande en ligne pour **Sara Pizzeraya Kebap**. Repo GitHub :
https://github.com/vulturVultur/sara.git. Projet Click ON, dossier local :
`C:\Users\Ayoub\Desktop\All\Business\Sara`.

## Objectif : reproduire la logique de Flash Pizzas
Décision du 2 août 2026 : faire évoluer SARA d'une vitrine statique vers une app complète
(compte client, panier, paiement en ligne, suivi de commande, dashboard patron), sur le
modèle exact de **Flash Pizzas** (`C:\Users\Ayoub\Desktop\All\Business\Flash Pizzas`) — même
stack, mêmes patterns (auth par cookie, statut de commande dérivé de timestamps, dashboard
patron sans table de rôles). Avant de modifier `server/`, consulter le `CLAUDE.md` de Flash
Pizzas pour le détail de chaque mécanisme — ce fichier ne fait qu'indiquer où en est SARA.

## Stack technique
- **Frontend** : React 18 + Vite 6 + TailwindCSS v3 (racine du repo, pas de dossier `client/`
  — contrairement à Flash, la vitrine existante n'a pas été déplacée pour limiter le risque
  sur les 15 commits déjà faits sur `SaraSite.jsx`)
- **Backend** : Express (Node), même process que le frontend en prod (`server/`)
- **Base de données** : Supabase (`public.users`, `public.sessions`, `public.orders`)
- **Déploiement cible** : Render, process Node persistant (PAS un site statique — le suivi de
  commande par polling et les cookies de session ont besoin d'un serveur qui tourne, contrairement
  au Vercel statique du point de départ)
- **Dev** : `setupApi()` (`server/api.ts`) monté à la fois sur le middleware Vite (dev,
  `vite.config.ts`) et sur Express (prod, `server/index.ts`) — un seul code pour les deux,
  aucun CORS nécessaire (même origine). Exactement le pattern de Flash.

## Avancement par phase

### ✅ Phase 0 — Fondations backend (fait, 2 août 2026)
- `server/db.ts` : singleton Supabase + helpers (`generateId`, `generateToken`,
  `hashPassword` PBKDF2-SHA512 100k itérations, `pingDb`) — pas encore de fonctions
  users/sessions/orders, ce sera la Phase 2/3.
- `server/api.ts` : middleware `setupApi()`, une seule route pour l'instant :
  `GET /api/health` (vérifie la connexion Supabase).
- `server/index.ts` : bootstrap Express (helmet, fichiers statiques, fallback SPA).
- `vite.config.ts` : monte `setupApi()` sur le dev server Vite.
- `supabase/migrations/0001_init.sql` : tables `users`, `sessions`, `orders` (schéma de
  base, sans les colonnes ETA/paiement qui arriveront avec les phases correspondantes),
  RLS activé sans policy (bypass via `service_role`).
- `render.yaml`, `.env.example`, `tsconfig.json`, `.gitignore` (`.env`, `.claude/`).
- ⚠️ **Actions manuelles requises avant de continuer** :
  1. Créer un projet Supabase, exécuter `supabase/migrations/0001_init.sql`.
  2. Copier `.env.example` → `.env`, remplir `SUPABASE_URL` + `SUPABASE_KEY`.
  3. `npm install` (nouvelles dépendances : express, @supabase/supabase-js, helmet, esbuild,
     typescript, @types/express, @types/node).
  4. Vérifier `npm run dev` puis `curl localhost:5173/api/health` → `{"ok":true}`.
- ✅ **Vérifié de bout en bout avec le vrai projet Supabase** (2 août 2026, projet
  `xfyspqhelfvgqoquhnjq`) : migration exécutée, `.env` rempli, `npm run dev` puis
  `curl localhost:5173/api/health` → `{"ok":true}` — connexion réelle confirmée, pas une
  supposition. `npm run check` et `npm run build` passent aussi après ce test.
- ⚠️ **Piège Vite #1 trouvé et corrigé** : dans `vite.config.ts`, le plugin `configureServer` ne
  doit **pas** `return` de fonction pour monter `setupApi()`. Un hook `configureServer` qui
  `return`s une fonction s'exécute en hook **"post"**, or le fallback SPA de Vite (`appType:
  "spa"`, actif par défaut) réécrit toute requête `GET` sans extension vers `/index.html`
  **avant** que les hooks post ne tournent — `/api/health` recevait donc silencieusement la
  page d'accueil au lieu de JSON (vérifié en loggant les requêtes reçues par le middleware :
  il ne voyait jamais que `GET /index.html`, jamais `GET /api/health`). Fix : appeler
  `setupApi(server.middlewares)` directement dans le corps de `configureServer` (hook "pre",
  qui s'exécute avant le fallback SPA). Le vite.config.ts de Flash Pizzas utilise le pattern
  "post" (`return () => {...}`) mais sur une version de Vite différente (7.1.7 vs 6.4.3 ici) —
  si ce piège réapparaît côté Flash après une mise à jour de Vite, c'est la même cause.
- ⚠️ **Piège Vite #2 trouvé et corrigé** : `.env` rempli mais `/api/health` continuait à
  renvoyer `SUPABASE_URL et SUPABASE_KEY requis`. Cause : Vite ne pose sur `process.env` (lu
  par le code serveur Node dans `server/db.ts`) que les variables qu'on lui demande
  explicitement — `envDir` ne fait que dire à Vite où chercher les fichiers `.env` pour
  `import.meta.env` (le monde client), pas pour `process.env` (le monde serveur). En prod,
  c'est `node --env-file-if-exists=.env dist/index.js` (cf. `package.json` → `start`) qui
  s'en charge ; en dev il n'y a pas d'équivalent automatique. Fix : `vite.config.ts` appelle
  maintenant `loadEnv(mode, ...)` et fait `Object.assign(process.env, env)` explicitement
  avant de définir la config. Sans ce fix, tout code serveur qui lit `process.env.X` en dev
  serait silencieusement `undefined` même avec un `.env` correctement rempli.

### ✅ Phase 1 — Catalogue (fait, 2 août 2026)
- `src/data/menuItems.ts` : `MENU_CATEGORIES`, `MENU_ITEMS`, helpers `categoryLabel`,
  `itemsByCategory`, `findMenuItem`, `formatChf` — source unique, contenu encore placeholder
  (à remplacer par la vraie carte du patron).
- `src/SaraSite.jsx` : `MENU_CATS`/`MENU_PRODUCTS`/`CATEGORIES`/`chf()` locaux supprimés,
  remplacés par l'import de `./data/menuItems`. `catLabel` par produit (dupliqué à la main)
  remplacé par `categoryLabel(p.category)` dérivé — pour ne pas reproduire le problème que
  Flash Pizzas a lui-même signalé dans son propre `CLAUDE.md` (prix/catégories dupliqués dans
  plusieurs fichiers qui peuvent diverger).
- Vérifié réellement, pas supposé : `npm run check` ✅, `npm run build` ✅, et rendu comparé
  dans le navigateur avant/après sur `/#/carte` (10 produits, mêmes catégories/prix/descriptions)
  et `/#menu` (carrousel catégories accueil) — zéro erreur console, zéro régression visuelle.
- Reste pour une session frontend future : remplacer le contenu placeholder par la vraie carte,
  et éventuellement migrer `MENU_ITEMS`/`MENU_CATEGORIES` vers les types que le collègue
  frontend aura choisis pour panier/checkout (voir `docs/brief-frontend-collegue.md`) — ce
  fichier est la source à faire évoluer ensemble, pas à dupliquer une deuxième fois ailleurs.

### ✅ Phase 2 — Panier + espace client (backend + logique fait, 2 août 2026)
- `server/db.ts` : `User`/`Session` + CRUD (`findUserByEmail`, `createUser`, `updateUser`,
  `updatePassword`, `verifyPassword` à temps constant, `toggleFavorite`, `safeUser` — retire
  toujours `passwordHash`/`emailVerifToken` avant de renvoyer un user) + sessions
  (`createSession`, `findSession`, `deleteSession`, `deleteUserSessions`).
- `server/api.ts` : cookie `sara_session` (HttpOnly, `SameSite=Strict`, `Secure` en prod — nom
  différent de `fp_session` chez Flash, deux sites distincts, pas de collision possible de
  toute façon mais plus clair). Rate limiting in-memory par IP (register 5/10min, login
  10/min). Routes : `POST /api/auth/register|login|logout`, `GET/PUT /api/me`,
  `PUT /api/me/password` (invalide toutes les sessions puis recrée celle de l'appareil
  courant), `POST /api/me/favorites` (toggle par id produit).
- `src/contexts/AuthContext.jsx` + `src/contexts/CartContext.jsx` : logique/état seulement,
  **aucune UI** — exprès, pour ne pas empiéter sur le travail du collègue frontend
  (`docs/brief-frontend-collegue.md`). `CartProvider` persiste en `localStorage`
  (`sara_cart`), fusionne les lignes par nom+prix+desc (`sameLine`) comme chez Flash. Les deux
  providers sont montés dans `src/main.jsx`, aucun composant ne les consomme encore.
- ⚠️ **Pas d'email de vérification envoyé** (contrairement à Flash) : `RESEND_API_KEY` n'est
  pas configuré, `email_verified` reste `false` sans bloquer la connexion (comme chez Flash,
  qui ne gate jamais le login sur ce champ non plus) — la colonne/le token existent déjà en
  base pour brancher Resend plus tard sans migration.
- **Vérifié réellement contre le vrai Supabase** (pas supposé) : script de test complet —
  inscription, doublon d'email → 409, mauvais mot de passe → 401, `/api/me` avec cookie,
  favoris, mise à jour profil, **et surtout** : changement de mot de passe avec deux sessions
  actives → l'ancienne session (`cookies2`) devient 401 après coup, la session courante reste
  valide (renouvelée). Déconnexion → `/api/me` repasse à 401. Utilisateur de test supprimé
  après coup (`DELETE .../rest/v1/users` avec la clé service_role, cascade sur `sessions`).
  `npm run check` + `npm run build` ✅.
- **Pas encore fait** : aucun écran (connexion/inscription/compte/panier visible) — c'est le
  périmètre du collègue frontend. Checkout invité pas testable avant la Phase 3
  (`POST /api/orders` n'existe pas encore, `user_id` nullable déjà prévu dans le schéma).

### ✅ Phase 3 — Commande + paiement (fait et vérifié, 2 août 2026)
- **Migration `0002_orders_payment_intent.sql`** : ajoute `orders.payment_intent` (nullable) —
  ⚠️ vérifier qu'elle a bien été exécutée dans Supabase (nécessaire pour que le webhook
  Stripe puisse enregistrer le `payment_intent` de chaque commande carte).
- **Clés Stripe (compte "vultur", mode test)** posées dans `.env` : `STRIPE_SECRET_KEY`
  (`sk_test_...`) et `VITE_STRIPE_PUBLISHABLE_KEY` (`pk_test_...`). `STRIPE_WEBHOOK_SECRET`
  toujours absent — aucun endpoint webhook n'est encore enregistré côté Stripe (ça a besoin
  d'une URL publique, donc après déploiement Render ; en local on le fournit à la volée pour
  les tests, voir plus bas).
- `server/db.ts` : `Order`/`OrderItem`, `createOrder`, `getUserOrders`, `findOrderByPaymentIntent`.
- `server/api.ts` :
  - `POST /api/orders` — paiement cash/sur place, crée la commande direct en `pending`.
    Checkout invité si prénom/nom/téléphone fournis sans compte. Validation stricte
    (`validateItems`/`validateTotal`, mêmes bornes que Flash : 60 articles max, qty 1-50,
    prix 0-1000, total 0-10000).
  - `GET /api/me/orders` — historique, requiert compte.
  - `POST /api/stripe/create-checkout` — Embedded Checkout, **capture manuelle**
    (`capture_method: "manual"`) : la carte n'est qu'**autorisée** au checkout, jamais
    débitée à ce stade. `GET /api/stripe/session-status`.
  - `POST /api/stripe/webhook` — `checkout.session.completed` crée la commande (`pending`),
    idempotent par `payment_intent` (Stripe relivre parfois le même événement).
  - ⚠️ **Capture/annulation du paiement pas encore câblées** (`captureOrderPayment`/
    `cancelOrderPayment` façon Flash) — normal, ça n'a de sens qu'avec un accepter/refuser,
    qui arrive en Phase 4. Jusque-là, une autorisation carte reste "en attente" côté Stripe
    (auto-annulée par Stripe au bout de 7 jours si jamais capturée — filet de sécurité
    intégré à Stripe, pas quelque chose qu'on a codé).
- `src/contexts/CartContext.jsx` : `placeOrder()` (cash, vide le panier après succès) et
  `createStripeCheckout()` (renvoie `clientSecret`, ne vide PAS le panier — ça doit attendre
  la confirmation réelle du paiement). Toujours pas d'UI — la page de paiement embarquée
  Stripe (`@stripe/react-stripe-js`) reste à construire par le collègue frontend, ces deux
  fonctions sont ce sur quoi il pourra s'appuyer.
- **Vérifié réellement contre le vrai Supabase (chemin cash)** : commande refusée si
  `orderType` invalide (400), commande créée en connecté (`desc` de personnalisation
  préservé), commande créée en invité (sans cookie), `/api/me/orders` ne renvoie que les
  commandes du compte connecté (la commande invité n'y apparaît pas — comportement voulu).
- **Vérifié réellement contre la vraie API Stripe (chemin carte)** :
  - `POST /api/stripe/create-checkout` → vraie session Stripe créée (`cs_test_...`),
    `clientSecret` renvoyé, confirmé via `GET /api/stripe/session-status` (`status: "open"`).
  - `POST /api/stripe/webhook` → pas de CLI Stripe installé et pas encore d'URL publique pour
    un vrai test bout-en-bout, donc **événement `checkout.session.completed` simulé** avec
    l'algorithme de signature officiel de Stripe (`HMAC-SHA256("{timestamp}.{payload}",
    secret)`, header `t=...,v1=...`) — script `test-stripe-webhook.mjs`, secret temporaire
    passé en variable d'env au lancement du serveur (`STRIPE_WEBHOOK_SECRET=... npm run dev`).
    Résultat : signature acceptée, commande créée en base avec les bonnes données (`items`
    avec `desc` préservé, `total`, `address`, `phone`, `status: "pending"`, `payment_intent`
    renseigné) ; **renvoi du même événement → `duplicate:true`, aucune deuxième commande
    créée** (idempotence confirmée au niveau base, pas juste dans la réponse HTTP).
    ⚠️ Ce test valide notre code de vérification/traitement, pas la config réelle du
    dashboard Stripe (qui n'existe pas encore) — un vrai test bout-en-bout (Stripe → notre
    webhook) reste à faire une fois `STRIPE_WEBHOOK_SECRET` obtenu après déploiement.
  - Données de test nettoyées après coup (ordres + doublons vérifiés absents).
- `npm run check` + `npm run build` ✅.

### 🟡 Phase 4 — Suivi de commande + notif patron (fait/vérifié sauf Telegram réel, 2 août 2026)
- **Migration `0003_orders_tracking.sql`** : `eta_minutes`, `eta_ready_at`, `cancelled_by_client`
  — exécutée par Ayoub, vérifiée (colonnes présentes).
- `server/db.ts` : `findOrderById` (auto-progression `preparing`→`ready` dès que `eta_ready_at`
  est dépassé, recalculée à **chaque lecture**, jamais de `setTimeout`), `acceptOrder`
  (restreint aux commandes `pending`/`confirmed` — garde-fou ajouté après relecture du code,
  absent chez Flash mais peu coûteux et évite qu'un vieux lien "Accepter" ressuscite une
  commande refusée), `updateOrderStatus`, `cancelOrderByClient`.
- `server/api.ts` :
  - `orderActionToken`/`verifyOrderToken` — HMAC-SHA256(orderId, `ADMIN_SECRET`), stateless,
    comparaison à temps constant.
  - `GET /api/orders/:id/manage` — page HTML autonome (CSS+JS inline, CSP dédiée), boutons
    Accepter 15/30/45/60 + Refuser si la commande est encore `pending`/`confirmed`, sinon
    affiche juste le statut (idempotent).
  - `POST /api/orders/:id/manage/accept|refuse` — capture/annule le paiement Stripe si
    `payment_intent` présent (`captureOrderPayment`/`cancelOrderPayment`, enfin câblées).
  - `GET /api/orders/:id/status` (public, l'ID sert de secret implicite), `POST
    /api/orders/:id/received` (ready→delivered), `DELETE /api/orders/:id` (client, compte
    requis, `pending`/`confirmed` uniquement).
  - `POST /api/admin/telegram/test` (Bearer `ADMIN_SECRET`) — pour tester la notif sans
    passer par une vraie commande.
  - Notification Telegram best-effort branchée sur `POST /api/orders` et le webhook Stripe —
    no-op silencieux (juste un `console.warn`) si `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`
    absents, donc le flow commande continue de fonctionner sans.
- `ADMIN_SECRET` généré et posé dans `.env` — aucun compte tiers requis pour celui-ci
  (contrairement à Supabase/Stripe), c'est juste un secret aléatoire local.
- `src/hooks/useOrderStatus.js` : poll 5s, expose `status/orderType/etaMinutes/etaReadyAt/
  cancelledByClient/markReceived/cancelOrder` — toujours logique seulement, pas d'UI (le
  collègue frontend construit l'écran de suivi par-dessus).
- **Vérifié réellement contre le vrai Supabase, scénario complet** :
  1. Commande créée → `GET /status` public → `pending`.
  2. Page `/manage` : mauvais jeton → 403 ; bon jeton → boutons Accepter 15/30/45/60 présents.
  3. Accepter 15 min → `preparing`, `etaReadyAt` = +15 min correct.
  4. **`eta_ready_at` forcé dans le passé directement en base** (simule le temps qui passe,
     sans attendre) → `GET /status` suivant repasse tout seul à `ready`, sans aucune action
     serveur déclenchée entre-temps — **le mécanisme central de la Phase 4 est confirmé**.
  5. `POST /received` → `delivered` ; rappelé une 2e fois → 404 (déjà livrée, pas "ready").
  6. Refuser une commande → `cancelled` ; **tentative de la réaccepter ensuite → rejetée**
     (le garde-fou ajouté fonctionne).
  7. `DELETE` sans cookie → 401 ; avec cookie propriétaire sur commande `pending` → `cancelled`
     + `cancelledByClient: true` (distinct d'un refus patron, comme prévu).
  8. `POST /api/admin/telegram/test` : sans auth → 403 ; mauvais secret → 403 ; bon secret →
     502 avec message clair (`TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID absents`) — échec propre,
     pas un crash.
  Toutes les données de test nettoyées après coup. `npm run check` + `npm run build` ✅.
- ⚠️ **Pas testé : une vraie notification Telegram reçue par un vrai bot.** Aucun bot créé —
  reste une action manuelle d'Ayoub (voir ci-dessous) avant de considérer la Phase 4 à 100 %.

#### Créer le bot Telegram (reste à faire par Ayoub)
1. Ouvrir Telegram → chercher **@BotFather** → `/newbot` → suivre les instructions (nom,
   username se terminant par `bot`) → il donne un **token** (`TELEGRAM_BOT_TOKEN`).
2. Envoyer n'importe quel message au bot créé (pour qu'il ait une conversation à répondre).
3. Ouvrir dans un navigateur : `https://api.telegram.org/bot<TOKEN>/getUpdates` → chercher
   `"chat":{"id": ...}` dans la réponse → c'est le **`TELEGRAM_CHAT_ID`**.
4. Ajouter les deux valeurs dans `.env`, relancer le serveur, tester via
   `POST /api/admin/telegram/test` avec `Authorization: Bearer <ADMIN_SECRET>`.

### ⬜ Phase 5 — Dashboard patron
Compte patron par email d'env (`BOSS_EMAIL`), stats dérivées d'`orders` +
`analytics_events`, aucune nouvelle table de rôles.

## Conventions héritées de Flash Pizzas (à respecter dès qu'applicable)
- Statuts commande : `pending → confirmed → preparing → ready → delivered | cancelled`.
- IDs applicatifs en hex (`crypto.randomBytes`), pas des uuid Postgres — l'ID de commande sert
  aussi de secret implicite pour le suivi public.
- Comparaisons de mot de passe/secret à temps constant (`crypto.timingSafeEqual`).
- Jamais de `.env` committé ; `sync: false` sur les env vars sensibles dans `render.yaml`.
- Ne jamais committer/pusher sans demande explicite de l'utilisateur.
