import type { JSX } from "react";
import { CaseSimulationEvidenceItem } from "./case-simulation-evidence-item";
import type {
  SimulationEvidenceItem,
  SimulationJudgmentCall,
} from "./case-simulation-detail-types";

export type CaseSimulationDetailEvidenceTabProps = {
  readonly collects: readonly string[];
  readonly evidence: readonly SimulationEvidenceItem[];
  readonly judgmentCall: SimulationJudgmentCall;
};

export function CaseSimulationDetailEvidenceTab({
  collects,
  evidence,
  judgmentCall,
}: CaseSimulationDetailEvidenceTabProps): JSX.Element {

  const items = collects
    .map((concept) => evidence.find((item) => item.concept === concept))
    .filter((item): item is SimulationEvidenceItem => item !== undefined);

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No evidence collected for this hypothesis.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <CaseSimulationEvidenceItem key={item.concept} item={item} />
          ))}
        </ul>
      )}
      {judgmentCall.called && (
        <p className="text-sm text-muted-foreground">
          Judgment {judgmentCall.model} · prompt {judgmentCall.promptVersion} ·{" "}
          {judgmentCall.usage.inputTokens} tokens in / {judgmentCall.usage.outputTokens} tokens out ·{" "}
          {judgmentCall.elapsedMs} ms
        </p>
      )}
    </div>
  );
}
