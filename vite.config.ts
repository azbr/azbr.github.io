import { resolve } from "node:path";
import sirv from "sirv";
import { defineConfig, type Plugin } from "vite";

function serveDataDir(): Plugin {
  const dataRoot = resolve(__dirname, "data");
  const serve = sirv(dataRoot, { dev: true, etag: true });

  return {
    name: "serve-data",
    configureServer(server) {
      server.middlewares.use("/data", serve);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/data", serve);
    },
  };
}

export default defineConfig({
  publicDir: resolve(__dirname, "public"),
  plugins: [serveDataDir()],
  server: {
    port: 4173,
    open: true,
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "index.html"),
    },
    copyPublicDir: true,
  },
});
