import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import './sara.css';
import {
  ShoppingBag, Menu as MenuIcon, X, CalendarDays, ChevronRight, ChevronLeft,
  Bike, Store, Clock, MapPin, Users, Check, Plus, Minus, Trash2,
  Star, Flame, Heart, Wind, Quote, Phone, Instagram, Facebook
} from 'lucide-react';


/* ------------------------------------------------------------------ */
/*  src/data/menu.js                                                   */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  { id: 'kebabs', label: 'Kebabs' },
  { id: 'burgers', label: 'Burgers' },
  { id: 'tacos', label: 'Tacos' },
  { id: 'assiettes', label: 'Assiettes' },
  { id: 'menus', label: 'Menus' },
  { id: 'boissons', label: 'Boissons' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'chichas', label: 'Chichas' },
];

/* Photos réelles du restaurant, embarquées en data-URI (aucune dépendance réseau).
   hero / broche / plate / drink sont 4 cadrages tirés de la même prise de vue comptoir. */
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

const EMOJI = {
  kebabs: '🌯', burgers: '🍔', tacos: '🌮', assiettes: '🍽️',
  menus: '🥡', boissons: '🥤', desserts: '🍰', chichas: '💨',
};

const PRODUCTS = [
  { id: 'kebab-classique', name: 'Kebab Classique', description: 'Pain pita, viande grillée, crudités fraîches et sauce blanche maison.', price: 8.5, image: IMG.durum, category: 'kebabs', badge: 'bestseller', rating: 4.9 },
  { id: 'durum-poulet', name: 'Durum Poulet', description: 'Galette roulée grillée, poulet mariné, frites et sauce samouraï.', price: 9.0, image: IMG.tacosAlt, category: 'kebabs', badge: 'loved', rating: 4.8 },
  { id: 'double-cheese', name: 'Double Cheeseburger', description: 'Deux steaks hachés, cheddar fondu, bacon croustillant, sauce maison.', price: 10.5, image: IMG.burger, category: 'burgers', badge: 'bestseller', rating: 4.9 },
  { id: 'burger-sara', name: 'Burger Sara', description: 'Steak 150g, cheddar, oignons confits, sauce signature Sara.', price: 9.5, image: IMG.burgerAlt, category: 'burgers', rating: 4.7 },
  { id: 'tacos-lyonnais', name: 'Tacos XL', description: 'Galette grillée, viande au choix, frites, sauce fromagère onctueuse.', price: 9.0, image: IMG.tacos, category: 'tacos', badge: 'loved', rating: 4.8 },
  { id: 'assiette-mixte', name: 'Assiette Mixte', description: 'Brochettes de poulet et bœuf, riz safran, frites, salade, sauces.', price: 13.5, image: IMG.assiette, category: 'assiettes', badge: 'bestseller', rating: 4.9 },
  { id: 'assiette-poulet', name: 'Assiette Poulet', description: 'Émincé de poulet grillé, frites maison, crudités et sauce blanche.', price: 11.5, image: IMG.assietteAlt, category: 'assiettes', rating: 4.6 },
  { id: 'menu-etudiant', name: 'Menu Étudiant', description: 'Kebab + frites + boisson au choix. Le meilleur rapport qualité-prix.', price: 9.9, image: IMG.plate, category: 'menus', badge: 'bestseller', rating: 4.8 },
  { id: 'menu-famille', name: 'Menu Famille', description: '4 kebabs + grandes frites + 4 boissons. Idéal pour partager.', price: 32.0, image: IMG.broche, category: 'menus', rating: 4.7 },
  { id: 'soda', name: 'Boisson 33cl', description: 'Coca, Fanta, Sprite, eau plate ou pétillante au choix.', price: 2.5, image: IMG.drink, category: 'boissons', rating: 4.5 },
  { id: 'baklava', name: 'Assortiment Baklava', description: 'Pâtisseries orientales au miel et pistaches, fait maison.', price: 4.5, image: null, category: 'desserts', badge: 'loved', rating: 4.9 },
  { id: 'chicha-classique', name: 'Chicha Classique', description: 'Chicha premium, parfum au choix. Installation et service inclus.', price: 15.0, image: IMG.chicha, category: 'chichas', badge: 'bestseller', rating: 4.8 },
];

const OFFERS = [
  '🔥 Menu Kebab + Boisson à 9.90 CHF',
  '🚚 Livraison offerte dès 20.- CHF',
  '💨 Happy Hour Chicha — 15.- CHF',
  '🎓 Menu étudiant toute la journée',
  '🍰 Dessert offert pour toute commande +25.- CHF',
];

