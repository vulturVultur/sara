import { createContext, useContext, useState, useEffect } from 'react';
import { track } from '../lib/track.js';

// Panier client, persisté en localStorage. Aucune UI ici — le composant
// panier/drawer sera construit par-dessus ce hook.

const STORAGE_KEY = 'sara_cart';

const CartContext = createContext(null);

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Deux lignes ne fusionnent que si nom + prix + personnalisation (desc) sont
// identiques — sinon deux personnalisations différentes du même produit
// écraseraient silencieusement l'une des deux (bug réel corrigé chez Flash
// Pizzas le 5 juillet 2026 : à éviter dès le départ ici).
function sameLine(a, b) {
  return a.name === b.name && a.price === b.price && (a.desc ?? '') === (b.desc ?? '');
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadItems);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item) => {
    track('cart'); // tracking patron : un visiteur a mis qqch au panier
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(item, i));
      if (existing) {
        return prev.map((i) => (i === existing ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (target) => {
    setItems((prev) => prev.filter((i) => !sameLine(target, i)));
  };

  const updateQty = (target, qty) => {
    if (qty <= 0) { removeItem(target); return; }
    setItems((prev) => prev.map((i) => (sameLine(target, i) ? { ...i, quantity: qty } : i)));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  // Paiement cash/sur place — commande créée directement (statut "pending").
  // Compte optionnel : fonctionne aussi en checkout invité (prenom/nom/telephone).
  const placeOrder = async ({ orderType, address, phone, prenom, nom }) => {
    const r = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, desc: i.desc })),
        total,
        orderType,
        address,
        phone,
        prenom,
        nom,
      }),
    });
    if (!r.ok) {
      const body = await r.json().catch(() => ({ error: 'Erreur inconnue' }));
      throw new Error(body.error ?? 'Commande refusée');
    }
    const result = await r.json();
    clearCart();
    return result; // { id, status }
  };

  // Paiement carte — crée une session Stripe Embedded Checkout et renvoie le
  // clientSecret. Ne vide PAS le panier ici : c'est fait après confirmation
  // réelle du paiement (écran de retour Stripe), pas avant.
  const createStripeCheckout = async ({ orderType, address, phone }) => {
    const r = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, desc: i.desc })),
        total,
        orderType,
        address,
        phone,
      }),
    });
    if (!r.ok) {
      const body = await r.json().catch(() => ({ error: 'Erreur inconnue' }));
      throw new Error(body.error ?? 'Impossible de créer le paiement');
    }
    return r.json(); // { clientSecret }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        total,
        count,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        placeOrder,
        createStripeCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans un CartProvider');
  return ctx;
}
