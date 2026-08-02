import { createContext, useContext, useState, useEffect } from 'react';

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