const GALLERY = [
  { src: IMG.durum, alt: 'Kebab roulé, crudités et sauce blanche', emoji: '🌯' },
  { src: IMG.burger, alt: 'Double cheeseburger et frites maison', emoji: '🍔' },
  { src: IMG.assiette, alt: 'Assiette mixte brochettes, riz safran et frites', emoji: '🍽️' },
  { src: IMG.salle, alt: 'La salle du restaurant Sara', emoji: '🪑' },
  { src: IMG.tacos, alt: 'Tacos XL galette grillée, poulet et sauce fromagère', emoji: '🌮' },
  { src: IMG.chicha, alt: "Espace chicha à l'ambiance tamisée", emoji: '💨' },
];

const REVIEWS = [
  { name: 'Yanis B.', rating: 5, comment: 'Meilleur kebab du quartier ! Viande tendre, frites maison, service rapide. Je recommande à 100%.' },
  { name: 'Sarah M.', rating: 5, comment: "L'espace chicha est super cosy et les parfums sont excellents. On a passé une super soirée." },
  { name: 'Karim A.', rating: 5, comment: 'Commande en livraison, tout est arrivé chaud et délicieux. Le double cheeseburger est une tuerie.' },
  { name: 'Léa D.', rating: 4, comment: 'Très bon rapport qualité-prix, le menu étudiant sauve ma vie. Livraison rapide même le soir.' },
];

const HERO_IMAGE = IMG.hero;

