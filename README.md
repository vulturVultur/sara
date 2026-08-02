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

Le site est une **vitrine** : hero avec carrousel de plats, catégories en marquee défilant,
offres, menu (`#/carte`), chicha, à propos, galerie, FAQ et pied de page. Les polices
(`Anton` pour les titres, `Poppins` pour le corps) et la palette sont définies dans le thème
Tailwind (`tailwind.config.js`) ; les vagues de séparation, le wordmark, les carrousels et
animations sont dans `src/sara.css`. Les photos sont servies depuis `public/img/`
(chemins `/img/...`).

## Charte graphique

Trois couleurs officielles de marque, et **rien d'autre** — les autres teintes `sara.*` du
thème sont des déclinaisons de ces trois-là, plus les neutres (papier, blanc, gris de texte) :

| Rôle | Couleur | Jeton Tailwind |
| --- | --- | --- |
| Fond principal | vert `#203818` | `sara.green` |
| Fond secondaire | or `#B67614` | `sara.gold` |
| Détail | rouge `#C60101` | `sara.red` |
| Support (neutre) | blanc chaud `#FAF7F0` | `sara.paper` |

### La règle de répartition : le blanc porte, la couleur ponctue

« Fond principal = vert » ne veut **pas** dire que la page est peinte en vert : ça veut dire
que le vert est la couleur de fond *quand il y a un fond coloré*. Une page entièrement verte
étouffe les photos de plats et prive les couleurs de marque du support sur lequel exister.

- **Le papier porte la page** (~70 % de la surface) : en-tête, grilles, galerie, FAQ, page
  Carte. `sara.paperAlt` sert de bande claire alternée pour le rythme (section « À propos »).
- **Le vert et l'or habillent les BANDES pleine largeur** qui rythment le parcours : hero
  (vert), espace chicha (`sara.ink`, ambiance tamisée), bandeau CTA (or), pied de page
  (vert profond). Chaque bande est cousue au papier par une vague.
- **Les cartes restent blanches** (`.card-light`) : c'est la photo du plat qui apporte la
  couleur, pas le fond de la carte.
- **Le rouge reste un point** : boutons d'action, pastilles, filets de crête sur fond clair
  ou doré, points actifs. Jamais en texte sur le vert (2:1) ni sur l'or (1,6:1) — uniquement
  en aplat avec du blanc, ou sur le papier (5,8:1).
- **Une seule carte remplie de couleur par grille** — le produit `featured` de la page Carte.
  Au-delà d'une, l'accent se dilue.
- **Le filet or** (`.gold-frame`, `.gold-rule`, `.gold-glow`) reprend l'encadrement lumineux
  de l'enseigne : il souligne l'en-tête, encadre les surfaces posées sur les bandes sombres,
  et borde la crête de chaque vague. Sur fond clair, l'or en texte passe en `sara.goldDeep`
  (5,5:1) — `sara.gold` seul n'y atteint que 3,5:1.
- Le logo officiel (`public/img/logo.png`) est affiché tel quel dans l'en-tête clair, où son
  badge noir est à son avantage ; le pied de page et le tiroir mobile utilisent le wordmark
  typographique `.sara-wordmark`.

### Pièges de mise en œuvre

- Après toute modification de `tailwind.config.js`, **redémarrer le serveur de dev** : le HMR
  ne propage pas les changements de jetons de façon fiable, et on juge alors une palette
  périmée. `npm run build` lit toujours la config fraîche.
- Les modulations d'opacité doivent rester **dans le barème Tailwind** (`/10`, `/15`, `/20`,
  `/25`…). Une valeur hors barème comme `/8` n'est pas générée : la classe tombe en
  transparent, sans erreur.

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
│   ├── sara.css          # charte Sara, polices, vagues, cadres or, animations
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
- **Photos manquantes** : quelques emplacements attendent des visuels (catégorie Desserts,
  troisième photo du salon chicha). Ils affichent un bloc « Photo à venir » tant que l'image
  n'est pas fournie dans `public/img/`.
- **Orthographe du nom** : l'enseigne du restaurant écrit « PIZZERAYA », le fichier logo PDF
  fourni écrit « PIZZERYA ». Le site suit l'enseigne (`INFO.name`) — à trancher avec le patron.
- **Liens** : les boutons « Commander / Réserver / Explorer / Lire l'article » pointent vers des
  ancres internes. À brancher sur les vraies pages (commande, réservation, blog) si besoin.
