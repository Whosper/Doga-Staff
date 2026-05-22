import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" => chemins relatifs, fonctionne aussi bien en local
// que sur GitHub Pages (https://user.github.io/repo/).
export default defineConfig({
  plugins: [react()],
  base: "./",
});
