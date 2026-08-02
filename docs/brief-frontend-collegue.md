# Brief SARA — espace commande client (pour la session Claude de [collègue])

Colle ce message tel quel comme première instruction à ton Claude Code, dans le dossier
`Sara` (le même repo que celui d'Ayoub — `https://github.com/vulturVultur/sara.git`).

## Contexte du projet

SARA (Sara Pizzeraya Kebap) est un site vitrine React + Vite existant, en train d'évoluer
vers une vraie app de commande en ligne (compte client, panier, paiement, suivi de commande),
sur le modèle d'un autre projet de l'agence (Flash Pizzas) qui tourne déjà en prod avec de
vrais clients. Le backend (Express + Supabase) est en cours de construction par un autre
chantier en parallèle — **ton rôle ici est uniquement le frontend/design des écrans de
commande**, pas le serveur.

## Ce qui existe déjà — ne pas repartir de zéro

- `src/SaraSite.jsx` : la vitrine (hero, offres, à propos, chicha, galerie, FAQ, footer) +
  une page Menu (`#/carte`) avec des **produits placeholder** (`MENU_PRODUCTS`, à ignorer
  côté contenu — les vrais produits arriveront dans un fichier de données partagé, pas encore
  livré). Routage par hash fait main (`#/carte`), pas de vraie librairie de routing.
- Charte graphique déjà posée dans `tailwind.config.js` — **à respecter, ne pas réinventer** :
  - Couleurs : `sara.cream` `#FBEFD5`, `sara.creamSoft` `#FCF5E6`, `sara.red` `#A51E22`,
    `sara.redDark` `#7E1518`, `sara.redBright` `#B8242A`, `sara.ink` `#2A1712`,
    `sara.brown` `#40241A`, `sara.orange` `#F5A623`, `sara.green` `#1F5C3D`,
    `sara.muted` `#7C6F64`
  - Polices : `font-display` = Anton (titres), `font-body` = Poppins (corps de texte)
  - Icônes : `lucide-react`
  - ⚠️ Ne surtout pas reprendre la palette de Flash Pizzas (rouge/jaune/noir) — SARA a sa
    propre identité, l'un ne doit pas ressembler à l'autre.
- `public/img/` : photos existantes (kebabs, burgers, tacos, assiettes...).

## Ce qu'il faut concevoir (rien de tout ça n'existe encore)

Le panier actuel est un simple lien `<a href="#/carte">`, sans aucune logique. Voici les
écrans/composants à designer et construire, dans l'ordre de priorité suggéré :

1. **Page Menu enrichie** — la grille actuelle est un point de départ, mais il manque : un
   vrai bouton "ajouter au panier" par produit, une modale de personnalisation si un produit a
   des options (taille, suppléments — à voir avec le patron si ça s'applique à Sara), une
   recherche/filtre par catégorie plus poussé.
2. **Panier** (drawer ou modale) — liste des articles, quantités, total, bouton vers le
   tunnel de commande. Chaque ligne de panier doit pouvoir porter une **description libre**
   (`desc`) en plus du nom/prix/quantité — c'est ce qui permettra plus tard d'afficher des
   suppléments ou une note ("sans oignon", etc.).
3. **Tunnel de commande** — choix emporter / livraison, adresse + téléphone si livraison,
   récapitulatif, bouton de validation. Prévoir un mode **"commande sans compte"** (juste
   prénom/nom/téléphone) en plus du mode connecté — ne bloque personne à la friction du login.
4. **Espace client `/compte`** — profil, historique de commandes, favoris (cœur sur les
   produits). Le programme fidélité (façon "10 commandes = 1 offerte") est **à confirmer avec
   le patron** avant de le designer — ne pas supposer que Sara le veut par défaut.
5. **Suivi de commande** — après validation, un écran/bandeau qui montre la progression en
   4 étapes : **Commande reçue → En préparation → Prête / En route → Livrée**, plus une
   annulation possible juste après l'envoi (fenêtre de quelques secondes). Les statuts
   possibles côté serveur seront exactement : `pending`, `confirmed`, `preparing`, `ready`,
   `delivered`, `cancelled` — le design doit pouvoir représenter ces 6 états (y compris
   "en attente de confirmation du resto" et "commande refusée/annulée", qui sont différents).
6. **Écrans connexion / inscription** — formulaire simple (email, mot de passe, prénom, nom,
   téléphone) + mot de passe oublié.

Le dashboard patron (interface de gestion des commandes) est **hors périmètre** pour l'instant
— c'est un outil interne, pas une priorité design.

## Contraintes à respecter

- Ne touche pas à `server/`, `supabase/`, `vite.config.ts`, `.env*` — c'est le chantier
  backend en parallèle, un conflit ici coûterait cher à réconcilier.
- La forme exacte des données produit n'est pas encore figée (ça arrive dans une prochaine
  étape backend) — construis tes composants avec des props/mock data raisonnables
  (`{ id, name, price, category, image, desc }`) plutôt que d'inventer un format définitif
  gravé dans le marbre.
- Le site doit rester un **SPA une seule origine** (pas d'appel vers un autre domaine/API
  séparée) — tout passera par `/api/...` sur le même site une fois branché.
- Priorité mobile : la majorité du trafic resto est mobile, teste large mais conçois d'abord
  pour petit écran.

## Pour aller plus loin si besoin de contexte fonctionnel

Le repo Flash Pizzas (même agence, déjà en prod) a résolu ces mêmes écrans avec des choix UX
validés en conditions réelles (ex. : fusionner les lignes de panier par nom+prix+description
pour ne pas perdre les personnalisations — un bug réel corrigé chez eux). Si tu veux t'en
inspirer fonctionnellement (pas visuellement), demande à Ayoub l'accès au dossier
`Flash Pizzas` en local pour lire son `CLAUDE.md`.
