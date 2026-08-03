import { useState, useEffect, useCallback } from 'react';

// Historique des commandes du compte connecté — GET /api/me/orders.
// Même parti pris que les trois hooks voisins : logique et état seulement,
// aucune UI. Le brief laissait le choix entre un fetch direct dans l'écran et
// un hook dédié ; le hook évite d'éparpiller des appels réseau dans le JSX,
// ce que le reste du projet s'interdit.
export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const r = await fetch('/api/me/orders', { credentials: 'include' });
      if (r.status === 401) { setOrders([]); return; } // pas connecté : liste vide, pas une erreur
      if (!r.ok) throw new Error('Historique indisponible');
      const data = await r.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Historique indisponible');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { orders, isLoading, error, reload };
}
