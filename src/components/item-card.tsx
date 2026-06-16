import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import type { Item, Trend } from "@/lib/sheets.functions";

const RARITY_CLASS: Record<string, string> = {
  Common: "border-rarity-common/40 text-rarity-common",
  Uncommon: "border-rarity-uncommon/50 text-rarity-uncommon",
  Rare: "border-rarity-rare/50 text-rarity-rare",
  Epic: "border-rarity-epic/50 text-rarity-epic",
  Legendary: "border-rarity-legendary/60 text-rarity-legendary",
  Mythic: "border-rarity-mythic/60 text-rarity-mythic",
  Divine: "border-gold/70 text-gold",
  Events: "border-rarity-events/50 text-rarity-events",
};

export function RarityBadge({ rarity }: { rarity: string }) {
  const cls = RARITY_CLASS[rarity] ?? "border-border text-muted-foreground";
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${cls}`}>
      {rarity}
    </span>
  );
}

export function TrendBadge({ trend }: { trend: Trend }) {
  if (trend === "Rising")
    return (
      <span className="inline-flex items-center gap-1 rounded bg-rising/15 px-2 py-1 text-xs font-semibold text-rising">
        <ArrowUp className="h-3 w-3" /> Rising
      </span>
    );
  if (trend === "Dropping")
    return (
      <span className="inline-flex items-center gap-1 rounded bg-dropping/15 px-2 py-1 text-xs font-semibold text-dropping">
        <ArrowDown className="h-3 w-3" /> Dropping
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
      <ArrowRight className="h-3 w-3" /> Stable
    </span>
  );
}

function DemandBar({ demand }: { demand: number | null }) {
  if (demand == null) return null;
  const pct = Math.max(0, Math.min(10, demand)) * 10;
  const color = demand >= 7 ? "bg-rising" : demand >= 4 ? "bg-gold" : "bg-dropping";
  return (
    <div className="flex items-center gap-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Demand</div>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs font-semibold text-foreground">{demand}/10</div>
    </div>
  );
}

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link
      to="/item/$id"
      params={{ id: item.id }}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_0_0_1px_var(--color-primary)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-display text-lg text-foreground">{item.name}</div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{item.section}</div>
        </div>
        <RarityBadge rarity={item.rarity} />
      </div>
      <div className="font-mono text-xl font-bold tracking-tight text-gold">{item.value}</div>
      <div className="flex items-center justify-between gap-2">
        <TrendBadge trend={item.trend} />
        <DemandBar demand={item.demand} />
      </div>
    </Link>
  );
}
