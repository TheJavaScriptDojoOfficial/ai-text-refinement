import { defineConfig } from "vite";
import { resolve } from "path";
import { promises as fs } from "fs";

async function copyExtensionAssets(): Promise<void> {
  const root = resolve(__dirname);
  const distDir = resolve(root, "dist");
  const manifestSrc = resolve(root, "manifest.json");
  const manifestDest = resolve(distDir, "manifest.json");
  const optionsHtmlSrc = resolve(root, "src/options/options.html");
  const optionsCssSrc = resolve(root, "src/options/options.css");
  const optionsDestDir = resolve(distDir, "options");
  const optionsHtmlDest = resolve(optionsDestDir, "options.html");
  const optionsCssDest = resolve(optionsDestDir, "options.css");
  const contentCssSrc = resolve(root, "src/styles/content.css");
  const contentCssDestDir = resolve(distDir, "content");
  const contentCssDest = resolve(contentCssDestDir, "content.css");

  await fs.mkdir(distDir, { recursive: true });
  await fs.mkdir(optionsDestDir, { recursive: true });
  await fs.mkdir(contentCssDestDir, { recursive: true });
  try {
    await fs.copyFile(manifestSrc, manifestDest);
  } catch {
    // ignore
  }
  try {
    await fs.copyFile(optionsHtmlSrc, optionsHtmlDest);
  } catch {
    // ignore
  }
  try {
    await fs.copyFile(optionsCssSrc, optionsCssDest);
  } catch {
    // ignore
  }
  try {
    await fs.copyFile(contentCssSrc, contentCssDest);
  } catch {
    // ignore
  }
}

export default defineConfig({
  build: {
    outDir: "dist",
    sourcemap: true,
    emptyOutDir: false,
    rollupOptions: {
      input: {
        serviceWorker: resolve(__dirname, "src/background/serviceWorker.ts"),
        options: resolve(__dirname, "src/options/options.ts")
      },
      output: {
        format: "es",
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "serviceWorker") {
            return "background/serviceWorker.js";
          }
          if (chunkInfo.name === "options") {
            return "options/options.js";
          }
          return "assets/[name].js";
        },
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]"
      }
    }
  },
  publicDir: "public",
  plugins: [
    {
      name: "copy-static-extension-assets",
      apply: "build",
      writeBundle: copyExtensionAssets
    }
  ]
});
