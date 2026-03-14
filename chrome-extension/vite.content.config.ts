import { defineConfig } from "vite";
import { resolve } from "path";
import { promises as fs } from "fs";

async function copyExtensionAssets(): Promise<void> {
  const root = resolve(__dirname);
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
    // ignore
  }
  try {
    await fs.copyFile(optionsHtmlSrc, optionsHtmlDest);
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
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "src/content/contentScript.ts"),
      output: {
        format: "iife",
        inlineDynamicImports: true,
        entryFileNames: "content/contentScript.js"
      }
    }
  },
  plugins: [
    {
      name: "copy-content-assets",
      apply: "build",
      writeBundle: copyExtensionAssets
    }
  ]
});
