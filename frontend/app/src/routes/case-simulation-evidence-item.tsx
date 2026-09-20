import type { JSX } from "react";
import { CaseSimulationStatusDot } from "./case-simulation-status-dot";
import { redactResolvedCredentialValue } from "./case-simulation-case-result-json-tab";
import type {
  SimulationEvidenceItem,
  SimulationEvidenceResult,
  SimulationFieldSemantics,
} from "./case-simulation-detail-types";

export const EVIDENCE_RESULT_CELL: Record<
  SimulationEvidenceResult,
  { readonly color: string; readonly label: string }
> = {
  ok: { color: "bg-success", label: "ok" },
  timeout: { color: "bg-warning", label: "timeout" },
  denied: { color: "bg-destructive", label: "denied" },
  unavailable: { color: "bg-muted-foreground", label: "unavailable" },
};

function prettyPrintJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function renderConceptDescription(conceptDescription: string): JSX.Element {
  return (
    <p className="text-sm text-muted-foreground">
      {conceptDescription === "" ? "No description recorded for this concept." : conceptDescription}
    </p>
  );
}

function renderCapabilityPayloadNotes(notes: string): JSX.Element | null {
  if (notes === "") {
    return null;
  }
  return <p className="text-sm text-muted-foreground">{notes}</p>;
}

function renderFieldSemantics(
  fields: readonly SimulationFieldSemantics[],
): JSX.Element {
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

export type CaseSimulationEvidenceItemProps = {
  readonly item: SimulationEvidenceItem;
};

export function CaseSimulationEvidenceItem({
  item,
}: CaseSimulationEvidenceItemProps): JSX.Element {
  return (
    <li className="flex flex-col gap-1 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium">{item.concept}</span>
        <CaseSimulationStatusDot {...EVIDENCE_RESULT_CELL[item.result]} />
        <span className="text-sm text-muted-foreground">
          {item.capabilityName} {item.capabilityVersion} → {item.connector}
        </span>
        <span className="text-sm text-muted-foreground">{item.elapsedMs} ms</span>
        <span className="text-sm text-muted-foreground">{item.observedAt} UTC</span>
        <span className="text-sm text-muted-foreground">ttl {item.ttl}s</span>
      </div>
      {item.resultDetail !== undefined && (
        <p className="text-sm text-muted-foreground">{item.resultDetail}</p>
      )}
      {renderConceptDescription(item.conceptDescription)}
      {renderFieldSemantics(item.fields)}
      {renderCapabilityPayloadNotes(item.capabilityPayloadNotes)}
      <details>
        <summary className="cursor-pointer text-sm text-muted-foreground">Inputs</summary>
        <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto">
          {prettyPrintJson(redactResolvedCredentialValue(item.inputs))}
        </pre>
      </details>
      {item.result === "ok" && (
        <details>
          <summary className="cursor-pointer text-sm text-muted-foreground">Observation</summary>
          <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto">
            {prettyPrintJson(item.observation)}
          </pre>
        </details>
      )}
    </li>
  );
}
