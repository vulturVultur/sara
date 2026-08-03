import { useState, useEffect, useRef, useCallback } from 'react';
import './sara.css';
import {
  Menu as MenuIcon, X, ArrowUpRight, ChevronLeft, ChevronRight,
  ChevronDown, Flame, Minus, Plus, Trash2, ShoppingCart, AlertCircle, UserPlus,
  Check, Clock, XCircle, ArrowLeft, Bike, ChefHat, Store, Heart,
  MapPin, Phone, Youtube, Twitter, Instagram, Linkedin,
  ShoppingBag, User,
} from 'lucide-react';
import { MENU_CATEGORIES, MENU_ITEMS, categoryLabel, formatChf } from './data/menuItems';
import { useCart } from './contexts/CartContext.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import { useOrderStatus } from './hooks/useOrderStatus.js';
import { useOrders } from './hooks/useOrders.js';

/* ------------------------------------------------------------------ */
/*  Charte graphique                                                   */
/*  Vert #203818 (fond principal) · Or #B67614 (fond secondaire)       */
/*  · Rouge #C60101 (détail).                                          */
/*                                                                     */
/*  RÉPARTITION — le blanc porte, la couleur ponctue :                 */
/*   · le papier (#FAF7F0) est le fond de la page et des grilles ;     */
/*   · le vert et l'or sont les fonds des BANDES pleine largeur qui    */
/*     rythment le parcours (hero, chicha, à propos, CTA, pied) ;      */
/*   · le rouge est un point : bouton, pastille, filet, carte accent.  */
/*  Les vagues font la couture entre une bande colorée et le papier.   */
/* ------------------------------------------------------------------ */

/* Teintes utilisées dans les SVG (les vagues), où Tailwind ne va pas. */
const C = {
  paper: '#FAF7F0',
  paperAlt: '#F0E8D6',
  green: '#203818',
  greenDeep: '#152510',
  gold: '#B67614',
  ink: '#0D1608',
  /* filets de crête : or sur fond sombre, rouge sur fond or ou clair */
  goldLine: 'rgba(217,160,61,.55)',
  redLine: 'rgba(198,1,1,.65)',
};

/* ------------------------------------------------------------------ */
/*  Données                                                            */
/* ------------------------------------------------------------------ */

const IMG = {
  logo: '/img/logo.png',
  hero: '/img/hero.jpg',
  broche: '/img/broche.jpg',
  plate: '/img/plate.jpg',
  drink: '/img/drink.jpg',
  salle: '/img/salle.jpg',
  durum: '/img/durum.jpg',
  tacos: '/img/tacos.jpg',
  tacosAlt: '/img/tacos-alt.jpg',
  burger: '/img/burger.jpg',
  burgerAlt: '/img/burger-alt.jpg',
  assiette: '/img/assiette.jpg',
  assietteAlt: '/img/assiette-alt.jpg',
  chicha: '/img/chicha.jpg',
};

/* Infos de contact — À CONFIRMER par le client (placeholder). */
const INFO = {
  name: 'Sara Pizzeraya Kebap',
  address: '12 rue des Lilas, 69001 Lyon',
  phone: '+41 00 000 00 00',
  hoursWeek: 'Lun – Jeu : 11h00 – 23h00',
  hoursWeekend: 'Ven – Dim : 11h00 – 01h00',
};

/* Spécialités affichées en bandeau du hero — reprise de l'enseigne. */
const SPECIALITES = ['Kebab', 'Pizza', 'Grill', 'Shisha Bar'];

/* Routes (routage par hash, fait main) */
const MENU_ROUTE = '#/carte';
const LOGIN_ROUTE = '#/connexion';
const REGISTER_ROUTE = '#/inscription';
const CHECKOUT_ROUTE = '#/commande';
/* Le suivi porte l'id en fin de route : #/suivi/<orderId>. L'id (32 car. hex)
   fait office de secret — pas besoin d'être connecté pour suivre sa commande. */
const TRACK_ROUTE = '#/suivi';
const ACCOUNT_ROUTE = '#/compte';
const RESA_ROUTE = '#/reservation';
const RESA_CHICHA_ROUTE = '#/reservation/chicha';

/* Libellés client des 6 statuts serveur. `cancelled` se lit différemment selon
   qui a annulé — c'est la seule nuance qui change le message. */
const LIBELLE_STATUT = {
  pending: 'En attente de confirmation',
  confirmed: 'En attente de confirmation',
  preparing: 'En préparation',
  ready: 'Prête',
  delivered: 'Terminée',
  cancelled: 'Annulée',
};

/* Filtres de la page Menu : "Tout" (pseudo-catégorie, UI seulement) + les
   vraies catégories du catalogue (src/data/menuItems.ts, source unique). */
const MENU_FILTERS = [{ id: 'all', label: 'Tout' }, ...MENU_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))];

/* Mise en avant : UNE seule carte de la grille est remplie de couleur, pour
   créer un point d'accroche — au-delà d'une, l'accent se dilue. C'est une
   décision d'affichage, pas une donnée du catalogue : elle reste donc ici et
   n'entre pas dans menuItems.ts, partagé avec le backend. */
const FEATURED_ID = 'etudiant';

/* Plats affichés dans le carrousel hero (le plat central défile). */
const HERO_DISHES = [
  { image: IMG.burger, emoji: '🍔', alt: 'Double cheeseburger et frites maison' },
  { image: IMG.durum, emoji: '🌯', alt: 'Kebab roulé grillé et crudités fraîches' },
  { image: IMG.assiette, emoji: '🍽️', alt: 'Assiette mixte brochettes et riz safran' },
  { image: IMG.tacos, emoji: '🌮', alt: 'Tacos XL galette grillée et sauce fromagère' },
];

/* theme : 'gold' (fond secondaire) · 'red' (détail) · 'green' (fond principal) */
const OFFERS = [
  {
    tag: 'Sélection du chef', theme: 'gold',
    title: 'PRÉPARÉ MINUTE', subtitle: 'SERVI À LA PERFECTION',
    save: '40%', image: IMG.assietteAlt, emoji: '🍽️',
  },
  {
    tag: 'Spécialité four', theme: 'red',
    title: 'BROCHE MAISON', subtitle: 'FONDANTE & PARFUMÉE',
    save: '50%', image: IMG.broche, emoji: '🔥',
  },
  {
    tag: 'Offre signature', theme: 'green',
    title: 'BURGERS SIGNATURE', subtitle: 'RICHES. JUTEUX. GÉNÉREUX.',
    save: '30%', image: IMG.burgerAlt, emoji: '🍔',
  },
];

/* Photos du salon chicha — remplace/complète avec tes propres visuels.
   Mets les fichiers dans public/img/ et renseigne le chemin (ex : '/img/salon-1.jpg'). */
const CHICHA_PHOTOS = [
  { src: IMG.chicha, emoji: '💨', alt: "Espace chicha à l'ambiance tamisée" },
  { src: IMG.salle, emoji: '🛋️', alt: 'Le salon Sara, cadre cosy et chaleureux' },
  { src: null, emoji: '💨', alt: 'Photo du salon chicha à venir' },
];

const FAQ = [
  { q: 'Combien de temps prend la livraison ?', a: 'En moyenne 25 à 40 minutes selon votre adresse et l’affluence. La livraison est offerte dès 20.- CHF de commande.' },
  { q: 'Proposez-vous un service traiteur ?', a: 'Oui, du petit rassemblement au grand événement. Contactez-nous pour un devis personnalisé et un menu sur mesure.' },
  { q: 'Puis-je réserver une table en ligne ?', a: 'Bien sûr. Réservez votre table ou votre coin chicha directement en nous appelant ou via le bouton « Réserver une table ».' },
  { q: 'Vos ingrédients sont-ils frais ?', a: 'Nous sélectionnons nos produits chaque jour et préparons nos plats minute pour garantir fraîcheur et qualité.' },
  { q: 'Avez-vous un espace chicha ?', a: 'Oui, un espace chicha premium avec un large choix de parfums, dans une ambiance cosy et tamisée.' },
];

const GALLERY = [
  { src: IMG.assietteAlt, emoji: '🍽️', alt: 'Assiette généreuse et accompagnements', span: 'row' },
  { src: IMG.plate, emoji: '🍴', alt: 'Plat servi à table' },
  { src: IMG.assiette, emoji: '🥗', alt: 'Assiette mixte et sauces' },
  { src: IMG.burger, emoji: '🍔', alt: 'Burger et frites maison' },
  { src: IMG.durum, emoji: '🌯', alt: 'Kebab roulé garni' },
  { src: IMG.tacos, emoji: '🍕', alt: 'Tacos XL et sauce fromagère' },
];

