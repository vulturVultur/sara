import { useState, useEffect, useRef, useCallback } from 'react';
import './sara.css';
import {
  Menu as MenuIcon, X, ArrowUpRight, ChevronLeft, ChevronRight,
  ChevronDown, Flame, Minus, Plus, Trash2, ShoppingCart,
  MapPin, Phone, Youtube, Twitter, Instagram, Linkedin,
  ShoppingBag, User,
} from 'lucide-react';
import { MENU_CATEGORIES, MENU_ITEMS, categoryLabel, formatChf } from './data/menuItems';
import { useCart } from './contexts/CartContext.jsx';

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

/* Route de la page Menu (routage par hash) */
const MENU_ROUTE = '#/carte';

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
            <a href="#contact" className="sara-iconbtn" aria-label="Mon compte"><User className="w-5 h-5" /></a>
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

            {/* Le tunnel de commande (emporter/livraison, paiement) est l'étape
                suivante du brief : le bouton reste inactif plutôt que de
                pointer vers une route qui n'existe pas encore. */}
            <button
              type="button"
              disabled
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 font-semibold rounded-2xl rounded-tr-none bg-sara-red text-white opacity-50 cursor-not-allowed"
            >
              <Flame className="w-5 h-5" /> Passer commande
            </button>
            <p className="mt-2 text-center text-xs text-sara-muted">
              Le tunnel de commande et le paiement arrivent à la prochaine étape.
            </p>

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
            <button key={i} onClick={() => setIdx(i)} className={`h-2 rounded-full transition-all ${i === idx ? 'w-7 bg-sara-red' : 'w-2 bg-sara-green/20'}`} aria-label={`Plat ${i + 1}`} />
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
                <button key={idx} onClick={() => setI(idx)} className={`h-2 rounded-full transition-all ${idx === i ? 'w-7 bg-sara-gold' : 'w-2 bg-sara-cream/40'}`} aria-label={`Photo ${idx + 1}`} />
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
            <PillLink href="#contact" variant="red"><Flame className="w-5 h-5" /> Réserver ma chicha</PillLink>
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
            <PillLink href="#contact" variant="dark">Réserver une table</PillLink>
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
      <div className={`aspect-4-3 ${f ? 'bg-sara-greenDeep' : 'bg-sara-paperAlt'}`}>
        <Img src={p.image} emoji={p.emoji} alt={p.name} className="w-full h-full object-cover" dark={f} />
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
              <a href={`tel:${INFO.phone.replace(/\s/g, '')}`} className="hover:text-sara-cream transition">{INFO.phone}</a>
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
          <li key={l}><a href={h} className="text-sara-mutedDark hover:text-sara-cream transition">{l}</a></li>
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

  useEffect(() => {
    if (isMenu) { window.scrollTo(0, 0); return; }
    const id = hash.replace(/^#\/?/, '');
    if (id) { const el = document.getElementById(id); if (el) el.scrollIntoView(); }
  }, [hash, isMenu]);

  return (
    <div className="sara-root min-h-screen">
      <a href={MENU_ROUTE} className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-sara-red focus:text-white">Aller au menu</a>
      <Header sticky={isMenu} />
      <CartDrawer />
      {isMenu ? (
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
