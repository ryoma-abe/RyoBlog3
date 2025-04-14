import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import sharp from "sharp";
import { getNotionPosts, getNotionBlocks } from "../api/notion";

const outputDir = path.resolve("public/images/notion");

async function downloadAndConvertToWebP(url: string, filename: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`⚠️ 画像の取得に失敗しました: ${url}`);
      return;
    }

    const buffer = await res.buffer();
    const outPath = path.join(outputDir, `${filename}.webp`);

    await sharp(buffer).webp().toFile(outPath);
    console.log(`✅ 変換完了: ${outPath}`);
  } catch (err) {
    console.error(`❌ エラー: ${url}`, err);
  }
}

async function run() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const posts = await getNotionPosts();

  for (const post of posts) {
    const blocks = await getNotionBlocks(post.id);

    for (const block of blocks) {
      if (block.type === "image") {
        const image = (block as any).image;
        const url =
          image?.type === "external" ? image.external.url : image?.file?.url;

        if (url) {
          const id = block.id.replace(/-/g, "");
          await downloadAndConvertToWebP(url, id);
        }
      }
    }
  }

  console.log("✅ 全ての画像を処理しました。");
}

run();
