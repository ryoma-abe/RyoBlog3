import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

const notion = new Client({
  auth: import.meta.env.NOTION_API_KEY,
});

const databaseId = import.meta.env.NOTION_DATABASE_ID;

if (!databaseId) {
  throw new Error(
    "❌ NOTION_DATABASE_ID is undefined. GitHub Actionsや.envの設定を確認してください。"
  );
}

export async function getNotionPosts(): Promise<PageObjectResponse[]> {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "公開",
      checkbox: { equals: true },
    },
    sorts: [
      {
        property: "date",
        direction: "descending",
      },
    ],
  });

  return response.results as PageObjectResponse[];
}

export async function getNotionBlocks(pageId: string) {
  const blocks = await notion.blocks.children.list({
    block_id: pageId,
  });

  return blocks.results as BlockObjectResponse[];
}

// 連続するリストアイテムの処理
let currentListType: "bulleted" | "numbered" | null = null;
let listItems: string[] = [];

// リストをHTMLに変換
function renderListItems(): string {
  if (listItems.length === 0) return "";

  const tag = currentListType === "bulleted" ? "ul" : "ol";
  const className =
    currentListType === "bulleted" ? "list-disc" : "list-decimal";

  const html = `<${tag} class="${className} ml-6 my-6">${listItems.join(
    ""
  )}</${tag}>`;

  // リストをリセット
  listItems = [];
  currentListType = null;

  return html;
}

// Helper function to generate slugs (Exported) - Updated for non-latin chars
export function slugify(text: string): string {
  if (!text) return "";
  // Keep the original text for non-empty slugs if it's simple enough, otherwise encode.
  // Simple check: alphanumeric, hyphen, underscore.
  // If it contains other characters (like Japanese), URL encode it.
  // Also, convert simple ASCII text to lowercase for consistency.
  const simplifiedText = text.trim(); // Trim whitespace first
  if (/^[a-zA-Z0-9-_]+$/.test(simplifiedText)) {
    // If the text is already simple (ASCII alphanumeric, hyphen, underscore), use it directly after lowercasing.
    // This keeps simple slugs like "section-1" readable.
    return simplifiedText.toLowerCase();
  } else {
    // For text containing spaces, special characters, or non-latin characters,
    // 1. Replace spaces with hyphens first for better readability before encoding.
    // 2. URL encode the entire string to handle all other characters safely.
    const spacedHyphened = simplifiedText.replace(/\s+/g, "-");
    return encodeURIComponent(spacedHyphened);
    // Example: "主要技術 の 進化" -> "主要技術-の-進化" -> "%E4%B8%BB%E8%A6%81%E6%8A%80%E8%A1%93-%E3%81%AE-%E9%80%B2%E5%8C%96"
  }
  // Note: This approach might generate long IDs for Japanese text.
  // Consider libraries like github-slugger for more sophisticated slug generation if needed.
}

// リッチテキストの処理（安全なバージョン） - プレーンテキスト取得ロジックを修正
function renderRichText(richTextArr: any[] = []): string {
  if (!richTextArr || richTextArr.length === 0) return "";

  return richTextArr
    .map((text) => {
      // Notion API v4 (2022-06-28)以降の型チェックを強化
      const richText = text as RichTextItemResponse;
      if (!richText || typeof richText.plain_text !== "string") return "";

      let result = richText.plain_text;

      // スタイル適用
      if (richText.annotations?.bold) result = `<strong>${result}</strong>`;
      if (richText.annotations?.italic) result = `<em>${result}</em>`;
      if (richText.annotations?.strikethrough) result = `<del>${result}</del>`;
      if (richText.annotations?.underline) result = `<u>${result}</u>`;
      if (richText.annotations?.code)
        result = `<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-primary">${result}</code>`; // Style update

      // リンク
      if (richText.href) {
        result = `<a href="${richText.href}" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">${result}</a>`; // Add target and rel
      }

      return result;
    })
    .join("");
}

// プレーンテキストのみを取得するヘルパー
function getPlainText(richTextArr: any[] = []): string {
  if (!richTextArr || richTextArr.length === 0) return "";
  return richTextArr
    .map((text) => (text as RichTextItemResponse)?.plain_text || "")
    .join("");
}

