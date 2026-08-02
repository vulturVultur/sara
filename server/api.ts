/**
 * API Sara — middleware compatible Vite (Connect) et Express.
 * Monte les routes /api/* sur n'importe quel app connect/express, pour que
 * le même code serve en dev (via le plugin Vite) et en prod (via Express),
 * sans jamais avoir deux implémentations à maintenir en parallèle.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import crypto from "node:crypto";
import Stripe from "stripe";
import {
  pingDb, findUserByEmail, findUserById, createUser, updateUser, updatePassword,
  verifyPassword, toggleFavorite, safeUser, createSession, findSession,
  deleteSession, deleteUserSessions, createOrder, getUserOrders, findOrderByPaymentIntent,
  type Order,
} from "./db.js";

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquante");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" as any });
  return _stripe;
}

type Req = IncomingMessage & { body?: unknown };
type Res = ServerResponse;
type Next = () => void;
type App = { use: (fn: (req: Req, res: Res, next: Next) => void) => void };

function send(res: Res, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}
function ok(res: Res, data: unknown) { send(res, 200, data); }
function err(res: Res, status: number, message: string) { send(res, status, { error: message }); }
function tooMany(res: Res) { err(res, 429, "Trop de requêtes. Réessayez plus tard."); }

// ── Corps de requête JSON (borné, anti-DoS) ───────────────────────────────────

const MAX_BODY_SIZE = 64 * 1024; // 64 KB

async function parseBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let data = "";
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_SIZE) { req.destroy(); resolve({}); return; }
      data += chunk.toString();
    });
    req.on("end", () => { try { resolve(JSON.parse(data)); } catch { resolve({}); } });
    req.on("error", () => resolve({}));
  });
}

// Corps brut (non parsé) — requis par la vérification de signature Stripe,
// qui doit s'appliquer sur les octets exacts envoyés, pas sur du JSON reparsé.
async function parseRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_SIZE) { req.destroy(); reject(new Error("Corps trop volumineux")); return; }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// ── Cookie de session (sara_session) ──────────────────────────────────────────

function parseCookieHeader(header: string | undefined): Record<string, string> {
  if (!header) return {};
  const result: Record<string, string> = {};
  for (const pair of header.split(";")) {
    const idx = pair.indexOf("=");
    if (idx < 0) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    try { result[key] = decodeURIComponent(val); } catch { result[key] = val; }
  }
  return result;
}

function setAuthCookie(res: Res, token: string) {
  const maxAge = 365 * 24 * 60 * 60;
  const isProduction = process.env.NODE_ENV === "production";
  const parts = [
    `sara_session=${encodeURIComponent(token)}`,
    `Max-Age=${maxAge}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    ...(isProduction ? ["Secure"] : []),
  ];
  res.setHeader("Set-Cookie", parts.join("; "));
}

function clearAuthCookie(res: Res) {
  const isProduction = process.env.NODE_ENV === "production";
  const parts = [
    "sara_session=",
    "Max-Age=0",
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    ...(isProduction ? ["Secure"] : []),
  ];
  res.setHeader("Set-Cookie", parts.join("; "));
}

function getToken(req: Req): string | null {
  const cookies = parseCookieHeader(req.headers.cookie);
  return cookies.sara_session ?? null;
}

// ── Rate limiting générique (in-memory, par IP + bucket) ──────────────────────

type Bucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, Bucket>();

// Derrière le reverse-proxy de l'hébergeur (Render), l'IP client est dans X-Forwarded-For.
function getClientIp(req: Req): string {
  const xff = req.headers["x-forwarded-for"];
  const raw = Array.isArray(xff) ? xff[0] : xff;
  if (raw && typeof raw === "string" && raw.length > 0) return raw.split(",")[0].trim();
  return (req.socket as { remoteAddress?: string })?.remoteAddress ?? "unknown";
}

function rateLimit(name: string, req: Req, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (rateBuckets.size > 5000) {
    rateBuckets.forEach((v, k) => { if (v.resetAt < now) rateBuckets.delete(k); });
  }
  const key = `${name}:${getClientIp(req)}`;
  const entry = rateBuckets.get(key);
  if (!entry || entry.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

// ── Validation / nettoyage des entrées ────────────────────────────────────────
// Champ requis : string non-vide, trim, longueur bornée. null si invalide.
function reqString(v: unknown, maxLen: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (t.length === 0 || t.length > maxLen) return null;
  return t;
}
// Champ optionnel : string trim et tronquée, "" si absent/invalide.
function optString(v: unknown, maxLen: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, maxLen);
}

// ── Validation des commandes ───────────────────────────────────────────────────

const MAX_ITEMS = 60;
const MAX_QTY = 50;
const MAX_UNIT_PRICE = 1000;
const MAX_TOTAL = 10000;

// Valide le tableau d'articles d'une commande : structure + bornes. Le total
// n'est PAS recalculé à partir des lignes (le client peut appliquer des
// remises légitimes) — voir validateTotal, borné indépendamment.
function validateItems(raw: unknown): Order["items"] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_ITEMS) return null;
  const out: Order["items"] = [];
  for (const it of raw) {
    if (!it || typeof it !== "object") return null;
    const r = it as Record<string, unknown>;
    const name = typeof r.name === "string" ? r.name.trim() : "";
    if (!name || name.length > 120) return null;
    const quantity = Number(r.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) return null;
    const price = Number(r.price);
    if (!Number.isFinite(price) || price < 0 || price > MAX_UNIT_PRICE) return null;
    const desc = typeof r.desc === "string" ? r.desc.slice(0, 500) : undefined;
    out.push({ name, quantity, price, ...(desc ? { desc } : {}) });
  }
  return out;
}

function validateTotal(raw: unknown): number | null {
  const total = Number(raw);
  if (!Number.isFinite(total) || total < 0 || total > MAX_TOTAL) return null;
  return total;
}

type Body = Record<string, unknown>;

export function setupApi(app: App) {
  app.use(async (req, res, next) => {
    const url = (req.url ?? "").split("?")[0];
    const method = req.method?.toUpperCase() ?? "GET";

    if (!url.startsWith("/api/")) { next(); return; }

    // ── Webhook Stripe (corps brut requis avant tout parsing JSON) ──
    if (method === "POST" && url === "/api/stripe/webhook") {
      try {
        const rawBody = await parseRawBody(req);
        const sig = req.headers["stripe-signature"] as string;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) { err(res, 500, "STRIPE_WEBHOOK_SECRET manquante"); return; }

        let event: Stripe.Event;
        try {
          event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret);
        } catch (e) {
          console.error("[Stripe] Signature webhook invalide:", e);
          err(res, 400, "Signature webhook invalide");
          return;
        }

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          const meta = session.metadata ?? {};
          const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : null;

          // Idempotence : Stripe relivre l'événement (au moins une fois, + relances
          // si la réponse tarde). Si une commande existe déjà pour ce PaymentIntent,
          // on ne recrée rien — sinon commande en double. On répond 200 dans tous
          // les cas pour que Stripe arrête de relancer.
          if (paymentIntent) {
            const existing = await findOrderByPaymentIntent(paymentIntent);
            if (existing) {
              console.log(`[Stripe] Webhook déjà traité (PI=${paymentIntent}, commande ${existing.id}) — ignoré`);
              ok(res, { received: true, duplicate: true });
              return;
            }
          }

          const itemsJson = Object.keys(meta)
            .filter((k) => k.startsWith("items_"))
            .sort((a, b) => parseInt(a.slice(6)) - parseInt(b.slice(6)))
            .map((k) => meta[k])
            .join("");
          let items: Order["items"] = [];
          try {
            const parsed = JSON.parse(itemsJson || "[]") as Array<{ q: number; n: string; p: number; d?: string }>;
            items = parsed.map((i) => ({ name: i.n, quantity: i.q, price: i.p, ...(i.d ? { desc: i.d } : {}) }));
          } catch (e) {
            console.error("[Stripe] items metadata invalide:", e);
          }

          // Capture manuelle : la carte est seulement AUTORISÉE (argent réservé),
          // pas encore débitée. La commande reste "pending" — l'encaissement
          // (capture) et son annulation arrivent en Phase 4 avec accepter/refuser.
          const order = await createOrder({
            userId: meta.userId || null,
            items,
            total: parseFloat(meta.total ?? "0"),
            orderType: (meta.orderType as "emporter" | "livraison") || "emporter",
            address: meta.address || "",
            phone: meta.phone || "",
            paymentIntent,
          });

          console.log(`[Stripe] Commande carte autorisée (pending) via webhook: ${order.id} PI=${paymentIntent}`);
        }

        ok(res, { received: true });
      } catch (e) {
        console.error("[API] Erreur webhook Stripe:", e);
        err(res, 500, "Erreur serveur");
      }
      return;
    }

    if (["POST", "PUT", "PATCH"].includes(method)) {
      if (!req.body) req.body = await parseBody(req);
    }
    const body = (req.body ?? {}) as Body;
    const token = getToken(req);

    const requireAuth = async () => {
      if (!token) { err(res, 401, "Non autorisé"); return null; }
      const session = await findSession(token);
      if (!session) { err(res, 401, "Session expirée"); return null; }
      const user = await findUserById(session.userId);
      if (!user) { err(res, 401, "Utilisateur introuvable"); return null; }
      return { user, session };
    };

    try {
      // Vérifie que le serveur ET la connexion Supabase répondent — première
      // chose à appeler après un déploiement pour confirmer que la Phase 0 tient.
      if (method === "GET" && url === "/api/health") {
        const dbOk = await pingDb();
        if (!dbOk) { err(res, 503, "Base de données injoignable"); return; }
        ok(res, { ok: true });
        return;
      }

      // ── Auth ──

      if (method === "POST" && url === "/api/auth/register") {
        if (!rateLimit("register", req, 5, 10 * 60_000)) { tooMany(res); return; }
        const email = reqString(body.email, 254);
        const prenom = reqString(body.prenom, 80);
        const nom = reqString(body.nom, 80);
        const password = typeof body.password === "string" ? body.password : "";
        if (!email || !password || !prenom || !nom) { err(res, 400, "Champs requis manquants"); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err(res, 400, "Adresse e-mail invalide"); return; }
        if (password.length < 8 || password.length > 200) { err(res, 400, "Le mot de passe doit faire entre 8 et 200 caractères"); return; }
        if (await findUserByEmail(email)) { err(res, 409, "Cet email est déjà utilisé"); return; }
        const user = await createUser({
          email, password, prenom, nom,
          phone: optString(body.phone, 40),
          address: optString(body.address, 300),
          newsletter: body.newsletter === true || body.newsletter === "true",
        });
        const t = await createSession(user.id);
        setAuthCookie(res, t);
        ok(res, { user: safeUser(user) });
        return;
      }

      if (method === "POST" && url === "/api/auth/login") {
        if (!rateLimit("login", req, 10, 60_000)) { tooMany(res); return; }
        const email = reqString(body.email, 254);
        const password = typeof body.password === "string" ? body.password : "";
        if (!email || !password || password.length > 200) { err(res, 400, "Email ou mot de passe invalide"); return; }
        const user = await findUserByEmail(email);
        if (!user || !verifyPassword(user, password)) { err(res, 401, "Email ou mot de passe incorrect"); return; }
        const t = await createSession(user.id);
        setAuthCookie(res, t);
        ok(res, { user: safeUser(user) });
        return;
      }

      if (method === "POST" && url === "/api/auth/logout") {
        if (token) await deleteSession(token);
        clearAuthCookie(res);
        ok(res, { ok: true });
        return;
      }

      // ── Profil ──

      if (method === "GET" && url === "/api/me") {
        const auth = await requireAuth(); if (!auth) return;
        ok(res, safeUser(auth.user));
        return;
      }

      if (method === "PUT" && url === "/api/me") {
        const auth = await requireAuth(); if (!auth) return;
        const updates: Record<string, string | boolean> = {};
        if (body.prenom !== undefined) { const v = reqString(body.prenom, 80); if (!v) { err(res, 400, "Prénom invalide"); return; } updates.prenom = v; }
        if (body.nom !== undefined) { const v = reqString(body.nom, 80); if (!v) { err(res, 400, "Nom invalide"); return; } updates.nom = v; }
        if (body.phone !== undefined) updates.phone = optString(body.phone, 40);
        if (body.address !== undefined) updates.address = optString(body.address, 300);
        if (body.newsletter !== undefined) updates.newsletter = body.newsletter === true;
        const updated = await updateUser(auth.user.id, updates);
        if (!updated) { err(res, 500, "Mise à jour impossible"); return; }
        ok(res, safeUser(updated));
        return;
      }

      if (method === "PUT" && url === "/api/me/password") {
        const auth = await requireAuth(); if (!auth) return;
        const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
        const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
        if (!verifyPassword(auth.user, currentPassword)) { err(res, 401, "Mot de passe actuel incorrect"); return; }
        if (newPassword.length < 8 || newPassword.length > 200) { err(res, 400, "Le nouveau mot de passe doit faire entre 8 et 200 caractères"); return; }
        const okUpdate = await updatePassword(auth.user.id, newPassword);
        if (!okUpdate) { err(res, 500, "Échec du changement de mot de passe"); return; }
        // Invalide toutes les sessions existantes, puis en recrée une pour l'appareil courant.
        await deleteUserSessions(auth.user.id);
        const t = await createSession(auth.user.id);
        setAuthCookie(res, t);
        ok(res, { ok: true });
        return;
      }

      if (method === "POST" && url === "/api/me/favorites") {
        const auth = await requireAuth(); if (!auth) return;
        const itemId = reqString(body.id, 120);
        if (!itemId) { err(res, 400, "id du produit requis"); return; }
        const favorites = await toggleFavorite(auth.user.id, itemId);
        ok(res, { favorites });
        return;
      }

      // ── Commandes ──

      if (method === "GET" && url === "/api/me/orders") {
        const auth = await requireAuth(); if (!auth) return;
        ok(res, await getUserOrders(auth.user.id));
        return;
      }

      // Paiement cash/sur place : crée la commande directement (statut "pending").
      // Compte optionnel — checkout invité si prénom/nom/téléphone fournis.
      if (method === "POST" && url === "/api/orders") {
        if (!rateLimit("orders", req, 12, 5 * 60_000)) { tooMany(res); return; }
        const orderItems = validateItems(body.items);
        const total = validateTotal(body.total);
        if (!orderItems || total === null || (body.orderType !== "emporter" && body.orderType !== "livraison")) {
          err(res, 400, "Données de commande invalides"); return;
        }
        const orderType: "emporter" | "livraison" = body.orderType === "livraison" ? "livraison" : "emporter";
        const phone = optString(body.phone, 40);
        const address = optString(body.address, 300);
        let userId: string | null = null;
        let customerName = [optString(body.prenom, 80), optString(body.nom, 80)].filter(Boolean).join(" ").trim() || "Client invité";
        if (token) {
          const session = await findSession(token);
          if (session) {
            const user = await findUserById(session.userId);
            if (user) { userId = user.id; customerName = `${user.prenom} ${user.nom}`; }
          }
        }
        const order = await createOrder({ userId, items: orderItems, total, orderType, address, phone });

        const itemsLog = orderItems.map((i) => `${i.quantity}x ${i.name}${i.desc ? ` [${i.desc}]` : ""}`).join(", ");
        console.log("──────────────────────────────────────────");
        console.log(`Nouvelle commande Sara — ${order.id}`);
        console.log(`Client    : ${customerName}`);
        console.log(`Type      : ${order.orderType === "livraison" ? "Livraison" : "À emporter"}`);
        if (order.address) console.log(`Adresse   : ${order.address}`);
        if (order.phone) console.log(`Téléphone : ${order.phone}`);
        console.log(`Articles  : ${itemsLog}`);
        console.log(`Total     : CHF ${order.total.toFixed(2)}`);
        console.log("──────────────────────────────────────────");
        // ⚠️ Pas encore de notification patron (Telegram/etc.) — Phase 4. Pour
        // l'instant une commande "pending" n'avance que par une action manuelle
        // en base tant que la Phase 4 (accepter/refuser) n'est pas construite.

        ok(res, { id: order.id, status: order.status });
        return;
      }

      // Paiement carte : crée une session Stripe Embedded Checkout, capture
      // manuelle (argent AUTORISÉ, pas débité — capturé seulement à
      // l'acceptation, en Phase 4). La commande elle-même est créée par le
      // webhook une fois le paiement confirmé, pas ici.
      if (method === "POST" && url === "/api/stripe/create-checkout") {
        if (!rateLimit("checkout", req, 12, 5 * 60_000)) { tooMany(res); return; }
        const orderItems = validateItems(body.items);
        const total = validateTotal(body.total);
        if (!orderItems || total === null) { err(res, 400, "Données de commande invalides"); return; }

        let userId: string | null = null;
        let customerName = "Client";
        if (token) {
          const session = await findSession(token);
          if (session) {
            const user = await findUserById(session.userId);
            if (user) { userId = user.id; customerName = `${user.prenom} ${user.nom}`; }
          }
        }

        const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
        const lineItems = orderItems.map((i) => ({
          price_data: { currency: "chf", product_data: { name: i.name }, unit_amount: Math.round(i.price * 100) },
          quantity: i.quantity,
        }));

        // Sérialisation JSON des articles (avec desc = personnalisation) répartie
        // sur plusieurs clés metadata Stripe (limite : 500 car./clé, 50 clés max).
        const ITEMS_META_CHUNK = 490;
        const ITEMS_META_BUDGET = 40;
        const buildItemsChunks = (withDesc: boolean): string[] => {
          const json = JSON.stringify(orderItems.map((i) => ({ q: i.quantity, n: i.name, p: i.price, ...(withDesc && i.desc ? { d: i.desc } : {}) })));
          const chunks: string[] = [];
          for (let pos = 0; pos < json.length; pos += ITEMS_META_CHUNK) chunks.push(json.slice(pos, pos + ITEMS_META_CHUNK));
          return chunks;
        };
        let itemsChunks = buildItemsChunks(true);
        if (itemsChunks.length > ITEMS_META_BUDGET) itemsChunks = buildItemsChunks(false);
        const itemsMeta: Record<string, string> = {};
        itemsChunks.forEach((c, i) => { itemsMeta[`items_${i}`] = c; });

        const stripeSession = await getStripe().checkout.sessions.create({
          ui_mode: "embedded_page",
          payment_method_types: ["card"],
          payment_intent_data: { capture_method: "manual" },
          line_items: lineItems,
          mode: "payment",
          return_url: `${baseUrl}/?stripe_return={CHECKOUT_SESSION_ID}`,
          metadata: {
            orderType: body.orderType === "livraison" ? "livraison" : "emporter",
            address: optString(body.address, 300),
            phone: optString(body.phone, 40),
            userId: userId || "",
            customerName: customerName.slice(0, 120),
            ...itemsMeta,
            total: String(total),
          },
        });

        ok(res, { clientSecret: stripeSession.client_secret });
        return;
      }

      if (method === "GET" && url === "/api/stripe/session-status") {
        if (!rateLimit("checkout", req, 30, 5 * 60_000)) { tooMany(res); return; }
        const sessionId = new URL(req.url ?? "", "http://x").searchParams.get("session_id") ?? "";
        if (!/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) { err(res, 400, "session_id invalide"); return; }
        const s = await getStripe().checkout.sessions.retrieve(sessionId);
        ok(res, { status: s.status, paymentStatus: s.payment_status });
        return;
      }

      next();
    } catch (e) {
      console.error("[API] Erreur non gérée:", e);
      err(res, 500, "Erreur serveur");
    }
  });
}
