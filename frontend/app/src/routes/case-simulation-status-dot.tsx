import type { JSX } from "react";
import { cn } from "@tui/lib/cn";

export type CaseSimulationStatusDotProps = {
  readonly color: string;
  readonly label: string;
};

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
