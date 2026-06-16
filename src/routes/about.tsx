import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site-nav";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — AOT:R Trading Value Centre" },
      { name: "description", content: "How values are determined, where the data comes from, and how often it updates." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <article className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h1 className="font-display text-5xl text-foreground">About this value centre</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          AOT:R Values is a community-built reference for trading in Attack on Titan Revolution. It mirrors the community value list and refreshes automatically, so the numbers you see here match the numbers used in-game trades.
        </p>

        <h2 className="mt-12 font-display text-2xl text-gold">Where the data comes from</h2>
        <p className="mt-3 text-muted-foreground">
          Every value, rarity, demand rating and rate-of-change indicator is pulled directly from the public AOT:R Value List Google Sheet. We do not edit values manually — when the source updates, the site updates.
        </p>

        <h2 className="mt-10 font-display text-2xl text-gold">How values are determined</h2>
        <p className="mt-3 text-muted-foreground">
          Values are decided by a community of veteran traders based on observed in-game trades, item rarity, drop rates, supply, demand and recent game updates. They represent a typical fair trade, not a guaranteed price.
        </p>
        <ul className="mt-4 space-y-2 text-muted-foreground">
          <li><span className="text-foreground">Demand 9–10</span> · Extremely sought after, trades fast</li>
          <li><span className="text-foreground">Demand 7–8</span> · Popular and desirable, trades quickly</li>
          <li><span className="text-foreground">Demand 5–6</span> · Balanced demand, trades at a normal pace</li>
          <li><span className="text-foreground">Demand 3–4</span> · Less interest, slower to trade</li>
          <li><span className="text-foreground">Demand 1–2</span> · Little to no demand, rarely traded</li>
        </ul>

        <h2 className="mt-10 font-display text-2xl text-gold">Currencies</h2>
        <p className="mt-3 text-muted-foreground">
          Values are shown in the same notation as the source list: 🔑 keys, 📜 memory scrolls and viz (vizard's masks). One vizard's mask = 900 keys; one memory scroll = 3 keys.
        </p>

        <h2 className="mt-10 font-display text-2xl text-gold">Disclaimer</h2>
        <p className="mt-3 text-muted-foreground">
          This is a fan-made project. It is not affiliated with or endorsed by the developers of Attack on Titan Revolution or any rights holders of the Attack on Titan franchise. All trade values are advisory.
        </p>
      </article>
      <SiteFooter />
    </div>
  );
}
