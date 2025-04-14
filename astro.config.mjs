// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  site: "http://web-ryoma.conohawing.com/",
  vite: {
    plugins: [tailwindcss()],
  },
});
