import { createContext, useContext, useState, useEffect } from 'react';

// Espace client : auth par cookie de session (sara_session, HttpOnly), pas de
// JWT ni de token stocké côté client — voir server/api.ts. Ce contexte ne
// contient aucune UI, seulement l'état + les appels réseau ; les écrans
// (connexion, inscription, profil) sont construits par-dessus.

const AuthContext = createContext(null);

async function apiFetch(path, opts) {
  const r = await fetch(`/api${path}`, { ...opts, credentials: 'include' });
  if (!r.ok) {
    const body = await r.json().catch(() => ({ error: 'Erreur inconnue' }));
    throw new Error(body.error ?? 'Requête échouée');
  }
  return r.json();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => { if (u) setUser(u); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    const u = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setUser(u.user);
    return u.user;
  };

  const register = async (data) => {
    const u = await apiFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setUser(u.user);
    return u.user;
  };

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  const updateProfile = async (data) => {
    const updated = await apiFetch('/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setUser(updated);
    return updated;
  };

  const changePassword = async (currentPassword, newPassword) => {
    await apiFetch('/me/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  };

  const refreshUser = async () => {
    const u = await apiFetch('/me');
    setUser(u);
  };

  const toggleFavorite = async (itemId) => {
    const { favorites } = await apiFetch('/me/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId }),
    });
    setUser((u) => (u ? { ...u, favorites } : u));
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, updateProfile, changePassword, refreshUser, toggleFavorite }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
