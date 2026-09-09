import type { JSX } from "react";
import { Label } from "@tui/ui/label";
import { Input } from "@tui/ui/input";
import { Button } from "@tui/ui/button";
import type { ConnectorConfigurationHelperState } from "../hooks/use-connector-configuration-helper";
import {
  disclosureStateForOutcome,
  type DraftDisclosure,
} from "../services/connector-configuration-draft-disclosure";

export type ConnectorConfigurationHelperFieldsProps = {
  readonly state: ConnectorConfigurationHelperState;
};

export function ConnectorConfigurationHelperFields({
  state,
}: ConnectorConfigurationHelperFieldsProps): JSX.Element {
  const disclosure = disclosureStateForOutcome(state.outcome);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="configuration-helper-link">OpenAPI document link</Label>
          <Input
            id="configuration-helper-link"
            value={state.link}
            onChange={(event) => state.onLinkChange(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="configuration-helper-path">Operation path</Label>
          <Input
            id="configuration-helper-path"
            value={state.path}
            onChange={(event) => state.onPathChange(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="configuration-helper-method">Operation method</Label>
          <Input
            id="configuration-helper-method"
            value={state.method}
            onChange={(event) => state.onMethodChange(event.target.value)}
          />
        </div>
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
        {disclosure.kind === "drafted" && <ConnectorConfigurationDraftDisclosure draft={disclosure.draft} />}
      </div>
    </div>
  );
}

function ConnectorConfigurationDraftDisclosure({
  draft,
}: {
  readonly draft: DraftDisclosure;
}): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Drafted configuration</p>
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
