import type { JSX } from "react";
import { cn } from "@tui/lib/cn";

export type CaseSimulationStatusDotProps = {
  readonly color: string;
  readonly label: string;
};

/**
 * The dot-plus-label idiom status-table.tsx's own renderCellContent already
 * establishes for a status-shaped value in this app -- `color` composed as
 * a class on the dot through `cn()`, always shown together with its word
 * (never color alone, ACC-08) -- extracted here as its own small component
 * since status-table.tsx does not export that internal renderer, and this
 * task/simulation-cockpit/detail-panel needs the same idiom twice (a
 * hypothesis's own verdict, and each evidence item's own result) outside
 * any StatusTable row.
 */
export function CaseSimulationStatusDot({
  color,
  label,
}: CaseSimulationStatusDotProps): JSX.Element {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn("inline-block h-2 w-2 rounded-full", color)}
      />
      <span>{label}</span>
    </span>
  );
}