let codeBlockCounter = 0;

// 追加: 見出し情報の型定義
export interface HeadingInfo {
  level: number;
  text: string;
  slug: string;
}

// 追加: renderBlock の戻り値の型定義
interface RenderResult {
  html: string;
  headingInfo?: HeadingInfo;
}

export async function renderBlock(
  block: BlockObjectResponse
): Promise<RenderResult> {
  // 戻り値の型を変更
  // nullチェック
  if (!block) return { html: "" }; // オブジェクトを返すように変更

  // リストアイテムの処理
  if (
    block.type === "bulleted_list_item" ||
    block.type === "numbered_list_item"
  ) {
    const isNewListType =
      currentListType === null ||
      (block.type === "bulleted_list_item" && currentListType !== "bulleted") ||
      (block.type === "numbered_list_item" && currentListType !== "numbered");

    let prefixHtml = ""; // 前のリストを閉じるHTML

    // リストタイプが変わった場合、前のリストを閉じる
    if (isNewListType && listItems.length > 0) {
      prefixHtml = renderListItems(); // ここで前のリストのHTMLを取得

      // 新しいリストタイプを設定
      currentListType =
        block.type === "bulleted_list_item" ? "bulleted" : "numbered";
    } else if (currentListType === null) {
      // 最初のリストアイテムの場合、タイプを設定
      currentListType =
        block.type === "bulleted_list_item" ? "bulleted" : "numbered";
    }

    // 現在のアイテムを追加
    const content =
      block.type === "bulleted_list_item"
        ? renderRichText((block as any).bulleted_list_item?.rich_text)
        : renderRichText((block as any).numbered_list_item?.rich_text);

    listItems.push(`<li class="mb-2">${content}</li>`);

    // リストアイテム自体はHTMLを返さないが、リストタイプが変わった場合は前のリストのHTMLを返す
    return { html: prefixHtml };
  }

  // リストアイテム以外の場合、現在のリストがあれば閉じる
  let prefixHtml = "";
  if (listItems.length > 0) {
    prefixHtml = renderListItems();
  }

  // リスト以外のブロックをレンダリング
  const nonListResult = await renderNonListBlock(block);

  // 前のリストHTMLと現在のブロックHTMLを結合
  return {
    html: prefixHtml + nonListResult.html,
    headingInfo: nonListResult.headingInfo, // 見出し情報を伝播
  };
}

