import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getSnapshot, summarize } from "../items";

export default defineTool({
  name: "get_item_value",
  title: "Get item value",
  description:
    "Get the full value details (value, viz, demand, rarity, trend, taxes) for one item by its exact name or id.",
  inputSchema: {
    item: z.string().trim().min(1).describe("Item name or item id, e.g. 'Attack Titan'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ item }) => {
    const { items, fetchedAt } = await getSnapshot();
    const key = item.toLowerCase();
    const found =
      items.find((i) => i.id.toLowerCase() === key) ??
      items.find((i) => i.name.toLowerCase() === key) ??
      items.find((i) => i.name.toLowerCase().includes(key));
    if (!found) throw new ToolError(`No item found matching "${item}".`);
    const payload = { ...summarize(found), synced_at: fetchedAt };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
