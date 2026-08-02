import { useState, useEffect, useRef, useCallback } from 'react';
import './sara.css';
import {
  Menu as MenuIcon, X, ArrowUpRight, ChevronLeft, ChevronRight,
  ChevronDown, Utensils, Armchair, UserPlus, Leaf, Quote, Flame,
  Clock, MapPin, Phone, Youtube, Twitter, Instagram, Linkedin,
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

const CATEGORIES = [
  { id: 'kebabs', label: 'Kebabs', image: IMG.durum, emoji: '🌯' },
  { id: 'burgers', label: 'Burgers', image: IMG.burger, emoji: '🍔' },
  { id: 'tacos', label: 'Tacos', image: IMG.tacos, emoji: '🌮' },
  { id: 'assiettes', label: 'Assiettes', image: IMG.assiette, emoji: '🍽️' },
  { id: 'menus', label: 'Menus', image: IMG.plate, emoji: '🥡' },
  { id: 'boissons', label: 'Boissons', image: IMG.drink, emoji: '🥤' },
  { id: 'desserts', label: 'Desserts', image: null, emoji: '🍰' },
  { id: 'chichas', label: 'Chichas', image: IMG.chicha, emoji: '💨' },
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

const MENU_DISHES = [
  { name: 'Burger Sara', price: 9.5, image: IMG.burger, emoji: '🍔', description: 'Steak 150g, cheddar fondu, oignons confits et sauce signature Sara.' },
  { name: 'Assiette Mixte', price: 13.5, image: IMG.assiette, emoji: '🍽️', description: 'Brochettes de poulet et bœuf, riz safran, frites, salade et sauces.' },
];

const FEATURES = [
  { icon: Utensils, title: 'Cuisine généreuse', text: 'Préparée avec des ingrédients frais et des saveurs qui donnent envie.' },
  { icon: Armchair, title: 'Ambiance cosy', text: 'Un cadre chaleureux et un espace chicha pour prolonger la soirée.' },
  { icon: UserPlus, title: 'Service rapide', text: 'Une équipe dédiée à un service fluide, en salle comme en livraison.' },
  { icon: Leaf, title: 'Produits frais', text: 'Des ingrédients sélectionnés chaque jour pour une qualité constante.' },
];

const CATERING = [
  { label: 'Plat 1', name: 'Assiette Mixte Traiteur', image: IMG.assiette, emoji: '🍽️', description: 'Brochettes de poulet et bœuf, riz safran et sauces maison, pour partager.' },
  { label: 'Plat 2', name: 'Plateau Burgers Gourmet', image: IMG.burgerAlt, emoji: '🍔', description: 'Burgers généreux garnis d’ingrédients frais, parfaits pour les grandes tablées.' },
  { label: 'Plat 3', name: 'Durum & Grillades', image: IMG.durum, emoji: '🌯', description: 'Galettes roulées grillées minute, viandes marinées et sauces au choix.' },
];

const REVIEWS = [
  { name: 'Yanis B.', role: 'Client fidèle', comment: 'Meilleur kebab du quartier ! Viande tendre, frites maison, service rapide. Je reviens à chaque fois avec le même plaisir.' },
  { name: 'Sarah M.', role: 'Habituée chicha', comment: 'L’espace chicha est super cosy et les parfums sont excellents. Une super soirée du début à la fin, à refaire.' },
  { name: 'Karim A.', role: 'Commande en ligne', comment: 'Commande en livraison, tout est arrivé chaud et délicieux. Le double cheeseburger est une vraie tuerie.' },
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

const POSTS = [
  { image: IMG.burger, emoji: '🍔', read: '4 min', date: '24 avr. 2026', title: 'Le secret d’un burger juteux et parfait' },
  { image: IMG.tacos, emoji: '🍕', read: '4 min', date: '15 juin 2026', title: 'Pourquoi des ingrédients frais changent tout' },
];

const NAV = [
  { href: '#accueil', label: 'Accueil' },
  { href: '#categories', label: 'Catégories' },
  { href: '#menu', label: 'Menu' },
  { href: '#about', label: 'À propos' },
  { href: '#catering', label: 'Traiteur' },
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
function PillLink({ href = '#menu', children, variant = 'red', className = '' }) {
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
            <a href="#menu" className="sara-iconbtn" aria-label="Panier"><ShoppingBag className="w-5 h-5" /></a>
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
            <PillLink href="#menu" className="mt-4 justify-center">Commander</PillLink>
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
    <section id="accueil" className="relative bg-sara-cream">
      <div className="relative overflow-hidden bg-sara-red">
        {/* décor flottant */}
        <span className="pointer-events-none absolute left-6 top-16 text-4xl floaty opacity-90" aria-hidden="true">🌶️</span>
        <span className="pointer-events-none absolute left-24 bottom-24 text-3xl floaty-slow opacity-80" aria-hidden="true">🌿</span>
        <span className="pointer-events-none absolute right-10 top-24 text-4xl floaty-slow opacity-90" aria-hidden="true">🍅</span>
        <span className="pointer-events-none absolute right-28 bottom-28 text-3xl floaty opacity-80" aria-hidden="true">🌶️</span>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-14 pb-40 md:pt-16 md:pb-52 text-center relative">
          <p className="text-sara-creamSoft/90 font-medium tracking-wide mb-6">• Frais • Rapide • Savoureux</p>
          <h1 className="heading text-white text-5xl sm:text-6xl md:text-7xl max-w-4xl mx-auto">
            Le goût qui donne<br />envie de revenir
          </h1>

          {/* carrousel : plat central qui défile */}
          <div className="relative mx-auto mt-10 w-64 h-64 sm:w-80 sm:h-80">
            {HERO_DISHES.map((d, i) => (
              <div key={i} className={`hero-slide ${i === idx ? 'is-active' : ''}`} aria-hidden={i !== idx}>
                <Img src={d.image} emoji={d.emoji} alt={d.alt} className="w-full h-full object-cover rounded-full shadow-2xl ring-8 ring-white/10" />
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <PillLink href="#menu" variant="cream"><Flame className="w-5 h-5" /> Commander maintenant</PillLink>
            <PillLink href="#menu" variant="dark">Voir le menu</PillLink>
          </div>

          {/* points du carrousel */}
          <div className="mt-8 flex justify-center gap-2">
            {HERO_DISHES.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`h-2 rounded-full transition-all ${i === idx ? 'w-7 bg-white' : 'w-2 bg-white/40'}`} aria-label={`Plat ${i + 1}`} />
            ))}
          </div>
        </div>

        <Wave fill="#FBEFD5" />
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
    <section id="categories" className="py-16 md:py-24 bg-sara-cream">
      <div className="max-w-3xl mx-auto px-5 text-center mb-12">
        <Eyebrow>Catégories</Eyebrow>
        <h2 className="heading text-sara-brown text-4xl sm:text-5xl mt-3">Découvrez nos plats populaires</h2>
        <p className="mt-4 text-sara-muted">
          Une variété de plats préparés minute, pensés pour satisfaire toutes les envies —
          saveurs riches, ingrédients premium et plaisir garanti pour tous.
        </p>
      </div>

      <div className="marquee">
        <div className="marquee__track">
          {loop.map((c, i) => (
            <a key={`${c.id}-${i}`} href="#menu" className="shrink-0 w-44 sm:w-52 text-center group" aria-label={c.label}>
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

function OfferCard({ offer, large = false }) {
  const themes = {
    orange: 'from-sara-orange to-[#E8890B] text-white',
    red: 'bg-sara-red text-white',
    green: 'bg-sara-green text-white',
  };
  const bg = offer.theme === 'orange' ? `bg-gradient-to-br ${themes.orange}` : themes[offer.theme];
  return (
    <div className={`relative overflow-hidden rounded-3xl ${bg} ${large ? 'p-8 min-h-[26rem]' : 'p-7 min-h-[13rem]'} flex flex-col`}>
      {/* image (arrière-plan) */}
      <div className={`absolute z-0 pointer-events-none ${large ? 'right-0 -bottom-4 w-1/2' : 'right-1 -bottom-2 w-2/5'}`}>
        <Img src={offer.image} emoji={offer.emoji} alt={offer.title} className="w-full h-full object-contain drop-shadow-2xl" />
      </div>
      {/* pastille remise */}
      <div className="sara-starburst absolute z-20 top-6 right-6 w-24 h-24 bg-white text-sara-brown flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-semibold leading-none">Jusqu'à</span>
        <span className="font-display text-2xl leading-none mt-0.5">{offer.save}</span>
      </div>
      {/* contenu (au-dessus) */}
      <div className="relative z-10 flex flex-col flex-1">
        <p className="text-white/85 font-medium mb-2">{offer.tag}</p>
        <h3 className={`heading text-2xl sm:text-3xl leading-tight ${large ? 'max-w-[55%]' : 'max-w-[62%]'}`}>
          {offer.title}<br />{offer.subtitle}
        </h3>
        <div className="mt-auto pt-6">
          <PillLink href="#menu" variant="cream"><Flame className="w-4 h-4 text-sara-orange" /> Commander</PillLink>
        </div>
      </div>
    </div>
  );
}

function SpecialOffers() {
  return (
    <section id="offres" className="py-16 md:py-24 bg-sara-cream">
      <div className="max-w-3xl mx-auto px-5 text-center mb-12">
        <Eyebrow>Offres spéciales</Eyebrow>
        <h2 className="heading text-sara-brown text-4xl sm:text-5xl mt-3">Des offres à ne pas manquer</h2>
        <p className="mt-4 text-sara-muted">
          Savourez vos plats préférés à prix imbattables — préparés minute et pleins de saveur,
          avec de bons ingrédients, une belle qualité et des portions généreuses.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid md:grid-cols-2 gap-6">
        <div className="grid gap-6">
          <Reveal><OfferCard offer={OFFERS[0]} /></Reveal>
          <Reveal delay={100}><OfferCard offer={OFFERS[1]} /></Reveal>
        </div>
        <Reveal delay={150}><OfferCard offer={OFFERS[2]} large /></Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Our Menu — Discover Flavors                                        */
/* ------------------------------------------------------------------ */

function DiscoverMenu() {
  return (
    <section id="menu" className="py-16 md:py-24 bg-sara-red text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-12">
          <div className="max-w-lg">
            <Eyebrow className="text-white">Notre menu</Eyebrow>
            <h2 className="heading text-white text-4xl sm:text-5xl mt-3">Des saveurs que vous allez adorer</h2>
            <p className="mt-4 text-white/70">
              Découvrez nos plats préparés avec soin — ingrédients frais, saveurs franches,
              goût riche, qualité premium et un parfum irrésistible.
            </p>
          </div>
          <PillLink href="#contact" variant="dark" className="shrink-0">Réserver une table</PillLink>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {MENU_DISHES.map((d, i) => (
            <Reveal key={d.name} delay={i * 100}>
              <article className="rounded-3xl overflow-hidden bg-sara-redDark/40">
                <div className="aspect-4-3 overflow-hidden">
                  <Img src={d.image} emoji={d.emoji} alt={d.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="heading text-2xl">{d.name}</h3>
                    <span className="font-display text-xl text-sara-orange whitespace-nowrap">{chf(d.price)}</span>
                  </div>
                  <p className="mt-2 text-white/70">{d.description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
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

        <Reveal delay={100}>
          <Eyebrow>À propos</Eyebrow>
          <h2 className="heading text-sara-brown text-4xl sm:text-5xl mt-3">Une expérience d'exception, qualité premium et saveurs riches</h2>
          <p className="mt-5 text-sara-muted leading-relaxed">
            Nous réunissons des ingrédients premium, un vrai savoir-faire et une passion du goût —
            pour créer des moments inoubliables à chaque bouchée, avec richesse et qualité.
          </p>

          <h3 className="heading text-sara-brown text-2xl mt-8">Horaires d'ouverture</h3>
          <p className="mt-3 text-sara-muted">{INFO.hoursWeek}</p>
          <p className="text-sara-muted">{INFO.hoursWeekend}</p>

          <div className="mt-8">
            <PillLink href="#contact">Réserver une table</PillLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Why Choose Us                                                      */
/* ------------------------------------------------------------------ */

function WhyChoose() {
  return (
    <section id="atouts" className="relative bg-sara-red text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <Eyebrow className="text-white">Pourquoi nous choisir</Eyebrow>
          <h2 className="heading text-white text-4xl sm:text-5xl mt-3">Plébiscité par les gourmands</h2>
          <p className="mt-4 text-white/70">
            Nous combinons des ingrédients de qualité, une cuisine experte et un service
            attentionné pour offrir une expérience inoubliable.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="h-full rounded-3xl bg-sara-redDark/50 p-8 text-center">
                <f.icon className="w-12 h-12 mx-auto text-white/70" strokeWidth={1.5} />
                <h3 className="heading text-2xl mt-6">{f.title}</h3>
                <p className="mt-3 text-white/70">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Catering                                                           */
/* ------------------------------------------------------------------ */

function Catering() {
  return (
    <section id="catering" className="py-16 md:py-24 bg-sara-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-12">
          <div>
            <Eyebrow>Traiteur</Eyebrow>
            <h2 className="heading text-sara-brown text-4xl sm:text-5xl mt-3">Un traiteur pour<br />chaque célébration</h2>
          </div>
          <div className="max-w-sm md:text-right">
            <p className="text-sara-muted">
              Du repas intime au grand événement, nous offrons des expériences culinaires
              d'exception qui laissent un souvenir durable.
            </p>
            <PillLink href="#menu" className="mt-6">Explorer le menu</PillLink>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {CATERING.slice(0, 2).map((d, i) => (
            <Reveal key={d.name} delay={i * 100}><CateringCard dish={d} /></Reveal>
          ))}
          <Reveal delay={150} className="md:col-span-2 md:max-w-[calc(50%-0.75rem)]">
            <CateringCard dish={CATERING[2]} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CateringCard({ dish }) {
  return (
    <article className="relative rounded-3xl overflow-hidden aspect-4-3">
      <Img src={dish.image} emoji={dish.emoji} alt={dish.name} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-sara-ink/90 via-sara-ink/25 to-transparent" />
      <span className="absolute top-0 left-6 px-5 py-2 bg-sara-cream text-sara-red font-semibold rounded-b-2xl">{dish.label}</span>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="heading text-2xl">{dish.name}</h3>
        <p className="mt-2 text-white/80 clamp-2">{dish.description}</p>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonials — carrousel                                          */
/* ------------------------------------------------------------------ */

function Testimonials() {
  const [i, setI] = useState(0);
  const n = REVIEWS.length;
  const next = useCallback(() => setI((p) => (p + 1) % n), [n]);
  const prev = () => setI((p) => (p - 1 + n) % n);
  useEffect(() => { const t = setInterval(next, 6000); return () => clearInterval(t); }, [next]);
  const r = REVIEWS[i];

  return (
    <section id="avis" className="py-16 md:py-24 bg-sara-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="rounded-3xl bg-sara-red text-white p-6 sm:p-10 md:p-14">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="rounded-3xl bg-sara-orange aspect-square overflow-hidden">
              <Img src={null} emoji="👨‍🍳" alt={`Portrait — ${r.name}`} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Eyebrow className="text-white">Témoignages</Eyebrow>
                  <h2 className="heading text-white text-3xl sm:text-4xl mt-3">Ce que disent nos clients</h2>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={prev} className="w-11 h-11 rounded-xl bg-white text-sara-red flex items-center justify-center hover:bg-sara-creamSoft transition" aria-label="Précédent"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={next} className="w-11 h-11 rounded-xl bg-white text-sara-red flex items-center justify-center hover:bg-sara-creamSoft transition" aria-label="Suivant"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
              <Quote className="w-10 h-10 text-sara-orange mt-6 fill-sara-orange" />
              <p key={i} className="fade-in mt-4 text-lg sm:text-xl text-white/90 leading-relaxed">« {r.comment} »</p>
              <p className="mt-6 font-semibold">{r.name} <span className="text-white/60 font-normal">· {r.role}</span></p>
            </div>
          </div>
        </div>
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
/*  Blog                                                               */
/* ------------------------------------------------------------------ */

function Blog() {
  return (
    <section id="blog" className="py-16 md:py-24 bg-sara-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-12">
          <div>
            <Eyebrow>Blog</Eyebrow>
            <h2 className="heading text-sara-brown text-4xl sm:text-5xl mt-3">Tendances &<br />histoires gourmandes</h2>
          </div>
          <div className="max-w-sm md:text-right">
            <p className="text-sara-muted">
              Découvrez les dernières tendances food, recettes et coulisses de notre cuisine,
              de nos chefs et de notre aventure culinaire.
            </p>
            <PillLink href="#blog" className="mt-6">Explorer le blog</PillLink>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {POSTS.map((p, i) => (
            <Reveal key={p.title} delay={i * 100}>
              <article className="bg-white rounded-3xl p-4 sm:p-5">
                <div className="aspect-4-3 rounded-2xl overflow-hidden">
                  <Img src={p.image} emoji={p.emoji} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-between mt-4 text-sm font-medium text-sara-red">
                  <span>Lecture : {p.read}</span>
                  <span>{p.date}</span>
                </div>
                <h3 className="heading text-sara-brown text-2xl mt-3">{p.title}</h3>
                <div className="mt-5">
                  <PillLink href="#blog">Lire l'article</PillLink>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
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
        <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-40 sm:w-56 opacity-95" aria-hidden="true">
          <Img src={IMG.broche} emoji="🍗" alt="" className="w-full object-contain drop-shadow-xl" />
        </span>
        <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-40 sm:w-56 opacity-95" aria-hidden="true">
          <Img src={IMG.assietteAlt} emoji="🍕" alt="" className="w-full object-contain drop-shadow-xl" />
        </span>
        <div className="max-w-2xl mx-auto px-5 text-center py-16 md:py-24 relative">
          <h2 className="heading text-sara-redDark text-4xl sm:text-5xl">Un petit creux ?<br />On vous attend</h2>
          <p className="mt-4 text-sara-redDark/80 font-medium">
            Commandez vos plats préférés et profitez d'une cuisine fraîche et savoureuse,
            livrée rapidement jusqu'à votre porte.
          </p>
          <div className="mt-8 flex justify-center">
            <PillLink href="#menu" variant="dark">Commander maintenant</PillLink>
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

          <FooterCol title="Menu" links={[['#menu', 'Menu'], ['#offres', 'Offres'], ['#categories', 'Catégories']]} />
          <FooterCol title="Restaurant" links={[['#about', 'À propos'], ['#catering', 'Traiteur'], ['#galerie', 'Galerie']]} />
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
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SaraSite() {
  return (
    <div className="sara-root min-h-screen">
      <a href="#menu" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-70 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-sara-ink focus:text-white">Aller au menu</a>
      <Header />
      <main>
        <Hero />
        <Categories />
        <SpecialOffers />
        <DiscoverMenu />
        <About />
        <WhyChoose />
        <Catering />
        <Testimonials />
        <FaqSection />
        <GallerySection />
        <Blog />
      </main>
      <CtaFooter />
    </div>
  );
}
