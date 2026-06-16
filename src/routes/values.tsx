import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { getAllItems, CATEGORY_LABELS } from "@/lib/sheets.functions";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { ItemCard } from "@/components/item-card";

const itemsQuery = queryOptions({
  queryKey: ["sheet-items"],
  queryFn: () => getAllItems(),
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
});

export const Route = createFileRoute("/values")({
  head: () => ({
    meta: [
      { title: "Item Values — AOT:R Trading Value Centre" },
      { name: "description", content: "Browse trading values for every item in Attack on Titan Revolution by category, rarity and trend." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(itemsQuery),
  errorComponent: ({ error }) => <div className="p-8 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-8">Not found</div>,
  component: Values,
});

const RARITIES = ["All", "Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic", "Events"];
const TRENDS = ["All", "Rising", "Dropping", "Stable"] as const;
const SORTS = [
  { id: "value-desc", label: "Value · High → Low" },
  { id: "value-asc", label: "Value · Low → High" },
  { id: "name", label: "Name · A → Z" },
  { id: "demand", label: "Demand · High → Low" },
] as const;

function Values() {
  const { data } = useSuspenseQuery(itemsQuery);
  const categories = useMemo(() => {
    const set = new Set(data.items.map((i) => i.category));
    return Array.from(set);
  }, [data]);

  const [activeCat, setActiveCat] = useState(categories[0] ?? "family");
  const [q, setQ] = useState("");
  const [rarity, setRarity] = useState("All");
  const [trend, setTrend] = useState<(typeof TRENDS)[number]>("All");
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("value-desc");

  const filtered = useMemo(() => {
    let list = data.items.filter((i) => i.category === activeCat);
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(term) || i.section.toLowerCase().includes(term));
    }
    if (rarity !== "All") list = list.filter((i) => i.rarity === rarity);
    if (trend !== "All") list = list.filter((i) => i.trend === trend);
    switch (sort) {
      case "value-desc": list = [...list].sort((a, b) => b.numericValue - a.numericValue); break;
      case "value-asc": list = [...list].sort((a, b) => a.numericValue - b.numericValue); break;
      case "name": list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      case "demand": list = [...list].sort((a, b) => (b.demand ?? -1) - (a.demand ?? -1)); break;
    }
    return list;
  }, [data, activeCat, q, rarity, trend, sort]);

  return (
    <div className="min-h-screen">
      <SiteNav />

      <section className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <h1 className="font-display text-4xl text-foreground md:text-5xl">Item Value Directory</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">All tradable items organised by category. Filter by rarity, demand and trend, or search across the entire catalogue.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className={`rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-widest transition ${
                activeCat === c
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {CATEGORY_LABELS[c] ?? c}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${CATEGORY_LABELS[activeCat] ?? activeCat}…`}
              className="w-full rounded-md border border-border bg-card py-2 pl-10 pr-3 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <select value={rarity} onChange={(e) => setRarity(e.target.value)} className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground">
            {RARITIES.map((r) => <option key={r} value={r}>{r === "All" ? "All rarities" : r}</option>)}
          </select>
          <select value={trend} onChange={(e) => setTrend(e.target.value as typeof trend)} className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground">
            {TRENDS.map((t) => <option key={t} value={t}>{t === "All" ? "All trends" : t}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground">
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">{filtered.length} items</div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((i) => <ItemCard key={i.id} item={i} />)}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
              No items match your filters.
            </div>
          )}
        </div>
      </div>

      <SiteFooter fetchedAt={data.fetchedAt} />
    </div>
  );
}
