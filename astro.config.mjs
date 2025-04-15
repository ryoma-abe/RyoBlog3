// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "http://web-ryoma.conohawing.com/",
  integrations: [
    mdx({
      extendMarkdownConfig: true,
      syntaxHighlight: "shiki",
      shikiConfig: { theme: "github-dark" },
    }),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