// リストアイテム以外のブロックをレンダリング (戻り値の型を変更)
async function renderNonListBlock(
  block: BlockObjectResponse
): Promise<RenderResult> {
  // nullチェック
  if (!block) return { html: "" };

  const { type } = block;
  let headingInfo: HeadingInfo | undefined = undefined; // 見出し情報用変数
  let html = ""; // HTML用変数

  switch (type) {
    case "paragraph":
      const paragraphText = renderRichText((block as any).paragraph?.rich_text);
      const codePenMatch = paragraphText.match(
        /https:\/\/codepen\.io\/[^\s"<>]+/
      );

      if (codePenMatch) {
        // CodePenのURLを検出して埋め込みに変換
        const codePenUrl = codePenMatch[0];
        const codePenEmbed = codePenUrl.replace("/pen/", "/embed/");
        html = `<div class="codepen-wrapper my-8 rounded-md overflow-hidden shadow-md">
                  <iframe 
                    height="400" 
                    style="width: 100%;" 
                    scrolling="no" 
                    src="${codePenEmbed}?height=400&theme-id=dark&default-tab=result" 
                    frameborder="no" 
                    loading="lazy"
                    allowfullscreen="true">
                  </iframe>
                </div>`;
      } else if (paragraphText.trim()) {
        html = `<p class="my-6 leading-relaxed text-primary dark:text-primary/90 hover:text-primary/100 dark:hover:text-primary transition-colors duration-200">${paragraphText}</p>`;
      } else {
        html = `<div class="h-4"></div>`; // 空の段落は小さいスペースとして表示
      }
      break;

    case "heading_1":
      const h1RichText = (block as any).heading_1?.rich_text;
      const h1Text = getPlainText(h1RichText);
      const h1Slug = slugify(h1Text);
      if (h1Text && h1Slug) {
        html = `<h1 id="${h1Slug}" class="text-3xl font-bold mt-10 mb-6 pb-2 border-b-2 border-red-400">${renderRichText(
          h1RichText
        )}</h1>`;
        headingInfo = { level: 1, text: h1Text, slug: h1Slug };
      } else {
        html = `<h1 class="text-3xl font-bold mt-10 mb-6 pb-2 border-b-2 border-red-400">${renderRichText(
          h1RichText
        )}</h1>`;
      }
      break;

    case "heading_2":
      const h2RichText = (block as any).heading_2?.rich_text;
      const h2Text = getPlainText(h2RichText);
      const h2Slug = slugify(h2Text);
      if (h2Text && h2Slug) {
        html = `<h2 id="${h2Slug}" class="text-2xl font-bold mt-8 mb-4 p-4 border border-dashed border-red-400">${renderRichText(
          h2RichText
        )}</h2>`;
        headingInfo = { level: 2, text: h2Text, slug: h2Slug };
      } else {
        html = `<h2 class="text-2xl font-bold mt-8 mb-4 pb-1 border-b border-red-400">${renderRichText(
          h2RichText
        )}</h2>`;
      }
      break;

    case "heading_3":
      const h3RichText = (block as any).heading_3?.rich_text;
      const h3Text = getPlainText(h3RichText);
      const h3Slug = slugify(h3Text);
      if (h3Text && h3Slug) {
        html = `<h3 id="${h3Slug}" class="text-xl font-bold mt-6 mb-3 pl-2 border-l-4 border-red-400">${renderRichText(
          h3RichText
        )}</h3>`;
        headingInfo = { level: 3, text: h3Text, slug: h3Slug };
      } else {
        html = `<h3 class="text-xl font-bold mt-6 mb-3 pl-2 border-l-4 border-red-400">${renderRichText(
          h3RichText
        )}</h3>`;
      }
      break;

    case "quote":
      html = `<blockquote class="border-l-4 border-red-400 pl-4 py-2 my-8 bg-red-50 dark:bg-gray-800 rounded-r-md italic">${renderRichText(
        (block as any).quote?.rich_text
      )}</blockquote>`;
      break;

    case "code":
      codeBlockCounter++;
      const codeId = `code-block-${codeBlockCounter}`;
      const codeContent = renderRichText((block as any).code?.rich_text);
      const language = (block as any).code?.language || "plaintext";

      html = `
        <div class="code-block-container relative my-8 bg-gray-800 rounded-md overflow-hidden shadow-md">
          <div class="flex justify-between items-center px-4 py-2 bg-gray-900 text-gray-300 border-b border-gray-700">
            <span class="text-xs font-mono">${language}</span>
            <button
              class="copy-button bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded transition-colors duration-200"
              data-target="${codeId}"
              onclick="copyCodeToClipboard('${codeId}')"
            >
              コピー
            </button>
          </div>
          <pre class="p-4 overflow-auto text-sm"><code id="${codeId}" class="text-gray-100 language-${language}">${codeContent}</code></pre>
        </div>
      `;
      break;

    // テーブル処理を簡略化・堅牢化
    case "table":
      const tableRows = await notion.blocks.children.list({
        block_id: block.id,
      });

      html = `<div class="overflow-x-auto my-8 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">`;

      tableRows.results.forEach((row: any, rowIndex: number) => {
        if (row.type !== "table_row") return; // Ensure it's a table_row

        const cells = row.table_row?.cells || [];
        if (!cells || cells.length === 0) return;

        const isFirstRow = rowIndex === 0;
        html += isFirstRow
          ? '<tr class="bg-red-50/30 dark:bg-red-900/10 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors duration-150">'
          : '<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">';

        cells.forEach((cell: any) => {
          // Cell data can be an array of rich text objects
          const cellContent = renderRichText(cell); // Use renderRichText directly
          html += `<td class="px-6 py-4 whitespace-nowrap text-sm text-primary">${cellContent}</td>`;
        });
        html += "</tr>";
      });

      html += `</tbody>
        </table>
      </div>`;
      break;

    case "image":
      const image = (block as any).image;
      const imageUrl =
        image?.type === "external" ? image.external.url : image?.file?.url;
      const caption = renderRichText(image?.caption);
      if (imageUrl) {
        html = `<figure class="my-8">
                <img src="${imageUrl}" alt="${
          caption || "Image from Notion"
        }" class="max-w-full h-auto mx-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                ${
                  caption
                    ? `<figcaption class="text-center text-sm text-muted-foreground mt-2 italic">${caption}</figcaption>`
                    : ""
                }
             </figure>`;
      }
      break;

    case "divider":
      html = `<hr class="my-8 h-px border-0 bg-gradient-to-r from-transparent via-red-400 dark:via-red-500 to-transparent">`;
      break;

    case "callout":
      const callout = (block as any).callout;
      const icon = callout?.icon?.emoji || "💡"; // Default icon
      html = `<div class="my-6 p-4 border rounded-md flex items-start space-x-3 bg-red-50 border-red-200 dark:bg-gray-800 dark:border-red-400 shadow-sm hover:shadow transition-shadow duration-200">
             <span class="text-xl select-none">${icon}</span>
             <div class="text-primary">${renderRichText(
               callout?.rich_text
             )}</div>
         </div>`;
      break;

    case "toggle":
      // Get toggle children recursively
      const toggleChildren = await notion.blocks.children.list({
        block_id: block.id,
      });
      const toggleContent = (
        await Promise.all(
          toggleChildren.results.map((child) =>
            renderBlock(child as BlockObjectResponse)
          )
        )
      )
        .map((res) => res.html)
        .join("");
      const summary = renderRichText((block as any).toggle?.rich_text);
      html = `<details class="my-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 shadow-sm hover:shadow transition-shadow duration-200">
                    <summary class="cursor-pointer font-medium text-primary hover:text-red-500 transition-colors duration-150">${summary}</summary>
                    <div class="mt-4 pt-3 border-t border-red-400 dark:border-red-400 text-primary">${toggleContent}</div>
                </details>`;
      break;

    case "child_page":
      html = `<div class="my-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow duration-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="font-medium text-primary">${
                  (block as any).child_page?.title || "Untitled"
                }</p>
              </div>`;
      break;

    case "embed":
      const embedUrl = (block as any).embed?.url;
      if (embedUrl && embedUrl.includes("codepen.io")) {
        // CodePenのURLを埋め込み用に変換
        const codePenSrc = embedUrl.replace("/pen/", "/embed/");
        html = `<div class="codepen-wrapper my-8 rounded-md overflow-hidden shadow-md">
                  <iframe 
                    height="400" 
                    style="width: 100%;" 
                    scrolling="no" 
                    src="${codePenSrc}?height=400&theme-id=dark&default-tab=result" 
                    frameborder="no" 
                    loading="lazy"
                    allowfullscreen="true">
                  </iframe>
                </div>`;
      } else {
        html = `<div class="embed-container my-8 rounded-md overflow-hidden shadow-md">
                  <iframe 
                    src="${embedUrl}" 
                    style="width: 100%;" 
                    height="400" 
                    frameborder="0" 
                    allowfullscreen="true"
                    loading="lazy">
                  </iframe>
                </div>`;
      }
      break;

    case "unsupported":
      console.warn("Unsupported block type:", block.type);
      html = ""; // Or render a placeholder
      break;

    default:
      console.warn("Unhandled block type:", type);
      html = ""; // Or render a placeholder
  }
  return { html, headingInfo }; // 結果オブジェクトを返す
}

// 最後のリストを閉じる処理を実行 (renderBlock の結果を受け取るように変更)
export function finalizeRenderedContent(results: RenderResult[]): {
  html: string;
  headings: HeadingInfo[];
} {
  let finalHtml = results.map((r) => r.html).join("");
  const headings = results
    .filter((r) => r.headingInfo)
    .map((r) => r.headingInfo as HeadingInfo);

  // ループの最後にリストが残っている場合、ここで閉じる
  if (listItems.length > 0) {
    finalHtml += renderListItems();
  }

  return { html: finalHtml, headings };
}
