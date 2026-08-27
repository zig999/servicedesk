import type { JSX } from "react";
import { Link, Outlet, rootRouteId, useMatches } from "@tanstack/react-router";
import { Breadcrumb, type BreadcrumbItem } from "@tui/ui/breadcrumb";
import { StatusBar } from "@tui/ui/status-bar";
import { Toaster } from "sonner";

/**
 * One top-level sidebar destination: a label and the route it links to.
 * Four exist -- Cases, Glossary, Capabilities, Connectors -- per the scope's
 * section 2.10 decision that Hypotheses is a Case Detail tab rather than a
 * top-level destination, so it has no entry here. Connectors was added by
 * task/connector-configuration-authoring/connector-configuration-create-edit-form
 * so its new "/connectors" route is reachable from the app's navigation
 * (that task's own criterion 1).
 */
const SIDEBAR_ENTRIES: ReadonlyArray<{
  label: string;
  to: "/cases" | "/glossary" | "/capabilities" | "/connectors";
}> = [
  { label: "Cases", to: "/cases" },
  { label: "Glossary", to: "/glossary" },
  { label: "Capabilities", to: "/capabilities" },
  { label: "Connectors", to: "/connectors" },
];

/**
 * A human label for each route the router skeleton defines (route-tree.tsx),
 * keyed by a route's own id. Every one of those routes is an unparented
 * direct child of the root route, so a route's id is exactly its literal
 * path pattern (see @tanstack/router-core's route id/fullPath derivation: an
 * unparented child's id is its own path, unless a custom id is given, which
 * none of these routes do). This table is read only to give the currently
 * matched route a readable breadcrumb label -- which route is current is
 * decided by the match itself, never by this table.
 *
 * Ten entries from the router skeleton task's own ten proposal screens, plus
 * "/cases/$slug/versions/new" (task/version-editor/new-draft-creation's own
 * blank-form entry point, added after that task's own scope required a route
 * distinct from the general Version Editor), plus "/cases/$slug/versions/
 * $version/manifest/hypotheses/new" (task/manifest-hypothesis-authoring/
 * revise-hypothesis-form's own distinct New-hypothesis entry point, added
 * for the same reason -- a hypothesis literally named "new" must not
 * collide with the create trigger), plus "/cases/$slug/versions/$version/
 * simulate" (task/simulation-cockpit/case-simulation-route's own new leaf
 * route, added so the breadcrumb shows "Simulate" rather than falling back
 * to that route's raw pathname -- this same table's own risk, named by this
 * area's own inventory).
 */
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

/**
 * Builds Breadcrumb's items from the router's own currently matched route,
 * through `useMatches()`, rather than any hand-derived path string. The
 * route tree is flat by the router skeleton task's own design -- every leaf
 * is a direct child of the root -- so filtering the root match out of
 * `useMatches()`'s result leaves exactly one entry: the screen that is
 * actually matched right now, labeled through ROUTE_LABELS and otherwise
 * falling back to the match's own resolved pathname.
 */
function useBreadcrumbItems(): BreadcrumbItem[] {
  const matches = useMatches();
  return matches
    .filter((match) => match.routeId !== rootRouteId)
    .map((match) => ({
      label: ROUTE_LABELS[match.routeId] ?? match.pathname,
    }));
}

/**
 * The three top-level destinations, as router-aware links (@tanstack/
 * react-router's own `Link`, not TUI's -- TUI's Link is a plain anchor with
 * no client-side navigation) so moving between them never reloads the app.
 * No sidebar/nav primitive exists in TUI's catalog (per this wave's own
 * survey), so this is new construction: plain markup styled with the same
 * semantic-token utility classes (`border-border`, `bg-surface`,
 * `text-foreground`, `bg-muted`, `text-primary`) TUI's own components use.
 */
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

/**
 * The topbar: TUI's own StatusBar primitive (its docstring names "breadcrumb
 * summary" as intended `center` content) carrying the route-derived
 * Breadcrumb in its center slot and the fixed no-auth indicator in its right
 * slot -- both always rendered, so the indicator shows regardless of which
 * route is active. `border-t-0 border-b` flips StatusBar's own default
 * footer-strip border (top) to a topbar's (bottom); nothing else about the
 * primitive changes.
 */
function Topbar(): JSX.Element {
  const items = useBreadcrumbItems();
  return (
    <StatusBar
      className="border-t-0 border-b border-border"
      center={<Breadcrumb items={items} />}
      right={<span>No auth in this build</span>}
    />
  );
}

/**
 * The persistent shell every routed screen renders inside: the sidebar, the
 * topbar, and the Outlet where the router skeleton's currently matched
 * route renders its own content. Wired in as the root route's own
 * `component` (route-tree.tsx), so RouterProvider renders this shell for
 * every one of the ten routes without exception -- none of them defines its
 * own layout.
 *
 * The one sonner Toaster this app mounts (task/frontend-console-foundation/
 * query-client-and-toaster) renders as a sibling of the shell's own layout
 * div rather than inside it, so it is present for every routed screen
 * exactly once and never nested inside a layout container whose own
 * positioning could clip it.
 */
export function AppShell(): JSX.Element {
  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-4">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster />
    </>
  );
}
