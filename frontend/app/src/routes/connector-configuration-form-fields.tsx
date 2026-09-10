import { useState, type BaseSyntheticEvent, type JSX, type ReactNode } from "react";
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
import { ConnectorConfigurationHelper } from "./connector-configuration-helper";
import type { ConnectorConfigurationFormValues } from "../services/connector-configuration-form-schema";
import type { ConfigurationFieldState } from "../hooks/use-connector-configuration-form";

export const CONNECTOR_CONFIGURATION_FORM_ID = "connector-configuration-form";

const APPLY_OVER_UNSAVED_EDIT_DESCRIPTION =
  "Applying this drafted configuration will replace the edit you have not saved in the " +
  "Configuration field. This cannot be undone.";

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
    watch,
    formState: { errors },
  } = form;

  const isSaveDisabled = isSubmitting || !configuration.isValid || isDirty === false;

  const hasUnsavedEdit = isDirty ?? configuration.value !== "";
  const [pendingApplyText, setPendingApplyText] = useState<string | null>(null);

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

      <ConnectorConfigurationHelper connector={watch("connector")} onApply={handleApply} />

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
            <DialogTitle>Apply drafted configuration?</DialogTitle>
          </DialogHeader>
          <DialogDescription>{APPLY_OVER_UNSAVED_EDIT_DESCRIPTION}</DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Keep editing
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="button" variant="destructive" onClick={handleConfirmApply}>
                Apply
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
          Save
        </Button>
        {trailingActions}
      </ButtonFooter>
    </form>
  );
}
