import type { JSX } from "react";
import { CaseSimulationStatusDot } from "./case-simulation-status-dot";
import type {
  SimulationEvidenceItem,
  SimulationEvidenceResult,
  SimulationFieldSemantics,
  SimulationJudgmentCall,
} from "./case-simulation-detail-types";

const EVIDENCE_RESULT_CELL: Record<
  SimulationEvidenceResult,
  { readonly color: string; readonly label: string }
> = {
  ok: { color: "bg-success", label: "ok" },
  timeout: { color: "bg-warning", label: "timeout" },
  denied: { color: "bg-destructive", label: "denied" },
  unavailable: { color: "bg-muted-foreground", label: "unavailable" },
};

function prettyPrintObservation(observation: string): string {
  try {

    return JSON.stringify(JSON.parse(observation), null, 2);
  } catch {
    return observation;
  }
}

function renderConceptDescription(conceptDescription: string | undefined): JSX.Element | null {
  if (conceptDescription === undefined) {
    return null;
  }
  return (
    <p className="text-sm text-muted-foreground">
      {conceptDescription === "" ? "No description recorded for this concept." : conceptDescription}
    </p>
  );
}

function renderFieldSemantics(
  fields: readonly SimulationFieldSemantics[] | undefined,
): JSX.Element | null {
  if (fields === undefined) {
    return null;
  }
  if (fields.length === 0) {
    return <p className="text-sm text-muted-foreground">No field semantics recorded for this observation.</p>;
  }
  return (
    <ul className="flex flex-col gap-0.5 text-sm text-muted-foreground">
      {fields.map((field) => (
        <li key={field.name}>
          <span className="font-mono">{field.name}</span>
          {field.type !== undefined && <span> ({field.type})</span>}
          {field.description !== undefined && <span> — {field.description}</span>}
        </li>
      ))}
    </ul>
  );
}

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
            <li
              key={item.concept}
              className="flex flex-col gap-1 border-b border-border pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium">{item.concept}</span>
                <CaseSimulationStatusDot {...EVIDENCE_RESULT_CELL[item.result]} />
                <span className="text-sm text-muted-foreground">
                  {item.capabilityName} {item.capabilityVersion} → {item.connector}
                </span>
                <span className="text-sm text-muted-foreground">{item.elapsedMs} ms</span>
              </div>
              {item.resultDetail !== undefined && (
                <p className="text-sm text-muted-foreground">{item.resultDetail}</p>
              )}
              {renderConceptDescription(item.conceptDescription)}
              {renderFieldSemantics(item.fields)}
              <details>
                <summary className="cursor-pointer text-sm text-muted-foreground">Observation</summary>
                <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto">
                  {prettyPrintObservation(item.observation)}
                </pre>
              </details>
            </li>
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
