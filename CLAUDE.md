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

### ⬜ Phase 2 — Panier + espace client
`CartContext` (fusion des lignes par nom+prix+desc, PAS par nom seul — c'est le bug corrigé
chez Flash le 5 juillet 2026, à éviter dès le départ). Auth : PBKDF2 + cookie `HttpOnly`,
endpoints `/api/auth/*` + `/api/me/*`, checkout invité possible.

### ⬜ Phase 3 — Commande + paiement
`POST /api/orders`, Stripe Embedded Checkout en capture manuelle, webhook idempotent.

### ⬜ Phase 4 — Suivi de commande + notif patron
Statut dérivé de `eta_ready_at` (jamais de `setTimeout` — survit aux redémarrages), lien de
gestion signé HMAC (accepter/refuser) envoyé au patron par un canal à définir (Telegram le
plus simple à mettre en place).

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
