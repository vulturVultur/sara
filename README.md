# Sara

Site web mono-page pour **Sara** (commande en ligne, livraison et réservation chicha),
construit avec React + Vite.

## Stack

- [React 18](https://react.dev/)
- [Vite 6](https://vite.dev/)
- [lucide-react](https://lucide.dev/) pour les icônes

Le style est fourni via du CSS inline dans le composant (`src/SaraSite.jsx`),
aucune configuration Tailwind n'est requise.

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
├── src/
│   ├── main.jsx          # montage de l'application React
│   ├── index.css         # reset CSS global
│   └── SaraSite.jsx      # composant principal du site
└── package.json
```
