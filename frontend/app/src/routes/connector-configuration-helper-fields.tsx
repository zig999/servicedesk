import type { JSX } from "react";
import { Label } from "@tui/ui/label";
import { Input } from "@tui/ui/input";
import { Select, type SelectOption } from "@tui/ui/select";
import { Button } from "@tui/ui/button";
import type { ConnectorConfigurationHelperState } from "../hooks/use-connector-configuration-helper";
import type { OpenApiOperation } from "../hooks/use-openapi-document-operations";
import {
  disclosureStateForOutcome,
  type DraftDisclosure,
} from "../services/connector-configuration-draft-disclosure";

export type ConnectorConfigurationHelperFieldsProps = {
  readonly state: ConnectorConfigurationHelperState;
  readonly onApply: (configurationText: string) => void;
};

function operationSelectValue(entry: Pick<OpenApiOperation, "path" | "method">): string {
  return `${entry.method.toUpperCase()} ${entry.path}`;
}

export function ConnectorConfigurationHelperFields({
  state,
  onApply,
}: ConnectorConfigurationHelperFieldsProps): JSX.Element {
  const disclosure = disclosureStateForOutcome(state.outcome);

  const operationOptions: SelectOption[] = state.operations.map((operation) => ({
    value: operationSelectValue(operation),
    label: `${operation.path} — ${operation.method.toUpperCase()}`,
  }));

  const selectedOperationValue =
    state.path === "" && state.method === ""
      ? ""
      : operationSelectValue({ path: state.path, method: state.method });

  const onOperationSelected = (value: string): void => {
    const chosen = state.operations.find((operation) => operationSelectValue(operation) === value);
    if (chosen !== undefined) {
      state.onChooseOperation(chosen);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="configuration-helper-link">OpenAPI document link</Label>
          <Input
            id="configuration-helper-link"
            value={state.link}
            onChange={(event) => state.onLinkChange(event.target.value)}
          />
        </div>
        <Label className="flex flex-col gap-1">
          Operation
          <Select
            options={operationOptions}
            value={selectedOperationValue}
            onChange={onOperationSelected}
            placeholder="Select an operation"
          />
        </Label>
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={state.onRequestDraft}
          disabled={state.outcome.kind === "pending"}
        >
          Request Draft
        </Button>
      </div>
      <div aria-live="polite" className="flex flex-col gap-4">
        {disclosure.kind === "pending" && <p>Drafting the connector configuration…</p>}
        {disclosure.kind === "refused" && (
          <p role="alert" className="text-sm text-destructive">
            {disclosure.message}
          </p>
        )}
        {disclosure.kind === "drafted" && (
          <ConnectorConfigurationDraftDisclosure draft={disclosure.draft} onApply={onApply} />
        )}
      </div>
    </div>
  );
}

function ConnectorConfigurationDraftDisclosure({
  draft,
  onApply,
}: {
  readonly draft: DraftDisclosure;
  readonly onApply: (configurationText: string) => void;
}): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">Drafted configuration</p>
          <Button type="button" onClick={() => onApply(draft.configuration)}>
            Apply
          </Button>
        </div>
        <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono whitespace-pre-wrap break-words">
          {draft.configuration}
        </pre>
      </section>

      {draft.unresolved.length > 0 && (
        <section className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">Unresolved</p>
          <ul className="flex flex-col gap-1">
            {draft.unresolved.map((item) => (
              <li key={`${item.name}:${item.reason}`} className="text-sm">
                <span className="font-medium">{item.name}</span>: {item.reasonLabel}
              </li>
            ))}
          </ul>
        </section>
      )}

      {draft.generatedCredentials.length > 0 && (
        <section className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">Generated credentials</p>
          <ul className="flex flex-col gap-1">
            {draft.generatedCredentials.map((credential) => (
              <li key={`${credential.name}:${credential.securityScheme}`} className="text-sm">
                <span className="font-medium">{credential.name}</span>: {credential.securityScheme}
              </li>
            ))}
          </ul>
        </section>
      )}

      {draft.methodMismatch !== undefined && (
        <section className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">Method mismatch</p>
          <p className="text-sm">
            Registered: {draft.methodMismatch.registered} · Drafted: {draft.methodMismatch.operation}
          </p>
        </section>
      )}
    </div>
  );
}
