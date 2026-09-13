import type { JSX } from "react";
import { Label } from "@tui/ui/label";
import { Input } from "@tui/ui/input";
import { Select, type SelectOption } from "@tui/ui/select";
import { Button } from "@tui/ui/button";
import type { ConnectorConfigurationHelperState } from "../hooks/use-connector-configuration-helper";
import type { OpenApiOperation } from "../hooks/use-openapi-document-operations";
import { useResponseMapCapabilityCoverage } from "../hooks/use-response-map-capability-coverage";
import { ResponseMapCapabilityCoverageStatement } from "./connector-configuration-response-map-capability-coverage-view";
import {
  disclosureStateForOutcome,
  type DraftDisclosure,
} from "../services/connector-configuration-draft-disclosure";
import { operationsReadDisclosureStateForOutcome } from "../services/connector-configuration-operations-read-disclosure";
import {
  CONFIGURATION_HELPER_DRAFTING_PENDING_MESSAGE,
  CONFIGURATION_HELPER_LINK_LABEL,
  CONFIGURATION_HELPER_OPERATION_LABEL,
  CONFIGURATION_HELPER_OPERATION_PLACEHOLDER,
  CONFIGURATION_HELPER_REQUEST_DRAFT_BUTTON,
  CONFIGURATION_HELPER_WAITING_ON_CONNECTOR_NAME_MESSAGE,
  CONFIGURATION_HELPER_WAITING_ON_OPERATION_MESSAGE,
  declaredAsText,
  declaredRequiredText,
  declaredTypeText,
  DRAFT_DISCLOSURE_APPLY_BUTTON,
  DRAFT_DISCLOSURE_CONFIGURATION_LABEL,
  DRAFT_DISCLOSURE_GENERATED_CREDENTIALS_LABEL,
  DRAFT_DISCLOSURE_METHOD_MISMATCH_LABEL,
  DRAFT_DISCLOSURE_READING_NOTES_LABEL,
  DRAFT_DISCLOSURE_RESPONSE_FIELDS_LABEL,
  DRAFT_DISCLOSURE_STALE_MESSAGE,
  DRAFT_DISCLOSURE_STATUS_READINGS_LABEL,
  DRAFT_DISCLOSURE_SUBJECT_KIND_SEPARATOR,
  DRAFT_DISCLOSURE_UNRESOLVED_LABEL,
  envelopeText,
  methodMismatchText,
  OPERATIONS_READ_EMPTY_MESSAGE,
  OPERATIONS_READ_PENDING_MESSAGE,
  readingNoteDetailText,
  responseFieldPathStatusText,
  statusReadingEndingText,
  statusReadingStatusText,
} from "../services/connector-configuration-messages";

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
  const operationsReadDisclosure = operationsReadDisclosureStateForOutcome(state.operationsOutcome);

  const operationOptions: SelectOption[] = state.operations.map((operation) => ({
    value: operationSelectValue(operation),
    label: `${operation.path} — ${operation.method.toUpperCase()}`,
  }));

  const selectedOperationValue =
    state.path === "" && state.method === ""
      ? ""
      : operationSelectValue({ path: state.path, method: state.method });

  const connectorNameMissing = (state.connector ?? "").trim() === "";
  const operationMissing = state.path === "" && state.method === "";

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
          <Label htmlFor="configuration-helper-link">{CONFIGURATION_HELPER_LINK_LABEL}</Label>
          <Input
            id="configuration-helper-link"
            value={state.link}
            onChange={(event) => state.onLinkChange(event.target.value)}
          />
        </div>
        <Label className="flex flex-col gap-1">
          {CONFIGURATION_HELPER_OPERATION_LABEL}
          <Select
            options={operationOptions}
            value={selectedOperationValue}
            onChange={onOperationSelected}
            placeholder={CONFIGURATION_HELPER_OPERATION_PLACEHOLDER}
          />
        </Label>
      </div>
      <div className="flex justify-end">
        {connectorNameMissing ? (
          <p className="text-sm text-muted-foreground">
            {CONFIGURATION_HELPER_WAITING_ON_CONNECTOR_NAME_MESSAGE}
          </p>
        ) : operationMissing ? (
          <p className="text-sm text-muted-foreground">
            {CONFIGURATION_HELPER_WAITING_ON_OPERATION_MESSAGE}
          </p>
        ) : (
          <Button
            type="button"
            onClick={state.onRequestDraft}
            disabled={state.outcome.kind === "pending"}
          >
            {CONFIGURATION_HELPER_REQUEST_DRAFT_BUTTON}
          </Button>
        )}
      </div>
      <div aria-live="polite" className="flex flex-col gap-4">
        {disclosure.kind === "pending" && <p>{CONFIGURATION_HELPER_DRAFTING_PENDING_MESSAGE}</p>}
        {disclosure.kind === "refused" && (
          <p role="alert" className="text-sm text-destructive">
            {disclosure.message}
          </p>
        )}
        {disclosure.kind === "drafted" && (
          <ConnectorConfigurationDraftDisclosure
            connector={state.connector ?? ""}
            draft={disclosure.draft}
            stale={state.stale ?? false}
            onApply={onApply}
          />
        )}
        {operationsReadDisclosure.kind === "pending" && (
          <p className="text-sm text-muted-foreground">{OPERATIONS_READ_PENDING_MESSAGE}</p>
        )}
        {operationsReadDisclosure.kind === "empty" && (
          <p className="text-sm text-muted-foreground">{OPERATIONS_READ_EMPTY_MESSAGE}</p>
        )}
        {operationsReadDisclosure.kind === "refused" && (
          <p role="alert" className="text-sm text-destructive">
            {operationsReadDisclosure.message}
          </p>
        )}
      </div>
    </div>
  );
}

