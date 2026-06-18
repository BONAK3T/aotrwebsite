import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2, ArrowLeftRight } from "lucide-react";
import { getAllItems, CATEGORY_LABELS, type Item } from "@/lib/sheets.functions";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { RarityBadge } from "@/components/item-card";

const itemsQuery = queryOptions({
  queryKey: ["sheet-items"],
  queryFn: () => getAllItems(),
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
});

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Trade Calculator — AOT:R Trading Value Centre" },
      { name: "description", content: "Add items to two offers and compare their total trading value side by side." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(itemsQuery),
  errorComponent: ({ error }) => <div className="p-8 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-8">Not found</div>,
  component: Calculator,
});

type Entry = { uid: string; item: Item; qty: number };

function formatValue(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2).replace(/\.?0+$/, "")}k`;
  return n.toLocaleString();
}

function formatViz(n: number) {
  if (n === 0) return "—";
  return `${n % 1 === 0 ? n : n.toFixed(2).replace(/\.?0+$/, "")}viz`;
}

function Calculator() {
  const { data } = useSuspenseQuery(itemsQuery);
  const [offerA, setOfferA] = useState<Entry[]>([]);
  const [offerB, setOfferB] = useState<Entry[]>([]);

  const totalA = useMemo(() => offerA.reduce((s, e) => s + e.item.numericValue * e.qty, 0), [offerA]);
  const totalB = useMemo(() => offerB.reduce((s, e) => s + e.item.numericValue * e.qty, 0), [offerB]);
  const diff = totalA - totalB;

  const vizA = useMemo(() => offerA.reduce((s, e) => s + e.item.vizValue * e.qty, 0), [offerA]);
  const vizB = useMemo(() => offerB.reduce((s, e) => s + e.item.vizValue * e.qty, 0), [offerB]);
  const vizDiff = vizA - vizB;

  const swap = () => {
    const a = offerA;
    setOfferA(offerB);
    setOfferB(a);
  };

  return (
    <div className="min-h-screen">
      <SiteNav />

      <section className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Trade Tools</div>
          <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">Trade Calculator</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Build two offers, set quantities, and instantly see which side has the higher total trading value.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-5">
          <div className="grid flex-1 grid-cols-3 items-center gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Your offer</div>
              <div className="font-display text-2xl text-gold">{formatValue(totalA)}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{formatViz(vizA)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Difference</div>
              <div className={`font-display text-2xl ${diff > 0 ? "text-rising" : diff < 0 ? "text-dropping" : "text-foreground"}`}>
                {diff === 0 ? "Even" : `${diff > 0 ? "+" : ""}${formatValue(diff)}`}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {vizDiff === 0 ? "—" : `${vizDiff > 0 ? "+" : ""}${formatViz(vizDiff)}`}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                {diff === 0 ? "Fair trade" : diff > 0 ? "You're overpaying" : "You profit"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Their offer</div>
              <div className="font-display text-2xl text-gold">{formatValue(totalB)}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{formatViz(vizB)}</div>
            </div>
          </div>
          <button
            onClick={swap}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold uppercase tracking-widest text-foreground hover:border-primary"
          >
            <ArrowLeftRight className="h-4 w-4" /> Swap
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <OfferColumn title="Your Offer" tone="rising" items={data.items} entries={offerA} setEntries={setOfferA} total={totalA} vizTotal={vizA} />
          <OfferColumn title="Their Offer" tone="dropping" items={data.items} entries={offerB} setEntries={setOfferB} total={totalB} vizTotal={vizB} />
        </div>
      </div>

      <SiteFooter fetchedAt={data.fetchedAt} />
    </div>
  );
}

function OfferColumn({
  title, tone, items, entries, setEntries, total,
}: {
  title: string;
  tone: "rising" | "dropping";
  items: Item[];
  entries: Entry[];
  setEntries: React.Dispatch<React.SetStateAction<Entry[]>>;
  total: number;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return items
      .filter((i) => i.name.toLowerCase().includes(term))
      .slice(0, 8);
  }, [q, items]);

  const add = (item: Item) => {
    setEntries((prev) => {
      const existing = prev.find((e) => e.item.id === item.id);
      if (existing) return prev.map((e) => (e.item.id === item.id ? { ...e, qty: e.qty + 1 } : e));
      return [...prev, { uid: `${item.id}-${Date.now()}`, item, qty: 1 }];
    });
    setQ("");
  };

  const setQty = (uid: string, qty: number) =>
    setEntries((prev) => prev.map((e) => (e.uid === uid ? { ...e, qty: Math.max(1, qty) } : e)));
  const remove = (uid: string) => setEntries((prev) => prev.filter((e) => e.uid !== uid));
  const clear = () => setEntries([]);

  const toneBorder = tone === "rising" ? "border-rising/30" : "border-dropping/30";

  return (
    <div className={`rounded-xl border bg-card p-5 ${toneBorder}`}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-foreground">{title}</h2>
        <button
          onClick={clear}
          disabled={entries.length === 0}
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          Clear
        </button>
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search items to add…"
          className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-3 text-sm text-foreground focus:border-primary focus:outline-none"
        />
        {results.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-72 overflow-auto rounded-md border border-border bg-popover shadow-xl">
            {results.map((i) => (
              <button
                key={i.id}
                onClick={() => add(i)}
                className="flex w-full items-center justify-between gap-2 border-b border-border/40 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-accent"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-foreground">{i.name}</span>
                    <RarityBadge rarity={i.rarity} />
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {CATEGORY_LABELS[i.category] ?? i.category}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gold">{i.value}</span>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 space-y-2">
        {entries.length === 0 && (
          <div className="rounded-md border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            Search above to add items to this offer.
          </div>
        )}
        {entries.map((e) => (
          <div key={e.uid} className="flex items-center gap-3 rounded-md border border-border bg-background/40 p-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-foreground">{e.item.name}</span>
                <RarityBadge rarity={e.item.rarity} />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {e.item.value} each
              </div>
            </div>
            <input
              type="number"
              min={1}
              value={e.qty}
              onChange={(ev) => setQty(e.uid, parseInt(ev.target.value) || 1)}
              className="w-16 rounded border border-border bg-background px-2 py-1 text-center text-sm text-foreground"
            />
            <div className="w-20 text-right font-mono text-sm text-gold">
              {formatValue(e.item.numericValue * e.qty)}
            </div>
            <button onClick={() => remove(e.uid)} className="rounded p-1 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Total · {entries.length} item{entries.length === 1 ? "" : "s"}</div>
        <div className="font-display text-2xl text-gold">{formatValue(total)}</div>
      </div>
    </div>
  );
}
