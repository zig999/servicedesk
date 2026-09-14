import { useMemo, useState, type BaseSyntheticEvent, type JSX, type ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@tui/ui/input";
import { Label } from "@tui/ui/label";
import { Button } from "@tui/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tui/ui/dialog";
import { ButtonFooter } from "../shared/components/button-footer";
import { JsonTextareaField } from "../shared/components/json-textarea-field";
import { isPlainRecord } from "../shared/services/plain-record";
import { ConnectorConfigurationHelper } from "./connector-configuration-helper";
import { CredentialPlaceholderStatements } from "./connector-configuration-credential-placeholder-statements-view";
import { HttpConnectorDeparturesStatement } from "./connector-configuration-http-connector-departures-view";
import { ResponseMapCapabilityCoverageStatement } from "./connector-configuration-response-map-capability-coverage-view";
import { SubjectPlaceholderStatements } from "./connector-configuration-subject-placeholder-statements-view";
import type { ConnectorConfigurationFormValues } from "../services/connector-configuration-form-schema";
import type { ConfigurationFieldState } from "../hooks/use-connector-configuration-form";
import { useResponseMapCapabilityCoverage } from "../hooks/use-response-map-capability-coverage";
import { useSubjectPlaceholderStatements } from "../hooks/use-subject-placeholder-statements";
import {
  applyConfirmationDiffIsEmpty,
  computeApplyConfirmationDiff,
  type ApplyConfirmationDiff,
  type KeyChangeSet,
} from "../services/connector-configuration-apply-diff";
import { computeCredentialPlaceholderStatements } from "../services/connector-configuration-credential-placeholder-statements";
import { computeHttpConnectorDepartures } from "../services/connector-configuration-http-departures";
import {
  APPLY_CONFIRMATION_CONFIRM_BUTTON,
  APPLY_CONFIRMATION_DIALOG_TITLE,
  APPLY_CONFIRMATION_KEEP_EDITING_BUTTON,
  APPLY_DIFF_EMPTY_MESSAGE,
  APPLY_DIFF_NOT_ITEMISABLE_MESSAGE,
  APPLY_OVER_UNSAVED_EDIT_DESCRIPTION,
  CONFIGURATION_ENTRY_GUIDANCE_IS_JSON_OBJECT_MESSAGE,
  CONFIGURATION_ENTRY_GUIDANCE_PLACEHOLDER_FORMS_MESSAGE,
  CONFIGURATION_ENTRY_GUIDANCE_READS_CALL_PARTS_MESSAGE,
  CONFIGURATION_ENTRY_GUIDANCE_READS_KEYS_MESSAGE,
  CONFIGURATION_NOT_A_JSON_OBJECT_MESSAGE,
  FORM_CONFIGURATION_FIELD_LABEL,
  FORM_CONNECTOR_FIELD_LABEL,
  FORM_SAVE_BUTTON,
  KEY_CHANGE_ADDED_PREFIX,
  KEY_CHANGE_CHANGED_PREFIX,
  KEY_CHANGE_LIST_TOP_LEVEL_LABEL,
  KEY_CHANGE_REMOVED_PREFIX,
} from "../services/connector-configuration-messages";

const CONFIGURATION_ENTRY_GUIDANCE_MESSAGES: readonly string[] = [
  CONFIGURATION_ENTRY_GUIDANCE_IS_JSON_OBJECT_MESSAGE,
  CONFIGURATION_ENTRY_GUIDANCE_READS_KEYS_MESSAGE,
  CONFIGURATION_ENTRY_GUIDANCE_READS_CALL_PARTS_MESSAGE,
  CONFIGURATION_ENTRY_GUIDANCE_PLACEHOLDER_FORMS_MESSAGE,
];

export const CONNECTOR_CONFIGURATION_FORM_ID = "connector-configuration-form";

export type ConnectorConfigurationFormFieldsProps = {
  readonly form: UseFormReturn<ConnectorConfigurationFormValues>;
  readonly configuration: ConfigurationFieldState;

  readonly isEditingIdentity: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: (event?: BaseSyntheticEvent) => void;

  readonly isDirty?: boolean;

  readonly trailingActions?: ReactNode;

  readonly testPanel?: ReactNode;
};

function FormField({
  label,
  errorId,
  error,
  children,
}: {
  label: string;
  errorId: string;
  error?: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <Label className="flex flex-col gap-1">
        <span>{label}</span>
        <div className="normal-case tracking-normal font-normal text-foreground">{children}</div>
      </Label>
      {error != null && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function KeyChangeList({
  label,
  changes,
}: {
  label: string;
  changes: KeyChangeSet;
}): JSX.Element | null {
  const hasAny = changes.added.length > 0 || changes.removed.length > 0 || changes.changed.length > 0;
  if (!hasAny) {
    return null;
  }
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <ul className="flex flex-col gap-1">
        {changes.added.map((key) => (
          <li key={`added:${key}`} className="text-sm">
            {KEY_CHANGE_ADDED_PREFIX}
            <span className="font-medium">{key}</span>
          </li>
        ))}
        {changes.removed.map((key) => (
          <li key={`removed:${key}`} className="text-sm">
            {KEY_CHANGE_REMOVED_PREFIX}
            <span className="font-medium">{key}</span>
          </li>
        ))}
        {changes.changed.map((key) => (
          <li key={`changed:${key}`} className="text-sm">
            {KEY_CHANGE_CHANGED_PREFIX}
            <span className="font-medium">{key}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function configurationTextParsesToNonObject(text: string): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return false;
  }
  return !isPlainRecord(parsed);
}

function ConfigurationNotAnObjectStatement({ text }: { text: string }): JSX.Element | null {
  if (!configurationTextParsesToNonObject(text)) {
    return null;
  }
  return (
    <p role="alert" className="text-sm text-destructive">
      {CONFIGURATION_NOT_A_JSON_OBJECT_MESSAGE}
    </p>
  );
}

function ConfigurationEntryGuidance(): JSX.Element {
  return (
    <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
      {CONFIGURATION_ENTRY_GUIDANCE_MESSAGES.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}

function ApplyConfirmationDiffBody({ diff }: { diff: ApplyConfirmationDiff }): JSX.Element {
  if (diff.kind === "not-itemisable") {
    return <p className="text-sm text-muted-foreground">{APPLY_DIFF_NOT_ITEMISABLE_MESSAGE}</p>;
  }

  if (applyConfirmationDiffIsEmpty(diff)) {
    return <p className="text-sm text-muted-foreground">{APPLY_DIFF_EMPTY_MESSAGE}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <KeyChangeList label={KEY_CHANGE_LIST_TOP_LEVEL_LABEL} changes={diff.topLevel} />
      {diff.nested.map((entry) => (
        <KeyChangeList key={entry.key} label={entry.key} changes={entry.diff} />
      ))}
    </div>
  );
}

export function ConnectorConfigurationFormFields({
  form,
  configuration,
  isEditingIdentity,
  isSubmitting,
  onSubmit,
  isDirty,
  trailingActions,
  testPanel,
}: ConnectorConfigurationFormFieldsProps): JSX.Element {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const isSaveDisabled = isSubmitting || !configuration.isValid || isDirty === false;

  const hasUnsavedEdit = isDirty ?? configuration.value !== "";
  const [pendingApplyText, setPendingApplyText] = useState<string | null>(null);

  const connector = watch("connector");

  const applyConfirmationDiff = useMemo<ApplyConfirmationDiff | null>(
    () =>
      pendingApplyText === null
        ? null
        : computeApplyConfirmationDiff(configuration.value, pendingApplyText),
    [configuration.value, pendingApplyText],
  );

  const httpConnectorDepartures = useMemo(
    () => computeHttpConnectorDepartures(configuration.value),
    [configuration.value],
  );

  const subjectPlaceholderStatements = useSubjectPlaceholderStatements(connector, configuration.value);

  const credentialPlaceholderStatements = useMemo(
    () => computeCredentialPlaceholderStatements(configuration.value),
    [configuration.value],
  );

  const responseMapCapabilityCoverage = useResponseMapCapabilityCoverage(connector, configuration.value);

  function handleApply(configurationText: string): void {
    if (!hasUnsavedEdit) {
      configuration.onChange(configurationText, true);
      return;
    }
    setPendingApplyText(configurationText);
  }

  function handleConfirmApply(): void {
    if (pendingApplyText !== null) {
      configuration.onChange(pendingApplyText, true);
    }
    setPendingApplyText(null);
  }

  return (
    <form
      id={CONNECTOR_CONFIGURATION_FORM_ID}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4"
    >
      <FormField
        label={FORM_CONNECTOR_FIELD_LABEL}
        errorId="connector-error"
        error={errors.connector?.message}
      >
        <Input
          {...register("connector")}
          disabled={isEditingIdentity || isSubmitting}
          aria-invalid={errors.connector != null}
          aria-describedby={errors.connector != null ? "connector-error" : undefined}
        />
      </FormField>

      <JsonTextareaField
        id="configuration"
        label={FORM_CONFIGURATION_FIELD_LABEL}
        value={configuration.value}
        onChange={configuration.onChange}
        disabled={isSubmitting}
      />
      <ConfigurationNotAnObjectStatement text={configuration.value} />
      <ConfigurationEntryGuidance />
      <HttpConnectorDeparturesStatement departures={httpConnectorDepartures} />
      <SubjectPlaceholderStatements statements={subjectPlaceholderStatements} />
      <CredentialPlaceholderStatements credentialNames={credentialPlaceholderStatements} />
      <ResponseMapCapabilityCoverageStatement coverage={responseMapCapabilityCoverage} />

      {testPanel}

      <ConnectorConfigurationHelper connector={connector} onApply={handleApply} />

      <Dialog
        open={pendingApplyText !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingApplyText(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{APPLY_CONFIRMATION_DIALOG_TITLE}</DialogTitle>
          </DialogHeader>
          <DialogDescription>{APPLY_OVER_UNSAVED_EDIT_DESCRIPTION}</DialogDescription>
          {applyConfirmationDiff !== null && <ApplyConfirmationDiffBody diff={applyConfirmationDiff} />}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                {APPLY_CONFIRMATION_KEEP_EDITING_BUTTON}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="button" variant="destructive" onClick={handleConfirmApply}>
                {APPLY_CONFIRMATION_CONFIRM_BUTTON}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ButtonFooter>
        <Button
          type="submit"
          form={CONNECTOR_CONFIGURATION_FORM_ID}
          loading={isSubmitting}
          disabled={isSaveDisabled}
        >
          {FORM_SAVE_BUTTON}
        </Button>
        {trailingActions}
      </ButtonFooter>
    </form>
  );
}
