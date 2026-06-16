import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Search, TrendingUp, TrendingDown, Activity, Boxes } from "lucide-react";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AOT:R Values — Trading Value Centre Dashboard" },
      { name: "description", content: "Live trading values, top risers, biggest droppers and demand for every Attack on Titan Revolution item." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(itemsQuery),
  errorComponent: ({ error }) => <div className="p-8 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-8">Not found</div>,
  component: Home,
});

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/70 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
        <div className={accent ?? "text-muted-foreground"}>{icon}</div>
      </div>
      <div className={`mt-2 font-display text-3xl ${accent ?? "text-foreground"}`}>{value}</div>
    </div>
  );
}

function Home() {
  const { data } = useSuspenseQuery(itemsQuery);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const items = data.items;
    const rising = items.filter((i) => i.trend === "Rising");
    const dropping = items.filter((i) => i.trend === "Dropping");
    const topRisers = [...rising].sort((a, b) => b.numericValue - a.numericValue).slice(0, 4);
    const topDroppers = [...dropping].sort((a, b) => b.numericValue - a.numericValue).slice(0, 4);
    const featured = [...items]
      .filter((i) => i.demand != null && i.demand >= 8)
      .sort((a, b) => b.numericValue - a.numericValue)
      .slice(0, 8);
    return { items, rising, dropping, topRisers, topDroppers, featured };
  }, [data]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return data.items
      .filter((i) => i.name.toLowerCase().includes(term) || i.section.toLowerCase().includes(term))
      .slice(0, 6);
  }, [q, data]);

  return (
    <div className="min-h-screen">
      <SiteNav />

      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-pattern" aria-hidden />
        <div className="absolute inset-0 wings-bg" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Live · Synced {new Date(data.fetchedAt).toLocaleString()}
          </div>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] text-foreground md:text-7xl">
            Attack on Titan <span className="text-gold">Revolution</span><br />
            Trading Value Centre
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Every titan shifter, bloodline, perk, artifact and cosmetic — priced, ranked by demand and tracked weekly. Pulled directly from the community value list.
          </p>

          <div className="relative mt-8 max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search 500+ items — Attack Titan, Ackerman, Founder's Blessing…"
              className="w-full rounded-lg border border-border bg-card/80 py-3 pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground/60 backdrop-blur focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            {results.length > 0 && (
              <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-2xl">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => navigate({ to: "/item/$id", params: { id: r.id } })}
                    className="flex w-full items-center justify-between gap-4 border-b border-border/60 px-4 py-3 text-left transition hover:bg-accent last:border-b-0"
                  >
                    <div>
                      <div className="font-medium text-foreground">{r.name}</div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">{CATEGORY_LABELS[r.category]} · {r.rarity}</div>
                    </div>
                    <div className="font-mono text-sm text-gold">{r.value}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat icon={<Boxes className="h-4 w-4" />} label="Items tracked" value={stats.items.length} />
            <Stat icon={<TrendingUp className="h-4 w-4" />} label="Rising" value={stats.rising.length} accent="text-rising" />
            <Stat icon={<TrendingDown className="h-4 w-4" />} label="Dropping" value={stats.dropping.length} accent="text-dropping" />
            <Stat icon={<Activity className="h-4 w-4" />} label="Categories" value={Object.keys(CATEGORY_LABELS).length} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-foreground md:text-3xl">High Demand · High Value</h2>
            <p className="text-sm text-muted-foreground">The most sought-after items right now.</p>
          </div>
          <Link to="/values" className="text-xs font-semibold uppercase tracking-widest text-primary hover:text-foreground">
            Browse all →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.featured.map((i) => <ItemCard key={i.id} item={i} />)}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 md:grid-cols-2 md:px-6">
        <div className="rounded-xl border border-rising/30 bg-rising/5 p-6">
          <div className="flex items-center gap-2 text-rising">
            <TrendingUp className="h-5 w-5" />
            <h3 className="font-display text-xl">Top Risers</h3>
          </div>
          <div className="mt-4 space-y-2">
            {stats.topRisers.length === 0 && <div className="text-sm text-muted-foreground">No items currently rising.</div>}
            {stats.topRisers.map((i) => (
              <Link key={i.id} to="/item/$id" params={{ id: i.id }} className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 transition hover:border-rising/30 hover:bg-rising/10">
                <div>
                  <div className="font-medium text-foreground">{i.name}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{i.section}</div>
                </div>
                <div className="font-mono text-sm text-gold">{i.value}</div>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-dropping/30 bg-dropping/5 p-6">
          <div className="flex items-center gap-2 text-dropping">
            <TrendingDown className="h-5 w-5" />
            <h3 className="font-display text-xl">Biggest Droppers</h3>
          </div>
          <div className="mt-4 space-y-2">
            {stats.topDroppers.length === 0 && <div className="text-sm text-muted-foreground">No items dropping.</div>}
            {stats.topDroppers.map((i) => (
              <Link key={i.id} to="/item/$id" params={{ id: i.id }} className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 transition hover:border-dropping/30 hover:bg-dropping/10">
                <div>
                  <div className="font-medium text-foreground">{i.name}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{i.section}</div>
                </div>
                <div className="font-mono text-sm text-gold">{i.value}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter fetchedAt={data.fetchedAt} />
    </div>
  );
}
