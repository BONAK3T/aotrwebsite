import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getSnapshot } from "../items";
import type { Item } from "@/lib/sheets-data";

const side = z
  .array(
    z.object({
      item: z.string().trim().min(1).describe("Item name or id."),
      quantity: z.number().int().min(1).default(1),
    }),
  )
  .describe("Items offered on this side of the trade.");

function resolve(items: Item[], name: string) {
  const key = name.toLowerCase();
  return (
    items.find((i) => i.id.toLowerCase() === key) ??
    items.find((i) => i.name.toLowerCase() === key) ??
    items.find((i) => i.name.toLowerCase().includes(key))
  );
}

export default defineTool({
  name: "compare_trade",
  title: "Compare a trade",
  description:
    "Sum the value of two sides of a trade (in keys and viz) and report which side wins and by how much.",
  inputSchema: { your_offer: side, their_offer: side },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ your_offer, their_offer }) => {
    const { items } = await getSnapshot();
    const missing: string[] = [];
    const total = (entries: typeof your_offer) => {
      let keys = 0;
      let viz = 0;
      const lines: { name: string; quantity: number; value: string }[] = [];
      for (const e of entries) {
        const found = resolve(items, e.item);
        if (!found) {
          missing.push(e.item);
          continue;
        }
        keys += found.numericValue * e.quantity;
        viz += found.vizValue * e.quantity;
        lines.push({ name: found.name, quantity: e.quantity, value: found.value });
      }
      return { keys, viz, lines };
    };
    const mine = total(your_offer);
    const theirs = total(their_offer);
    const diffKeys = theirs.keys - mine.keys;
    const verdict =
      diffKeys > 0 ? "Their offer is worth more" : diffKeys < 0 ? "Your offer is worth more" : "Even trade";
    const payload = {
      your_offer: mine,
      their_offer: theirs,
      difference_in_keys: diffKeys,
      difference_in_viz: theirs.viz - mine.viz,
      verdict,
      unmatched_items: missing,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
