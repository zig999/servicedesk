import type { JSX } from "react";
import { Label } from "@tui/ui/label";
import { Input } from "@tui/ui/input";
import { Select, type SelectOption } from "@tui/ui/select";
import { Button } from "@tui/ui/button";
import type { CapabilitySchemaHelperState } from "../hooks/use-capability-schema-helper";
import type { OpenApiOperation } from "../hooks/use-openapi-document-operations";
import type { CapabilitySchemaDraft } from "../hooks/use-draft-capability-schema-from-openapi";
import { operationsReadDisclosureStateForOutcome } from "../services/connector-configuration-operations-read-disclosure";
import {
  DRAFT_DISCLOSURE_APPLY_BUTTON,
  OPERATIONS_READ_EMPTY_MESSAGE,
  OPERATIONS_READ_PENDING_MESSAGE,
} from "../services/connector-configuration-messages";
import {
  capabilitySchemaDraftDisclosureFrom,
  capabilitySchemaDraftRefusalDisclosureFrom,
} from "../services/capability-schema-draft-disclosure";
import {
  CAPABILITY_SCHEMA_DRAFT_INPUT_SCHEMA_LABEL,
  CAPABILITY_SCHEMA_DRAFT_OUTPUT_SCHEMA_LABEL,
  CAPABILITY_SCHEMA_DRAFT_STALE_MESSAGE,
  CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_LABEL,
} from "../services/capability-schema-messages";

const SCHEMA_HELPER_HEADING = "Assistente de Schema";
const SCHEMA_HELPER_LINK_LABEL = "Link do documento OpenAPI";
const SCHEMA_HELPER_OPERATION_LABEL = "Operação";
const SCHEMA_HELPER_OPERATION_PLACEHOLDER = "Selecione uma operação";
const SCHEMA_HELPER_REQUEST_DRAFT_BUTTON = "Solicitar rascunho de schema";
const SCHEMA_HELPER_WAITING_ON_OPERATION_MESSAGE =
  "Escolha uma operação para solicitar um rascunho de schema.";
const SCHEMA_HELPER_OPERATIONS_READ_RETRY_BUTTON = "Tentar novamente";

export type CapabilitySchemaHelperFieldsProps = {
  readonly state: CapabilitySchemaHelperState;
  readonly onApplyInputSchema: (inputSchema: string) => void;
  readonly onApplyOutputSchema: (outputSchema: string) => void;
};

function operationSelectValue(entry: Pick<OpenApiOperation, "path" | "method">): string {
  return `${entry.method.toUpperCase()} ${entry.path}`;
}

