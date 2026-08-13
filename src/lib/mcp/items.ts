import { loadAllItems, type Item, type SheetSnapshot } from "@/lib/sheets-data";

let cache: { at: number; snapshot: SheetSnapshot } | null = null;
const TTL = 5 * 60 * 1000;

export async function getSnapshot(): Promise<SheetSnapshot> {
  if (cache && Date.now() - cache.at < TTL) return cache.snapshot;
  const snapshot = await loadAllItems();
  cache = { at: Date.now(), snapshot };
  return snapshot;
}

export function summarize(item: Item) {
  return {
    id: item.id,
    name: item.name,
    category: item.categoryLabel,
    section: item.section,
    rarity: item.rarity,
    demand: item.demand,
    value: item.value,
    value_in_keys: item.numericValue,
    value_in_viz: item.vizValue,
    trend: item.trend,
    tax_gems: item.taxGems,
    tax_gold: item.taxGold,
  };
}
