import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/values", label: "Values" },
  { to: "/changes", label: "Changes" },
  { to: "/about", label: "About" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <svg viewBox="0 0 40 40" className="h-8 w-8 text-gold" fill="currentColor" aria-hidden>
            <path d="M20 6 C 14 4, 6 10, 4 18 C 10 16, 14 18, 18 22 L 20 18 L 22 22 C 26 18, 30 16, 36 18 C 34 10, 26 4, 20 6 Z M 20 22 L 17 32 L 20 28 L 23 32 Z" />
          </svg>
          <div className="leading-none">
            <div className="font-display text-xl tracking-wider text-foreground">AOT:R Values</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Trading Centre</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded px-3 py-2 text-sm font-medium uppercase tracking-wider text-muted-foreground transition hover:bg-accent hover:text-foreground [&.active]:bg-accent [&.active]:text-foreground"
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded p-2 text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded px-3 py-3 text-sm font-medium uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:bg-accent [&.active]:text-foreground"
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter({ fetchedAt }: { fetchedAt?: string }) {
  return (
    <footer className="mt-20 border-t border-border bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:px-6">
        <div>
          <div className="font-display text-foreground">AOT:R Values</div>
          <div className="text-xs">Unofficial trading value centre · Not affiliated with the Attack on Titan Revolution developers.</div>
        </div>
        {fetchedAt && (
          <div className="text-xs">Synced {new Date(fetchedAt).toLocaleString()}</div>
        )}
      </div>
    </footer>
  );
}
