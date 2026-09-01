import type { JSX } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { cn } from "@tui/lib/cn";
import type { CaseVersionState } from "../hooks/use-case-versions";

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
