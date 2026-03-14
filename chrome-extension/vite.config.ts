import { defineConfig } from "vite";
import { resolve } from "path";
import { promises as fs } from "fs";

export default defineConfig({
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input: {
        contentScript: resolve(__dirname, "src/content/contentScript.ts"),
        serviceWorker: resolve(__dirname, "src/background/serviceWorker.ts"),
        options: resolve(__dirname, "src/options/options.ts")
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "contentScript") {
            return "content/contentScript.js";
          }
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
    },
    emptyOutDir: true
  },
  publicDir: "public",
  plugins: [
    {
      name: "copy-static-extension-assets",
      apply: "build",
      async writeBundle() {
        const root = __dirname;
        const distDir = resolve(root, "dist");

        const manifestSrc = resolve(root, "manifest.json");
        const manifestDest = resolve(distDir, "manifest.json");

        const optionsHtmlSrc = resolve(root, "src/options/options.html");
        const optionsHtmlDestDir = resolve(distDir, "options");
        const optionsHtmlDest = resolve(optionsHtmlDestDir, "options.html");

        const contentCssSrc = resolve(root, "src/styles/content.css");
        const contentCssDestDir = resolve(distDir, "content");
        const contentCssDest = resolve(contentCssDestDir, "content.css");

        await fs.mkdir(distDir, { recursive: true });
        await fs.mkdir(optionsHtmlDestDir, { recursive: true });
        await fs.mkdir(contentCssDestDir, { recursive: true });

        try {
          await fs.copyFile(manifestSrc, manifestDest);
        } catch {
          // ignore if missing
        }

        try {
          await fs.copyFile(optionsHtmlSrc, optionsHtmlDest);
        } catch {
          // ignore if missing
        }

        try {
          await fs.copyFile(contentCssSrc, contentCssDest);
        } catch {
          // ignore if missing
        }
      }
    }
  ]
});