const chf = (n) => {
  const v = Math.round(n * 100) / 100;
  return Number.isInteger(v) ? `${v}.- CHF` : `${v.toFixed(2)} CHF`;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function Img({ src, alt, className = '', emoji = '🍽️' }) {
  const [err, setErr] = useState(false);
  if (err || !src) {
    return (
      <div className={`${className} sara-placeholder flex flex-col items-center justify-center gap-1`} role="img" aria-label={alt}>
        <span className="text-4xl" aria-hidden="true">{emoji}</span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-sara-black/40">Photo à venir</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setErr(true)} />;
}

function Wave({ fill }) {
  return (
    <svg className="sara-wave" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,44 C210,96 400,-6 720,32 C1010,66 1230,4 1440,40 L1440,90 L0,90 Z" fill={fill} />
      <path d="M0,44 C210,96 400,-6 720,32 C1010,66 1230,4 1440,40" fill="none" stroke="#D62828" strokeWidth="3" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Reveal({ children, delay = 0, className = '', ...rest }) {
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
    <div ref={ref} className={`reveal ${seen ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CartContext (sans localStorage — interdit dans les artefacts)      */
/* ------------------------------------------------------------------ */

const CartContext = createContext(null);

function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState(null);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...product, qty: 1 }];
    });
    setFlash(product.id);
    setTimeout(() => setFlash(null), 600);
  }, []);

  const removeItem = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);

  const setQty = useCallback((id, qty) => {
    if (qty <= 0) { setItems((prev) => prev.filter((i) => i.id !== id)); return; }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, open, setOpen, addItem, removeItem, setQty, clear, count, total, flash }}>
      {children}
    </CartContext.Provider>
  );
}

const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

const LINKS = [
  { href: '#accueil', label: 'Accueil' },
  { href: '#menu', label: 'Menu' },
  { href: '#commander', label: 'Commander' },
  { href: '#reserver', label: 'Réserver' },
  { href: '#chicha', label: 'Chicha' },
  { href: '#promos', label: 'Promotions' },
  { href: '#contact', label: 'Contact' },
];

function Header() {
  const { count, setOpen } = useCart();
  const [mobile, setMobile] = useState(false);

  return (
    <header className="relative z-50 bg-sara-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="sara-header grid grid-cols-3 items-center">
          <div className="flex justify-start">
            <button onClick={() => setMobile(true)} className="p-2 -ml-2 text-sara-black hover:text-sara-red transition-colors" aria-label="Ouvrir le menu">
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex justify-center">
            <a href="#accueil" aria-label="Sara Pizzeraya Kebap — accueil">
              <img src={IMG.logo} alt="Sara Pizzeraya Kebap" className="sara-logo" />
            </a>
          </div>
          <div className="flex justify-end">
            <button onClick={() => setOpen(true)} className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sara-red text-white font-semibold text-sm glow-red hover:bg-sara-red-dark active:scale-95 transition">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Panier</span>
              {count > 0 && <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-sara-black text-white text-xs font-bold flex items-center justify-center">{count}</span>}
            </button>
          </div>
        </div>
      </div>

      {mobile && (
        <div className="fixed inset-0 z-60">
          <div className="absolute inset-0 bg-sara-black/40 fade-in" onClick={() => setMobile(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-extrabold text-xl text-sara-black">Menu</span>
              <button onClick={() => setMobile(false)} aria-label="Fermer"><X className="w-6 h-6 text-sara-black" /></button>
            </div>
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobile(false)} className="px-3 py-3 text-base font-medium text-sara-black hover:bg-sara-red/5 hover:text-sara-red rounded-lg">{l.label}</a>
            ))}
            <a href="#contact" onClick={() => setMobile(false)} className="mt-4 px-4 py-3 text-center rounded-xl bg-sara-black text-white font-semibold">Connexion</a>
          </div>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function Hero() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % OFFERS.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="accueil" className="relative overflow-hidden bg-sara-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-0 pb-24 md:pt-16 md:pb-28">
        <div className="hero-grid fade-up">

          {/* 1. Photo + prix d'appel */}
          <div className="hero-media">
            <div className="relative">
              <div className="relative aspect-4-3 md:aspect-6-5 overflow-hidden">
                <Img src={HERO_IMAGE} emoji="🥙" alt="Kebab grillé minute avec frites croustillantes et boisson fraîche" className="w-full h-full object-cover" />
              </div>
              <div className="promo-chip absolute left-3 right-3 bottom-0 translate-y-1/2 flex items-center justify-between gap-3 bg-white border-l-4 border-sara-red px-4 py-4 sm:py-5">
                <span key={idx} className="promo-pop min-w-0 truncate text-sm sm:text-base font-bold text-sara-black">{OFFERS[idx]}</span>
                <span className="flex items-center justify-center w-7 h-7 shrink-0 rounded-lg bg-sara-red/10">
                  <ChevronRight className="w-4 h-4 text-sara-red" />
                </span>
              </div>
            </div>
          </div>

          {/* 2. Titre */}
          <div className="hero-title text-center">
            <h1 className="sara-hero-title font-display font-extrabold italic text-4xl sm:text-5xl md:text-6xl leading-tightest text-sara-black">
              Sara, le goût qui <span className="text-sara-red">donne envie</span> de revenir.
            </h1>
          </div>


          {/* 3. Meilleures ventes */}
          <div className="hero-best">
            <BestSellers inline />
          </div>

          {/* 4. Actions */}
          <div className="hero-cta flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#commander" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-sara-red text-white font-bold text-base glow-red-lg hover:bg-sara-red-dark active:scale-95 transition">
              <ShoppingBag className="w-5 h-5" /> Commander maintenant
            </a>
          </div>

        </div>
      </div>

      <Wave fill="#FFFFFF" />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  QuickOrder                                                         */
/* ------------------------------------------------------------------ */

function Field({ icon: Icon, label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-sara-black/60 uppercase tracking-wide">{label}</span>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-sara-black/10 bg-white px-3 py-2.5 focus-ring transition">
        {Icon && <Icon className="w-4 h-4 text-sara-black/40 shrink-0" />}
        {children}
      </div>
    </label>
  );
}

const inputCls = 'w-full bg-transparent outline-none text-sm font-medium text-sara-black placeholder-sara';

function QuickOrder() {
  const [mode, setMode] = useState('livraison');
  const [orderDone, setOrderDone] = useState(false);
  const [resDone, setResDone] = useState(false);
  const [askMeal, setAskMeal] = useState(false);

  return (
    <section id="commander" className="relative overflow-hidden pt-10 pb-24 md:pt-12 md:pb-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-sara-black">Commandez ou réservez en 30 secondes</h2>
          <p className="mt-3 text-sara-black/60">Choisissez ce qui vous convient. Tout est pensé pour aller vite.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Reveal className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-sara-black/5">
            <div className="flex items-center gap-3 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sara-red/10 text-sara-red"><Bike className="w-5 h-5" /></span>
              <div><h3 className="font-display font-bold text-xl text-sara-black">Commander</h3><p className="text-sm text-sara-black/60">Livraison ou à emporter</p></div>
            </div>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-sara-black/5 mb-5">
              {[{ id: 'livraison', label: 'Livraison', icon: Bike }, { id: 'emporter', label: 'À emporter', icon: Store }].map((m) => (
                <button key={m.id} onClick={() => setMode(m.id)} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${mode === m.id ? 'bg-white text-sara-red shadow-sm' : 'text-sara-black/60'}`}>
                  <m.icon className="w-4 h-4" />{m.label}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {mode === 'livraison'
                ? <Field icon={MapPin} label="Adresse de livraison"><input className={inputCls} placeholder="12 rue des Lilas, Lyon" /></Field>
                : <Field icon={Store} label="Restaurant de retrait"><input className={inputCls} placeholder="Sara — 12 rue des Lilas" /></Field>}
              <Field icon={Clock} label="Heure souhaitée">
                <select className={inputCls} defaultValue=""><option value="" disabled>Choisir une heure</option><option>Dès que possible</option><option>19:00</option><option>19:30</option><option>20:00</option><option>20:30</option></select>
              </Field>
            </div>
            <a href="#menu" onClick={() => setOrderDone(true)} className="mt-5 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-sara-red text-white font-bold glow-red hover:bg-sara-red-dark active:scale-95 transition">
              {orderDone ? <Check className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
              {orderDone ? 'Choisissez vos plats' : 'Commander'}
            </a>
          </Reveal>

          <Reveal delay={100} id="reserver" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-sara-black/5">
            <div className="flex items-center gap-3 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sara-black/10 text-sara-black"><CalendarDays className="w-5 h-5" /></span>
              <div><h3 className="font-display font-bold text-xl text-sara-black">Réserver une table</h3><p className="text-sm text-sara-black/60">On vous garde une place</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field icon={CalendarDays} label="Date"><input type="date" className={inputCls} /></Field>
              <Field icon={Clock} label="Heure"><select className={inputCls} defaultValue=""><option value="" disabled>Heure</option><option>19:00</option><option>19:30</option><option>20:00</option><option>20:30</option><option>21:00</option></select></Field>
              <div className="col-span-2">
                <Field icon={Users} label="Nombre de personnes">
                  <select className={inputCls} defaultValue="2"><option value="1">1 personne</option><option value="2">2 personnes</option><option value="3">3 personnes</option><option value="4">4 personnes</option><option value="5">5 personnes</option><option value="6">6 personnes ou plus</option></select>
                </Field>
              </div>
            </div>
            <button onClick={() => { setResDone(true); setAskMeal(true); }} className="mt-5 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-sara-black text-white font-bold hover:bg-sara-black/90 active:scale-95 transition">
              {resDone ? <Check className="w-5 h-5" /> : <CalendarDays className="w-5 h-5" />}
              {resDone ? 'Réservation confirmée' : 'Réserver'}
            </button>
            {askMeal && (
              <div className="fade-in mt-4 rounded-2xl bg-sara-yellow/15 border border-sara-yellow/40 p-4">
                <p className="text-sm font-semibold text-sara-black">Souhaitez-vous ajouter votre repas à votre réservation ?</p>
                <div className="mt-3 flex gap-2">
                  <a href="#menu" className="flex-1 text-center py-2.5 rounded-xl bg-sara-green text-white font-semibold text-sm hover:opacity-90 transition">Ajouter des plats</a>
                  <button onClick={() => setAskMeal(false)} className="px-4 py-2.5 rounded-xl bg-white text-sara-black font-semibold text-sm border border-sara-black/10">Plus tard</button>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </div>

      <Wave fill="#FAFAFA" />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  BestSellers                                                        */
/* ------------------------------------------------------------------ */

function Badge({ type }) {
  if (type === 'bestseller') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sara-red text-white text-[11px] font-bold shadow-sm whitespace-nowrap"><Flame className="w-3 h-3" /> Bestseller</span>;
  if (type === 'loved') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sara-yellow text-sara-black text-[11px] font-bold shadow-sm whitespace-nowrap"><Heart className="w-3 h-3" /> Le plus commandé</span>;
  return null;
}

function BestSellers({ inline = false }) {
  const { addItem, flash } = useCart();
  const items = PRODUCTS.filter((p) => p.badge).slice(0, 4);
  return (
    <section className={inline ? '' : 'py-16 md:py-20 bg-white'}>
      <div className={inline ? '' : 'max-w-7xl mx-auto px-4 sm:px-6'}>
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-sm font-bold text-sara-red uppercase tracking-wide">Les favoris</span>
            <h2 className="mt-1 font-display font-extrabold text-3xl sm:text-4xl text-sara-black">Nos meilleures ventes</h2>
          </div>
          <a href="#menu" className="hidden sm:inline-flex text-sm font-semibold text-sara-red hover:underline">Voir tout le menu →</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <article className="group h-full bg-white rounded-3xl border border-sara-black/5 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col">
                <div className="relative aspect-4-3 overflow-hidden">
                  <Img src={p.image} emoji={EMOJI[p.category]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 left-2"><Badge type={p.badge} /></div>
                </div>
                <div className="p-2.5 sm:p-3 flex flex-col flex-1">
                  <div className="flex items-center gap-1 mb-1"><Star className="w-3.5 h-3.5 fill-sara-yellow text-sara-yellow" /><span className="text-xs font-bold text-sara-black">{p.rating}</span></div>
                  <h3 className="font-bold text-xs sm:text-sm text-sara-black leading-tight">{p.name}</h3>
                  <p className="mt-0.5 text-[11px] text-sara-black/60 clamp-2 leading-snug flex-1">{p.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-display font-extrabold text-sm sm:text-base text-sara-black whitespace-nowrap">{chf(p.price)}</span>
                    <button onClick={() => addItem(p)} className={`inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-sara-red text-white glow-red hover:bg-sara-red-dark active:scale-95 transition ${flash === p.id ? 'scale-110' : ''}`} aria-label={`Ajouter ${p.name} au panier`}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
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
/*  MenuSection                                                        */
/* ------------------------------------------------------------------ */

function MenuSection() {
  const [open, setOpen] = useState(false);

  // tout lien pointant vers #menu ouvre la carte (en-tête, favoris, chicha, pied de page)
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target && e.target.closest && e.target.closest('a[href="#menu"]');
      if (a) setOpen(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <>
      <section id="menu" className="relative overflow-hidden bg-sara-cream">
        <button
          onClick={() => setOpen(true)}
          className="menu-band w-full text-center px-4 py-14 md:py-16 transition"
        >
          <span className="text-sm font-bold text-sara-red uppercase tracking-wide">Le menu</span>
          <h2 className="mt-1 font-display font-extrabold text-3xl sm:text-4xl text-sara-black">Trouvez votre craving</h2>
          <span className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sara-red text-white text-sm font-bold glow-red">
            Voir la carte <ChevronRight className="w-4 h-4" />
          </span>
        </button>

        <Wave fill="#1F1F1F" />
      </section>

      {open && <MenuOverlay onClose={() => setOpen(false)} />}
    </>
  );
}

function MenuOverlay({ onClose }) {
  const [active, setActive] = useState('kebabs');
  const { addItem, flash } = useCart();
  const items = PRODUCTS.filter((p) => p.category === active);

  return (
    <div className="fixed inset-0 z-55 flex flex-col bg-sara-cream fade-in">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-16 bg-white border-b border-sara-black/5 shrink-0">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-sara-red uppercase tracking-wide leading-none">Le menu</p>
          <p className="mt-1 font-display font-extrabold text-lg text-sara-black leading-none truncate">Trouvez votre craving</p>
        </div>
        <button onClick={onClose} className="p-2 -mr-2 text-sara-black hover:text-sara-red transition-colors" aria-label="Fermer la carte">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="px-4 sm:px-6 py-3 border-b border-sara-black/5 shrink-0 bg-sara-cream">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setActive(c.id)} className={`shrink-0 px-4 py-2.5 rounded-2xl text-sm font-semibold transition ${active === c.id ? 'bg-sara-red text-white glow-red' : 'bg-white text-sara-black/70 border border-sara-black/5 hover:border-sara-red/30'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
        <div key={active} className="fade-up grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {items.map((p) => (
            <article key={p.id} className="group bg-white rounded-3xl border border-sara-black/5 shadow-sm hover:shadow-xl transition overflow-hidden flex flex-col">
              <div className="relative aspect-4-3 overflow-hidden">
                <Img src={p.image} emoji={EMOJI[p.category]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-2.5 sm:p-3 flex flex-col flex-1">
                <div className="flex items-center gap-1 mb-1"><Star className="w-3.5 h-3.5 fill-sara-yellow text-sara-yellow" /><span className="text-xs font-bold text-sara-black">{p.rating}</span></div>
                <h3 className="font-bold text-xs sm:text-sm text-sara-black leading-tight">{p.name}</h3>
                <p className="mt-0.5 text-[11px] text-sara-black/60 clamp-2 leading-snug flex-1">{p.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-display font-extrabold text-sm sm:text-base text-sara-black whitespace-nowrap">{chf(p.price)}</span>
                  <button onClick={() => addItem(p)} className={`inline-flex items-center gap-1 px-2 sm:px-2.5 h-8 sm:h-9 rounded-lg bg-sara-red text-white text-xs font-semibold glow-red hover:bg-sara-red-dark active:scale-95 transition ${flash === p.id ? 'scale-105' : ''}`}>
                    <Plus className="w-3.5 h-3.5" /> Ajouter
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ChichaReservation                                                  */
/* ------------------------------------------------------------------ */

const FLAVORS = ['Menthe fraîche', 'Pomme double', 'Fraise', 'Raisin', 'Pastèque', 'Bubble Gum'];
const DRINKS = PRODUCTS.filter((p) => p.category === 'boissons');
const FOOD = PRODUCTS.filter((p) => ['kebabs', 'assiettes', 'menus'].includes(p.category));

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition ${active ? 'bg-sara-red text-white border-sara-red' : 'bg-white text-sara-black/70 border-sara-black/10 hover:border-sara-red/40'}`}>
      {children}
    </button>
  );
}

function ChichaReservation() {
  const [flavor, setFlavor] = useState(FLAVORS[0]);
  const [count, setCount] = useState(1);
  const [added, setAdded] = useState({ drinks: [], food: [] });
  const [done, setDone] = useState(false);

  const toggle = (group, item) => {
    setAdded((prev) => {
      const exists = prev[group].find((x) => x.id === item.id);
      return { ...prev, [group]: exists ? prev[group].filter((x) => x.id !== item.id) : [...prev[group], item] };
    });
  };

  const extras = [...added.drinks, ...added.food].reduce((s, x) => s + x.price, 0);

  return (
    <section id="chicha" className="py-16 md:py-20 bg-sara-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sara-red/20 text-sara-yellow text-sm font-semibold mb-4"><Wind className="w-4 h-4" /> Espace Chicha</span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl leading-tight">Réservez votre coin chicha</h2>
            <p className="mt-4 text-white/70 leading-relaxed max-w-md">Chicha premium, parfums variés, ambiance cosy. Réservez juste une chicha ou une table avec repas — c'est vous qui choisissez.</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-white/60 uppercase">Date</span>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5"><CalendarDays className="w-4 h-4 text-white/60" /><input type="date" className="w-full bg-transparent outline-none text-sm text-white" /></div>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-white/60 uppercase">Heure</span>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5"><Clock className="w-4 h-4 text-white/60" /><select className="w-full bg-transparent outline-none text-sm text-white"><option className="text-sara-black">19:00</option><option className="text-sara-black">20:00</option><option className="text-sara-black">21:00</option><option className="text-sara-black">22:00</option></select></div>
              </label>
              <label className="block col-span-2">
                <span className="text-xs font-semibold text-white/60 uppercase">Personnes</span>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5"><Users className="w-4 h-4 text-white/60" /><select className="w-full bg-transparent outline-none text-sm text-white"><option className="text-sara-black">1 personne</option><option className="text-sara-black">2 personnes</option><option className="text-sara-black">3 personnes</option><option className="text-sara-black">4 personnes ou plus</option></select></div>
              </label>
            </div>

            <div className="mt-5">
              <span className="text-xs font-semibold text-white/60 uppercase">Parfum</span>
              <div className="mt-2 flex flex-wrap gap-2">{FLAVORS.map((f) => <Chip key={f} active={flavor === f} onClick={() => setFlavor(f)}>{f}</Chip>)}</div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
              <span className="text-sm font-semibold">Nombre de chichas</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setCount((c) => Math.max(1, c - 1))} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 font-bold" aria-label="Retirer une chicha">−</button>
                <span className="w-6 text-center font-bold">{count}</span>
                <button onClick={() => setCount((c) => c + 1)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 font-bold" aria-label="Ajouter une chicha">+</button>
              </div>
            </div>

            <button onClick={() => setDone(true)} className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-sara-red text-white font-bold glow-red hover:bg-sara-red-dark active:scale-95 transition">
              {done ? <Check className="w-5 h-5" /> : <Wind className="w-5 h-5" />}{done ? 'Réservation confirmée' : 'Réserver la chicha'}
            </button>
          </Reveal>

          <Reveal delay={100} className="bg-white/5 rounded-3xl p-6 border border-white/10">
            <h3 className="font-display font-bold text-xl mb-1">Complétez votre soirée</h3>
            <p className="text-sm text-white/60 mb-5">Ajoutez boissons et nourriture à votre réservation.</p>

            <p className="text-xs font-semibold text-white/60 uppercase mb-2">Boissons</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {DRINKS.map((d) => {
                const on = added.drinks.find((x) => x.id === d.id);
                return (
                  <button key={d.id} onClick={() => toggle('drinks', d)} className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${on ? 'bg-sara-green/90 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>
                    <span className="truncate">{d.name}</span><Plus className={`w-4 h-4 shrink-0 transition ${on ? 'rotate-45' : ''}`} />
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-semibold text-white/60 uppercase mb-2">Nourriture</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {FOOD.map((d) => {
                const on = added.food.find((x) => x.id === d.id);
                return (
                  <button key={d.id} onClick={() => toggle('food', d)} className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${on ? 'bg-sara-green/90 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>
                    <span className="truncate">{d.name}</span><Plus className={`w-4 h-4 shrink-0 transition ${on ? 'rotate-45' : ''}`} />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-white/70 text-sm">Total estimé</span>
              <span className="font-display font-extrabold text-2xl text-sara-yellow">{chf(15 * count + extras)}</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Gallery                                                            */
/* ------------------------------------------------------------------ */

function Gallery() {
  const [i, setI] = useState(0);
  const n = GALLERY.length;
  const next = useCallback(() => setI((p) => (p + 1) % n), [n]);
  const prev = () => setI((p) => (p - 1 + n) % n);
  useEffect(() => { const t = setInterval(next, 4000); return () => clearInterval(t); }, [next]);

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-sm font-bold text-sara-red uppercase tracking-wide">En images</span>
          <h2 className="mt-1 font-display font-extrabold text-3xl sm:text-4xl text-sara-black">L'ambiance Sara</h2>
        </div>
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          <div className="aspect-16-9 sm:aspect-21-9">
            <Img key={i} src={GALLERY[i].src} emoji={GALLERY[i].emoji} alt={GALLERY[i].alt} className="fade-in w-full h-full object-cover" />
          </div>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white" aria-label="Précédent"><ChevronLeft className="w-5 h-5 text-sara-black" /></button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white" aria-label="Suivant"><ChevronRight className="w-5 h-5 text-sara-black" /></button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {GALLERY.map((_, idx) => <button key={idx} onClick={() => setI(idx)} className={`h-2 rounded-full transition-all ${idx === i ? 'w-6 bg-sara-red' : 'w-2 bg-white/90'}`} aria-label={`Image ${idx + 1}`} />)}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-6 gap-3">
          {GALLERY.map((g, idx) => (
            <button key={idx} onClick={() => setI(idx)} className={`aspect-square rounded-xl overflow-hidden border-2 transition ${idx === i ? 'border-sara-red' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              <Img src={g.src} emoji={g.emoji} alt={g.alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Reviews                                                            */
/* ------------------------------------------------------------------ */

function Reviews() {
  const avg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);
  return (
    <section className="py-16 md:py-20 bg-sara-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-sm font-bold text-sara-red uppercase tracking-wide">Avis clients</span>
          <h2 className="mt-1 font-display font-extrabold text-3xl sm:text-4xl text-sara-black">Ils reviennent chez Sara</h2>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm">
            <Star className="w-5 h-5 fill-sara-yellow text-sara-yellow" />
            <span className="font-bold text-sara-black">{avg} / 5</span>
            <span className="text-sara-black/50 text-sm">· 1200+ avis</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 80}>
              <article className="h-full bg-white rounded-3xl p-6 shadow-sm border border-sara-black/5">
                <Quote className="w-6 h-6 text-sara-red/20 mb-3" />
                <div className="flex gap-0.5 mb-3">{Array.from({ length: 5 }).map((_, s) => <Star key={s} className={`w-4 h-4 ${s < r.rating ? 'fill-sara-yellow text-sara-yellow' : 'text-sara-black/15'}`} />)}</div>
                <p className="text-sm text-sara-black/80 leading-relaxed">{r.comment}</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-sara-red/10 text-sara-red font-bold text-sm">{r.name.charAt(0)}</span>
                  <span className="font-semibold text-sara-black text-sm">{r.name}</span>
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
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer id="contact" className="bg-sara-black text-white">
      <div id="promos" className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-sara-yellow text-sara-black text-xs font-bold">Promos</span>
            <h3 className="font-display font-bold text-lg">Offres du moment</h3>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {OFFERS.map((o) => <div key={o} className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm font-semibold">{o}</div>)}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-sara-red text-white font-display font-extrabold text-xl">S</span>
              <span className="font-display font-extrabold text-2xl">Sara</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">Kebabs, burgers, tacos, assiettes et espace chicha. Le goût qui donne envie de revenir.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wide text-white/60">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-white/80"><MapPin className="w-4 h-4 mt-0.5 shrink-0 text-sara-red" />12 rue des Lilas, 69001 Lyon</li>
              <li className="flex items-center gap-2 text-white/80"><Phone className="w-4 h-4 shrink-0 text-sara-red" /><a href="tel:+33400000000" className="hover:text-white">04 00 00 00 00</a></li>
              <li className="flex items-start gap-2 text-white/80"><Clock className="w-4 h-4 mt-0.5 shrink-0 text-sara-red" />Lun–Jeu : 11h–23h<br />Ven–Sam : 11h–01h · Dim : 16h–23h</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wide text-white/60">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {[['#menu', 'Menu'], ['#commander', 'Commander'], ['#reserver', 'Réserver'], ['#chicha', 'Chicha'], ['#promos', 'Promotions']].map(([h, l]) => (
                <li key={h}><a href={h} className="text-white/80 hover:text-white">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wide text-white/60">Suivez-nous</h4>
            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-sara-red flex items-center justify-center transition" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-sara-red flex items-center justify-center font-bold text-sm transition" aria-label="TikTok">TT</a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-sara-red flex items-center justify-center transition" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
            </div>
            <a href="https://maps.google.com/?q=12+rue+des+Lilas+Lyon" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sara-red text-white text-sm font-semibold hover:bg-sara-red-dark transition">
              <MapPin className="w-4 h-4" /> Voir sur Google Maps
            </a>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Sara. Tous droits réservés.</p>
          <div className="flex gap-4"><a href="#" className="hover:text-white">Mentions légales</a><a href="#" className="hover:text-white">CGV</a><a href="#" className="hover:text-white">Confidentialité</a></div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  CartDrawer                                                         */
/* ------------------------------------------------------------------ */

const FREE_DELIVERY_THRESHOLD = 20;
const DELIVERY_FEE = 2.9;

function CartDrawer() {
  const { items, open, setOpen, setQty, removeItem, total, count, clear } = useCart();
  if (!open) return null;

  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - total);
  const delivery = total >= FREE_DELIVERY_THRESHOLD || total === 0 ? 0 : DELIVERY_FEE;
  const grandTotal = total + delivery;

  return (
    <div className="fixed inset-0 z-60">
      <div className="absolute inset-0 bg-sara-black/50 backdrop-blur-sm fade-in" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col fade-in">
        <div className="flex items-center justify-between p-5 border-b border-sara-black/5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-sara-red" />
            <h2 className="font-display font-bold text-lg text-sara-black">Mon panier</h2>
            {count > 0 && <span className="px-2 py-0.5 rounded-full bg-sara-red/10 text-sara-red text-xs font-bold">{count}</span>}
          </div>
          <button onClick={() => setOpen(false)} aria-label="Fermer le panier"><X className="w-6 h-6 text-sara-black" /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <span className="w-16 h-16 rounded-full bg-sara-cream flex items-center justify-center mb-4"><ShoppingBag className="w-8 h-8 text-sara-black/30" /></span>
            <p className="font-semibold text-sara-black">Votre panier est vide</p>
            <p className="text-sm text-sara-black/50 mt-1">Ajoutez vos plats préférés du menu.</p>
            <button onClick={() => setOpen(false)} className="mt-5 px-5 py-2.5 rounded-xl bg-sara-red text-white font-semibold text-sm hover:bg-sara-red-dark transition">Voir le menu</button>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 bg-sara-cream border-b border-sara-black/5">
              {remaining > 0
                ? <p className="text-xs text-sara-black/70">Plus que <span className="font-bold text-sara-red">{chf(remaining)}</span> pour la livraison offerte 🚚</p>
                : <p className="text-xs font-bold text-sara-green">🎉 Livraison offerte débloquée !</p>}
              <div className="mt-2 h-1.5 rounded-full bg-sara-black/10 overflow-hidden">
                <div className="h-full bg-sara-green transition-all duration-500" style={{ width: `${Math.min(100, (total / FREE_DELIVERY_THRESHOLD) * 100)}%` }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.map((it) => (
                <div key={it.id} className="flex gap-3 rounded-2xl border border-sara-black/5 p-2">
                  <Img src={it.image} emoji={EMOJI[it.category]} alt={it.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-sara-black truncate">{it.name}</p>
                    <p className="text-sm font-bold text-sara-red">{chf(it.price)}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <button onClick={() => setQty(it.id, it.qty - 1)} className="w-7 h-7 rounded-lg bg-sara-cream hover:bg-sara-black/10 flex items-center justify-center" aria-label="Diminuer"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="w-5 text-center text-sm font-bold">{it.qty}</span>
                      <button onClick={() => setQty(it.id, it.qty + 1)} className="w-7 h-7 rounded-lg bg-sara-cream hover:bg-sara-black/10 flex items-center justify-center" aria-label="Augmenter"><Plus className="w-3.5 h-3.5" /></button>
                      <button onClick={() => removeItem(it.id)} className="ml-auto w-7 h-7 rounded-lg text-sara-black/40 hover:text-sara-red flex items-center justify-center" aria-label="Retirer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-sara-black self-center">{chf(it.price * it.qty)}</span>
                </div>
              ))}
              <button onClick={clear} className="text-xs text-sara-black/40 hover:text-sara-red font-medium">Vider le panier</button>
            </div>

            <div className="p-5 border-t border-sara-black/5 space-y-2">
              <div className="flex justify-between text-sm text-sara-black/70"><span>Sous-total</span><span>{chf(total)}</span></div>
              <div className="flex justify-between text-sm text-sara-black/70"><span>Livraison</span><span>{delivery === 0 ? 'Offerte' : chf(delivery)}</span></div>
              <div className="flex justify-between font-display font-extrabold text-lg text-sara-black pt-2 border-t border-sara-black/5"><span>Total</span><span>{chf(grandTotal)}</span></div>
              <button className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-sara-green text-white font-bold glow-green hover:opacity-90 active:scale-95 transition">
                <Bike className="w-5 h-5" /> Payer en ligne
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StickyCartBar                                                      */
/* ------------------------------------------------------------------ */

function StickyCartBar() {
  const { count, total, setOpen } = useCart();
  if (count === 0) return null;
  return (
    <button onClick={() => setOpen(true)} className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-cart-bar max-w-md flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-sara-red text-white glow-red-lg backdrop-blur md:hidden">
      <span className="flex items-center gap-2 font-bold">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-sara-red text-sm">{count}</span>
        Voir le panier
      </span>
      <span className="font-display font-extrabold">{chf(total)}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SaraSite() {
  return (
    <CartProvider>
      <div className="sara-root min-h-screen bg-sara-cream">
        <a href="#menu" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-70 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-sara-black focus:text-white">Aller au menu</a>
        <Header />
        <main>
          <Hero />
          <QuickOrder />
          <MenuSection />
          <ChichaReservation />
          <Gallery />
          <Reviews />
        </main>
        <Footer />
        <CartDrawer />
        <StickyCartBar />
      </div>
    </CartProvider>
  );
}
