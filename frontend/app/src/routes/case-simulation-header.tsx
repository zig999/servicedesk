import type { JSX } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { cn } from "@tui/lib/cn";
import type { CaseVersionState } from "../hooks/use-case-versions";

/**
 * The Simulation Cockpit's own header region (task/simulation-cockpit/
 * case-simulation-route), matching the top band of layout/simulation-
 * screen.md's own wireframe: the version's identity (`slug · vN`), its state
 * as a pill, its `when_to_use` text, and three actions -- "Edit version",
 * "Manifest", "Simulate case". The wireframe's own fourth header element (a
 * declared deadline) is not rendered here: this task's own Notes record why
 * it was dropped -- no candidate specification node states a "declared
 * deadline" concept for simulation, only for `diagnose`
 * (rules/investigation/an-answer-arrives-within-the-declared-deadline),
 * outside this task's own implements and this epic's own covers.
 *
 * The state pill reuses case-detail-screen.tsx's own established convention
 * (its own header comment: draft -> bg-warning, released -> bg-success, TUI's
 * own semantic tokens, not a color any specification node names) --
 * duplicated here rather than imported, since that table is declared locally
 * and unexported there, and case-detail-screen.tsx is outside this task's own
 * reach. Rendered through the same color-dot-plus-text shape StatusTable
 * already renders a status cell as (ACC-08: a state conveyed by color alone
 * is paired with text), for the same reason -- not composed through
 * StatusTable itself, since this is one pill beside a heading, not a table
 * cell.
 *
 * "Edit version" and "Manifest" are plain client-side Links (no data fetch of
 * their own), matching case-detail-screen.tsx's and case-attributes-tab.tsx's
 * own convention for a navigation action -- never a Button wrapping a Link,
 * which this area's own inventory does not establish anywhere. "Simulate
 * case" is the one real dispatch action in this header, so it is TUI's own
 * Button; its enabled/disabled state and its click handler are both supplied
 * by the caller rather than computed here (this task's own criterion: "its
 * enabled/disabled state is driven by a prop the header itself does not
 * compute") -- the same design hypotheses-table.md's own sibling task states
 * for a row's own simulate action ("exposed as a callback the region itself
 * does not implement the dispatch of"). This task builds no subject-readiness
 * gate and no simulate-case dispatch of its own (both belong to sibling tasks
 * this one does not depend on); case-simulation-ready-view.tsx's own header
 * comment records what it passes in their place until
 * task/simulation-cockpit/screen-assembly wires the real values.
 */

const VERSION_STATE_CELL: Record<CaseVersionState, { color: string; label: string }> = {
  draft: { color: "bg-warning", label: "Draft" },
  released: { color: "bg-success", label: "Released" },
};

export type CaseSimulationHeaderProps = {
  readonly slug: string;
  readonly version: number;
  readonly whenToUse: string;
  readonly versionState: CaseVersionState;
  readonly canSimulate: boolean;
  readonly onSimulateCase: () => void;
};

export function CaseSimulationHeader({
  slug,
  version,
  whenToUse,
  versionState,
  canSimulate,
  onSimulateCase,
}: CaseSimulationHeaderProps): JSX.Element {
  const stateCell = VERSION_STATE_CELL[versionState];
  const versionParams = { slug, version: String(version) };

  return (
    <header className="flex flex-col gap-2 border-b border-border pb-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-medium">
            {slug} · v{version}
          </h1>
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn("inline-block h-2 w-2 rounded-full", stateCell.color)}
            />
            <span>{stateCell.label}</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          {versionState === "draft" ? (
            <Link to="/cases/$slug/versions/$version" params={versionParams}>
              Edit version
            </Link>
          ) : (
            <Link
              to="/cases/$slug/versions/new"
              params={{ slug }}
              search={{ sourceVersion: version }}
            >
              Edit version
            </Link>
          )}
          <Link to="/cases/$slug/versions/$version/manifest" params={versionParams}>
            Manifest
          </Link>
          <Button type="button" disabled={!canSimulate} onClick={onSimulateCase}>
            ▶ Simulate case
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">&quot;{whenToUse}&quot;</p>
    </header>
  );
}
