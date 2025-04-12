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
    page_size: 100,
  });

  // ネストされたブロックがある場合に再帰的に取得
  const childBlocks = await Promise.all(
    blocks.results.map(async (block) => {
      if (block.has_children) {
        const children = await getNotionBlocks(block.id);
        return {
          ...block,
          children,
        };
      }
      return block;
    })
  );

  return childBlocks as BlockObjectResponse[];
}

// リッチテキストの処理
function renderRichText(richTextArr: any[]): string {
  if (!richTextArr || richTextArr.length === 0) return "";

  return richTextArr
    .map((text) => {
      let result = text.plain_text;

      // スタイル適用
      if (text.annotations.bold) result = `<strong>${result}</strong>`;
      if (text.annotations.italic) result = `<em>${result}</em>`;
      if (text.annotations.strikethrough) result = `<del>${result}</del>`;
      if (text.annotations.underline) result = `<u>${result}</u>`;
      if (text.annotations.code) result = `<code>${result}</code>`;

      // リンク
      if (text.href) {
        result = `<a href="${text.href}" target="_blank" rel="noopener noreferrer">${result}</a>`;
      }

      return result;
    })
    .join("");
}

// 連続するリストアイテムの処理
let currentListType: "bulleted" | "numbered" | null = null;
let listItems: string[] = [];

// リストをHTMLに変換する
function renderListItems(): string {
  if (listItems.length === 0) return "";

  const tag = currentListType === "bulleted" ? "ul" : "ol";
  const html = `<${tag}>${listItems.join("")}</${tag}>`;

  // リストをリセット
  listItems = [];
  currentListType = null;

  return html;
}

export function renderBlock(block: BlockObjectResponse): string {
  // リストアイテム以外のブロックが来た場合、現在のリストを終了
  if (
    block.type !== "bulleted_list_item" &&
    block.type !== "numbered_list_item" &&
    currentListType !== null
  ) {
    const listHtml = renderListItems();
    return listHtml + renderBlockContent(block);
  }

  return renderBlockContent(block);
}

function renderBlockContent(block: BlockObjectResponse): string {
  const { type } = block;

  switch (type) {
    case "paragraph":
      return `<p>${renderRichText(block.paragraph.rich_text)}</p>`;

    case "heading_1":
      return `<h1 class="text-4xl font-bold mt-8 mb-4">${renderRichText(
        block.heading_1.rich_text
      )}</h1>`;

    case "heading_2":
      return `<h2 class="text-3xl font-bold mt-6 mb-3">${renderRichText(
        block.heading_2.rich_text
      )}</h2>`;

    case "heading_3":
      return `<h3 class="text-2xl font-bold mt-5 mb-2">${renderRichText(
        block.heading_3.rich_text
      )}</h3>`;

    case "bulleted_list_item":
      // リストタイプが変わった場合、前のリストを閉じる
      if (currentListType && currentListType !== "bulleted") {
        const listHtml = renderListItems();
        currentListType = "bulleted";
        listItems.push(
          `<li>${renderRichText(block.bulleted_list_item.rich_text)}</li>`
        );
        return listHtml;
      }

      // 同じリストタイプなら追加
      currentListType = "bulleted";
      listItems.push(
        `<li>${renderRichText(block.bulleted_list_item.rich_text)}</li>`
      );
      return "";

    case "numbered_list_item":
      // リストタイプが変わった場合、前のリストを閉じる
      if (currentListType && currentListType !== "numbered") {
        const listHtml = renderListItems();
        currentListType = "numbered";
        listItems.push(
          `<li>${renderRichText(block.numbered_list_item.rich_text)}</li>`
        );
        return listHtml;
      }

      // 同じリストタイプなら追加
      currentListType = "numbered";
      listItems.push(
        `<li>${renderRichText(block.numbered_list_item.rich_text)}</li>`
      );
      return "";

    case "quote":
      return `<blockquote class="pl-4 border-l-4 border-gray-300 italic my-4">
        ${renderRichText(block.quote.rich_text)}
      </blockquote>`;

    case "code":
      return `<pre class="bg-gray-100 p-4 rounded-md overflow-x-auto my-4">
        <code class="language-${
          block.code.language || "plaintext"
        }">${renderRichText(block.code.rich_text)}</code>
      </pre>`;

    case "image":
      const imageUrl =
        block.image.type === "external"
          ? block.image.external.url
          : block.image.file.url;
      const caption =
        block.image.caption.length > 0
          ? `<figcaption class="text-center text-sm text-gray-500 mt-2">${renderRichText(
              block.image.caption
            )}</figcaption>`
          : "";

      return `<figure class="my-6">
        <img src="${imageUrl}" alt="${
        caption ? renderRichText(block.image.caption) : "Image"
      }" class="max-w-full h-auto rounded-lg" />
        ${caption}
      </figure>`;

    case "divider":
      return `<hr class="my-8 border-t border-gray-300" />`;

    case "table":
      let tableHtml = `<div class="overflow-x-auto my-6">
        <table class="min-w-full border-collapse border border-gray-300">`;

      // ヘッダー行があるか
      const hasColumnHeader = block.table.has_column_header;

      if (block.children && block.children.length > 0) {
        for (let i = 0; i < block.children.length; i++) {
          const row = block.children[i];
          if (row.type !== "table_row") continue;

          // ヘッダー行
          if (i === 0 && hasColumnHeader) {
            tableHtml += "<thead><tr>";
            for (const cell of row.table_row.cells) {
              tableHtml += `<th class="px-4 py-2 border border-gray-300 bg-gray-100">${renderRichText(
                cell
              )}</th>`;
            }
            tableHtml += "</tr></thead><tbody>";
          } else {
            // 通常の行
            if (i === 0) tableHtml += "<tbody>";
            tableHtml += "<tr>";
            for (const cell of row.table_row.cells) {
              tableHtml += `<td class="px-4 py-2 border border-gray-300">${renderRichText(
                cell
              )}</td>`;
            }
            tableHtml += "</tr>";
          }
        }
      }

      tableHtml += "</tbody></table></div>";
      return tableHtml;

    default:
      return `<div class="text-gray-500 my-4">未対応ブロック: ${type}</div>`;
  }
}

// 最後のリストを閉じる処理
export function finalizeRenderedContent(content: string): string {
  if (listItems.length > 0) {
    return content + renderListItems();
  }
  return content;
}
