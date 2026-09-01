import type { BaseSyntheticEvent, JSX, ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@tui/ui/input";
import { Label } from "@tui/ui/label";
import { Button } from "@tui/ui/button";
import { JsonTextareaField } from "../shared/components/json-textarea-field";
import type { ConnectorConfigurationFormValues } from "../services/connector-configuration-form-schema";
import type { ConfigurationFieldState } from "../hooks/use-connector-configuration-form";

export type ConnectorConfigurationFormFieldsProps = {
  readonly form: UseFormReturn<ConnectorConfigurationFormValues>;
  readonly configuration: ConfigurationFieldState;

  readonly isEditingIdentity: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: (event?: BaseSyntheticEvent) => void;

  readonly isDirty?: boolean;

  readonly trailingActions?: ReactNode;
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

export function ConnectorConfigurationFormFields({
  form,
  configuration,
  isEditingIdentity,
  isSubmitting,
  onSubmit,
  isDirty,
  trailingActions,
}: ConnectorConfigurationFormFieldsProps): JSX.Element {
  const {
    register,
    formState: { errors },
  } = form;

  const isSaveDisabled = isSubmitting || !configuration.isValid || isDirty === false;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField label="Connector" errorId="connector-error" error={errors.connector?.message}>
        <Input
          {...register("connector")}
          disabled={isEditingIdentity || isSubmitting}
          aria-invalid={errors.connector != null}
          aria-describedby={errors.connector != null ? "connector-error" : undefined}
        />
      </FormField>

      <JsonTextareaField
        id="configuration"
        label="Configuration"
        value={configuration.value}
        onChange={configuration.onChange}
        disabled={isSubmitting}
      />

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" loading={isSubmitting} disabled={isSaveDisabled}>
          Save
        </Button>
        {trailingActions}
      </div>
    </form>
  );
}
