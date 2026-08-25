import type { BaseSyntheticEvent, JSX, ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@tui/ui/input";
import { Label } from "@tui/ui/label";
import { Button } from "@tui/ui/button";
import { JsonTextareaField } from "../shared/components/json-textarea-field";
import type { ConnectorConfigurationFormValues } from "../services/connector-configuration-form-schema";
import type { ConfigurationFieldState } from "../hooks/use-connector-configuration-form";

/**
 * The Connector Configuration create/edit form's own field markup
 * (task/connector-configuration-authoring/connector-configuration-create-edit-form):
 * connector and configuration (criteria 2 and 3) -- kept in its own file,
 * apart from the Dialog composing it, matching this app's own established
 * split (capability-form-fields.tsx, concept-form-fields.tsx,
 * case-version-editor-form-fields.tsx).
 *
 * The label wraps its own control (FormField below) rather than a matching
 * htmlFor/id pair, the same convention capability-form-fields.tsx already
 * keeps.
 *
 * `configuration` is the shared JsonTextareaField (criterion 4), wired to
 * `configuration`'s own value/onChange/isValid triple rather than through
 * `register`/`Controller` -- use-connector-configuration-form.ts's own
 * header comment states why it is tracked as plain component state instead
 * of a react-hook-form field. The Save button is disabled while it is
 * invalid, on top of the hook's own submit-time guard, so an operator sees
 * why Save will not act rather than clicking it and observing nothing
 * happen.
 *
 * `isDirty` (task/connector-capability-detail-editing/
 * connector-configuration-detail-route, criterion 4) is optional and, left
 * unset, never itself disables Save -- so
 * connector-configuration-form-dialog.tsx's own existing call site (which
 * never passes it) keeps exactly the disabling behavior it already had:
 * that dialog's own hook (use-connector-configuration-form.ts) tracks no
 * "differs from the loaded record" concept at all, and re-saving an
 * unmodified record there was never refused. The routed detail screen is
 * the one caller that does pass it, gating Save on top of the same
 * isSubmitting/configuration.isValid conditions this component already
 * applied -- the markup below is otherwise unchanged from this file's own
 * prior delivery.
 */

export type ConnectorConfigurationFormFieldsProps = {
  readonly form: UseFormReturn<ConnectorConfigurationFormValues>;
  readonly configuration: ConfigurationFieldState;
  /** True only in edit mode -- see use-connector-configuration-form.ts's own header comment on why `connector` is disabled rather than merely pre-filled. */
  readonly isEditingIdentity: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: (event?: BaseSyntheticEvent) => void;
  /** See this file's own header comment above. */
  readonly isDirty?: boolean;
};

/** One labeled field: the label wraps its own control, and an invalid control's error text sits beside it, linked back through aria-describedby (EDG-03, ACC-04) -- the same convention every other form in this app already keeps. */
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

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting} disabled={isSaveDisabled}>
          Save
        </Button>
      </div>
    </form>
  );
}
