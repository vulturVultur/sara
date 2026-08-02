// Tracking analytics maison (anonyme) pour le dashboard patron.
// Un identifiant visiteur aléatoire est stocké en localStorage. Au plus un
// évènement par type et par jour côté client (le serveur dédoublonne aussi).

function getVisitorId() {
  try {
    let v = localStorage.getItem('sara_vid');
    if (!v || !/^[A-Za-z0-9_-]{8,64}$/.test(v)) {
      v = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)).replace(/[^A-Za-z0-9_-]/g, '');
      localStorage.setItem('sara_vid', v);
    }
    return v;
  } catch {
    return 'anon' + Date.now().toString(36);
  }
}

export function track(type) {
  try {
    const day = new Date().toISOString().slice(0, 10);
    const key = `sara_trk_${type}_${day}`;
    if (localStorage.getItem(key)) return; // déjà envoyé aujourd'hui
    localStorage.setItem(key, '1');
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, visitorId: getVisitorId() }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // localStorage indisponible → on ignore
  }
}