function ConnectorConfigurationDraftDisclosure({
  connector,
  draft,
  stale,
  onApply,
}: {
  readonly connector: string;
  readonly draft: DraftDisclosure;
  readonly stale: boolean;
  readonly onApply: (configurationText: string) => void;
}): JSX.Element {
  const responseMapCapabilityCoverage = useResponseMapCapabilityCoverage(connector, draft.configuration);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{DRAFT_DISCLOSURE_CONFIGURATION_LABEL}</p>
          <Button type="button" onClick={() => onApply(draft.configuration)}>
            {DRAFT_DISCLOSURE_APPLY_BUTTON}
          </Button>
        </div>
        {stale && <p className="text-sm text-muted-foreground">{DRAFT_DISCLOSURE_STALE_MESSAGE}</p>}
        <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono whitespace-pre-wrap break-words">
          {draft.configuration}
        </pre>
        <ResponseMapCapabilityCoverageStatement coverage={responseMapCapabilityCoverage} />
      </section>

      {draft.unresolved.length > 0 && (
        <section className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">{DRAFT_DISCLOSURE_UNRESOLVED_LABEL}</p>
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
          <p className="text-sm font-medium text-foreground">
            {DRAFT_DISCLOSURE_GENERATED_CREDENTIALS_LABEL}
          </p>
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
          <p className="text-sm font-medium text-foreground">{DRAFT_DISCLOSURE_METHOD_MISMATCH_LABEL}</p>
          <p className="text-sm">
            {methodMismatchText(draft.methodMismatch.registered, draft.methodMismatch.operation)}
          </p>
        </section>
      )}

      {draft.statusReadings.length > 0 && (
        <section className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">{DRAFT_DISCLOSURE_STATUS_READINGS_LABEL}</p>
          <ul className="flex flex-col gap-1">
            {draft.statusReadings.map((reading) => (
              <li key={reading.status} className="text-sm">
                <span className="font-medium">{statusReadingStatusText(reading.status)}</span>{" "}
                {statusReadingEndingText(reading.ending)}
                {reading.declaredAs !== undefined && <> {declaredAsText(reading.declaredAs)}</>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {draft.responseFields.length > 0 && (
        <section className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">{DRAFT_DISCLOSURE_RESPONSE_FIELDS_LABEL}</p>
          <ul className="flex flex-col gap-1">
            {draft.responseFields.map((field) => (
              <li key={`${field.status}:${field.path}:${field.name}`} className="text-sm">
                <span className="font-medium">{field.name}</span>{" "}
                {responseFieldPathStatusText(field.path, field.status)}
                {field.declaredType !== undefined && <> {declaredTypeText(field.declaredType)}</>}
                {field.declaredRequired !== undefined && (
                  <> {declaredRequiredText(field.declaredRequired)}</>
                )}
                {field.envelope !== undefined && <> {envelopeText(field.envelope)}</>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {draft.readingNotes.length > 0 && (
        <section className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">{DRAFT_DISCLOSURE_READING_NOTES_LABEL}</p>
          <ul className="flex flex-col gap-1">
            {draft.readingNotes.map((note) => (
              <li key={`${note.kind}:${note.subject}`} className="text-sm">
                <span className="font-medium">{note.subject}</span>
                {DRAFT_DISCLOSURE_SUBJECT_KIND_SEPARATOR}
                {note.kindLabel}
                {note.detail !== undefined && <> {readingNoteDetailText(note.detail)}</>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
