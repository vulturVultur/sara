# Sara

Site web mono-page pour **Sara Pizzeraya Kebap** (commande en ligne, livraison et
réservation chicha), construit avec React + Vite.

## Stack

- [React 18](https://react.dev/)
- [Vite 6](https://vite.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/) pour la mise en page (utilitaires `flex`, `grid`, `rounded-*`…)
- [lucide-react](https://lucide.dev/) pour les icônes

Les couleurs de marque (`bg-sara-red`, `text-sara-black`, `glow-red`…), la vague, les
polices et les animations sont définies à la main dans `src/sara.css` — pas via le thème
Tailwind. Les photos sont servies depuis `public/img/` (chemins `/img/...`), sans base64.

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

- **Panier** : le `CartProvider` garde l'état en mémoire uniquement. Rebrancher
  `localStorage` pour survivre à un rechargement.
- **Back-office** : les boutons « Commander / Réserver / Payer » ne font que modifier
  un état local. À brancher : paiement (Stripe), commandes/réservations, notification cuisine.
- **Coordonnées** : le pied de page affiche encore une adresse et un numéro de démo
  (`12 rue des Lilas, Lyon`) alors que les prix sont en CHF — à corriger dans `Footer`.
- **Photos manquantes** : les desserts (Baklava) affichent un bloc « Photo à venir ».
