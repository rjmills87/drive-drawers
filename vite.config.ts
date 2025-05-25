import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve, dirname } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { fileURLToPath } from "url";

// Get the directory name
const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "manifest.json",
          dest: ".",
        },
        {
          src: "icons",
          dest: ".",
        },
      ],
    }),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        options: resolve(__dirname, "options.html"),
        background: resolve(__dirname, "src/background/index.ts"),
        content: resolve(__dirname, "src/content/index.ts"),
      },
      output: {
        entryFileNames: (chunk) => {
          return chunk.name === "main" ? "[name]-[hash].js" : "[name].js";
        },
      },
    },
  },
  publicDir: false, // Disable automatic copying of public directory
});
