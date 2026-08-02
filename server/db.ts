import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

// Singleton Supabase — un seul client créé pour tout le process (pas de
// recréation à chaque appel). Clé service_role : bypass RLS côté backend.
let _sb: SupabaseClient | null = null;
function sb(): SupabaseClient {
  if (_sb) return _sb;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL et SUPABASE_KEY requis");
  _sb = createClient(url, key);
  return _sb;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
// IDs applicatifs (pas des uuid Postgres) : générés en hex non devinable côté
// serveur. Sur les commandes, cet ID sert aussi de secret implicite pour le
// suivi public (voir Phase 3/4) — d'où le besoin d'un espace suffisamment large.

export function generateId(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
}

// ── Santé DB (vérifie la connexion Supabase au démarrage / via /api/health) ──

export async function pingDb(): Promise<boolean> {
  const { error } = await sb().from("users").select("id", { head: true, count: "exact" }).limit(1);
  return !error;
}

// Les fonctions users/sessions/orders (createUser, findUserByEmail,
// createSession, createOrder, ...) arrivent en Phase 2/3, sur le même modèle
// que server/db.ts de Flash Pizzas : mappers rowToX(), comparaison de mot de
// passe à temps constant, sessions en base (pas de JWT).
