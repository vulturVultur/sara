# Sara

Site pour **Sara Pizzeraya Kebap** (commande en ligne, livraison et réservation
chicha) : vitrine React + Vite, en cours d'évolution vers une app complète
(compte client, panier, paiement, suivi de commande, dashboard patron) sur le
modèle de Flash Pizzas. Voir [CLAUDE.md](./CLAUDE.md) pour l'architecture
cible et l'avancement par phase.

## Stack

- **Frontend** : React 18 + Vite 6 + Tailwind 3, [lucide-react](https://lucide.dev/) pour les icônes
- **Backend** : Express (Node), même process que le frontend en prod (`server/`)
- **Base de données** : Supabase (`public.users`, `public.sessions`, `public.orders`)

Le site est une **vitrine** au style « FreshBox » : hero avec carrousel de plats, catégories
en marquee défilant, offres, menu, à propos, atouts, traiteur, témoignages, FAQ, galerie,
blog et pied de page. La palette (`sara.red`, `sara.cream`, `sara.orange`, `sara.brown`…) et
les polices (`Anton` pour les titres, `Poppins` pour le corps) sont définies dans le thème
Tailwind (`tailwind.config.js`) ; la vague, le wordmark 3D, les carrousels et animations
sont dans `src/sara.css`. Les photos sont servies depuis `public/img/` (chemins `/img/...`).

## Démarrage

```bash
npm install                    # installe les dépendances
cp .env.example .env           # puis remplir SUPABASE_URL / SUPABASE_KEY
npm run dev                    # serveur de dev (http://localhost:5173, API /api/* incluse)
npm run build                  # build de production dans dist/
npm run check                  # vérifie TypeScript (server/)
npm start                      # lance le build de prod (dist/index.js)
```

Base de données : créer un projet Supabase, puis exécuter
`supabase/migrations/0001_init.sql` dans l'éditeur SQL (rien n'est appliqué
automatiquement par le code).

## Structure

```
.
├── index.html            # point d'entrée HTML
├── vite.config.ts        # config Vite + montage des routes /api/* en dev
├── tailwind.config.js    # scan des classes dans index.html + src/
├── postcss.config.js     # Tailwind + autoprefixer
├── render.yaml            # déploiement Render (process Node persistant, pas statique)
├── public/
│   └── img/              # photos (JPEG) + logo PNG
├── src/
│   ├── main.jsx          # montage de l'application React
│   ├── index.css         # directives Tailwind + réglages globaux
│   ├── sara.css          # palette Sara, polices, vague, animations
│   └── SaraSite.jsx      # composant principal du site
├── server/
│   ├── db.ts              # Supabase (singleton, helpers) — LIRE AVANT DE MODIFIER
│   ├── api.ts              # routes /api/* (middleware Connect/Express)
│   └── index.ts            # bootstrap Express (prod)
├── supabase/migrations/    # schéma DB, numéroté, appliqué manuellement
└── package.json
```

## À faire avant la mise en ligne

- **Coordonnées** : les infos de contact sont des placeholders dans l'objet `INFO`
  (`src/SaraSite.jsx`) — adresse `12 rue des Lilas, Lyon`, téléphone et horaires à confirmer,
  ainsi que la devise (prix en CHF). À remplacer par les vraies données.
- **Photos manquantes** : plusieurs sections attendent des visuels (portrait client/chef des
  témoignages, catégorie Desserts, articles de blog). Elles affichent un bloc « Photo à venir »
  tant que l'image n'est pas fournie dans `public/img/`.
- **Liens** : les boutons « Commander / Réserver / Explorer / Lire l'article » pointent vers des
  ancres internes. À brancher sur les vraies pages (commande, réservation, blog) si besoin.
