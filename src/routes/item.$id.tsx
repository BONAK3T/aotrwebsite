import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Share2 } from "lucide-react";
import { getAllItems, CATEGORY_LABELS } from "@/lib/sheets.functions";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { ItemCard, RarityBadge, TrendBadge } from "@/components/item-card";

const itemsQuery = queryOptions({
  queryKey: ["sheet-items"],
  queryFn: () => getAllItems(),
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
});

export const Route = createFileRoute("/item/$id")({
  loader: ({ context }) => context.queryClient.ensureQueryData(itemsQuery),
  head: ({ params }) => ({
    meta: [
      { title: `${params.id.replace(/-/g, " ")} · AOT:R Value` },
      { name: "description", content: `Current trading value, demand and trend for ${params.id.replace(/-/g, " ")} in Attack on Titan Revolution.` },
    ],
  }),
  errorComponent: ({ error }) => <div className="p-8 text-destructive">{error.message}</div>,
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl text-foreground">Item not found</h1>
        <p className="mt-2 text-muted-foreground">This item isn't in the value list.</p>
        <Link to="/values" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-widest text-primary-foreground">Browse values</Link>
      </div>
    </div>
  ),
  component: ItemDetail,
});

function ItemDetail() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(itemsQuery);
  const item = data.items.find((i) => i.id === id);
  if (!item) throw notFound();

  const related = data.items
    .filter((i) => i.id !== item.id && i.category === item.category && i.rarity === item.rarity)
    .slice(0, 4);

  return (
    <div className="min-h-screen">
      <SiteNav />

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <Link to="/values" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to values
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-[1fr_1.2fr]">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10">
            <div className="absolute inset-0 grid-pattern" aria-hidden />
            <div className="relative flex aspect-square items-center justify-center">
              <div className="font-display text-[8rem] leading-none text-foreground/10 md:text-[12rem]">
                {item.name.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <Link to="/values" className="hover:text-foreground">{CATEGORY_LABELS[item.category] ?? item.category}</Link>
              <span>·</span>
              <span>{item.section}</span>
            </div>
            <h1 className="mt-2 font-display text-5xl text-foreground">{item.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <RarityBadge rarity={item.rarity} />
              <TrendBadge trend={item.trend} />
              {item.demand != null && (
                <span className="inline-flex items-center gap-2 rounded border border-border bg-card px-2 py-0.5 text-xs uppercase tracking-widest text-muted-foreground">
                  Demand <span className="font-semibold text-foreground">{item.demand}/10</span>
                </span>
              )}
            </div>

            <div className="mt-8 rounded-xl border border-gold/30 bg-gold/5 p-6">
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold/80">Current value</div>
              <div className="mt-1 font-mono text-4xl font-bold text-gold md:text-5xl">{item.value}</div>
              <div className="mt-2 text-xs text-muted-foreground">Sourced from the community AOT:R Value List · synced {new Date(data.fetchedAt).toLocaleString()}</div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">Tax (Gems)</dt>
                <dd className="mt-1 font-mono text-base text-foreground">{item.taxGems || "—"}</dd>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">Tax (Gold)</dt>
                <dd className="mt-1 font-mono text-base text-foreground">{item.taxGold || "—"}</dd>
              </div>
            </dl>

            <button
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator.share({ title: item.name, url: window.location.href }).catch(() => {});
                } else if (typeof navigator !== "undefined") {
                  navigator.clipboard?.writeText(window.location.href);
                }
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold uppercase tracking-widest text-foreground hover:border-primary/60 hover:bg-accent"
            >
              <Share2 className="h-4 w-4" /> Share value
            </button>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl text-foreground">Related Items</h2>
            <p className="text-sm text-muted-foreground">Other {item.rarity} {CATEGORY_LABELS[item.category] ?? item.category}.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((i) => <ItemCard key={i.id} item={i} />)}
            </div>
          </div>
        )}
      </div>

      <SiteFooter fetchedAt={data.fetchedAt} />
    </div>
  );
}
