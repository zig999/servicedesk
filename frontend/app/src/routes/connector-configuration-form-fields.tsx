import { useMemo, useState, type BaseSyntheticEvent, type JSX, type ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@tui/ui/input";
import { Label } from "@tui/ui/label";
import { Button } from "@tui/ui/button";
import { ButtonFooter } from "../shared/components/button-footer";
import { JsonCodeEditorField } from "../shared/components/json-code-editor-field";
import { configurationTextParsesToNonObject } from "../services/connector-configuration-well-formedness";
import { ConnectorConfigurationApplyConfirmationDialog } from "./connector-configuration-apply-confirmation-dialog";
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
  computeApplyConfirmationDiff,
  type ApplyConfirmationDiff,
} from "../services/connector-configuration-apply-diff";
import { computeCredentialPlaceholderStatements } from "../services/connector-configuration-credential-placeholder-statements";
import { computeHttpConnectorDepartures } from "../services/connector-configuration-http-departures";
import {
  CONFIGURATION_ENTRY_GUIDANCE_IS_JSON_OBJECT_MESSAGE,
  CONFIGURATION_ENTRY_GUIDANCE_PLACEHOLDER_FORMS_MESSAGE,
  CONFIGURATION_ENTRY_GUIDANCE_READS_CALL_PARTS_MESSAGE,
  CONFIGURATION_ENTRY_GUIDANCE_READS_KEYS_MESSAGE,
  CONFIGURATION_NOT_A_JSON_OBJECT_MESSAGE,
  FORM_CONFIGURATION_FIELD_LABEL,
  FORM_CONNECTOR_FIELD_LABEL,
  FORM_SAVE_BUTTON,
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

      <JsonCodeEditorField
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

      <ConnectorConfigurationApplyConfirmationDialog
        diff={applyConfirmationDiff}
        onOpenChange={(open) => {
          if (!open) {
            setPendingApplyText(null);
          }
        }}
        onConfirm={handleConfirmApply}
      />

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
