/** @type {import('tailwindcss').Config} */

/* ------------------------------------------------------------------ */
/*  Charte graphique SARA                                              */
/*                                                                     */
/*  Trois couleurs officielles (cf. Couleurs_Charte_Site) :            */
/*    • fond principal   — vert  #203818                               */
/*    • fond secondaire  — or    #B67614                               */
/*    • détail           — rouge #C60101                               */
/*                                                                     */
/*  RÈGLE DE RÉPARTITION — le blanc porte, la couleur ponctue.         */
/*  Le blanc cassé (`paper`) est le support de la page ; le vert et    */
/*  l'or sont les fonds des BANDES pleine largeur qui rythment le      */
/*  parcours (hero, chicha, CTA, pied de page) ; le rouge reste un     */
/*  point (bouton, pastille, filet). Une page entièrement verte étouffe*/
/*  les photos et les couleurs de marque : elles n'ont plus de fond    */
/*  sur lequel exister.                                                */
/*                                                                     */
/*  Les teintes ci-dessous sont des déclinaisons des trois couleurs    */
/*  officielles + les neutres (blanc, papier, gris de texte). Aucune   */
/*  quatrième couleur de marque.                                       */
/* ------------------------------------------------------------------ */

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sara: {
          /* Neutres — le support */
          paper: '#FAF7F0',      // fond de page (blanc chaud)
          paperAlt: '#F0E8D6',   // bande claire alternée, pour le rythme
          card: '#FFFFFF',       // cartes et surfaces posées sur le papier

          /* Vert — fond principal des bandes colorées, et encre des textes */
          green: '#203818',      // bandes vertes + titres sur fond clair
          greenDeep: '#152510',  // pied de page, aplats profonds
          greenDark: '#1A2E13',  // surfaces sombres sur fond vert
          ink: '#0D1608',        // noir verdâtre (ambiance chicha)

          /* Or — fond secondaire */
          gold: '#B67614',       // bandeau or pleine largeur
          goldDeep: '#8C590C',   // or lisible en TEXTE sur fond clair
          goldLight: '#D9A03D',  // or lisible en texte sur fond sombre
          goldPale: '#F2E2C2',   // reflets, texte chaud sur or foncé

          /* Rouge — détail */
          red: '#C60101',        // boutons d'action, accents
          redDeep: '#8F0101',    // survol des boutons rouges

          /* Textes secondaires — un par type de fond */
          muted: '#5F6B57',      // sur fond clair  (5,3:1 sur paper)
          mutedDark: '#AFBCA2',  // sur fond sombre (6,4:1 sur green)
          cream: '#F7EEDD',      // texte principal sur fond sombre
        },
      },
      fontFamily: {
        display: ['Anton', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