export function CapabilitySchemaHelperFields({
  state,
  onApplyInputSchema,
  onApplyOutputSchema,
}: CapabilitySchemaHelperFieldsProps): JSX.Element {
  const operationsReadDisclosure = operationsReadDisclosureStateForOutcome(state.operationsOutcome);
  const refusalDisclosure = capabilitySchemaDraftRefusalDisclosureFrom(state.outcome);

  const operationOptions: SelectOption[] = state.operations.map((operation) => ({
    value: operationSelectValue(operation),
    label: `${operation.path} — ${operation.method.toUpperCase()}`,
  }));

  const selectedOperationValue =
    state.chosenOperation === undefined ? "" : operationSelectValue(state.chosenOperation);

  const onOperationSelected = (value: string): void => {
    const chosen = state.operations.find((operation) => operationSelectValue(operation) === value);
    if (chosen !== undefined) {
      state.onChooseOperation(chosen);
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-4 border-t border-border">
      <h3 className="text-lg font-semibold">{SCHEMA_HELPER_HEADING}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="capability-schema-helper-link">{SCHEMA_HELPER_LINK_LABEL}</Label>
          <Input
            id="capability-schema-helper-link"
            value={state.link}
            onChange={(event) => state.onLinkChange(event.target.value)}
          />
        </div>
        <Label className="flex flex-col gap-1">
          {SCHEMA_HELPER_OPERATION_LABEL}
          <Select
            options={operationOptions}
            value={selectedOperationValue}
            onChange={onOperationSelected}
            placeholder={SCHEMA_HELPER_OPERATION_PLACEHOLDER}
          />
        </Label>
      </div>
      <div className="flex justify-end">
        {state.chosenOperation === undefined ? (
          <p className="text-sm text-muted-foreground">{SCHEMA_HELPER_WAITING_ON_OPERATION_MESSAGE}</p>
        ) : (
          <Button
            type="button"
            onClick={state.onRequestDraft}
            disabled={state.outcome.kind === "pending"}
          >
            {SCHEMA_HELPER_REQUEST_DRAFT_BUTTON}
          </Button>
        )}
      </div>
      <div aria-live="polite" className="flex flex-col gap-2">
        {refusalDisclosure !== undefined && (
          <p role="alert" className="text-sm text-destructive">
            {refusalDisclosure.message}
          </p>
        )}
        {operationsReadDisclosure.kind === "pending" && (
          <p className="text-sm text-muted-foreground">{OPERATIONS_READ_PENDING_MESSAGE}</p>
        )}
        {operationsReadDisclosure.kind === "empty" && (
          <p className="text-sm text-muted-foreground">{OPERATIONS_READ_EMPTY_MESSAGE}</p>
        )}
        {operationsReadDisclosure.kind === "refused" && (
          <div className="flex items-center justify-between gap-2">
            <p role="alert" className="text-sm text-destructive">
              {operationsReadDisclosure.message}
            </p>
            <Button type="button" variant="secondary" onClick={state.onRetryOperationsRead}>
              {SCHEMA_HELPER_OPERATIONS_READ_RETRY_BUTTON}
            </Button>
          </div>
        )}
      </div>
      {state.outcome.kind === "drafted" && (
        <CapabilitySchemaDraftStatement
          draft={state.outcome.draft}
          stale={state.stale ?? false}
          onApplyInputSchema={onApplyInputSchema}
          onApplyOutputSchema={onApplyOutputSchema}
        />
      )}
    </div>
  );
}

function CapabilitySchemaDraftStatement({
  draft,
  stale,
  onApplyInputSchema,
  onApplyOutputSchema,
}: {
  readonly draft: CapabilitySchemaDraft;
  readonly stale: boolean;
  readonly onApplyInputSchema: (inputSchema: string) => void;
  readonly onApplyOutputSchema: (outputSchema: string) => void;
}): JSX.Element {
  const disclosure = capabilitySchemaDraftDisclosureFrom(draft);

  return (
    <div aria-live="polite" className="flex flex-col gap-4">
      {stale && <p className="text-sm text-muted-foreground">{CAPABILITY_SCHEMA_DRAFT_STALE_MESSAGE}</p>}
      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">
            {CAPABILITY_SCHEMA_DRAFT_INPUT_SCHEMA_LABEL}
          </p>
          <Button type="button" onClick={() => onApplyInputSchema(disclosure.inputSchema)}>
            {DRAFT_DISCLOSURE_APPLY_BUTTON}
          </Button>
        </div>
        <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono whitespace-pre-wrap break-words">
          {disclosure.inputSchema}
        </pre>
      </section>
      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">
            {CAPABILITY_SCHEMA_DRAFT_OUTPUT_SCHEMA_LABEL}
          </p>
          <Button type="button" onClick={() => onApplyOutputSchema(disclosure.outputSchema)}>
            {DRAFT_DISCLOSURE_APPLY_BUTTON}
          </Button>
        </div>
        <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono whitespace-pre-wrap break-words">
          {disclosure.outputSchema}
        </pre>
      </section>
      {disclosure.unresolved.length > 0 && (
        <section className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_LABEL}
          </p>
          <ul className="flex flex-col gap-1">
            {disclosure.unresolved.map((item) => (
              <li key={`${item.name}:${item.reason}`} className="text-sm">
                <span className="font-medium">{item.name}</span>: {item.reasonLabel}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
