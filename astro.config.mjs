// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  site: "http://web-ryoma.conohawing.com/",
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // リモート画像のパターンを設定
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Notionの画像URLはさまざまなドメインから来る可能性があるため、すべてを許可
      },
    ],
    // 画像最適化の設定
    service: {
      entrypoint: "astro/assets/services/sharp", // Sharpを使用した画像処理
    },
  },
});
