import type { JSX } from "react";

export type PromptTabCall =
  | { readonly called: true; readonly prompt: string }
  | { readonly called: false };

export type CaseSimulationDetailPromptTabProps = {
  readonly judgmentCall: PromptTabCall;
  readonly notCalledMessage?: string;
};

const DEFAULT_NOT_CALLED_MESSAGE = "Judgment was never called for this hypothesis.";

export function CaseSimulationDetailPromptTab({
  judgmentCall,
  notCalledMessage = DEFAULT_NOT_CALLED_MESSAGE,
}: CaseSimulationDetailPromptTabProps): JSX.Element {
  if (!judgmentCall.called) {
    return <p>{notCalledMessage}</p>;
  }

  return (
    <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono whitespace-pre-wrap break-words">
      {judgmentCall.prompt}
    </pre>
  );
}
