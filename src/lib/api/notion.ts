import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  BlockObjectResponse,
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

// リッチテキストの処理（安全なバージョン）
function renderRichText(richTextArr: any[] = []): string {
  if (!richTextArr || richTextArr.length === 0) return "";

  return richTextArr
    .map((text) => {
      if (!text) return "";

      let result = text.plain_text || "";

      // スタイル適用
      if (text.annotations?.bold) result = `<strong>${result}</strong>`;
      if (text.annotations?.italic) result = `<em>${result}</em>`;
      if (text.annotations?.strikethrough) result = `<del>${result}</del>`;
      if (text.annotations?.underline) result = `<u>${result}</u>`;
      if (text.annotations?.code)
        result = `<code class="bg-gray-100 px-1 py-0.5 rounded">${result}</code>`;

      // リンク
      if (text.href) {
        result = `<a href="${text.href}" class="text-blue-600 hover:underline">${result}</a>`;
      }

      return result;
    })
    .join("");
}

let codeBlockCounter = 0;

export async function renderBlock(block: BlockObjectResponse): Promise<string> {
  // nullチェック
  if (!block) return "";

  // リストアイテムの処理
  if (
    block.type === "bulleted_list_item" ||
    block.type === "numbered_list_item"
  ) {
    const isNewListType =
      currentListType === null ||
      (block.type === "bulleted_list_item" && currentListType !== "bulleted") ||
      (block.type === "numbered_list_item" && currentListType !== "numbered");

    // リストタイプが変わった場合、前のリストを閉じる
    if (isNewListType && listItems.length > 0) {
      const html = renderListItems();

      // 新しいリストタイプを設定
      currentListType =
        block.type === "bulleted_list_item" ? "bulleted" : "numbered";

      // 現在のアイテムを追加
      const content =
        block.type === "bulleted_list_item"
          ? renderRichText((block as any).bulleted_list_item?.rich_text)
          : renderRichText((block as any).numbered_list_item?.rich_text);

      listItems.push(`<li class="mb-2">${content}</li>`);

      return html;
    }

    // 同じリストタイプなら、リストアイテムを追加
    currentListType =
      block.type === "bulleted_list_item" ? "bulleted" : "numbered";

    const content =
      block.type === "bulleted_list_item"
        ? renderRichText((block as any).bulleted_list_item?.rich_text)
        : renderRichText((block as any).numbered_list_item?.rich_text);

    listItems.push(`<li class="mb-2">${content}</li>`);

    return "";
  }

  // リストアイテム以外の場合、現在のリストを閉じる
  if (listItems.length > 0) {
    const html = renderListItems();
    return html + (await renderNonListBlock(block));
  }

  return await renderNonListBlock(block);
}

