import { useState, useEffect } from 'react';

// Poll GET /api/orders/:id/status toutes les 5s — aucune UI ici, juste l'état.
// L'ID de commande (32 car. hex) sert d'auth implicite : pas besoin d'être
// connecté pour suivre sa propre commande (checkout invité inclus).
export function useOrderStatus(orderId) {
  const [status, setStatus] = useState(null);
  const [orderType, setOrderType] = useState(null);
  const [etaMinutes, setEtaMinutes] = useState(null);
  const [etaReadyAt, setEtaReadyAt] = useState(null);
  const [cancelledByClient, setCancelledByClient] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const r = await fetch(`/api/orders/${orderId}/status`, { credentials: 'include' });
        if (!r.ok || cancelled) return;
        const data = await r.json();
        setStatus(data.status);
        setOrderType(data.orderType);
        setEtaMinutes(data.etaMinutes);
        setEtaReadyAt(data.etaReadyAt);
        setCancelledByClient(data.cancelledByClient);
      } catch {
        // silencieux — le prochain poll réessaiera
      }
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [orderId]);

  const markReceived = async () => {
    if (!orderId) return;
    await fetch(`/api/orders/${orderId}/received`, { method: 'POST', credentials: 'include' });
  };

  // Nécessite un compte (cookie de session) — les commandes invité ne
  // peuvent pas être auto-annulées, seulement suivies. Ne fonctionne que
  // pendant "pending"/"confirmed" (le serveur revalide de toute façon).
  const cancelOrder = async () => {
    if (!orderId) return;
    const r = await fetch(`/api/orders/${orderId}`, { method: 'DELETE', credentials: 'include' });
    if (!r.ok) {
      const body = await r.json().catch(() => ({ error: 'Erreur inconnue' }));
      throw new Error(body.error ?? 'Annulation impossible');
    }
  };

  return { status, orderType, etaMinutes, etaReadyAt, cancelledByClient, markReceived, cancelOrder };
}
