import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  base: "/cctv/",
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      // The about page is a separate, standalone page.
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        about: resolve(import.meta.dirname, "about.html"),
      },
    },
  },
  test: {
    environment: "happy-dom",
    environmentOptions: {
      happyDOM: { url: "http://localhost:5173/cctv/" },
    },
    include: ["src/**/*.test.ts"],
  },
});