const NAV = [
  { href: '#accueil', label: 'Accueil' },
  { href: '#/carte', label: 'Menu' },
  { href: '#chicha', label: 'Chicha' },
  { href: '#about', label: 'À propos' },
  { href: '#galerie', label: 'Galerie' },
  { href: '#contact', label: 'Contact' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/* `dark` : le bloc « Photo à venir » se pose sur une bande sombre. */
function Img({ src, alt, className = '', emoji = '🍽️', dark = false }) {
  const [err, setErr] = useState(false);
  if (err || !src) {
    return (
      <div
        className={`${className} sara-placeholder ${dark ? 'sara-placeholder--dark' : ''} flex flex-col items-center justify-center gap-1`}
        role="img"
        aria-label={alt}
      >
        <span className="text-4xl" aria-hidden="true">{emoji}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wide ${dark ? 'text-sara-goldLight/60' : 'text-sara-green/40'}`}>Photo à venir</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setErr(true)} />;
}

const WAVE_CREST = 'M0,48 C240,104 420,4 720,40 C1010,74 1230,8 1440,44';

/* Couture entre une bande colorée et le papier. Le filet de crête est le
   détail signature (liseré de l'enseigne) : or quand la section au-dessus
   est sombre, rouge quand elle est claire ou dorée. */
function Wave({ fill, stroke = C.goldLine }) {
  return (
    <svg className="sara-wave" viewBox="0 0 1440 96" preserveAspectRatio="none" aria-hidden="true">
      <path d={`${WAVE_CREST} L1440,96 L0,96 Z`} fill={fill} />
      {stroke && <path d={WAVE_CREST} fill="none" stroke={stroke} strokeWidth="3" vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}

/* Même vague, accrochée en haut de section : ouvre une bande colorée sur le
   fond de la section précédente. */
function WaveTop({ fill, stroke = C.goldLine }) {
  return (
    <svg className="sara-wave sara-wave--top" viewBox="0 0 1440 96" preserveAspectRatio="none" aria-hidden="true">
      <path d={`${WAVE_CREST} L1440,0 L0,0 Z`} fill={fill} />
      {stroke && <path d={WAVE_CREST} fill="none" stroke={stroke} strokeWidth="3" vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}

function Reveal({ children, delay = 0, className = '', as: Tag = 'div', ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${seen ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

/* Bouton pilule (coin haut-droit rogné) */
function PillLink({ href = '#/carte', children, variant = 'red', className = '', ...rest }) {
  const styles = {
    red: 'bg-sara-red text-white hover:bg-sara-redDeep',
    gold: 'bg-sara-gold text-sara-ink hover:bg-sara-goldDeep hover:text-sara-goldPale',
    dark: 'bg-sara-green text-sara-cream hover:bg-sara-greenDeep',
    white: 'bg-white text-sara-red ring-1 ring-sara-green/10 hover:bg-sara-paperAlt',
  };
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-2 px-7 py-3.5 font-semibold rounded-2xl rounded-tr-none transition ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
      <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

/* Sur fond clair l'or descend à 3,5:1 en texte : on utilise goldDeep. */
function Eyebrow({ children, className = 'text-sara-goldDeep' }) {
  return <span className={`eyebrow ${className}`}>{children}</span>;
}

/* ------------------------------------------------------------------ */
/*  Vol de la pastille « ajouté au panier »                            */
/* ------------------------------------------------------------------ */

/* Identifiant de la cible : l'icône panier de l'en-tête. */
const CART_ANCHOR_ID = 'sara-cart-anchor';

const reduitLesAnimations = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* Envoie une pastille rouge du bouton cliqué vers l'icône panier.
   Purement décoratif : si la cible est absente, hors écran, ou si l'API
   d'animation manque, on ne fait rien — l'ajout au panier a déjà eu lieu. */
function volVersLePanier(depuis) {
  if (!depuis || reduitLesAnimations()) return;
  const cible = document.getElementById(CART_ANCHOR_ID);
  if (!cible || typeof depuis.animate !== 'function') return;

  const a = depuis.getBoundingClientRect();
  const b = cible.getBoundingClientRect();
  // Cible hors du viewport (en-tête non collant, déjà défilé) : la pastille
  // partirait dans le vide, mieux vaut s'abstenir.
  if (b.bottom < 0 || b.top > window.innerHeight) return;

  const dx = (b.left + b.width / 2) - (a.left + a.width / 2);
  const dy = (b.top + b.height / 2) - (a.top + a.height / 2);

  const pastille = document.createElement('span');
  pastille.className = 'sara-fly';
  pastille.style.left = `${a.left + a.width / 2}px`;
  pastille.style.top = `${a.top + a.height / 2}px`;
  document.body.appendChild(pastille);

  // Trajectoire en cloche : le point médian remonte, sinon le trajet est plat
  // et se lit mal quand départ et arrivée sont presque à la même hauteur.
  const animation = pastille.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 90}px) scale(1.25)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.35)`, opacity: 0.25 },
    ],
    { duration: 650, easing: 'cubic-bezier(.42,0,.35,1)', fill: 'forwards' }
  );

  const nettoyer = () => {
    pastille.remove();
    cible.classList.remove('cart-bump');
    // reflow : sans ça, ré-ajouter la classe aussitôt ne relance pas l'animation
    void cible.offsetWidth;
    cible.classList.add('cart-bump');
    setTimeout(() => cible.classList.remove('cart-bump'), 500);
  };
  animation.addEventListener('finish', nettoyer);
  animation.addEventListener('cancel', () => pastille.remove());
}

/* Reprise typographique du logo, là où l'image ne passe pas
   (tiroir mobile, pied de page). */
function Wordmark({ className = '' }) {
  return (
    <span className={`sara-wordmark ${className}`} aria-label="Sara Pizzeraya Kebap">
      <span className="sara-wordmark__name">Sara</span>
      <span className="sara-wordmark__sub">Pizzeraya Kebap</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Header — clair, pour que le logo (badge noir) soit à son avantage  */
/* ------------------------------------------------------------------ */

/* `sticky` : sur la page Carte, l'en-tête reste accroché en haut — c'est là
   qu'on ajoute des plats, et la pastille qui vole a besoin d'une cible
   visible en permanence. */
function Header({ sticky = false }) {
  const [mobile, setMobile] = useState(false);
  const [defile, setDefile] = useState(false);
  const { count, openCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (!sticky) { setDefile(false); return; }
    const onScroll = () => setDefile(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [sticky]);

  return (
    <header
      className={`z-50 bg-sara-paper transition-shadow ${sticky ? 'sticky top-0' : 'relative'} ${defile ? 'shadow-[0_10px_30px_-18px_rgba(13,22,8,.65)]' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="h-24 grid grid-cols-3 items-center">
          {/* Gauche : menu ☰ */}
          <div className="flex justify-start">
            <button onClick={() => setMobile(true)} className="sara-burger" aria-label="Ouvrir le menu">
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
          {/* Centre : logo officiel */}
          <div className="flex justify-center">
            <a href="#accueil" aria-label="Sara — accueil" className="block transition hover:opacity-90">
              <img src={IMG.logo} alt="Sara Pizzeraya Kebap" className="h-[4.25rem] md:h-[4.75rem] w-auto" />
            </a>
          </div>
          {/* Droite : panier + compte */}
          <div className="flex justify-end items-center gap-2 sm:gap-3">
            <button
              type="button"
              id={CART_ANCHOR_ID}
              onClick={openCart}
              className="sara-iconbtn relative"
              aria-label={count ? `Panier, ${count} article${count > 1 ? 's' : ''}` : 'Panier (vide)'}
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.15rem] h-[1.15rem] px-1 rounded-full bg-sara-red text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-sara-paper">
                  {count}
                </span>
              )}
            </button>
            <a
              href={user ? ACCOUNT_ROUTE : REGISTER_ROUTE}
              className="sara-iconbtn"
              aria-label={user ? `Mon compte (${user.prenom || user.email})` : 'Créer un compte ou se connecter'}
            >
              {user
                ? <span className="font-display text-sm leading-none">{(user.prenom || user.email).charAt(0).toUpperCase()}</span>
                : <User className="w-5 h-5" />}
            </a>
          </div>
        </div>
      </div>

      {/* liseré or sous l'en-tête (le bandeau lumineux de la devanture) */}
      <div className="gold-glow h-[2px] w-full" aria-hidden="true" />

      {mobile && (
        <div className="fixed inset-0 z-70">
          <div className="absolute inset-0 bg-sara-ink/50 fade-in" onClick={() => setMobile(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-sara-paper shadow-2xl p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between mb-6">
              <Wordmark className="sara-wordmark--dark" />
              <button onClick={() => setMobile(false)} aria-label="Fermer"><X className="w-6 h-6 text-sara-green" /></button>
            </div>
            {NAV.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobile(false)} className="px-3 py-3 text-base font-semibold text-sara-green hover:bg-sara-red/10 hover:text-sara-red rounded-xl transition">{l.label}</a>
            ))}
            <PillLink href="#/carte" className="mt-4 justify-center">Commander</PillLink>
          </div>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Panier — tiroir latéral                                            */
/* ------------------------------------------------------------------ */

/* Une ligne de panier. ATTENTION : `removeItem` et `updateQty` du
   CartContext prennent la LIGNE ENTIÈRE, pas un id — ils retrouvent la ligne
   en comparant nom + prix + desc (`sameLine`). Leur passer un id ne lève
   aucune erreur et ne fait simplement rien. */
function CartLine({ line }) {
  const { updateQty, removeItem } = useCart();
  return (
    <li className="card-light rounded-2xl p-3 flex gap-3 items-start">
      <span className="text-2xl leading-none pt-1 shrink-0" aria-hidden="true">{line.emoji ?? '🍽️'}</span>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sara-green leading-tight">{line.name}</p>
        {/* `desc` porte la personnalisation (« sans oignon », suppléments…) :
            c'est ce qui distingue deux lignes du même produit. */}
        {line.desc ? <p className="mt-0.5 text-xs text-sara-muted clamp-2">{line.desc}</p> : null}

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="inline-flex items-center rounded-full border border-sara-green/15 bg-white">
            <button
              type="button"
              onClick={() => updateQty(line, line.quantity - 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sara-green hover:text-sara-red transition"
              aria-label={`Retirer un ${line.name}`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center text-sm font-bold text-sara-green tabular-nums">{line.quantity}</span>
            <button
              type="button"
              onClick={() => updateQty(line, line.quantity + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sara-green hover:text-sara-red transition"
              aria-label={`Ajouter un ${line.name}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="font-display text-lg text-sara-green tabular-nums">{formatChf(line.price * line.quantity)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => removeItem(line)}
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sara-muted hover:text-sara-red hover:bg-sara-red/10 transition"
        aria-label={`Supprimer ${line.name} du panier`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </li>
  );
}

function CartDrawer() {
  const { items, count, total, isCartOpen, closeCart, clearCart } = useCart();
  const { user } = useAuth();

  // Échap pour fermer + blocage du défilement de la page derrière le tiroir.
  useEffect(() => {
    if (!isCartOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeCart(); };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Votre panier">
      <div className="absolute inset-0 bg-sara-ink/50 fade-in" onClick={closeCart} />

      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-sara-paper shadow-2xl flex flex-col">
        {/* en-tête */}
        <div className="shrink-0 px-5 py-4 flex items-center justify-between border-b border-sara-green/10">
          <h2 className="heading text-sara-green text-2xl flex items-center gap-2">
            Votre panier
            {count > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-sara-red text-white text-xs font-bold align-middle">{count}</span>
            )}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="w-10 h-10 rounded-full flex items-center justify-center text-sara-green hover:bg-sara-red hover:text-white transition"
            aria-label="Fermer le panier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="gold-glow h-[2px] w-full shrink-0" aria-hidden="true" />

        {/* contenu */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
            <span className="w-20 h-20 rounded-full bg-sara-paperAlt flex items-center justify-center" aria-hidden="true">
              <ShoppingCart className="w-8 h-8 text-sara-green/40" />
            </span>
            <p className="heading text-sara-green text-xl">Votre panier est vide</p>
            <p className="text-sara-muted text-sm">Ajoutez un plat depuis la carte et il apparaîtra ici.</p>
            <PillLink href={MENU_ROUTE} variant="red" className="mt-2" onClick={closeCart}>
              <Flame className="w-5 h-5" /> Voir la carte
            </PillLink>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {items.map((line, i) => (
              <CartLine key={`${line.name}|${line.price}|${line.desc ?? ''}|${i}`} line={line} />
            ))}
          </ul>
        )}

        {/* pied : total + suite du parcours */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-sara-green/10 px-5 py-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sara-muted font-medium">Total</span>
              <span className="font-display text-3xl text-sara-green tabular-nums">{formatChf(total)}</span>
            </div>

            {/* Tant que le client n'est pas connecté, le panier ne propose pas
                de payer mais de créer un compte : c'est la porte d'entrée du
                parcours de commande. Une fois connecté, place au tunnel — qui
                reste à construire, d'où le bouton encore inactif. */}
            {!user ? (
              <>
                <a
                  href={REGISTER_ROUTE}
                  onClick={closeCart}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 font-semibold rounded-2xl rounded-tr-none bg-sara-red text-white hover:bg-sara-redDeep transition"
                >
                  <UserPlus className="w-5 h-5" /> Créez un compte
                </a>
                <p className="mt-2 text-center text-xs text-sara-muted">
                  Un compte permet de suivre votre commande en direct.{' '}
                  <a href={LOGIN_ROUTE} onClick={closeCart} className="font-semibold text-sara-red hover:underline">
                    Déjà client ?
                  </a>
                </p>
              </>
            ) : (
              <>
                <a
                  href={CHECKOUT_ROUTE}
                  onClick={closeCart}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 font-semibold rounded-2xl rounded-tr-none bg-sara-red text-white hover:bg-sara-redDeep transition"
                >
                  <Flame className="w-5 h-5" /> Passer commande
                </a>
                <p className="mt-2 text-center text-xs text-sara-muted">
                  Bonjour {user.prenom || 'à vous'} — plus qu'une étape.
                </p>
              </>
            )}

            <button
              type="button"
              onClick={clearCart}
              className="mt-3 w-full text-center text-xs font-semibold uppercase tracking-widest text-sara-muted hover:text-sara-red transition"
            >
              Vider le panier
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Connexion / inscription                                            */
/* ------------------------------------------------------------------ */

/* Mêmes règles que server/api.ts — validées ici pour une réponse immédiate,
   mais c'est le serveur qui fait foi (ces contrôles sont du confort, pas de
   la sécurité). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MDP_MIN = 8;

function Champ({ id, label, hint, erreur, className = '', ...props }) {
  return (
    <div className={className}>
      <label className="sara-label" htmlFor={id}>{label}</label>
      <input id={id} className="sara-input" aria-invalid={erreur ? 'true' : undefined} {...props} />
      {hint && <p className="sara-hint">{hint}</p>}
    </div>
  );
}

function AuthPage({ mode }) {
  const inscription = mode === 'register';
  const { user, isLoading, login, register, logout } = useAuth();
  const { count, openCart } = useCart();

  const [form, setForm] = useState({ prenom: '', nom: '', email: '', phone: '', password: '', newsletter: false });
  const [erreur, setErreur] = useState('');
  const [champFautif, setChampFautif] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  // Repartir d'un formulaire propre quand on bascule connexion <-> inscription
  useEffect(() => { setErreur(''); setChampFautif(''); }, [mode]);

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur(''); setChampFautif('');

    if (inscription && !form.prenom.trim()) { setErreur('Votre prénom est nécessaire.'); setChampFautif('prenom'); return; }
    if (inscription && !form.nom.trim()) { setErreur('Votre nom est nécessaire.'); setChampFautif('nom'); return; }
    if (!EMAIL_RE.test(form.email.trim())) { setErreur('Cette adresse e-mail ne semble pas valide.'); setChampFautif('email'); return; }
    if (inscription && form.password.length < MDP_MIN) {
      setErreur(`Le mot de passe doit faire au moins ${MDP_MIN} caractères.`); setChampFautif('password'); return;
    }
    if (!form.password) { setErreur('Le mot de passe est nécessaire.'); setChampFautif('password'); return; }

    setEnvoi(true);
    try {
      if (inscription) {
        await register({
          email: form.email.trim(),
          password: form.password,
          prenom: form.prenom.trim(),
          nom: form.nom.trim(),
          phone: form.phone.trim() || undefined,
          newsletter: form.newsletter,
        });
      } else {
        await login(form.email.trim(), form.password);
      }
      // Retour au panier si une commande était en cours, sinon à l'accueil.
      if (count > 0) { window.location.hash = MENU_ROUTE; openCart(); }
      else { window.location.hash = '#accueil'; }
    } catch (e2) {
      // Les fonctions du contexte rejettent avec le message français du
      // serveur (« Cet email est déjà utilisé », « Email ou mot de passe
      // incorrect »…) : ceux-là sont utiles au client, on les affiche tels
      // quels. Les messages techniques (500, panne réseau) ne lui apprennent
      // rien et l'inquiètent : on les remplace par une phrase actionnable.
      const brut = e2?.message ?? '';
      const technique = !brut || /erreur (serveur|inconnue)|requ[êe]te [ée]chou/i.test(brut);
      setErreur(technique
        ? "Le service est momentanément indisponible. Réessayez dans un instant, ou appelez-nous pour commander."
        : brut);
    } finally {
      setEnvoi(false);
    }
  };

  if (isLoading) {
    return (
      <main className="bg-sara-paper min-h-[60vh] flex items-center justify-center px-5">
        <p className="text-sara-muted">Chargement…</p>
      </main>
    );
  }

  if (user) {
    return (
      <main className="bg-sara-paper px-5 py-16 md:py-24">
        <div className="card-light rounded-3xl max-w-md mx-auto p-6 sm:p-8 text-center">
          <span className="w-14 h-14 rounded-full bg-sara-green text-sara-cream font-display text-2xl flex items-center justify-center mx-auto" aria-hidden="true">
            {(user.prenom || user.email || '?').charAt(0).toUpperCase()}
          </span>
          <h1 className="heading text-sara-green text-3xl mt-4">Vous êtes connecté</h1>
          <p className="mt-2 text-sara-muted">
            {user.prenom ? `${user.prenom} ${user.nom ?? ''}`.trim() : user.email}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <PillLink href={ACCOUNT_ROUTE} variant="red" className="justify-center">Mon espace client</PillLink>
            <PillLink href={MENU_ROUTE} variant="dark" className="justify-center"><Flame className="w-5 h-5" /> Voir la carte</PillLink>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-sara-paper px-5 py-12 md:py-20">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <Eyebrow className="text-sara-goldDeep">{inscription ? 'Bienvenue chez Sara' : 'Content de vous revoir'}</Eyebrow>
          <h1 className="heading text-sara-green text-3xl sm:text-4xl mt-3">
            {inscription ? 'Créez votre compte' : 'Connectez-vous'}
          </h1>
          <p className="mt-3 text-sara-muted text-sm">
            {inscription
              ? 'Un compte permet de suivre vos commandes en direct et de retrouver vos plats favoris.'
              : 'Retrouvez vos commandes en cours et vos plats favoris.'}
          </p>
        </div>

        <form onSubmit={soumettre} className="card-light rounded-3xl mt-8 p-5 sm:p-7 space-y-4" noValidate>
          {erreur && (
            <p className="sara-error" role="alert">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{erreur}</span>
            </p>
          )}

          {inscription && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Champ id="prenom" label="Prénom" type="text" autoComplete="given-name" required
                value={form.prenom} onChange={set('prenom')} erreur={champFautif === 'prenom'} placeholder="Sara" />
              <Champ id="nom" label="Nom" type="text" autoComplete="family-name" required
                value={form.nom} onChange={set('nom')} erreur={champFautif === 'nom'} placeholder="Yilmaz" />
            </div>
          )}

          <Champ id="email" label="Adresse e-mail" type="email" autoComplete="email" required inputMode="email"
            value={form.email} onChange={set('email')} erreur={champFautif === 'email'} placeholder="vous@exemple.ch" />

          {inscription && (
            <Champ id="phone" label="Téléphone (facultatif)" type="tel" autoComplete="tel" inputMode="tel"
              value={form.phone} onChange={set('phone')} placeholder="079 000 00 00"
              hint="Utile si le restaurant doit vous joindre pour une livraison." />
          )}

          <Champ id="password" label="Mot de passe" type="password" required
            autoComplete={inscription ? 'new-password' : 'current-password'}
            value={form.password} onChange={set('password')} erreur={champFautif === 'password'}
            hint={inscription ? `${MDP_MIN} caractères minimum.` : undefined} />

          {inscription && (
            <label className="flex items-start gap-2.5 text-sm text-sara-muted cursor-pointer">
              <input type="checkbox" checked={form.newsletter} onChange={set('newsletter')}
                className="mt-0.5 w-4 h-4 accent-[#C60101]" />
              <span>Je souhaite recevoir les offres et nouveautés de Sara.</span>
            </label>
          )}

          <button
            type="submit"
            disabled={envoi}
            className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 font-semibold rounded-2xl rounded-tr-none bg-sara-red text-white hover:bg-sara-redDeep transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {envoi ? 'Un instant…' : (inscription ? 'Créer mon compte' : 'Se connecter')}
            {!envoi && <ArrowUpRight className="w-5 h-5" />}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-sara-muted">
          {inscription ? 'Vous avez déjà un compte ? ' : 'Pas encore de compte ? '}
          <a href={inscription ? LOGIN_ROUTE : REGISTER_ROUTE} className="inline-block py-1.5 font-semibold text-sara-red hover:underline">
            {inscription ? 'Se connecter' : 'Créez-en un'}
          </a>
        </p>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Tunnel de commande                                                 */
/* ------------------------------------------------------------------ */

/* Coquille commune aux écrans « page » (commande, suivi) : titre, retour,
   fond papier, largeur de lecture. */
function PageEtroite({ retourHref, retourLabel, eyebrow, titre, children }) {
  return (
    <main className="bg-sara-paper px-5 py-10 md:py-16">
      <div className="max-w-2xl mx-auto">
        {retourHref && (
          <a href={retourHref} className="inline-flex items-center gap-1.5 py-1.5 text-sm font-semibold text-sara-muted hover:text-sara-red transition">
            <ArrowLeft className="w-4 h-4" /> {retourLabel}
          </a>
        )}
        <div className="mt-4 text-center">
          {eyebrow && <Eyebrow className="text-sara-goldDeep">{eyebrow}</Eyebrow>}
          <h1 className="heading text-sara-green text-3xl sm:text-4xl mt-3">{titre}</h1>
        </div>
        {children}
      </div>
    </main>
  );
}

/* Le serveur n'accepte QUE ces deux valeurs (server/api.ts) — toute autre
   chaîne fait échouer la commande en 400. */
const TYPES_COMMANDE = [
  { id: 'emporter', label: 'À emporter', desc: 'Vous venez chercher', Icone: Store },
  { id: 'livraison', label: 'Livraison', desc: 'On vous apporte', Icone: Bike },
];

function CheckoutPage() {
  const { user, isLoading } = useAuth();
  const { items, total, count, placeOrder } = useCart();

  const [type, setType] = useState('emporter');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [erreur, setErreur] = useState('');
  const [champFautif, setChampFautif] = useState('');
  const [envoi, setEnvoi] = useState(false);

  // Pré-remplissage depuis le profil : personne n'aime retaper son adresse.
  useEffect(() => {
    if (!user) return;
    setPhone((p) => p || user.phone || '');
    setAddress((a) => a || user.address || '');
  }, [user]);

  if (isLoading) {
    return <main className="bg-sara-paper min-h-[60vh] flex items-center justify-center"><p className="text-sara-muted">Chargement…</p></main>;
  }

  // Le panier renvoie vers la création de compte tant qu'on n'est pas connecté :
  // cet écran applique la même règle, au cas où on y arrive par l'URL.
  if (!user) {
    return (
      <PageEtroite retourHref={MENU_ROUTE} retourLabel="Retour à la carte" titre="Un compte est nécessaire">
        <div className="card-light rounded-3xl mt-8 p-6 text-center">
          <p className="text-sara-muted">Créez votre compte pour commander et suivre votre commande en direct.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <PillLink href={REGISTER_ROUTE} variant="red" className="justify-center"><UserPlus className="w-5 h-5" /> Créez un compte</PillLink>
            <PillLink href={LOGIN_ROUTE} variant="dark" className="justify-center">Se connecter</PillLink>
          </div>
        </div>
      </PageEtroite>
    );
  }

  if (count === 0) {
    return (
      <PageEtroite retourHref={MENU_ROUTE} retourLabel="Retour à la carte" titre="Votre panier est vide">
        <div className="card-light rounded-3xl mt-8 p-6 text-center">
          <p className="text-sara-muted">Ajoutez un plat depuis la carte pour passer commande.</p>
          <div className="mt-6 flex justify-center">
            <PillLink href={MENU_ROUTE} variant="red"><Flame className="w-5 h-5" /> Voir la carte</PillLink>
          </div>
        </div>
      </PageEtroite>
    );
  }

  const valider = async (e) => {
    e.preventDefault();
    setErreur(''); setChampFautif('');
    if (!phone.trim()) {
      setErreur('Un numéro de téléphone est nécessaire : le restaurant doit pouvoir vous joindre.');
      setChampFautif('phone'); return;
    }
    if (type === 'livraison' && address.trim().length < 8) {
      setErreur('Indiquez une adresse complète pour la livraison.');
      setChampFautif('address'); return;
    }
    setEnvoi(true);
    try {
      const commande = await placeOrder({
        orderType: type,
        address: type === 'livraison' ? address.trim() : '',
        phone: phone.trim(),
      });
      // placeOrder vide le panier au succès. On enchaîne sur le suivi.
      window.location.hash = `${TRACK_ROUTE}/${commande.id}`;
    } catch (e2) {
      const brut = e2?.message ?? '';
      const technique = !brut || /erreur (serveur|inconnue)|requ[êe]te [ée]chou/i.test(brut);
      setErreur(technique
        ? "Le service est momentanément indisponible. Réessayez, ou appelez-nous pour commander."
        : brut);
      setEnvoi(false);
    }
  };

  return (
    <PageEtroite retourHref={MENU_ROUTE} retourLabel="Retour à la carte" eyebrow="Dernière étape" titre="Votre commande">
      <form onSubmit={valider} className="mt-8 space-y-5" noValidate>
        {erreur && (
          <p className="sara-error" role="alert">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /><span>{erreur}</span>
          </p>
        )}

        {/* Emporter ou livraison */}
        <fieldset className="card-light rounded-3xl p-5 sm:p-6">
          {/* Libellé court : « Comment souhaitez-vous être servi ? » laissait le
              point d'interrogation seul sur une 2e ligne en 375 px. */}
          <legend className="sara-label px-1">Mode de retrait</legend>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {TYPES_COMMANDE.map(({ id, label, desc, Icone }) => {
              const actif = type === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setType(id)}
                  aria-pressed={actif}
                  className={`rounded-2xl p-4 text-left border-2 transition ${actif ? 'border-sara-red bg-sara-red/5' : 'border-sara-green/15 hover:border-sara-green/35'}`}
                >
                  <Icone className={`w-6 h-6 ${actif ? 'text-sara-red' : 'text-sara-green'}`} aria-hidden="true" />
                  <span className={`block font-display text-lg mt-2 ${actif ? 'text-sara-red' : 'text-sara-green'}`}>{label}</span>
                  <span className="block text-xs text-sara-muted mt-0.5">{desc}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Coordonnées */}
        <div className="card-light rounded-3xl p-5 sm:p-6 space-y-4">
          <Champ
            id="phone" label="Téléphone" type="tel" inputMode="tel" autoComplete="tel" required
            value={phone} onChange={(e) => setPhone(e.target.value)} erreur={champFautif === 'phone'}
            placeholder="079 000 00 00"
            hint="Le restaurant vous appelle si besoin."
          />
          {type === 'livraison' && (
            <Champ
              id="address" label="Adresse de livraison" type="text" autoComplete="street-address" required
              value={address} onChange={(e) => setAddress(e.target.value)} erreur={champFautif === 'address'}
              placeholder="Rue, numéro, code postal, ville"
            />
          )}
        </div>

        {/* Récapitulatif */}
        <div className="card-light rounded-3xl p-5 sm:p-6">
          <h2 className="sara-label">Récapitulatif</h2>
          <ul className="mt-2 divide-y divide-sara-green/10">
            {items.map((l, i) => (
              <li key={`${l.name}|${l.price}|${l.desc ?? ''}|${i}`} className="py-2.5 flex items-baseline justify-between gap-3">
                <span className="text-sara-green">
                  <span className="font-bold tabular-nums">{l.quantity}×</span> {l.name}
                  {l.desc ? <span className="block text-xs text-sara-muted">{l.desc}</span> : null}
                </span>
                <span className="font-display text-lg text-sara-green tabular-nums shrink-0">{formatChf(l.price * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-sara-green/15 flex items-center justify-between">
            <span className="text-sara-muted font-medium">Total</span>
            <span className="font-display text-3xl text-sara-green tabular-nums">{formatChf(total)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={envoi}
          className="w-full inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-2xl rounded-tr-none bg-sara-red text-white hover:bg-sara-redDeep transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {envoi ? 'Envoi de la commande…' : <><Flame className="w-5 h-5" /> Confirmer ma commande</>}
        </button>
        <p className="text-center text-xs text-sara-muted">
          Paiement sur place ou à la livraison. Le paiement par carte arrivera prochainement.
        </p>
      </form>
    </PageEtroite>
  );
}

/* ------------------------------------------------------------------ */
/*  Suivi de commande                                                  */
/* ------------------------------------------------------------------ */

/* Les 6 statuts du serveur ne se résument pas à 4 étapes : « annulé » sort du
   parcours, et sa cause change complètement le message affiché. */
const ETAPES_SUIVI = ['pending', 'preparing', 'ready', 'delivered'];

function OrderTrackingPage({ orderId }) {
  const { user } = useAuth();
  const { status, orderType, etaMinutes, etaReadyAt, cancelledByClient, markReceived, cancelOrder } = useOrderStatus(orderId);
  const [erreur, setErreur] = useState('');
  const [action, setAction] = useState(false);

  const livraison = orderType === 'livraison';
  const annule = status === 'cancelled';

  // pending et confirmed sont deux états serveur mais une seule étape client :
  // « le restaurant n'a pas encore répondu ».
  const indexEtape = status === 'delivered' ? 3
    : status === 'ready' ? 2
    : status === 'preparing' ? 1
    : 0;

  const libelles = [
    { cle: 'pending', titre: 'Commande reçue', desc: "En attente de confirmation du restaurant" },
    { cle: 'preparing', titre: 'En préparation', desc: 'Votre commande est en cuisine' },
    { cle: 'ready', titre: livraison ? 'En route' : 'Prête', desc: livraison ? 'Le livreur est parti' : 'À récupérer au restaurant' },
    { cle: 'delivered', titre: livraison ? 'Livrée' : 'Récupérée', desc: 'Bon appétit !' },
  ];

  const agir = async (fn) => {
    setErreur(''); setAction(true);
    try { await fn(); } catch (e) { setErreur(e?.message || 'Action impossible.'); }
    finally { setAction(false); }
  };

  const heurePrete = etaReadyAt
    ? new Date(etaReadyAt).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <PageEtroite
      retourHref={MENU_ROUTE}
      retourLabel="Retour à la carte"
      eyebrow={`Commande ${String(orderId).slice(0, 8).toUpperCase()}`}
      titre={annule ? 'Commande annulée' : 'Suivi de votre commande'}
    >
      {status === null && (
        <p className="mt-8 text-center text-sara-muted">Chargement du statut…</p>
      )}

      {annule && (
        <div className="card-light rounded-3xl mt-8 p-6 text-center">
          <XCircle className="w-10 h-10 text-sara-red mx-auto" aria-hidden="true" />
          <p className="heading text-sara-green text-xl mt-3">
            {cancelledByClient ? 'Vous avez annulé cette commande' : 'Le restaurant n’a pas pu accepter cette commande'}
          </p>
          <p className="mt-2 text-sara-muted text-sm">
            {cancelledByClient
              ? 'Rien ne vous a été facturé.'
              : 'Cela arrive en cas de rupture ou de forte affluence. Appelez-nous, on trouvera une solution.'}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <PillLink href={MENU_ROUTE} variant="red" className="justify-center"><Flame className="w-5 h-5" /> Commander à nouveau</PillLink>
            <a href={`tel:${INFO.phone.replace(/\s/g, '')}`} className="px-7 py-3.5 font-semibold rounded-2xl rounded-tr-none border border-sara-green/20 text-sara-green hover:border-sara-red hover:text-sara-red transition text-center">
              Appeler le restaurant
            </a>
          </div>
        </div>
      )}

      {status !== null && !annule && (
        <>
          <ol className="card-light rounded-3xl mt-8 p-5 sm:p-6 space-y-1">
            {libelles.map((e, i) => {
              const faite = i < indexEtape;
              const courante = i === indexEtape;
              return (
                <li key={e.cle} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition ${
                        faite ? 'bg-sara-green text-sara-cream'
                          : courante ? 'bg-sara-red text-white'
                          : 'bg-sara-paperAlt text-sara-green/40'
                      }`}
                      aria-hidden="true"
                    >
                      {faite ? <Check className="w-4 h-4" />
                        : courante ? (i === 1 ? <ChefHat className="w-4 h-4" /> : i === 2 ? (livraison ? <Bike className="w-4 h-4" /> : <Store className="w-4 h-4" />) : <Clock className="w-4 h-4" />)
                        : <span className="text-xs font-bold">{i + 1}</span>}
                    </span>
                    {i < libelles.length - 1 && (
                      <span className={`w-0.5 flex-1 min-h-[1.75rem] ${faite ? 'bg-sara-green' : 'bg-sara-green/15'}`} aria-hidden="true" />
                    )}
                  </div>
                  <div className="pb-5">
                    <p className={`font-display text-lg ${courante ? 'text-sara-red' : faite ? 'text-sara-green' : 'text-sara-green/40'}`}>
                      {e.titre}
                    </p>
                    {(courante || faite) && <p className="text-sm text-sara-muted">{e.desc}</p>}
                    {courante && i === 1 && etaMinutes ? (
                      <p className="mt-1 text-sm font-semibold text-sara-goldDeep">
                        Prête dans ~{etaMinutes} min{heurePrete ? ` (vers ${heurePrete})` : ''}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>

          {erreur && (
            <p className="sara-error mt-4" role="alert">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /><span>{erreur}</span>
            </p>
          )}

          {/* Annulation possible tant que le restaurant n'a pas commencé.
              Réservée aux comptes : une commande invité ne peut pas s'annuler
              seule (le serveur revalide de toute façon). */}
          {user && (status === 'pending' || status === 'confirmed') && (
            <button
              type="button"
              disabled={action}
              onClick={() => agir(cancelOrder)}
              className="mt-4 w-full py-3 rounded-2xl border border-sara-green/20 text-sm font-semibold text-sara-muted hover:border-sara-red hover:text-sara-red transition disabled:opacity-60"
            >
              Annuler ma commande
            </button>
          )}

          {status === 'ready' && (
            <button
              type="button"
              disabled={action}
              onClick={() => agir(markReceived)}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-2xl rounded-tr-none bg-sara-red text-white hover:bg-sara-redDeep transition disabled:opacity-60"
            >
              <Check className="w-5 h-5" /> J’ai reçu ma commande
            </button>
          )}

          {status === 'delivered' && (
            <div className="mt-4 flex justify-center">
              <PillLink href={MENU_ROUTE} variant="red"><Flame className="w-5 h-5" /> Commander à nouveau</PillLink>
            </div>
          )}

          <p className="mt-4 text-center text-xs text-sara-muted">
            Cette page se met à jour toute seule. Gardez le lien pour revenir suivre votre commande.
          </p>
        </>
      )}
    </PageEtroite>
  );
}

/* ------------------------------------------------------------------ */
/*  Réservation (table / espace chicha)                                */
/*                                                                     */
/*  ⚠️ Il n'existe AUCUNE route serveur de réservation (vérifié : les    */
/*  seules routes exposées sont auth, me, orders, stripe, track, admin) */
/*  ni table `reservations` en base. Cet écran ne prétend donc pas      */
/*  enregistrer quoi que ce soit : il compose la demande et l'envoie    */
/*  par le seul canal qui existe aujourd'hui — le téléphone du          */
/*  restaurant, par appel ou par SMS pré-rempli. Le jour où Ayoub       */
/*  ajoute POST /api/reservations, seule la fonction `envoyer` change.  */
/* ------------------------------------------------------------------ */

const telBrut = INFO.phone.replace(/[^\d+]/g, '');

function ReservationPage({ chicha }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ date: '', heure: '', personnes: '2', nom: '', phone: '' });
  const [erreur, setErreur] = useState('');
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      nom: f.nom || `${user.prenom ?? ''} ${user.nom ?? ''}`.trim(),
      phone: f.phone || user.phone || '',
    }));
  }, [user]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const complet = form.date && form.heure && form.personnes && form.nom.trim();
  const dateLisible = form.date
    ? new Date(`${form.date}T00:00:00`).toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';
  const message =
    `Bonjour, je souhaite réserver ${chicha ? "l'espace chicha" : 'une table'} pour ${form.personnes} personne`
    + `${Number(form.personnes) > 1 ? 's' : ''} le ${dateLisible} à ${form.heure}.`
    + ` Nom : ${form.nom.trim()}.${form.phone.trim() ? ` Téléphone : ${form.phone.trim()}.` : ''}`;

  const verifier = () => {
    if (!complet) { setErreur('Complétez la date, l’heure, le nombre de personnes et votre nom.'); return false; }
    setErreur(''); return true;
  };

  const copier = async () => {
    if (!verifier()) return;
    try { await navigator.clipboard.writeText(message); setCopie(true); setTimeout(() => setCopie(false), 2500); }
    catch { setErreur('Copie impossible — sélectionnez le texte à la main.'); }
  };

  return (
    <PageEtroite
      retourHref={chicha ? '#chicha' : '#accueil'}
      retourLabel="Retour"
      eyebrow={chicha ? 'Espace chicha' : 'Restaurant'}
      titre={chicha ? 'Réserver votre chicha' : 'Réserver une table'}
    >
      <p className="mt-3 text-center text-sara-muted text-sm">
        Composez votre demande, puis envoyez-la en un geste. Le restaurant vous
        confirme directement.
      </p>

      <div className="card-light rounded-3xl mt-8 p-5 sm:p-6 space-y-4">
        {erreur && (
          <p className="sara-error" role="alert">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /><span>{erreur}</span>
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Champ id="r-date" label="Date" type="date" required
            value={form.date} onChange={set('date')} min={new Date().toISOString().slice(0, 10)} />
          <Champ id="r-heure" label="Heure" type="time" required value={form.heure} onChange={set('heure')} />
        </div>

        <div>
          <label className="sara-label" htmlFor="r-personnes">Nombre de personnes</label>
          <select id="r-personnes" className="sara-input" value={form.personnes} onChange={set('personnes')}>
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} personne{n > 1 ? 's' : ''}</option>
            ))}
            <option value="plus de 20">Plus de 20 (groupe)</option>
          </select>
        </div>

        <Champ id="r-nom" label="Votre nom" type="text" autoComplete="name" required
          value={form.nom} onChange={set('nom')} placeholder="Nom et prénom" />
        <Champ id="r-tel" label="Votre téléphone (facultatif)" type="tel" inputMode="tel" autoComplete="tel"
          value={form.phone} onChange={set('phone')} placeholder="079 000 00 00" />

        {complet && (
          <div className="rounded-2xl bg-sara-paperAlt p-4">
            <p className="sara-label">Votre demande</p>
            <p className="text-sm text-sara-green leading-relaxed">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href={`tel:${telBrut}`}
            onClick={(e) => { if (!verifier()) e.preventDefault(); }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-2xl rounded-tr-none bg-sara-red text-white hover:bg-sara-redDeep transition"
          >
            <Phone className="w-5 h-5" /> Appeler le restaurant
          </a>
          <a
            href={`sms:${telBrut}?&body=${encodeURIComponent(message)}`}
            onClick={(e) => { if (!verifier()) e.preventDefault(); }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-2xl rounded-tr-none bg-sara-green text-sara-cream hover:bg-sara-greenDeep transition"
          >
            Envoyer par SMS
          </a>
        </div>

        <button
          type="button"
          onClick={copier}
          className="w-full py-2.5 text-xs font-semibold uppercase tracking-widest text-sara-muted hover:text-sara-red transition"
        >
          {copie ? 'Demande copiée ✓' : 'Copier la demande'}
        </button>

        <p className="text-center text-xs text-sara-muted">
          Réservation confirmée par le restaurant. Horaires : {INFO.hoursWeek} · {INFO.hoursWeekend}
        </p>
      </div>
    </PageEtroite>
  );
}

/* ------------------------------------------------------------------ */
/*  Espace compte                                                      */
/* ------------------------------------------------------------------ */

function Encadre({ titre, children, action }) {
  return (
    <section className="card-light rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="heading text-sara-green text-xl">{titre}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function AccountPage() {
  const { user, isLoading, logout, updateProfile, changePassword, toggleFavorite } = useAuth();
  const { orders, isLoading: chargeCommandes } = useOrders();

  const [profil, setProfil] = useState({ prenom: '', nom: '', phone: '', address: '', newsletter: false });
  const [msgProfil, setMsgProfil] = useState({ type: '', texte: '' });
  const [envoiProfil, setEnvoiProfil] = useState(false);

  const [mdp, setMdp] = useState({ actuel: '', nouveau: '' });
  const [msgMdp, setMsgMdp] = useState({ type: '', texte: '' });
  const [envoiMdp, setEnvoiMdp] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfil({
      prenom: user.prenom ?? '', nom: user.nom ?? '', phone: user.phone ?? '',
      address: user.address ?? '', newsletter: !!user.newsletter,
    });
  }, [user]);

  if (isLoading) {
    return <main className="bg-sara-paper min-h-[60vh] flex items-center justify-center"><p className="text-sara-muted">Chargement…</p></main>;
  }

  if (!user) {
    return (
      <PageEtroite retourHref="#accueil" retourLabel="Retour à l'accueil" titre="Votre espace client">
        <div className="card-light rounded-3xl mt-8 p-6 text-center">
          <p className="text-sara-muted">Connectez-vous pour retrouver vos commandes et vos favoris.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <PillLink href={LOGIN_ROUTE} variant="red" className="justify-center">Se connecter</PillLink>
            <PillLink href={REGISTER_ROUTE} variant="dark" className="justify-center"><UserPlus className="w-5 h-5" /> Créez un compte</PillLink>
          </div>
        </div>
      </PageEtroite>
    );
  }

  const enregistrerProfil = async (e) => {
    e.preventDefault();
    setMsgProfil({ type: '', texte: '' }); setEnvoiProfil(true);
    try {
      await updateProfile({
        prenom: profil.prenom.trim(), nom: profil.nom.trim(),
        phone: profil.phone.trim(), address: profil.address.trim(),
        newsletter: profil.newsletter,
      });
      setMsgProfil({ type: 'ok', texte: 'Profil enregistré.' });
    } catch (e2) {
      setMsgProfil({ type: 'ko', texte: e2?.message || 'Enregistrement impossible.' });
    } finally { setEnvoiProfil(false); }
  };

  const changerMdp = async (e) => {
    e.preventDefault();
    setMsgMdp({ type: '', texte: '' });
    if (mdp.nouveau.length < MDP_MIN) {
      setMsgMdp({ type: 'ko', texte: `Le nouveau mot de passe doit faire au moins ${MDP_MIN} caractères.` });
      return;
    }
    setEnvoiMdp(true);
    try {
      await changePassword(mdp.actuel, mdp.nouveau);
      setMdp({ actuel: '', nouveau: '' });
      setMsgMdp({ type: 'ok', texte: 'Mot de passe modifié. Vos autres appareils ont été déconnectés.' });
    } catch (e2) {
      setMsgMdp({ type: 'ko', texte: e2?.message || 'Modification impossible.' });
    } finally { setEnvoiMdp(false); }
  };

  const favoris = MENU_ITEMS.filter((p) => (user.favorites ?? []).includes(p.id));
  const Message = ({ m }) => m.texte
    ? <p className={m.type === 'ok' ? 'text-sm font-semibold text-sara-green' : 'sara-error'} role="status">{m.texte}</p>
    : null;

  return (
    <main className="bg-sara-paper px-5 py-10 md:py-16">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* En-tête du compte */}
        <div className="text-center">
          <span className="w-16 h-16 rounded-full bg-sara-green text-sara-cream font-display text-3xl flex items-center justify-center mx-auto" aria-hidden="true">
            {(user.prenom || user.email).charAt(0).toUpperCase()}
          </span>
          <h1 className="heading text-sara-green text-3xl sm:text-4xl mt-4">
            Bonjour {user.prenom || ''}
          </h1>
          <p className="mt-1 text-sara-muted text-sm">{user.email}</p>
        </div>

        {/* Commandes */}
        <Encadre titre="Mes commandes">
          {chargeCommandes ? (
            <p className="text-sara-muted text-sm">Chargement…</p>
          ) : orders.length === 0 ? (
            <p className="text-sara-muted text-sm">Aucune commande pour le moment.</p>
          ) : (
            <ul className="divide-y divide-sara-green/10">
              {orders.map((o) => (
                <li key={o.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sara-green">
                      {new Date(o.createdAt).toLocaleDateString('fr-CH', { day: '2-digit', month: 'short', year: 'numeric' })}
                      <span className="text-sara-muted font-normal"> · {o.orderType === 'livraison' ? 'Livraison' : 'À emporter'}</span>
                    </p>
                    <p className="text-xs text-sara-muted truncate">
                      {o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                      o.status === 'cancelled' ? 'bg-sara-red/10 text-sara-red' : 'bg-sara-gold/15 text-sara-goldDeep'
                    }`}>
                      {LIBELLE_STATUT[o.status] ?? o.status}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-display text-lg text-sara-green tabular-nums block">{formatChf(o.total)}</span>
                    <a href={`${TRACK_ROUTE}/${o.id}`} className="inline-block py-1 text-xs font-semibold text-sara-red hover:underline">Suivre</a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Encadre>

        {/* Favoris */}
        <Encadre titre="Mes favoris">
          {favoris.length === 0 ? (
            <p className="text-sara-muted text-sm">
              Aucun favori. Touchez le cœur sur un plat de <a href={MENU_ROUTE} className="font-semibold text-sara-red hover:underline">la carte</a> pour le retrouver ici.
            </p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favoris.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-sara-green/10 p-2.5">
                  <span className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-sara-paperAlt">
                    <Img src={p.image} emoji={p.emoji} alt={p.name} className="w-full h-full object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-sara-green text-sm truncate">{p.name}</span>
                    <span className="block text-xs text-sara-muted">{formatChf(p.price)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(p.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sara-red hover:bg-sara-red/10 transition shrink-0"
                    aria-label={`Retirer ${p.name} des favoris`}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Encadre>

        {/* Profil */}
        <Encadre titre="Mes informations">
          <form onSubmit={enregistrerProfil} className="space-y-4" noValidate>
            <Message m={msgProfil} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Champ id="c-prenom" label="Prénom" type="text" autoComplete="given-name" required
                value={profil.prenom} onChange={(e) => setProfil((p) => ({ ...p, prenom: e.target.value }))} />
              <Champ id="c-nom" label="Nom" type="text" autoComplete="family-name" required
                value={profil.nom} onChange={(e) => setProfil((p) => ({ ...p, nom: e.target.value }))} />
            </div>
            <Champ id="c-phone" label="Téléphone" type="tel" inputMode="tel" autoComplete="tel"
              value={profil.phone} onChange={(e) => setProfil((p) => ({ ...p, phone: e.target.value }))} />
            <Champ id="c-address" label="Adresse de livraison" type="text" autoComplete="street-address"
              value={profil.address} onChange={(e) => setProfil((p) => ({ ...p, address: e.target.value }))}
              hint="Pré-remplie automatiquement lors de vos prochaines commandes." />
            <label className="flex items-start gap-2.5 text-sm text-sara-muted cursor-pointer">
              <input type="checkbox" checked={profil.newsletter}
                onChange={(e) => setProfil((p) => ({ ...p, newsletter: e.target.checked }))}
                className="mt-0.5 w-4 h-4 accent-[#C60101]" />
              <span>Recevoir les offres et nouveautés de Sara.</span>
            </label>
            <button type="submit" disabled={envoiProfil}
              className="w-full px-7 py-3 font-semibold rounded-2xl rounded-tr-none bg-sara-green text-sara-cream hover:bg-sara-greenDeep transition disabled:opacity-60">
              {envoiProfil ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </form>
        </Encadre>

        {/* Mot de passe */}
        <Encadre titre="Mot de passe">
          <form onSubmit={changerMdp} className="space-y-4" noValidate>
            <Message m={msgMdp} />
            <Champ id="c-mdp-actuel" label="Mot de passe actuel" type="password" autoComplete="current-password" required
              value={mdp.actuel} onChange={(e) => setMdp((m) => ({ ...m, actuel: e.target.value }))} />
            <Champ id="c-mdp-nouveau" label="Nouveau mot de passe" type="password" autoComplete="new-password" required
              value={mdp.nouveau} onChange={(e) => setMdp((m) => ({ ...m, nouveau: e.target.value }))}
              hint={`${MDP_MIN} caractères minimum. Vos autres appareils seront déconnectés.`} />
            <button type="submit" disabled={envoiMdp}
              className="w-full px-7 py-3 font-semibold rounded-2xl rounded-tr-none border border-sara-green/20 text-sara-green hover:border-sara-red hover:text-sara-red transition disabled:opacity-60">
              {envoiMdp ? 'Modification…' : 'Changer mon mot de passe'}
            </button>
          </form>
        </Encadre>

        <button type="button" onClick={logout}
          className="w-full py-3 text-sm font-semibold uppercase tracking-widest text-sara-muted hover:text-sara-red transition">
          Se déconnecter
        </button>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero — bande verte, puis retour au papier                          */
/* ------------------------------------------------------------------ */

function Hero() {
  const [idx, setIdx] = useState(0);
  const n = HERO_DISHES.length;
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % n), 3200);
    return () => clearInterval(t);
  }, [n]);

  return (
    <section id="accueil" className="relative overflow-hidden bg-sara-paper">
      {/* bloc hero : photo de fond + titre */}
      <div className="relative bg-sara-greenDeep pt-14 md:pt-20 pb-40 md:pb-56 overflow-hidden">
        {/* photo de fond avec voile vert pour garder le contraste du texte */}
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <img src={IMG.hero} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-sara-green/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-sara-ink/75 via-sara-green/30 to-sara-greenDeep/70" />
        </div>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center relative z-10">
          {/* bandeau spécialités — repris de l'enseigne du restaurant */}
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sara-goldLight text-xs sm:text-sm font-semibold uppercase tracking-[.22em]">
            {SPECIALITES.map((s, i) => (
              <span key={s} className="inline-flex items-center gap-3">
                {i > 0 && <span className="w-1.5 h-1.5 rounded-full bg-sara-red" aria-hidden="true" />}
                {s}
              </span>
            ))}
          </p>

          {/* 2.75rem sur mobile : « Le goût qui donne » tient alors sur une
              seule ligne dans 375 px de large (48 px la faisait casser). */}
          <h1 className="heading text-[2.75rem] sm:text-6xl md:text-7xl max-w-4xl mx-auto mt-5 drop-shadow-lg">
            <span className="text-sara-cream">Le goût qui donne</span><br />
            <span className="text-sara-goldLight">envie de revenir</span>
          </h1>
        </div>

        <Wave fill={C.paper} />
      </div>

      {/* bande d'images qui chevauche la vague : plat gauche · carrousel central · burger droite */}
      <div className="relative z-20 -mt-32 md:-mt-44 h-48 sm:h-56 md:h-72 pointer-events-none">
        {/* image gauche */}
        <div className="hidden md:block absolute left-0 -translate-x-1/4 top-20 w-40 lg:w-52 floaty-slow">
          <Img src={IMG.assietteAlt} emoji="🍽️" alt="Assiette garnie Sara" className="w-full aspect-square object-cover rounded-full shadow-2xl ring-4 ring-sara-gold/60" />
        </div>

        {/* plat central (carrousel) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-44 sm:w-52 md:w-64 aspect-square">
          {HERO_DISHES.map((d, i) => (
            <div key={i} className={`hero-slide ${i === idx ? 'is-active' : ''}`} aria-hidden={i !== idx}>
              <Img src={d.image} emoji={d.emoji} alt={d.alt} className="w-full h-full object-cover rounded-full shadow-2xl ring-4 ring-sara-gold/60" />
            </div>
          ))}
        </div>

        {/* image droite (burger) */}
        <div className="hidden md:block absolute right-0 translate-x-1/4 top-12 w-40 lg:w-52 floaty">
          <Img src={IMG.burgerAlt} emoji="🍔" alt="Burger généreux Sara" className="w-full aspect-square object-cover rounded-full shadow-2xl ring-4 ring-sara-gold/60" />
        </div>
      </div>

      {/* boutons + points du carrousel */}
      <div className="relative z-10 text-center px-5 pt-6 pb-6 md:pb-10">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <PillLink href="#/carte" variant="red" className="sara-shine"><Flame className="w-5 h-5" /> Commander maintenant</PillLink>
          <PillLink href="#/carte" variant="dark" className="sara-shine">Voir le menu</PillLink>
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {HERO_DISHES.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`sara-dot h-2 rounded-full transition-all ${i === idx ? 'w-7 bg-sara-red' : 'w-2 bg-sara-green/20'}`} aria-label={`Plat ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Categories — marquee défilant, cartes blanches                     */
/* ------------------------------------------------------------------ */

function Categories() {
  const loop = [...MENU_CATEGORIES, ...MENU_CATEGORIES];
  return (
    <section id="menu" className="py-16 md:py-24 bg-sara-paper">
      <div className="max-w-3xl mx-auto px-5 text-center mb-12">
        <Eyebrow>Notre menu</Eyebrow>
        <h2 className="heading text-sara-green text-4xl sm:text-5xl mt-3">Découvrez nos plats populaires</h2>
      </div>

      <div className="marquee py-2">
        <div className="marquee__track">
          {loop.map((c, i) => (
            <a key={`${c.id}-${i}`} href="#/carte" className="shrink-0 w-44 sm:w-52 text-center group" aria-label={c.label}>
              <div className="card-light aspect-square rounded-3xl overflow-hidden group-hover:-translate-y-1">
                <Img src={c.image} emoji={c.emoji} alt={c.label} className="w-full h-full object-cover" />
              </div>
              <p className="mt-3 font-semibold text-sara-green text-lg group-hover:text-sara-red transition">{c.label}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Special Offers — les bannières SONT les blocs de couleur           */
/* ------------------------------------------------------------------ */

function OfferBanner({ offer }) {
  const themes = {
    gold: 'bg-sara-gold text-sara-ink',
    red: 'bg-sara-red text-white',
    green: 'bg-sara-green text-sara-cream',
  };
  const tagTone = offer.theme === 'gold' ? 'text-sara-ink/70' : 'text-white/75';
  return (
    <div className={`relative overflow-hidden rounded-3xl ${themes[offer.theme]} flex items-stretch min-h-[9.5rem] sm:min-h-[10.5rem] shadow-[0_18px_40px_-24px_rgba(32,56,24,.6)]`}>
      {/* contenu à gauche */}
      <div className="relative z-10 flex-1 flex flex-col justify-center p-5 sm:p-7 pr-32 sm:pr-44">
        <p className={`text-xs sm:text-sm font-medium uppercase tracking-[.18em] ${tagTone}`}>{offer.tag}</p>
        <h3 className="heading text-lg sm:text-2xl leading-tight mt-1">
          {offer.title}<br />{offer.subtitle}
        </h3>
        <div className="mt-3">
          <a href="#/carte" className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl rounded-tr-none bg-white text-sara-red text-sm font-semibold hover:bg-sara-paperAlt transition">
            <Flame className="w-4 h-4" /> Commander
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>

      {/* image à droite */}
      <div className="absolute right-0 top-0 h-full w-28 sm:w-52 pointer-events-none">
        <Img src={offer.image} emoji={offer.emoji} alt={offer.title} className="w-full h-full object-cover" dark />
      </div>

      {/* pastille remise */}
      <div className="sara-starburst absolute z-20 top-3 right-3 w-16 h-16 sm:w-20 sm:h-20 bg-white text-sara-red flex flex-col items-center justify-center text-center">
        <span className="text-[9px] sm:text-[10px] font-semibold leading-none">Jusqu'à</span>
        <span className="font-display text-lg sm:text-2xl leading-none mt-0.5">{offer.save}</span>
      </div>
    </div>
  );
}

function SpecialOffers() {
  return (
    <section id="offres" className="bg-sara-paper pt-16 md:pt-24 pb-16 md:pb-24">
      <div className="max-w-3xl mx-auto px-5 text-center mb-12">
        <Eyebrow>Offres spéciales</Eyebrow>
        <h2 className="heading text-sara-green text-4xl sm:text-5xl mt-3">Des offres à ne pas manquer</h2>
        <p className="mt-4 text-sara-muted">
          Savourez vos plats préférés à prix imbattables — préparés minute et pleins de saveur,
          avec de bons ingrédients, une belle qualité et des portions généreuses.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-4 sm:space-y-5">
        {OFFERS.map((o, i) => (
          <Reveal key={o.title} delay={i * 100}><OfferBanner offer={o} /></Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Chicha — bande sombre (ambiance tamisée)                           */
/* ------------------------------------------------------------------ */

function Chicha() {
  const [i, setI] = useState(0);
  const n = CHICHA_PHOTOS.length;
  const next = useCallback(() => setI((p) => (p + 1) % n), [n]);
  const prev = () => setI((p) => (p - 1 + n) % n);
  useEffect(() => { const t = setInterval(next, 4500); return () => clearInterval(t); }, [next]);

  return (
    <section id="chicha" className="relative overflow-hidden bg-sara-ink text-sara-cream pt-28 md:pt-40 pb-28 md:pb-44">
      <WaveTop fill={C.paper} stroke={C.redLine} />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid md:grid-cols-2 gap-12 items-center">
        {/* Carrousel photos du salon */}
        <Reveal className="relative">
          <div className="gold-frame relative rounded-3xl overflow-hidden aspect-4-3 shadow-2xl">
            {CHICHA_PHOTOS.map((ph, idx) => (
              <div key={idx} className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? 'opacity-100' : 'opacity-0'}`} aria-hidden={idx !== i}>
                <Img src={ph.src} emoji={ph.emoji} alt={ph.alt} className="w-full h-full object-cover" dark />
              </div>
            ))}
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-sara-ink/70 border border-sara-goldLight/50 text-sara-cream flex items-center justify-center hover:bg-sara-red hover:border-sara-red transition" aria-label="Photo précédente"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-sara-ink/70 border border-sara-goldLight/50 text-sara-cream flex items-center justify-center hover:bg-sara-red hover:border-sara-red transition" aria-label="Photo suivante"><ChevronRight className="w-5 h-5" /></button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {CHICHA_PHOTOS.map((_, idx) => (
                <button key={idx} onClick={() => setI(idx)} className={`sara-dot h-2 rounded-full transition-all ${idx === i ? 'w-7 bg-sara-gold' : 'w-2 bg-sara-cream/40'}`} aria-label={`Photo ${idx + 1}`} />
              ))}
            </div>
          </div>
        </Reveal>

        {/* Texte + bouton */}
        <Reveal delay={100}>
          <Eyebrow className="text-sara-goldLight">Espace Chicha</Eyebrow>
          <h2 className="heading text-sara-cream text-4xl sm:text-5xl mt-3">Découvrez nos chichas</h2>
          <p className="mt-5 text-sara-mutedDark leading-relaxed">
            Détendez-vous dans notre salon à l'ambiance tamisée. Chicha premium, large choix
            de parfums et service soigné — l'endroit idéal pour prolonger la soirée entre amis.
          </p>
          <div className="mt-8">
            <PillLink href={RESA_CHICHA_ROUTE} variant="red"><Flame className="w-5 h-5" /> Réserver ma chicha</PillLink>
          </div>
        </Reveal>
      </div>

      {/* retour au papier */}
      <Wave fill={C.paper} />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  About — bande claire alternée, pour le rythme sans bloc coloré     */
/* ------------------------------------------------------------------ */

function About() {
  return (
    <section id="about" className="py-16 md:py-24 bg-sara-paperAlt">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid md:grid-cols-2 gap-12 items-center">
        <Reveal className="sara-arch bg-sara-green aspect-5-4 max-w-md mx-auto w-full shadow-[0_24px_50px_-28px_rgba(32,56,24,.8)]">
          <Img src={IMG.salle} emoji="😋" alt="L'ambiance chaleureuse du restaurant Sara" className="w-full h-full object-cover" />
        </Reveal>

        <Reveal delay={100} className="text-center">
          <div className="flex justify-center"><Eyebrow className="text-sara-green eyebrow--dot-red">À propos</Eyebrow></div>
          <h2 className="heading text-sara-green text-4xl sm:text-5xl mt-3">Une expérience d'exception, qualité premium et saveurs riches</h2>
          <p className="mt-5 text-sara-muted leading-relaxed">
            Nous réunissons des ingrédients premium, un vrai savoir-faire et une passion du goût —
            pour créer des moments inoubliables à chaque bouchée, avec richesse et qualité.
          </p>

          <h3 className="heading text-sara-green text-2xl mt-8">Horaires d'ouverture</h3>
          <p className="mt-3 text-sara-muted">{INFO.hoursWeek}</p>
          <p className="text-sara-muted">{INFO.hoursWeekend}</p>

          <div className="mt-8 flex justify-center">
            <PillLink href={RESA_ROUTE} variant="dark">Réserver une table</PillLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ — accordéon                                                    */
/* ------------------------------------------------------------------ */

function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-16 md:py-24 bg-sara-paper">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid md:grid-cols-[minmax(0,22rem)_1fr] gap-10 md:gap-16">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="heading text-sara-green text-4xl sm:text-5xl mt-3">Questions fréquentes</h2>
          <p className="mt-4 text-sara-muted">
            Des questions ? Nous avons les réponses pour profiter de votre expérience
            simplement, rapidement et en toute sérénité.
          </p>
        </div>

        <div>
          {FAQ.map((item, idx) => (
            <div key={item.q} className="border-b border-sara-green/10">
              <button onClick={() => setOpen(open === idx ? -1 : idx)} className="w-full flex items-center justify-between gap-4 py-6 text-left group" aria-expanded={open === idx}>
                <span className={`heading text-xl sm:text-2xl transition ${open === idx ? 'text-sara-red' : 'text-sara-green group-hover:text-sara-red'}`}>{item.q}</span>
                <ChevronDown className={`w-6 h-6 shrink-0 transition-transform ${open === idx ? 'rotate-180 text-sara-red' : 'text-sara-green/50'}`} />
              </button>
              {open === idx && <p className="fade-in -mt-2 pb-6 text-sara-muted leading-relaxed max-w-2xl">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Gallery                                                            */
/* ------------------------------------------------------------------ */

function GallerySection() {
  return (
    <section id="galerie" className="py-16 md:py-24 bg-sara-paper">
      <div className="max-w-3xl mx-auto px-5 text-center mb-12">
        <Eyebrow>Galerie</Eyebrow>
        <h2 className="heading text-sara-green text-4xl sm:text-5xl mt-3">Un régal pour les yeux</h2>
        <p className="mt-4 text-sara-muted">
          Explorez nos créations — préparées avec passion et servies avec soin, pour une
          qualité, une fraîcheur et une expérience inoubliables.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[10rem] sm:auto-rows-[13rem]">
        {GALLERY.map((g, idx) => (
          <Reveal key={idx} delay={idx * 60} className={g.span === 'row' ? 'row-span-2' : ''}>
            <div className="card-light w-full h-full rounded-3xl overflow-hidden group">
              <Img src={g.src} emoji={g.emoji} alt={g.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Menu (route #/carte)                                          */
/* ------------------------------------------------------------------ */

function ProductCard({ p }) {
  /* Une seule carte de la grille est remplie de vert : c'est l'accent qui
     accroche l'œil. Les autres restent blanches pour laisser la couleur aux
     photos des plats. */
  const f = p.id === FEATURED_ID;
  const { addItem } = useCart();
  const { user, toggleFavorite } = useAuth();
  /* Le cœur n'apparaît que connecté : sans compte, `toggleFavorite` renverrait
     un 401 et le client ne comprendrait pas pourquoi son clic ne fait rien. */
  const favori = !!user && (user.favorites ?? []).includes(p.id);

  /* `desc` est OBLIGATOIRE, même vide : le panier ne fusionne deux lignes que
     si nom + prix + desc sont identiques. L'omettre ferait fusionner deux
     personnalisations différentes du même plat (bug déjà vécu chez Flash
     Pizzas). Le catalogue n'a pas encore d'options, donc '' pour l'instant. */
  const ajouter = (e) => {
    addItem({ name: p.name, price: p.price, desc: '', emoji: p.emoji });
    // La pastille qui vole sert de confirmation : plus besoin d'ouvrir le
    // tiroir à chaque ajout, ce qui coupait le parcours de celui qui compose
    // une commande de plusieurs plats.
    volVersLePanier(e.currentTarget);
  };
  return (
    <article className={`rounded-3xl overflow-hidden flex flex-col ${f ? 'bg-sara-green gold-frame shadow-[0_20px_44px_-24px_rgba(32,56,24,.85)]' : 'card-light'}`}>
      <div className={`relative aspect-4-3 ${f ? 'bg-sara-greenDeep' : 'bg-sara-paperAlt'}`}>
        <Img src={p.image} emoji={p.emoji} alt={p.name} className="w-full h-full object-cover" dark={f} />
        {user && (
          <button
            type="button"
            onClick={() => toggleFavorite(p.id)}
            aria-pressed={favori}
            aria-label={favori ? `Retirer ${p.name} des favoris` : `Ajouter ${p.name} aux favoris`}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md hover:bg-white active:scale-90 transition"
          >
            <Heart className={`w-5 h-5 transition ${favori ? 'text-sara-red fill-current' : 'text-sara-green/50'}`} />
          </button>
        )}
      </div>
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        {/* Opacités : s'en tenir au barème Tailwind (…/10, /15, /20, /25…).
            Une valeur hors barème comme /8 n'est tout simplement pas générée
            et la classe tombe en transparent, sans erreur. */}
        <span className={`self-start px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${f ? 'bg-sara-gold/25 text-sara-goldLight' : 'bg-sara-gold/15 text-sara-goldDeep'}`}>{categoryLabel(p.category)}</span>
        <h3 className={`heading text-2xl mt-3 ${f ? 'text-sara-cream' : 'text-sara-green'}`}>{p.name}</h3>
        <p className={`mt-2 clamp-2 leading-relaxed ${f ? 'text-sara-mutedDark' : 'text-sara-muted'}`}>{p.desc}</p>
        <div className="mt-auto pt-5">
          <button
            type="button"
            className={`block w-full text-center px-4 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition border ${f ? 'border-sara-goldLight/40 text-sara-cream hover:border-sara-goldLight hover:text-sara-goldLight' : 'border-sara-green/20 text-sara-green hover:border-sara-red hover:text-sara-red'}`}
          >
            Voir le produit
          </button>
          <div className="flex items-center justify-between mt-4">
            <span className={`font-display text-2xl ${f ? 'text-sara-goldLight' : 'text-sara-green'}`}>{formatChf(p.price)}</span>
            <button
              type="button"
              onClick={ajouter}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-sara-red text-white text-xs font-bold uppercase tracking-widest hover:bg-sara-redDeep active:scale-95 transition"
              aria-label={`Ajouter ${p.name} au panier`}
            >
              <Flame className="w-4 h-4" /> Commander
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function MenuPage() {
  const [active, setActive] = useState('all');
  const shown = active === 'all' ? MENU_ITEMS : MENU_ITEMS.filter((p) => p.category === active);

  return (
    <main className="bg-sara-paper">
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 md:pt-16">
        <Eyebrow>Commandez · Savourez · Recommencez</Eyebrow>
        <h1 className="heading text-sara-green text-5xl sm:text-6xl md:text-7xl mt-3">Notre carte</h1>
      </section>

      <div className="checker my-8 md:my-12" aria-hidden="true" />

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20 md:pb-28">
        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-10">
          {MENU_FILTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wide transition border ${active === c.id ? 'bg-sara-red text-white border-sara-red' : 'bg-white text-sara-green border-sara-green/15 hover:border-sara-red hover:text-sara-red'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grille produits */}
        <div key={active} className="fade-up grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA + Footer                                                       */
/* ------------------------------------------------------------------ */

function CtaFooter() {
  return (
    <footer id="contact" className="bg-sara-greenDeep text-sara-cream">
      {/* bandeau CTA or — ouvert et refermé par une vague, comme les autres
          bandes colorées (il suit tantôt la FAQ, tantôt la page Menu, toutes
          deux sur le papier) */}
      <div className="relative overflow-hidden bg-sara-gold">
        <WaveTop fill={C.paper} stroke={C.redLine} />
        <span className="hidden lg:block pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-48 xl:w-56 opacity-95" aria-hidden="true">
          <Img src={IMG.broche} emoji="🍗" alt="" className="w-full object-contain drop-shadow-xl" />
        </span>
        <span className="hidden lg:block pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-48 xl:w-56 opacity-95" aria-hidden="true">
          <Img src={IMG.assietteAlt} emoji="🍕" alt="" className="w-full object-contain drop-shadow-xl" />
        </span>
        <div className="max-w-2xl mx-auto px-5 text-center pt-24 md:pt-36 pb-16 md:pb-24 relative">
          <h2 className="heading text-sara-ink text-4xl sm:text-5xl">Un petit creux ?<br />On vous attend</h2>
          <p className="mt-4 text-sara-ink/75 font-medium">
            Commandez vos plats préférés et profitez d'une cuisine fraîche et savoureuse,
            livrée rapidement jusqu'à votre porte.
          </p>
          <div className="mt-8 flex justify-center">
            <PillLink href="#/carte" variant="red">Commander maintenant</PillLink>
          </div>
        </div>
        <Wave fill={C.greenDeep} stroke={C.redLine} />
      </div>

      {/* footer principal */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Wordmark className="sara-wordmark--footer items-start" />
            <h4 className="heading text-lg mt-8 text-sara-cream">Adresse</h4>
            <p className="mt-3 text-sara-mutedDark leading-relaxed flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-1 shrink-0 text-sara-goldLight" />{INFO.address}
            </p>
            <p className="mt-3 text-sara-mutedDark flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0 text-sara-goldLight" />
              {/* Appeler est l'action la plus utile sur mobile : la cible
                  mérite la même hauteur qu'un bouton. */}
              <a href={`tel:${INFO.phone.replace(/\s/g, '')}`} className="inline-block py-1.5 hover:text-sara-cream transition">{INFO.phone}</a>
            </p>
          </div>

          <FooterCol title="Menu" links={[['#/carte', 'Menu'], ['#offres', 'Offres'], ['#chicha', 'Chicha']]} />
          <FooterCol title="Restaurant" links={[['#about', 'À propos'], ['#chicha', 'Chicha'], ['#galerie', 'Galerie']]} />
          <FooterCol title="Aide" links={[['#faq', 'FAQ'], ['#contact', 'Contact']]} />
          <FooterCol title="Légal" links={[['#', 'Confidentialité'], ['#', 'Conditions']]} />
        </div>

        <div className="gold-rule mt-12" aria-hidden="true" />

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-sara-mutedDark">
          <p>© {new Date().getFullYear()} {INFO.name}. Tous droits réservés.</p>
          <div className="flex gap-3">
            {[Youtube, Twitter, Instagram, Linkedin].map((I, k) => (
              <a key={k} href="#" className="w-9 h-9 rounded-lg bg-sara-cream/5 border border-sara-goldLight/25 hover:bg-sara-red hover:border-sara-red hover:text-white flex items-center justify-center transition" aria-label="Réseau social">
                <I className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="heading text-lg text-sara-goldLight">{title}</h4>
      <ul className="mt-4 space-y-3">
        {links.map(([h, l]) => (
          <li key={l}><a href={h} className="inline-block py-1.5 text-sara-mutedDark hover:text-sara-cream transition">{l}</a></li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Routage par hash                                                   */
/* ------------------------------------------------------------------ */

function useHashRoute() {
  const [hash, setHash] = useState(typeof window !== 'undefined' ? window.location.hash : '');
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SaraSite() {
  const hash = useHashRoute();
  const isMenu = hash.startsWith(MENU_ROUTE);
  const isRegister = hash.startsWith(REGISTER_ROUTE);
  const isLogin = hash.startsWith(LOGIN_ROUTE);
  const isAuth = isRegister || isLogin;
  const isCheckout = hash.startsWith(CHECKOUT_ROUTE);
  const isAccount = hash.startsWith(ACCOUNT_ROUTE);
  const isResa = hash.startsWith(RESA_ROUTE);
  const isResaChicha = hash.startsWith(RESA_CHICHA_ROUTE);
  const trackId = (hash.match(/^#\/suivi\/([a-f0-9]{6,})$/) || [])[1] ?? null;
  // Toute route « page » (#/…) part du haut ; les ancres (#faq) défilent.
  const estUnePage = isMenu || isAuth || isCheckout || isAccount || isResa || !!trackId;

  useEffect(() => {
    if (estUnePage) { window.scrollTo(0, 0); return; }
    const id = hash.replace(/^#\/?/, '');
    if (id) { const el = document.getElementById(id); if (el) el.scrollIntoView(); }
  }, [hash, estUnePage]);

  return (
    <div className="sara-root min-h-screen">
      <a href={MENU_ROUTE} className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-sara-red focus:text-white">Aller au menu</a>
      <Header sticky={isMenu} />
      <CartDrawer />
      {trackId ? (
        <OrderTrackingPage orderId={trackId} />
      ) : isResa ? (
        <ReservationPage chicha={isResaChicha} />
      ) : isAccount ? (
        <AccountPage />
      ) : isCheckout ? (
        <CheckoutPage />
      ) : isAuth ? (
        <AuthPage mode={isRegister ? 'register' : 'login'} />
      ) : isMenu ? (
        <MenuPage />
      ) : (
        <main>
          <Hero />
          <Categories />
          <SpecialOffers />
          <Chicha />
          <About />
          <GallerySection />
          <FaqSection />
        </main>
      )}
      <CtaFooter />
    </div>
  );
}
