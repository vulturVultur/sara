import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import { setupApi } from "./server/api.js";

// Monte les routes /api/* directement sur le serveur de dev Vite : même code
// qu'en prod (server/index.ts + Express), zéro CORS, une seule implémentation.
// (.ts requis ici, pas .js : Vite ne bundle un config file via esbuild — donc
// ne résout ".js" → "api.ts" — que pour les fichiers de config TypeScript.)
//
// ⚠️ Ne PAS retourner de fonction ici (hook "post") : le fallback SPA de Vite
// (appType "spa") réécrit tout GET sans extension vers /index.html avant que
// les hooks "post" ne s'exécutent, donc /api/health n'atteignait jamais ce
// middleware — vérifié empiriquement (log "middleware hit: GET /index.html"
// pour une requête curl sur /api/health). Appeler setupApi() directement
// dans le corps de configureServer l'enregistre en hook "pre", avant le
// fallback SPA.
function saraApiPlugin(): Plugin {
  return {
    name: "sara-api",
    configureServer(server: ViteDevServer) {
      setupApi(server.middlewares as unknown as Parameters<typeof setupApi>[0]);
    },
  };
}

export default defineConfig(({ mode }) => {
  // Vite ne pose que les variables préfixées VITE_ sur import.meta.env (côté
  // client) — le code serveur (server/db.ts etc.) tourne dans le même process
  // Node que le dev server et lit process.env directement, donc il faut l'y
  // injecter nous-mêmes ici (en prod, c'est `node --env-file-if-exists=.env`
  // qui s'en charge, cf. package.json → start).
  const env = loadEnv(mode, path.resolve(import.meta.dirname), "");
  Object.assign(process.env, env);

  return {
    plugins: [react(), saraApiPlugin()],
    envDir: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port: 5173,
      strictPort: false,
      host: true,
    },
  };
});
