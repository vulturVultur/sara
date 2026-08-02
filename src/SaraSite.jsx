import { useState, useEffect, useRef, useCallback } from 'react';
import './sara.css';
import {
  Menu as MenuIcon, X, ArrowUpRight, ChevronLeft, ChevronRight,
  ChevronDown, Flame,
  MapPin, Phone, Youtube, Twitter, Instagram, Linkedin,
  ShoppingBag, User,
} from 'lucide-react';

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

const chf = (n) => {
  const v = Math.round(n * 100) / 100;
  return Number.isInteger(v) ? `${v}.- CHF` : `${v.toFixed(2)} CHF`;
};

/* Route de la page Menu (routage par hash) */
const MENU_ROUTE = '#/carte';

/* Filtres et produits de la page Menu — CONTENU PLACEHOLDER à personnaliser. */
const MENU_CATS = [
  { id: 'all', label: 'Tout' },
  { id: 'kebabs', label: 'Kebabs' },
  { id: 'burgers', label: 'Burgers' },
  { id: 'tacos', label: 'Tacos' },
  { id: 'assiettes', label: 'Assiettes' },
  { id: 'menus', label: 'Menus' },
  { id: 'boissons', label: 'Boissons' },
  { id: 'desserts', label: 'Desserts' },
];

const MENU_PRODUCTS = [
  { id: 'kebab', cat: 'kebabs', catLabel: 'Kebabs', name: 'Kebab Classique', price: 8.5, image: IMG.durum, emoji: '🌯', desc: 'Pain pita, viande grillée, crudités fraîches et sauce blanche maison.' },
  { id: 'durum', cat: 'kebabs', catLabel: 'Kebabs', name: 'Durum Poulet', price: 9, image: IMG.tacosAlt, emoji: '🌯', desc: 'Galette roulée grillée, poulet mariné, frites et sauce samouraï.' },
  { id: 'double', cat: 'burgers', catLabel: 'Burgers', name: 'Double Cheeseburger', price: 10.5, image: IMG.burger, emoji: '🍔', desc: 'Deux steaks, cheddar fondu, bacon croustillant et sauce maison.' },
  { id: 'sara', cat: 'burgers', catLabel: 'Burgers', name: 'Burger Sara', price: 9.5, image: IMG.burgerAlt, emoji: '🍔', desc: 'Steak 150g, cheddar, oignons confits et sauce signature Sara.' },
  { id: 'tacosxl', cat: 'tacos', catLabel: 'Tacos', name: 'Tacos XL', price: 9, image: IMG.tacos, emoji: '🌮', desc: 'Galette grillée, viande au choix, frites et sauce fromagère onctueuse.' },
  { id: 'mixte', cat: 'assiettes', catLabel: 'Assiettes', name: 'Assiette Mixte', price: 13.5, image: IMG.assiette, emoji: '🍽️', desc: 'Brochettes de poulet et bœuf, riz safran, frites, salade et sauces.' },
  { id: 'poulet', cat: 'assiettes', catLabel: 'Assiettes', name: 'Assiette Poulet', price: 11.5, image: IMG.assietteAlt, emoji: '🍽️', desc: 'Émincé de poulet grillé, frites maison, crudités et sauce blanche.' },
  { id: 'etudiant', cat: 'menus', catLabel: 'Menus', name: 'Menu Étudiant', price: 9.9, image: IMG.plate, emoji: '🥡', desc: 'Kebab + frites + boisson au choix. Le meilleur rapport qualité-prix.' },
  { id: 'soda', cat: 'boissons', catLabel: 'Boissons', name: 'Boisson 33cl', price: 2.5, image: IMG.drink, emoji: '🥤', desc: 'Coca, Fanta, Sprite, eau plate ou pétillante au choix.' },
  { id: 'baklava', cat: 'desserts', catLabel: 'Desserts', name: 'Assortiment Baklava', price: 4.5, image: null, emoji: '🍰', desc: 'Pâtisseries orientales au miel et pistaches, fait maison.' },
];

const CATEGORIES = [
  { id: 'kebabs', label: 'Kebabs', image: IMG.durum, emoji: '🌯' },
  { id: 'burgers', label: 'Burgers', image: IMG.burger, emoji: '🍔' },
  { id: 'tacos', label: 'Tacos', image: IMG.tacos, emoji: '🌮' },
  { id: 'assiettes', label: 'Assiettes', image: IMG.assiette, emoji: '🍽️' },
  { id: 'menus', label: 'Menus', image: IMG.plate, emoji: '🥡' },
  { id: 'boissons', label: 'Boissons', image: IMG.drink, emoji: '🥤' },
  { id: 'desserts', label: 'Desserts', image: null, emoji: '🍰' },
];

