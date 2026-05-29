/**
 * Build de produção: Vite gera dist/ (HTML, assets, public/).
 * Copia data/ para dist/data/ (fetch em runtime no deploy).
 */
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build as viteBuild } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");

await viteBuild({
  configFile: join(root, "vite.config.ts"),
});

mkdirSync(join(dist, "data"), { recursive: true });
cpSync(join(root, "data"), join(dist, "data"), { recursive: true });

console.log("Build complete → dist/");
