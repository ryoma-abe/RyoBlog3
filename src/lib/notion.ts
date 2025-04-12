import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  BlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

const notion = new Client({
  auth: import.meta.env.NOTION_API_KEY,
});

const databaseId = import.meta.env.NOTION_DATABASE_ID;

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
    case "heading_1":
      return `<h1>${block.heading_1.rich_text
        .map((text) => text.plain_text)
        .join("")}</h1>`;
    case "heading_2":
      return `<h2>${block.heading_2.rich_text
        .map((text) => text.plain_text)
        .join("")}</h2>`;
    case "heading_3":
      return `<h3>${block.heading_3.rich_text
        .map((text) => text.plain_text)
        .join("")}</h3>`;
    case "bulleted_list_item":
      return `<li>${block.bulleted_list_item.rich_text
        .map((text) => text.plain_text)
        .join("")}</li>`;
    case "numbered_list_item":
      return `<li>${block.numbered_list_item.rich_text
        .map((text) => text.plain_text)
        .join("")}</li>`;
    case "code":
      return `<pre><code class="language-${
        block.code.language
      }">${block.code.rich_text
        .map((text) => text.plain_text)
        .join("")}</code></pre>`;
    default:
      return "";
  }
}
