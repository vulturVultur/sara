# Sara

Site web mono-page pour **Sara Pizzeraya Kebap** (commande en ligne, livraison et
réservation chicha), construit avec React + Vite.

## Stack

- [React 18](https://react.dev/)
- [Vite 6](https://vite.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/) pour la mise en page (utilitaires `flex`, `grid`, `rounded-*`…)
- [lucide-react](https://lucide.dev/) pour les icônes

Le site est une **vitrine** au style « FreshBox » : hero avec carrousel de plats, catégories
en marquee défilant, offres, menu, à propos, atouts, traiteur, témoignages, FAQ, galerie,
blog et pied de page. La palette (`sara.red`, `sara.cream`, `sara.orange`, `sara.brown`…) et
les polices (`Anton` pour les titres, `Poppins` pour le corps) sont définies dans le thème
Tailwind (`tailwind.config.js`) ; la vague, le wordmark 3D, les carrousels et animations
sont dans `src/sara.css`. Les photos sont servies depuis `public/img/` (chemins `/img/...`).

## Démarrage

```bash
npm install       # installe les dépendances
npm run dev       # serveur de développement (http://localhost:5173)
npm run build     # build de production dans dist/
npm run preview   # prévisualise le build de production
```

## Structure

```
.
├── index.html            # point d'entrée HTML
├── vite.config.js        # configuration Vite
├── tailwind.config.js    # scan des classes dans index.html + src/
├── postcss.config.js     # Tailwind + autoprefixer
├── public/
│   └── img/              # 14 photos (JPEG) + logo PNG
├── src/
│   ├── main.jsx          # montage de l'application React
│   ├── index.css         # directives Tailwind + réglages globaux
│   ├── sara.css          # palette Sara, polices, vague, animations
│   └── SaraSite.jsx      # composant principal du site
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
