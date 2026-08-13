import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getSnapshot, summarize } from "../items";

export default defineTool({
  name: "list_trends",
  title: "List rising or dropping items",
  description:
    "List the highest-value items whose community value is currently rising, dropping or stable.",
  inputSchema: {
    trend: z.enum(["Rising", "Dropping", "Stable"]).describe("Which trend to list."),
    limit: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ trend, limit }) => {
    const { items, fetchedAt } = await getSnapshot();
    const matches = items
      .filter((i) => i.trend === trend)
      .sort((a, b) => b.numericValue - a.numericValue)
      .slice(0, limit)
      .map(summarize);
    const payload = { trend, count: matches.length, items: matches, synced_at: fetchedAt };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
