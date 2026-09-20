import type { JSX } from "react";
import { CaseSimulationEvidenceItem } from "./case-simulation-evidence-item";
import type { SimulationEvidenceItem } from "./case-simulation-detail-types";

export type CaseSimulationCaseResultEvidenceTabProps = {
  readonly evidence: readonly SimulationEvidenceItem[];
};

export function CaseSimulationCaseResultEvidenceTab({
  evidence,
}: CaseSimulationCaseResultEvidenceTabProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      {evidence.length === 0 ? (
        <p className="text-sm text-muted-foreground">No evidence collected for this run.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {evidence.map((item) => (
            <CaseSimulationEvidenceItem key={item.concept} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
