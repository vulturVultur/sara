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

// ── Orders ─────────────────────────────────────────────────────────────────────

export type OrderItem = { name: string; quantity: number; price: number; desc?: string };

export type Order = {
  id: string;
  userId: string | null;
  items: OrderItem[];
  total: number;
  orderType: "emporter" | "livraison";
  address: string;
  phone: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
  createdAt: string;
  paymentIntent: string | null;
  etaMinutes: number | null;
  etaReadyAt: string | null;
  cancelledByClient: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToOrder(r: any): Order {
  return {
    id: r.id,
    userId: r.user_id ?? null,
    items: r.items,
    total: Number(r.total),
    orderType: r.order_type,
    address: r.address ?? "",
    phone: r.phone ?? "",
    status: r.status,
    createdAt: r.created_at,
    paymentIntent: r.payment_intent ?? null,
    etaMinutes: r.eta_minutes ?? null,
    etaReadyAt: r.eta_ready_at ?? null,
    cancelledByClient: r.cancelled_by_client ?? false,
  };
}

export async function createOrder(
  data: Omit<Order, "id" | "createdAt" | "status" | "paymentIntent" | "etaMinutes" | "etaReadyAt" | "cancelledByClient">
    & { status?: Order["status"]; paymentIntent?: string | null }
): Promise<Order> {
  const row: Record<string, unknown> = {
    id: generateId(),
    user_id: data.userId,
    items: data.items,
    total: data.total,
    order_type: data.orderType,
    address: data.address,
    phone: data.phone,
    status: data.status ?? "pending",
  };
  if (data.paymentIntent) row.payment_intent = data.paymentIntent;
  const { data: inserted, error } = await sb().from("orders").insert(row).select().single();
  if (error) throw new Error(error.message);
  return rowToOrder(inserted);
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data } = await sb().from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return (data ?? []).map(rowToOrder);
}

// Statut dérivé de eta_ready_at à CHAQUE lecture — pas de timer mémoire (qui
// mourrait au redémarrage du process). Marche pour tous les chemins de
// lecture d'une commande : polling client, page de gestion patron, etc.
export async function findOrderById(id: string): Promise<Order | undefined> {
  const { data } = await sb().from("orders").select("*").eq("id", id).maybeSingle();
  if (!data) return undefined;
  const order = rowToOrder(data);
  if (order.status === "preparing" && order.etaReadyAt && new Date(order.etaReadyAt) <= new Date()) {
    await sb().from("orders").update({ status: "ready" }).eq("id", id);
    order.status = "ready";
  }
  return order;
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order | null> {
  const { data, error } = await sb().from("orders").update({ status }).eq("id", id).select().maybeSingle();
  if (error || !data) return null;
  return rowToOrder(data);
}

// Le patron accepte : passe en "preparing", pose l'ETA absolue (now + etaMinutes).
// Restreint aux commandes pas encore décidées — sinon un clic tardif sur un
// vieux lien "Accepter" ressusciterait une commande déjà refusée/annulée.
export async function acceptOrder(id: string, etaMinutes: number): Promise<Order | null> {
  const etaReadyAt = new Date(Date.now() + etaMinutes * 60 * 1000).toISOString();
  const { data, error } = await sb()
    .from("orders")
    .update({ status: "preparing", eta_minutes: etaMinutes, eta_ready_at: etaReadyAt })
    .eq("id", id)
    .in("status", ["pending", "confirmed"])
    .select()
    .maybeSingle();
  if (error || !data) return null;
  return rowToOrder(data);
}

// +N minutes de préparation — repousse l'ETA existant (pas "now"), pour ne
// pas grignoter un délai déjà annoncé au client si appelé plusieurs fois.
export async function extendPrepTime(id: string, addMinutes: number): Promise<Order | null> {
  const order = await findOrderById(id);
  if (!order || order.status !== "preparing") return null;
  const base = order.etaReadyAt ? new Date(order.etaReadyAt).getTime() : Date.now();
  const newReadyAt = new Date(base + addMinutes * 60 * 1000).toISOString();
  const newEtaMinutes = (order.etaMinutes ?? 0) + addMinutes;
  const { data, error } = await sb()
    .from("orders")
    .update({ eta_minutes: newEtaMinutes, eta_ready_at: newReadyAt })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error || !data) return null;
  return rowToOrder(data);
}

// Annulation par le CLIENT (flag distinct du refus par le restaurant, pour
// que le suivi affiche le bon message). Uniquement tant qu'aucune décision
// n'a été prise (pending/confirmed).
export async function cancelOrderByClient(id: string, userId: string): Promise<Order | null> {
  const { data, error } = await sb()
    .from("orders")
    .update({ status: "cancelled", cancelled_by_client: true })
    .eq("id", id)
    .eq("user_id", userId)
    .in("status", ["pending", "confirmed"])
    .select()
    .maybeSingle();
  if (error || !data) return null;
  return rowToOrder(data);
}

// Retrouve la commande créée pour un PaymentIntent Stripe — utilisé par le
// webhook pour l'idempotence (Stripe relivre parfois le même événement).
export async function findOrderByPaymentIntent(pi: string): Promise<Order | undefined> {
  const { data } = await sb()
    .from("orders")
    .select("*")
    .eq("payment_intent", pi)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? rowToOrder(data) : undefined;
}
