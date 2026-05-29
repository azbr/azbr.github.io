import * as esbuild from "esbuild";
import { cpSync, mkdirSync, rmSync, watch } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");
const watchMode = process.argv.includes("--watch");

function copyStatic() {
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(join(dist, "assets"), { recursive: true });
  mkdirSync(join(dist, "data"), { recursive: true });
  cpSync(join(root, "public"), dist, { recursive: true });
  cpSync(join(root, "data"), join(dist, "data"), { recursive: true });
}

async function bundle() {
  await esbuild.build({
    entryPoints: [join(root, "src/main.ts")],
    bundle: true,
    outfile: join(dist, "assets/app.js"),
    format: "iife",
    platform: "browser",
    target: "es2020",
    sourcemap: true,
    minify: !watchMode,
    logLevel: "info",
  });
}

async function build() {
  copyStatic();
  await bundle();
  console.log("Build complete → dist/");
}

if (watchMode) {
  copyStatic();
  const ctx = await esbuild.context({
    entryPoints: [join(root, "src/main.ts")],
    bundle: true,
    outfile: join(dist, "assets/app.js"),
    format: "iife",
    platform: "browser",
    target: "es2020",
    sourcemap: true,
    logLevel: "info",
  });
  await ctx.watch();
  console.log("Watching…");
} else {
  await build();
}
