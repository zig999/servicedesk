import type { JSX } from "react";
import { CaseSimulationStatusDot } from "./case-simulation-status-dot";
import type {
  SimulationEvidenceItem,
  SimulationEvidenceResult,
  SimulationFieldSemantics,
  SimulationJudgmentCall,
} from "./case-simulation-detail-types";

/**
 * The Evidence tab's own body (task/simulation-cockpit/detail-panel,
 * criteria 3 and 6, default-shown per this task's own objective), widened by
 * task/simulation-evidence-snapshot/evidence-tab-snapshot-rendering to also
 * show each item's own snapshotted concept_description and field semantics
 * (renderConceptDescription/renderFieldSemantics below), with every absence
 * -- both the pre-snapshot "never carried this at all" and the honest
 * "carried it, and it was empty" -- rendered as a stated absence rather
 * than invented or left silently blank.
 *
 * The capability/connector line below reads `item.capabilityName`,
 * `item.capabilityVersion` and `item.connector` as flat fields of the
 * evidence item (case-simulation-detail-types.ts's own SimulationEvidenceItem)
 * rather than through a nested `item.capability.name`/`item.capability.version`
 * object -- flatten-detail-evidence-capability-reference, a corrective
 * increment: this line previously dereferenced that nested shape, which
 * neither POST /v1/simulate nor POST /v1/simulate/hypothesis has ever sent,
 * crashing this tab on a real response's own evidence item.
 *
 * Colors for domain/investigation/evidence-result's own four values --
 * `ok` -> `bg-success` (the one result that carries a usable observation,
 * per that node's own description), `timeout` -> `bg-warning` (a deadline
 * concern, not a hard refusal), `denied` -> `bg-destructive` (an explicit
 * refusal -- the same semantic token this app's Button `variant="destructive"`
 * and its `text-destructive` error text already key off), `unavailable` ->
 * `bg-muted-foreground` (a neutral absence, the same token
 * hypothesis-revision-history.tsx already uses for its own "frozen" state).
 * Not a fact any specification node names a color for -- this task's own
 * inference, following case-detail-screen.tsx's and
 * hypothesis-revision-history.tsx's own established convention for a status
 * cell in this app.
 */
const EVIDENCE_RESULT_CELL: Record<
  SimulationEvidenceResult,
  { readonly color: string; readonly label: string }
> = {
  ok: { color: "bg-success", label: "ok" },
  timeout: { color: "bg-warning", label: "timeout" },
  denied: { color: "bg-destructive", label: "denied" },
  unavailable: { color: "bg-muted-foreground", label: "unavailable" },
};

/**
 * `observation` is carried as a plain string (domain/investigation/
 * evidence's own attribute type); this region's own criterion 3 asks for it
 * "in a collapsible JSON block", so it is parsed and re-serialized
 * (indented) for display the same way connector-test-panel-result.tsx's own
 * request/response blocks already format raw transport data --
 * falling back to the raw string unchanged where it does not parse as JSON,
 * rather than this region inventing an error state no criterion asks for.
 */
function prettyPrintObservation(observation: string): string {
  try {
    // JSON.parse's own return feeds straight into JSON.stringify below,
    // never assigned to a typed variable of its own -- nothing here reads
    // it as data, only re-serializes it indented.
    return JSON.stringify(JSON.parse(observation), null, 2);
  } catch {
    return observation;
  }
}

/**
 * The concept's own snapshotted meaning (task/simulation-evidence-snapshot/
 * evidence-tab-snapshot-rendering's own criteria 1 and 4,
 * rules/investigation/presentation-reads-the-evidence-snapshot): `undefined`
 * (a record collected before this snapshot existed) renders nothing here at
 * all, matching this tab's own prior rendering exactly (criterion 6); a
 * present but empty string (a legacy concept snapshotted with no description)
 * renders a stated absence rather than blank or invented text (criterion 4);
 * anything else renders as given, read only from `item` -- no glossary
 * request is issued to enrich it (criterion 7).
 */
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

/**
 * The observation's own snapshotted field semantics (criteria 2, 3 and 5,
 * the same absent/empty distinction `renderConceptDescription` above draws):
 * `undefined` renders nothing, matching this tab's own prior rendering; a
 * present but empty array renders a stated absence and the item still
 * renders around it; each present field renders its own name always, and its
 * `type`/`description` only where the snapshot itself states them --
 * neither is ever invented for a field that lacks one.
 */
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
  // Per collected concept (criterion 3's own "per collected concept"), not
  // the raw `evidence` array as-is -- a full-case run's own evidence may
  // hold concepts other hypotheses collect, which this hypothesis's own
  // Evidence tab does not show. A concept this hypothesis collects with no
  // matching evidence entry is skipped rather than rendered as a phantom
  // row: no criterion of this task states what to show for that case, and
  // domain/investigation/evidence's own guarantee is one entry per
  // collected concept.
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
          {judgmentCall.usage.inputTokens} in / {judgmentCall.usage.outputTokens} out ·{" "}
          {judgmentCall.elapsedMs} ms
        </p>
      )}
    </div>
  );
}
