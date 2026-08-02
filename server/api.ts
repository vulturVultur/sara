/**
 * API Sara — middleware compatible Vite (Connect) et Express.
 * Monte les routes /api/* sur n'importe quel app connect/express, pour que
 * le même code serve en dev (via le plugin Vite) et en prod (via Express),
 * sans jamais avoir deux implémentations à maintenir en parallèle.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import crypto from "node:crypto";
import {
  pingDb, findUserByEmail, findUserById, createUser, updateUser, updatePassword,
  verifyPassword, toggleFavorite, safeUser, createSession, findSession,
  deleteSession, deleteUserSessions,
} from "./db.js";

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

type Body = Record<string, unknown>;

export function setupApi(app: App) {
  app.use(async (req, res, next) => {
    const url = (req.url ?? "").split("?")[0];
    const method = req.method?.toUpperCase() ?? "GET";

    if (!url.startsWith("/api/")) { next(); return; }

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

      next();
    } catch (e) {
      console.error("[API] Erreur non gérée:", e);
      err(res, 500, "Erreur serveur");
    }
  });
}
