/**
 * API Sara — middleware compatible Vite (Connect) et Express.
 * Monte les routes /api/* sur n'importe quel app connect/express, pour que
 * le même code serve en dev (via le plugin Vite) et en prod (via Express),
 * sans jamais avoir deux implémentations à maintenir en parallèle.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { pingDb } from "./db.js";

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

export function setupApi(app: App) {
  app.use(async (req, res, next) => {
    const url = req.url ?? "";
    const method = req.method ?? "GET";

    if (!url.startsWith("/api/")) { next(); return; }

    try {
      // Vérifie que le serveur ET la connexion Supabase répondent — première
      // chose à appeler après un déploiement pour confirmer que la Phase 0 tient.
      if (method === "GET" && url === "/api/health") {
        const dbOk = await pingDb();
        if (!dbOk) { err(res, 503, "Base de données injoignable"); return; }
        ok(res, { ok: true });
        return;
      }

      // Auth (/api/auth/*), profil (/api/me*), commandes (/api/orders*) :
      // ajoutés en Phase 2/3 sur le modèle de server/api.ts de Flash Pizzas
      // (reqString/optString pour la validation, rateLimit par IP, sessions
      // par cookie HttpOnly).

      next();
    } catch (e) {
      console.error("[API] Erreur non gérée:", e);
      err(res, 500, "Erreur serveur");
    }
  });
}
