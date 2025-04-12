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

export function renderBlock(block: BlockObjectResponse): string {
  switch (block.type) {
    case "paragraph":
      return `<p>${block.paragraph.rich_text
        .map((text) => text.plain_text)
        .join("")}</p>`;
    default:
      return `<div>未対応ブロック: ${block.type}</div>`;
  }
}
