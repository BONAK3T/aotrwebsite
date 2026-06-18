import { createServerFn } from "@tanstack/react-start";

const SHEET_BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR7naBmry1w8WlHFrtpxJ0n3XdgDj5cehW6XxTdJVDPMDivrnOefz83uuFCoYEGd028tjFQ6tcfPyBA/pub";

export type Trend = "Rising" | "Dropping" | "Stable";

export type Item = {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  section: string; // sub-grouping inside the sheet (e.g. "JJK Crate")
  rarity: string;
  demand: number | null;
  value: string;
  trend: Trend;
  taxGems: string;
  taxGold: string;
  numericValue: number; // best-effort numeric for sorting (keys)
};

export type SheetSpec = { gid: string; category: string; label: string };

export const SHEETS: SheetSpec[] = [
  { gid: "1985243848", category: "family", label: "Bloodlines / Families" },
  { gid: "365176366", category: "perks", label: "Perks / Traits" },
  { gid: "1256383298", category: "artifacts", label: "Artifacts" },
  { gid: "1207135228", category: "raid", label: "Raid & Mission Drops" },
  { gid: "1350029234", category: "shop", label: "Shop / Market" },
  { gid: "760101351", category: "robux", label: "Robux Items" },
  { gid: "30110624", category: "events", label: "Event Items" },
  { gid: "1606480838", category: "cosmetics", label: "Cosmetics" },
  { gid: "824267924", category: "cosmetics", label: "Other Cosmetics" },
  { gid: "346887600", category: "cosmetics", label: "Scout Fashions" },
  { gid: "1161641948", category: "crates", label: "Anime All Star Crates" },
  { gid: "931952227", category: "crates", label: "Blade Burst Crate" },
  { gid: "300368556", category: "battlepass", label: "Battlepass" },
];

export const CATEGORY_LABELS: Record<string, string> = {
  family: "Bloodlines",
  perks: "Perks",
  artifacts: "Artifacts",
  raid: "Raid Drops",
  shop: "Shop",
  robux: "Robux",
  events: "Events",
  cosmetics: "Cosmetics",
  crates: "Crates",
  battlepass: "Battlepass",
};

// CSV parser supporting quoted fields with commas and escaped quotes.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else if (c === "\r") { /* skip */ }
      else cur += c;
    }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseNumericValue(raw: string): number {
  // strip emoji and pick first number-looking token, supporting k/M suffix
  const cleaned = raw.replace(/[^\d.,kKmM/\s]/g, " ");
  const match = cleaned.match(/([\d.,]+)\s*([kKmM])?/);
  if (!match) return 0;
  const n = parseFloat(match[1].replace(/,/g, ""));
  if (isNaN(n)) return 0;
  const suf = match[2]?.toLowerCase();
  return suf === "k" ? n * 1000 : suf === "m" ? n * 1_000_000 : n;
}

function parseVizValue(raw: string): number {
  // handle patterns like "2.5viz" or "🔑2.25k/2.5viz"
  const match = raw.match(/(\d+(?:\.\d+)?)\s*viz/i);
  if (!match) return 0;
  const n = parseFloat(match[1]);
  return isNaN(n) ? 0 : n;
}

function normalizeTrend(s: string): Trend {
  const v = s.trim().toLowerCase();
  if (v.startsWith("ris")) return "Rising";
  if (v.startsWith("drop") || v.startsWith("fall")) return "Dropping";
  return "Stable";
}

async function fetchSheet(spec: SheetSpec): Promise<Item[]> {
  const url = `${SHEET_BASE}?gid=${spec.gid}&single=true&output=csv`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return [];
  const text = await res.text();
  const rows = parseCsv(text).filter((r) => r.some((c) => c.trim() !== ""));
  if (rows.length < 2) return [];
  // Expected header: Item Name, Rarity, Demand, Value, Rate Of Change, Tax (Gems), Tax (Gold)
  const items: Item[] = [];
  let section = spec.label;
  const seenIds = new Set<string>();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const name = (r[0] ?? "").trim();
    if (!name) continue;
    const rarity = (r[1] ?? "").trim();
    const value = (r[3] ?? "").trim();
    // Section divider rows have a name but no rarity/value
    if (!rarity && !value) {
      section = name;
      continue;
    }
    const demandRaw = (r[2] ?? "").trim();
    const demand = demandRaw && !isNaN(parseFloat(demandRaw)) ? parseFloat(demandRaw) : null;
    const trend = normalizeTrend(r[4] ?? "");
    const taxGems = (r[5] ?? "").trim();
    const taxGold = (r[6] ?? "").trim();
    let id = `${spec.category}-${slugify(name)}`;
    let n = 2;
    while (seenIds.has(id)) { id = `${spec.category}-${slugify(name)}-${n++}`; }
    seenIds.add(id);
    items.push({
      id,
      name,
      category: spec.category,
      categoryLabel: CATEGORY_LABELS[spec.category] ?? spec.label,
      section,
      rarity: rarity || "Common",
      demand,
      value: value || "—",
      trend,
      taxGems,
      taxGold,
      numericValue: parseNumericValue(value),
    });
  }
  return items;
}

export type SheetSnapshot = {
  fetchedAt: string;
  items: Item[];
};

export const getAllItems = createServerFn({ method: "GET" }).handler(
  async (): Promise<SheetSnapshot> => {
    const all = await Promise.all(SHEETS.map(fetchSheet));
    const seen = new Set<string>();
    const items: Item[] = [];
    for (const it of all.flat()) {
      if (seen.has(it.id)) continue;
      seen.add(it.id);
      items.push(it);
    }
    return { fetchedAt: new Date().toISOString(), items };
  },
);
