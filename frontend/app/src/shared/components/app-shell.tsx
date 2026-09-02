import type { JSX } from "react";
import { Link, Outlet, rootRouteId, useMatches } from "@tanstack/react-router";
import { Breadcrumb, type BreadcrumbItem } from "@tui/ui/breadcrumb";
import { StatusBar } from "@tui/ui/status-bar";
import { Toaster } from "sonner";

const SIDEBAR_ENTRIES: ReadonlyArray<{
  label: string;
  to: "/cases" | "/glossary" | "/capabilities" | "/connectors";
}> = [
  { label: "Cases", to: "/cases" },
  { label: "Glossary", to: "/glossary" },
  { label: "Capabilities", to: "/capabilities" },
  { label: "Connectors", to: "/connectors" },
];

const ROUTE_LABELS: Record<string, string> = {
  "/cases": "Cases List",
  "/cases/$slug": "Case Detail",
  "/cases/$slug/versions/$version": "Version Editor",
  "/cases/$slug/versions/new": "New Draft",
  "/cases/$slug/versions/$version/manifest": "Manifest Builder",
  "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName":
    "Revise Hypothesis",
  "/cases/$slug/versions/$version/manifest/hypotheses/new": "New Hypothesis",
  "/cases/$slug/versions/$version/release": "Release",
  "/cases/$slug/versions/$version/discard": "Discard",
  "/cases/$slug/versions/$version/simulate": "Simulate",
  "/cases/$slug/hypotheses": "Hypotheses",
  "/glossary": "Glossary Browser",
  "/capabilities": "Capabilities Browser",
  "/connectors": "Connectors",
};

function useBreadcrumbItems(): BreadcrumbItem[] {
  const matches = useMatches();
  return matches
    .filter((match) => match.routeId !== rootRouteId)
    .map((match) => ({
      label: ROUTE_LABELS[match.routeId] ?? match.pathname,
    }));
}

function Sidebar(): JSX.Element {
  return (
    <nav aria-label="Primary" className="w-48 shrink-0 border-r border-border bg-surface">
      <ul className="flex flex-col gap-1 p-2">
        {SIDEBAR_ENTRIES.map((entry) => (
          <li key={entry.to}>
            <Link
              to={entry.to}
              className="block rounded px-3 py-2 text-sm text-foreground hover:bg-muted"
              activeProps={{
                className: "bg-muted text-primary",
                "aria-current": "page",
              }}
            >
              {entry.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Topbar(): JSX.Element {
  const items = useBreadcrumbItems();
  return (
    <StatusBar
      className="min-h-20 border-t-0 border-b border-border"
      left={
        <span className="flex items-center gap-[2.6429rem]">
          <span
            role="img"
            aria-label="Unifique"
            className="brand-logo-mask h-12 w-auto text-foreground"
          />
          <span className="text-base font-semibold text-foreground">servicedeskN1</span>
        </span>
      }
      center={<Breadcrumb items={items} />}
      right={<span>No auth in this build</span>}
    />
  );
}

function Footer(): JSX.Element {
  return <footer className="min-h-10 shrink-0 border-t border-border bg-surface" />;
}

export function AppShell(): JSX.Element {
  return (
    <>
      <div className="flex h-screen flex-col">
        <Topbar />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4">
            <Outlet />
          </main>
        </div>
        <Footer />
      </div>
      <Toaster />
    </>
  );
}
