import type { JSX } from "react";

const CREDENTIAL_PLACEHOLDER_PATTERN = /\$\{credential:[^}]*\}/g;
const REDACTED_CREDENTIAL_VALUE = "***REDACTED***";

export function redactResolvedCredentialValue(inputs: string): string {
  return inputs.replace(CREDENTIAL_PLACEHOLDER_PATTERN, REDACTED_CREDENTIAL_VALUE);
}

function redactEvidenceItemInputs(item: unknown): unknown {
  if (typeof item !== "object" || item === null || !("inputs" in item)) {
    return item;
  }
  if (typeof item.inputs !== "string") {
    return item;
  }
  return { ...item, inputs: redactResolvedCredentialValue(item.inputs) };
}

function redactEvidenceListInputs(evidence: unknown): unknown {
  if (!Array.isArray(evidence)) {
    return evidence;
  }
  return evidence.map(redactEvidenceItemInputs);
}

function toMaskedRawPayload(rawResponse: unknown): unknown {
  if (typeof rawResponse !== "object" || rawResponse === null || !("evidence" in rawResponse)) {
    return rawResponse;
  }
  return { ...rawResponse, evidence: redactEvidenceListInputs(rawResponse.evidence) };
}

export type CaseSimulationCaseResultJsonTabProps = {
  readonly rawResponse: unknown;
};

export function CaseSimulationCaseResultJsonTab({
  rawResponse,
}: CaseSimulationCaseResultJsonTabProps): JSX.Element {
  return (
    <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto">
      {JSON.stringify(toMaskedRawPayload(rawResponse), null, 2)}
    </pre>
  );
}