// リストアイテム以外のブロックをレンダリング
async function renderNonListBlock(block: BlockObjectResponse): Promise<string> {
  // nullチェック
  if (!block) return "";

  const { type } = block;

  switch (type) {
    case "paragraph":
      return `<p class="my-6 leading-relaxed">${renderRichText(
        (block as any).paragraph?.rich_text
      )}</p>`;

    case "heading_1":
      return `<h1 class="text-3xl font-bold mt-10 mb-6">${renderRichText(
        (block as any).heading_1?.rich_text
      )}</h1>`;

    case "heading_2":
      return `<h2 class="text-2xl font-bold mt-8 mb-4">${renderRichText(
        (block as any).heading_2?.rich_text
      )}</h2>`;

    case "heading_3":
      return `<h3 class="text-xl font-bold mt-6 mb-3">${renderRichText(
        (block as any).heading_3?.rich_text
      )}</h3>`;

    case "quote":
      return `<blockquote class="border-l-4 pl-4 my-8 border-gray-300 italic py-2">${renderRichText(
        (block as any).quote?.rich_text
      )}</blockquote>`;

    case "code":
      codeBlockCounter++;
      const codeId = `code-block-${codeBlockCounter}`;
      const codeContent = renderRichText((block as any).code?.rich_text);
      const language = (block as any).code?.language || "plaintext";

      return `
        <div class="code-block-container relative my-8 bg-gray-800 rounded-md overflow-hidden">
          <div class="flex justify-between items-center px-4 py-2 bg-gray-900 text-gray-300">
            <span class="text-xs font-mono">${language}</span>
            <button 
              class="copy-button bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded" 
              data-target="${codeId}"
              onclick="copyCodeToClipboard('${codeId}')"
            >
              コピー
            </button>
          </div>
          <pre class="p-4 overflow-auto"><code id="${codeId}" class="text-gray-100">${codeContent}</code></pre>
        </div>
      `;

    case "table":
      const table = (block as any).table;
      console.log("Table block:", JSON.stringify(table, null, 2));

      if (!table) {
        console.log("Table data is missing");
        return `<div class="overflow-x-auto my-8">
          <table class="min-w-full border border-gray-300">
            <tbody>
              <tr><td class="p-3 border">テーブルデータがありません</td></tr>
            </tbody>
          </table>
        </div>`;
      }

      // テーブルの子ブロックを取得
      const tableRows = await notion.blocks.children.list({
        block_id: block.id,
      });
      console.log("Table rows:", JSON.stringify(tableRows, null, 2));

      let tableHtml = `<div class="overflow-x-auto my-8">
        <table class="min-w-full border border-gray-300">
          <tbody>`;

      tableRows.results.forEach((row: any) => {
        console.log("Table row:", JSON.stringify(row, null, 2));

        // 行データの取得方法を改善
        const cells = row.table_row?.cells || [];
        if (!cells || cells.length === 0) {
          console.log("Row data is missing");
          return;
        }

        tableHtml += "<tr>";
        cells.forEach((cell: any) => {
          console.log("Table cell:", JSON.stringify(cell, null, 2));

          // セルデータの取得方法を改善
          const cellData = Array.isArray(cell) ? cell : cell.rich_text || [];
          const cellContent =
            cellData.length > 0 ? renderRichText(cellData) : "&nbsp;";
          tableHtml += `<td class="p-3 border">${cellContent}</td>`;
        });
        tableHtml += "</tr>";
      });

      tableHtml += `</tbody>
        </table>
      </div>`;

      return tableHtml;

    case "divider":
      return `<hr class="my-10 border-t border-gray-300" />`;

    case "image":
      const imageType = (block as any).image?.type || "external";
      const imageUrl =
        imageType === "external"
          ? (block as any).image?.external?.url || ""
          : (block as any).image?.file?.url || "";
      const caption = renderRichText((block as any).image?.caption);

      return `<figure class="my-8">
        <img src="${imageUrl}" alt="${
        caption || "Image"
      }" class="max-w-full h-auto rounded-lg" />
        ${
          caption
            ? `<figcaption class="text-center text-sm text-gray-500 mt-3">${caption}</figcaption>`
            : ""
        }
      </figure>`;

    default:
      return `<div class="text-gray-500 my-4">未対応ブロック: ${type}</div>`;
  }
}

// 最後のリストを閉じる処理
export function finalizeRenderedContent(content: string): string {
  // コードブロックのコピー機能用のJavaScriptを追加
  const copyScript = `
    <script>
      function copyCodeToClipboard(codeId) {
        const codeElement = document.getElementById(codeId);
        const text = codeElement.textContent;
        
        navigator.clipboard.writeText(text).then(() => {
          const button = document.querySelector(\`button[data-target="\${codeId}"]\`);
          const originalText = button.textContent;
          
          button.textContent = 'コピーしました！';
          button.classList.add('bg-green-600');
          
          setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('bg-green-600');
          }, 2000);
        }).catch(err => {
          console.error('コピーに失敗しました:', err);
          alert('コピーに失敗しました');
        });
      }
    </script>
  `;

  // リストを閉じる処理
  let finalContent = content;
  if (listItems.length > 0) {
    finalContent += renderListItems();
  }

  return finalContent + copyScript;
}