/* Plats affichés dans le carrousel hero (le plat central défile). */
const HERO_DISHES = [
  { image: IMG.burger, emoji: '🍔', alt: 'Double cheeseburger et frites maison' },
  { image: IMG.durum, emoji: '🌯', alt: 'Kebab roulé grillé et crudités fraîches' },
  { image: IMG.assiette, emoji: '🍽️', alt: 'Assiette mixte brochettes et riz safran' },
  { image: IMG.tacos, emoji: '🌮', alt: 'Tacos XL galette grillée et sauce fromagère' },
];

const OFFERS = [
  {
    tag: "Sélection du chef", theme: 'orange',
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

function Img({ src, alt, className = '', emoji = '🍽️' }) {
  const [err, setErr] = useState(false);
  if (err || !src) {
    return (
      <div className={`${className} sara-placeholder flex flex-col items-center justify-center gap-1`} role="img" aria-label={alt}>
        <span className="text-4xl" aria-hidden="true">{emoji}</span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-sara-brown/40">Photo à venir</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setErr(true)} />;
}

function Wave({ fill, stroke }) {
  return (
    <svg className="sara-wave" viewBox="0 0 1440 96" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,48 C240,104 420,4 720,40 C1010,74 1230,8 1440,44 L1440,96 L0,96 Z" fill={fill} />
      {stroke && <path d="M0,48 C240,104 420,4 720,40 C1010,74 1230,8 1440,44" fill="none" stroke={stroke} strokeWidth="3" vectorEffect="non-scaling-stroke" />}
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

/* Bouton pilule façon FreshBox (coin haut-droit rogné) */
function PillLink({ href = '#/carte', children, variant = 'red', className = '' }) {
  const styles = {
    red: 'bg-sara-red text-white hover:bg-sara-redDark',
    dark: 'bg-sara-redDark text-white hover:bg-sara-ink',
    cream: 'bg-white text-sara-red hover:bg-sara-creamSoft',
  };
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-2 px-7 py-3.5 font-semibold rounded-2xl rounded-tr-none transition ${styles[variant]} ${className}`}
    >
      {children}
      <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

function Eyebrow({ children, className = 'text-sara-red' }) {
  return <span className={`eyebrow ${className}`}>{children}</span>;
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

function Header() {
  const [mobile, setMobile] = useState(false);
  return (
    <header className="relative z-50 bg-sara-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="h-24 grid grid-cols-3 items-center">
          {/* Gauche : menu ☰ */}
          <div className="flex justify-start">
            <button onClick={() => setMobile(true)} className="sara-burger" aria-label="Ouvrir le menu">
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
          {/* Centre : wordmark SARA */}
          <div className="flex justify-center">
            <a href="#accueil" className="sara-wordmark" aria-label="Sara — accueil">Sara</a>
          </div>
          {/* Droite : panier + compte */}
          <div className="flex justify-end items-center gap-2 sm:gap-3">
            <a href="#/carte" className="sara-iconbtn" aria-label="Panier"><ShoppingBag className="w-5 h-5" /></a>
            <a href="#contact" className="sara-iconbtn" aria-label="Mon compte"><User className="w-5 h-5" /></a>
          </div>
        </div>
      </div>

      {mobile && (
        <div className="fixed inset-0 z-70">
          <div className="absolute inset-0 bg-sara-ink/50 fade-in" onClick={() => setMobile(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-sara-cream shadow-2xl p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between mb-6">
              <span className="sara-wordmark" style={{ fontSize: '1.6rem' }}>Sara</span>
              <button onClick={() => setMobile(false)} aria-label="Fermer"><X className="w-6 h-6 text-sara-brown" /></button>
            </div>
            {NAV.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobile(false)} className="px-3 py-3 text-base font-semibold text-sara-brown hover:bg-sara-red/5 hover:text-sara-red rounded-xl transition">{l.label}</a>
            ))}
            <PillLink href="#/carte" className="mt-4 justify-center">Commander</PillLink>
          </div>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero — carrousel de plats                                          */
/* ------------------------------------------------------------------ */

function Hero() {
  const [idx, setIdx] = useState(0);
  const n = HERO_DISHES.length;
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % n), 3200);
    return () => clearInterval(t);
  }, [n]);

  return (
    <section id="accueil" className="relative overflow-hidden bg-sara-cream">
      {/* bloc rouge : décor + titre */}
      <div className="relative bg-sara-red pt-14 md:pt-20 pb-40 md:pb-56">
        {/* décor flottant */}
        <span className="pointer-events-none absolute left-4 top-16 text-3xl sm:text-4xl floaty opacity-90" aria-hidden="true">🌶️</span>
        <span className="pointer-events-none absolute left-20 bottom-10 text-2xl sm:text-3xl floaty-slow opacity-80" aria-hidden="true">🌿</span>
        <span className="pointer-events-none absolute right-8 top-24 text-3xl sm:text-4xl floaty-slow opacity-90" aria-hidden="true">🍅</span>
        <span className="pointer-events-none absolute right-24 bottom-16 text-2xl sm:text-3xl floaty opacity-80" aria-hidden="true">🌶️</span>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center relative z-10">
          <p className="text-sara-creamSoft/90 font-medium tracking-wide mb-6">• Frais • Rapide • Savoureux</p>
          <h1 className="heading text-white text-5xl sm:text-6xl md:text-7xl max-w-4xl mx-auto">
            Le goût qui donne<br />envie de revenir
          </h1>
        </div>

        <Wave fill="#FBEFD5" />
      </div>

      {/* bande d'images qui chevauche la vague : plat gauche · carrousel central · burger droite */}
      <div className="relative z-20 -mt-32 md:-mt-44 h-48 sm:h-56 md:h-72 pointer-events-none">
        {/* image gauche */}
        <div className="hidden md:block absolute left-0 -translate-x-1/4 top-20 w-40 lg:w-52 floaty-slow">
          <Img src={IMG.assietteAlt} emoji="🍽️" alt="Assiette garnie Sara" className="w-full aspect-square object-cover rounded-full shadow-2xl ring-8 ring-white/10" />
        </div>

        {/* plat central (carrousel) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-44 sm:w-52 md:w-64 aspect-square">
          {HERO_DISHES.map((d, i) => (
            <div key={i} className={`hero-slide ${i === idx ? 'is-active' : ''}`} aria-hidden={i !== idx}>
              <Img src={d.image} emoji={d.emoji} alt={d.alt} className="w-full h-full object-cover rounded-full shadow-2xl ring-8 ring-white/10" />
            </div>
          ))}
        </div>

        {/* image droite (burger) */}
        <div className="hidden md:block absolute right-0 translate-x-1/4 top-12 w-40 lg:w-52 floaty">
          <Img src={IMG.burgerAlt} emoji="🍔" alt="Burger généreux Sara" className="w-full aspect-square object-cover rounded-full shadow-2xl ring-8 ring-white/10" />
        </div>
      </div>

      {/* boutons + points du carrousel */}
      <div className="relative z-10 text-center px-5 pt-6 pb-16 md:pb-20">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <PillLink href="#/carte" variant="red"><Flame className="w-5 h-5" /> Commander maintenant</PillLink>
          <PillLink href="#/carte" variant="dark">Voir le menu</PillLink>
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {HERO_DISHES.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`h-2 rounded-full transition-all ${i === idx ? 'w-7 bg-sara-red' : 'w-2 bg-sara-brown/30'}`} aria-label={`Plat ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Categories — marquee défilant                                      */
/* ------------------------------------------------------------------ */

function Categories() {
  const loop = [...CATEGORIES, ...CATEGORIES];
  return (
    <section id="menu" className="py-16 md:py-24 bg-sara-cream">
      <div className="max-w-3xl mx-auto px-5 text-center mb-12">
        <Eyebrow>Notre menu</Eyebrow>
        <h2 className="heading text-sara-brown text-4xl sm:text-5xl mt-3">Découvrez nos plats populaires</h2>
      </div>

      <div className="marquee">
        <div className="marquee__track">
          {loop.map((c, i) => (
            <a key={`${c.id}-${i}`} href="#/carte" className="shrink-0 w-44 sm:w-52 text-center group" aria-label={c.label}>
              <div className="aspect-square rounded-3xl overflow-hidden bg-sara-orange/15 p-3 transition group-hover:-translate-y-1">
                <Img src={c.image} emoji={c.emoji} alt={c.label} className="w-full h-full object-contain drop-shadow-lg" />
              </div>
              <p className="mt-3 font-semibold text-sara-brown text-lg">{c.label}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Special Offers                                                     */
/* ------------------------------------------------------------------ */

function OfferBanner({ offer }) {
  const themes = {
    orange: 'bg-gradient-to-br from-sara-orange to-[#E8890B] text-white',
    red: 'bg-sara-red text-white',
    green: 'bg-sara-green text-white',
  };
  return (
    <div className={`relative overflow-hidden rounded-3xl ${themes[offer.theme]} flex items-stretch min-h-[9.5rem] sm:min-h-[10.5rem]`}>
      {/* contenu à gauche */}
      <div className="relative z-10 flex-1 flex flex-col justify-center p-5 sm:p-7 pr-32 sm:pr-44">
        <p className="text-white/85 text-xs sm:text-sm font-medium">{offer.tag}</p>
        <h3 className="heading text-lg sm:text-2xl leading-tight mt-1">
          {offer.title}<br />{offer.subtitle}
        </h3>
        <div className="mt-3">
          <a href="#/carte" className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl rounded-tr-none bg-white text-sara-red text-sm font-semibold hover:bg-sara-creamSoft transition">
            <Flame className="w-4 h-4 text-sara-orange" /> Commander
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>

      {/* image à droite */}
      <div className="absolute right-0 top-0 h-full w-28 sm:w-52 pointer-events-none">
        <Img src={offer.image} emoji={offer.emoji} alt={offer.title} className="w-full h-full object-cover" />
      </div>

      {/* pastille remise */}
      <div className="sara-starburst absolute z-20 top-3 right-3 w-16 h-16 sm:w-20 sm:h-20 bg-white text-sara-brown flex flex-col items-center justify-center text-center">
        <span className="text-[9px] sm:text-[10px] font-semibold leading-none">Jusqu'à</span>
        <span className="font-display text-lg sm:text-2xl leading-none mt-0.5">{offer.save}</span>
      </div>
    </div>
  );
}

function SpecialOffers() {
  return (
    <section id="offres" className="relative overflow-hidden bg-sara-cream pt-16 md:pt-24 pb-28 md:pb-44">
      <div className="max-w-3xl mx-auto px-5 text-center mb-12">
        <Eyebrow>Offres spéciales</Eyebrow>
        <h2 className="heading text-sara-brown text-4xl sm:text-5xl mt-3">Des offres à ne pas manquer</h2>
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

      {/* vague de raccord vers la section Chicha (fond sombre) */}
      <Wave fill="#2A1712" />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Chicha — carrousel du salon                                        */
/* ------------------------------------------------------------------ */

function Chicha() {
  const [i, setI] = useState(0);
  const n = CHICHA_PHOTOS.length;
  const next = useCallback(() => setI((p) => (p + 1) % n), [n]);
  const prev = () => setI((p) => (p - 1 + n) % n);
  useEffect(() => { const t = setInterval(next, 4500); return () => clearInterval(t); }, [next]);

  return (
    <section id="chicha" className="relative overflow-hidden bg-sara-ink text-white pt-16 md:pt-24 pb-28 md:pb-44">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid md:grid-cols-2 gap-12 items-center">
        {/* Carrousel photos du salon */}
        <Reveal className="relative">
          <div className="relative rounded-3xl overflow-hidden aspect-4-3 shadow-2xl ring-1 ring-white/10">
            {CHICHA_PHOTOS.map((ph, idx) => (
              <div key={idx} className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? 'opacity-100' : 'opacity-0'}`} aria-hidden={idx !== i}>
                <Img src={ph.src} emoji={ph.emoji} alt={ph.alt} className="w-full h-full object-cover" />
              </div>
            ))}
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-sara-brown flex items-center justify-center hover:bg-white transition" aria-label="Photo précédente"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-sara-brown flex items-center justify-center hover:bg-white transition" aria-label="Photo suivante"><ChevronRight className="w-5 h-5" /></button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {CHICHA_PHOTOS.map((_, idx) => (
                <button key={idx} onClick={() => setI(idx)} className={`h-2 rounded-full transition-all ${idx === i ? 'w-7 bg-white' : 'w-2 bg-white/50'}`} aria-label={`Photo ${idx + 1}`} />
              ))}
            </div>
          </div>
        </Reveal>

        {/* Texte + bouton */}
        <Reveal delay={100}>
          <Eyebrow className="text-sara-orange">Espace Chicha</Eyebrow>
          <h2 className="heading text-white text-4xl sm:text-5xl mt-3">Découvrez nos chichas</h2>
          <p className="mt-5 text-white/70 leading-relaxed">
            Détendez-vous dans notre salon à l'ambiance tamisée. Chicha premium, large choix
            de parfums et service soigné — l'endroit idéal pour prolonger la soirée entre amis.
          </p>
          <div className="mt-8">
            <PillLink href="#contact" variant="red"><Flame className="w-5 h-5" /> Réserver ma chicha</PillLink>
          </div>
        </Reveal>
      </div>

      {/* vague de raccord vers la section À propos (fond crème) */}
      <Wave fill="#FBEFD5" />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  About Us                                                           */
/* ------------------------------------------------------------------ */

function About() {
  return (
    <section id="about" className="py-16 md:py-24 bg-sara-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid md:grid-cols-2 gap-12 items-center">
        <Reveal className="sara-arch bg-sara-red aspect-5-4 max-w-md mx-auto w-full">
          <Img src={IMG.salle} emoji="😋" alt="L'ambiance chaleureuse du restaurant Sara" className="w-full h-full object-cover" />
        </Reveal>

        <Reveal delay={100} className="text-center">
          <div className="flex justify-center"><Eyebrow>À propos</Eyebrow></div>
          <h2 className="heading text-sara-brown text-4xl sm:text-5xl mt-3">Une expérience d'exception, qualité premium et saveurs riches</h2>
          <p className="mt-5 text-sara-muted leading-relaxed">
            Nous réunissons des ingrédients premium, un vrai savoir-faire et une passion du goût —
            pour créer des moments inoubliables à chaque bouchée, avec richesse et qualité.
          </p>

          <h3 className="heading text-sara-brown text-2xl mt-8">Horaires d'ouverture</h3>
          <p className="mt-3 text-sara-muted">{INFO.hoursWeek}</p>
          <p className="text-sara-muted">{INFO.hoursWeekend}</p>

          <div className="mt-8 flex justify-center">
            <PillLink href="#contact">Réserver une table</PillLink>
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
    <section id="faq" className="py-16 md:py-24 bg-sara-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid md:grid-cols-[minmax(0,22rem)_1fr] gap-10 md:gap-16">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="heading text-sara-brown text-4xl sm:text-5xl mt-3">Questions fréquentes</h2>
          <p className="mt-4 text-sara-muted">
            Des questions ? Nous avons les réponses pour profiter de votre expérience
            simplement, rapidement et en toute sérénité.
          </p>
        </div>

        <div>
          {FAQ.map((item, idx) => (
            <div key={item.q} className="border-b border-sara-brown/15">
              <button onClick={() => setOpen(open === idx ? -1 : idx)} className="w-full flex items-center justify-between gap-4 py-6 text-left" aria-expanded={open === idx}>
                <span className="heading text-sara-brown text-xl sm:text-2xl">{item.q}</span>
                <ChevronDown className={`w-6 h-6 shrink-0 text-sara-brown transition-transform ${open === idx ? 'rotate-180' : ''}`} />
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
    <section id="galerie" className="py-16 md:py-24 bg-sara-cream">
      <div className="max-w-3xl mx-auto px-5 text-center mb-12">
        <Eyebrow>Galerie</Eyebrow>
        <h2 className="heading text-sara-brown text-4xl sm:text-5xl mt-3">Un régal pour les yeux</h2>
        <p className="mt-4 text-sara-muted">
          Explorez nos créations — préparées avec passion et servies avec soin, pour une
          qualité, une fraîcheur et une expérience inoubliables.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[10rem] sm:auto-rows-[13rem]">
        {GALLERY.map((g, idx) => (
          <Reveal key={idx} delay={idx * 60} className={g.span === 'row' ? 'row-span-2' : ''}>
            <div className="w-full h-full rounded-3xl overflow-hidden group">
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

function MenuPage() {
  const [active, setActive] = useState('all');
  const shown = active === 'all' ? MENU_PRODUCTS : MENU_PRODUCTS.filter((p) => p.cat === active);

  return (
    <main className="bg-sara-cream">
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 md:pt-16">
        <Eyebrow>Commandez · Savourez · Recommencez</Eyebrow>
        <h1 className="heading text-sara-brown text-5xl sm:text-6xl md:text-7xl mt-3">Notre carte</h1>
      </section>

      <div className="checker my-8 md:my-12" aria-hidden="true" />

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20 md:pb-28">
        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-10">
          {MENU_CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wide transition ${active === c.id ? 'bg-sara-red text-white' : 'bg-white text-sara-brown border border-sara-brown/15 hover:border-sara-red/40'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grille produits */}
        <div key={active} className="fade-up grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map((p) => (
            <article key={p.id} className="rounded-3xl overflow-hidden bg-white shadow-sm flex flex-col">
              <div className="aspect-4-3 bg-sara-ink">
                <Img src={p.image} emoji={p.emoji} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <span className="self-start px-3 py-1 rounded-full bg-sara-brown/10 text-sara-brown/70 text-[11px] font-bold uppercase tracking-wide">{p.catLabel}</span>
                <h3 className="heading text-sara-brown text-2xl mt-3">{p.name}</h3>
                <p className="mt-2 text-sara-muted clamp-2 leading-relaxed">{p.desc}</p>
                <div className="mt-auto pt-5">
                  <button type="button" className="block w-full text-center px-4 py-3 rounded-full border border-sara-brown/20 text-sara-brown text-xs font-bold uppercase tracking-widest hover:border-sara-red hover:text-sara-red transition">
                    Voir le produit
                  </button>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-display text-2xl text-sara-brown">{chf(p.price)}</span>
                    <button type="button" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-sara-red text-white text-xs font-bold uppercase tracking-widest hover:bg-sara-redDark transition">
                      <Flame className="w-4 h-4" /> Commander
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
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
    <footer id="contact" className="bg-sara-red text-white">
      {/* bandeau CTA jaune */}
      <div className="relative overflow-hidden bg-sara-orange">
        <span className="hidden lg:block pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-48 xl:w-56 opacity-95" aria-hidden="true">
          <Img src={IMG.broche} emoji="🍗" alt="" className="w-full object-contain drop-shadow-xl" />
        </span>
        <span className="hidden lg:block pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-48 xl:w-56 opacity-95" aria-hidden="true">
          <Img src={IMG.assietteAlt} emoji="🍕" alt="" className="w-full object-contain drop-shadow-xl" />
        </span>
        <div className="max-w-2xl mx-auto px-5 text-center py-16 md:py-24 relative">
          <h2 className="heading text-sara-redDark text-4xl sm:text-5xl">Un petit creux ?<br />On vous attend</h2>
          <p className="mt-4 text-sara-redDark/80 font-medium">
            Commandez vos plats préférés et profitez d'une cuisine fraîche et savoureuse,
            livrée rapidement jusqu'à votre porte.
          </p>
          <div className="mt-8 flex justify-center">
            <PillLink href="#/carte" variant="dark">Commander maintenant</PillLink>
          </div>
        </div>
        <Wave fill="#A51E22" />
      </div>

      {/* footer principal */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <span className="sara-wordmark sara-wordmark--footer">Sara</span>
            <h4 className="heading text-lg mt-8">Adresse</h4>
            <p className="mt-3 text-white/80 leading-relaxed flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-1 shrink-0 text-sara-orange" />{INFO.address}
            </p>
            <p className="mt-3 text-white/80 flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0 text-sara-orange" />
              <a href={`tel:${INFO.phone.replace(/\s/g, '')}`} className="hover:text-white">{INFO.phone}</a>
            </p>
          </div>

          <FooterCol title="Menu" links={[['#/carte', 'Menu'], ['#offres', 'Offres'], ['#chicha', 'Chicha']]} />
          <FooterCol title="Restaurant" links={[['#about', 'À propos'], ['#chicha', 'Chicha'], ['#galerie', 'Galerie']]} />
          <FooterCol title="Aide" links={[['#faq', 'FAQ'], ['#contact', 'Contact']]} />
          <FooterCol title="Légal" links={[['#', 'Confidentialité'], ['#', 'Conditions']]} />
        </div>

        <div className="mt-12 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <p>© {new Date().getFullYear()} {INFO.name}. Tous droits réservés.</p>
          <div className="flex gap-3">
            {[Youtube, Twitter, Instagram, Linkedin].map((I, k) => (
              <a key={k} href="#" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition" aria-label="Réseau social">
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
      <h4 className="heading text-lg text-sara-orange">{title}</h4>
      <ul className="mt-4 space-y-3">
        {links.map(([h, l]) => (
          <li key={l}><a href={h} className="text-white/80 hover:text-white transition">{l}</a></li>
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
      <a href={MENU_ROUTE} className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-70 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-sara-ink focus:text-white">Aller au menu</a>
      <Header />
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
