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

// ── Types publics ──────────────────────────────────────────────────────────────

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  prenom: string;
  nom: string;
  phone: string;
  address: string;
  newsletter: boolean;
  createdAt: string;
  loyaltyCount: number;
  favorites: string[];
  emailVerified: boolean;
  emailVerifToken: string | null;
};

export type Session = {
  token: string;
  userId: string;
  expiresAt: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToUser(r: any): User {
  return {
    id: r.id,
    email: r.email,
    passwordHash: r.password_hash,
    prenom: r.prenom,
    nom: r.nom,
    phone: r.phone ?? "",
    address: r.address ?? "",
    newsletter: r.newsletter ?? false,
    createdAt: r.created_at,
    loyaltyCount: r.loyalty_count ?? 0,
    favorites: r.favorites ?? [],
    emailVerified: r.email_verified ?? false,
    emailVerifToken: r.email_verif_token ?? null,
  };
}

// ── Users ──────────────────────────────────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const { data } = await sb().from("users").select("*").eq("email", email.toLowerCase()).maybeSingle();
  return data ? rowToUser(data) : undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
  const { data } = await sb().from("users").select("*").eq("id", id).maybeSingle();
  return data ? rowToUser(data) : undefined;
}

export async function createUser(
  data: Omit<User, "id" | "passwordHash" | "createdAt" | "loyaltyCount" | "favorites" | "emailVerified" | "emailVerifToken"> & { password: string }
): Promise<User> {
  const salt = generateId();
  const row = {
    id: generateId(),
    email: data.email.toLowerCase(),
    password_hash: `${salt}:${hashPassword(data.password, salt)}`,
    prenom: data.prenom,
    nom: data.nom,
    phone: data.phone,
    address: data.address,
    newsletter: data.newsletter,
    loyalty_count: 0,
    favorites: [],
    email_verified: false,
    email_verif_token: generateToken(),
  };
  const { data: inserted, error } = await sb().from("users").insert(row).select().single();
  if (error) throw new Error(error.message);
  return rowToUser(inserted);
}

export async function updateUser(
  id: string,
  updates: Partial<Pick<User, "prenom" | "nom" | "phone" | "address" | "newsletter">>
): Promise<User | null> {
  const row: Record<string, unknown> = {};
  if (updates.prenom !== undefined) row.prenom = updates.prenom;
  if (updates.nom !== undefined) row.nom = updates.nom;
  if (updates.phone !== undefined) row.phone = updates.phone;
  if (updates.address !== undefined) row.address = updates.address;
  if (updates.newsletter !== undefined) row.newsletter = updates.newsletter;
  const { data, error } = await sb().from("users").update(row).eq("id", id).select().maybeSingle();
  if (error || !data) return null;
  return rowToUser(data);
}

export async function updatePassword(id: string, newPassword: string): Promise<boolean> {
  const salt = generateId();
  const { error } = await sb()
    .from("users")
    .update({ password_hash: `${salt}:${hashPassword(newPassword, salt)}` })
    .eq("id", id);
  return !error;
}

export function verifyPassword(user: User, password: string): boolean {
  const parts = user.passwordHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const computed = Buffer.from(hashPassword(password, salt), "hex");
  const stored = Buffer.from(hash, "hex");
  if (computed.length !== stored.length) return false;
  return crypto.timingSafeEqual(computed, stored);
}

export async function toggleFavorite(userId: string, itemId: string): Promise<string[]> {
  const user = await findUserById(userId);
  if (!user) return [];
  const favs = user.favorites ?? [];
  const next = favs.includes(itemId) ? favs.filter((f) => f !== itemId) : [...favs, itemId];
  await sb().from("users").update({ favorites: next }).eq("id", userId);
  return next;
}

export function safeUser(user: User): Omit<User, "passwordHash" | "emailVerifToken"> {
  const { passwordHash, emailVerifToken, ...rest } = user;
  return rest;
}

// ── Sessions ───────────────────────────────────────────────────────────────────
// Cookie de session, pas de JWT : le token est un secret opaque stocké côté
// serveur, révocable à tout moment (déconnexion, changement de mot de passe).

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  await sb().from("sessions").insert({ token, user_id: userId, expires_at: expiresAt });
  return token;
}

export async function findSession(token: string): Promise<Session | undefined> {
  const { data } = await sb()
    .from("sessions")
    .select("*")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (!data) return undefined;
  return { token: data.token, userId: data.user_id, expiresAt: data.expires_at };
}

export async function deleteSession(token: string): Promise<void> {
  await sb().from("sessions").delete().eq("token", token);
}

// Invalide toutes les sessions d'un utilisateur (changement de mot de passe).
export async function deleteUserSessions(userId: string): Promise<void> {
  await sb().from("sessions").delete().eq("user_id", userId);
}
