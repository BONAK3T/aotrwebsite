import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getSnapshot, summarize } from "../items";

export default defineTool({
  name: "search_items",
  title: "Search trading items",
  description:
    "Search Attack on Titan Revolution trading items by name, category, section or rarity, and return their current community values.",
  inputSchema: {
    query: z.string().trim().describe("Text to match against item name, section or category."),
    limit: z.number().int().min(1).max(50).default(10).describe("Maximum number of results."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query, limit }) => {
    const { items } = await getSnapshot();
    const q = query.toLowerCase();
    const matches = items
      .filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.section.toLowerCase().includes(q) ||
          i.categoryLabel.toLowerCase().includes(q) ||
          i.rarity.toLowerCase().includes(q),
      )
      .slice(0, limit)
      .map(summarize);
    return {
      content: [{ type: "text", text: JSON.stringify({ count: matches.length, matches }, null, 2) }],
      structuredContent: { count: matches.length, matches },
    };
  },
});
