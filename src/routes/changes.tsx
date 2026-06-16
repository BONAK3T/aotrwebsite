import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { getAllItems, CATEGORY_LABELS } from "@/lib/sheets.functions";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { RarityBadge } from "@/components/item-card";

const itemsQuery = queryOptions({
  queryKey: ["sheet-items"],
  queryFn: () => getAllItems(),
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
});

export const Route = createFileRoute("/changes")({
  head: () => ({
    meta: [
      { title: "Weekly Value Changes — AOT:R Trading Value Centre" },
      { name: "description", content: "All items currently rising or dropping in trading value across Attack on Titan Revolution." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(itemsQuery),
  errorComponent: ({ error }) => <div className="p-8 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-8">Not found</div>,
  component: Changes,
});

function Changes() {
  const { data } = useSuspenseQuery(itemsQuery);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { risers, droppers, categories } = useMemo(() => {
    const filter = (arr: typeof data.items) =>
      categoryFilter === "all" ? arr : arr.filter((i) => i.category === categoryFilter);
    const risers = filter(data.items.filter((i) => i.trend === "Rising"))
      .sort((a, b) => b.numericValue - a.numericValue);
    const droppers = filter(data.items.filter((i) => i.trend === "Dropping"))
      .sort((a, b) => b.numericValue - a.numericValue);
    const categories = Array.from(new Set(data.items.map((i) => i.category)));
    return { risers, droppers, categories };
  }, [data, categoryFilter]);

  const fetchedDate = new Date(data.fetchedAt);
  const weekLabel = fetchedDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen">
      <SiteNav />

      <section className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Week of {weekLabel}</div>
          <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">Weekly Value Changes</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every item currently flagged as rising or dropping by the value team. Updates automatically as the source list changes.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-rising/30 bg-rising/10 p-4">
              <div className="text-[10px] uppercase tracking-widest text-rising">Rising</div>
              <div className="mt-1 font-display text-3xl text-rising">{risers.length}</div>
            </div>
            <div className="rounded-lg border border-dropping/30 bg-dropping/10 p-4">
              <div className="text-[10px] uppercase tracking-widest text-dropping">Dropping</div>
              <div className="mt-1 font-display text-3xl text-dropping">{droppers.length}</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Net movement</div>
              <div className="mt-1 font-display text-3xl text-foreground">{risers.length - droppers.length >= 0 ? "+" : ""}{risers.length - droppers.length}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Filter:</span>
          <button
            onClick={() => setCategoryFilter("all")}
            className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition ${categoryFilter === "all" ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition ${categoryFilter === c ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
            >
              {CATEGORY_LABELS[c] ?? c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ChangeColumn title="Risers" icon={<TrendingUp className="h-5 w-5" />} tone="rising" items={risers} />
          <ChangeColumn title="Droppers" icon={<TrendingDown className="h-5 w-5" />} tone="dropping" items={droppers} />
        </div>
      </div>

      <SiteFooter fetchedAt={data.fetchedAt} />
    </div>
  );
}

function ChangeColumn({
  title, icon, tone, items,
}: {
  title: string;
  icon: React.ReactNode;
  tone: "rising" | "dropping";
  items: { id: string; name: string; value: string; rarity: string; section: string; category: string }[];
}) {
  const toneClasses =
    tone === "rising"
      ? "border-rising/30 bg-rising/5 text-rising"
      : "border-dropping/30 bg-dropping/5 text-dropping";
  return (
    <div className={`rounded-xl border p-6 ${toneClasses}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-display text-2xl">{title}</h2>
        </div>
        <div className="rounded-full bg-background/40 px-2 py-0.5 text-xs font-semibold">{items.length}</div>
      </div>
      <div className="mt-4 space-y-1">
        {items.length === 0 && (
          <div className="rounded-md border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
            No items in this column.
          </div>
        )}
        {items.map((i) => (
          <Link
            key={i.id}
            to="/item/$id"
            params={{ id: i.id }}
            className="flex items-center justify-between gap-3 rounded-md border border-transparent bg-background/30 px-3 py-3 transition hover:border-border hover:bg-background/60"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-foreground">{i.name}</span>
                <RarityBadge rarity={i.rarity} />
              </div>
              <div className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                {CATEGORY_LABELS[i.category] ?? i.category} · {i.section}
              </div>
            </div>
            <div className="font-mono text-sm text-gold">{i.value}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
