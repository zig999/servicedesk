import type { BaseSyntheticEvent, JSX, ReactNode } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@tui/ui/input";
import { Label } from "@tui/ui/label";
import { Select, type SelectOption } from "@tui/ui/select";
import { Button } from "@tui/ui/button";
import { JsonTextareaField } from "../shared/components/json-textarea-field";
import { CAPABILITY_NATURES, type CapabilityFormValues } from "../services/capability-form-schema";
import type { ConceptOption } from "../hooks/use-concept-options";
import type { JsonSchemaFieldState } from "../hooks/use-capability-form";

/**
 * The Capability create/edit form's own field markup
 * (task/capability-authoring/capability-create-edit-form): name, version,
 * nature, input_schema, output_schema, timeout, connector and concept
 * (criterion 1) -- kept in its own file, apart from the Dialog composing
 * it, matching this app's own established split
 * (concept-form-fields.tsx, case-version-editor-form-fields.tsx).
 *
 * Every label wraps its own control (FormField below) rather than a
 * matching htmlFor/id pair, the same convention those two files already
 * keep for TUI's own Select (that control forwards a caller's props only
 * to its outer wrapping div, never to the inner combobox button a screen
 * reader announces).
 *
 * input_schema and output_schema are the shared JsonTextareaField
 * (criterion 3), wired to `inputSchema`/`outputSchema`'s own
 * value/onChange/isValid triple rather than through `register`/`Controller`
 * -- use-capability-form.ts's own header comment states why those two
 * fields are tracked as plain component state instead of react-hook-form
 * fields. The Save button is disabled while either is invalid, on top of
 * the hook's own submit-time guard, so an operator sees why Save will not
 * act rather than clicking it and observing nothing happen.
 *
 * concept is a single-select (criterion 4) over a plain {value, label}
 * option list built from `conceptOptions` -- deliberately a Select, never
 * a Checkbox group (that composition belongs to concept-form-fields.tsx's
 * own multi-select `accepts` field, a different field on a different
 * form), so the form offers no way to pick more than one concept at once.
 *
 * `isDirty` (task/connector-capability-detail-editing/
 * capability-detail-route, criterion 4) is optional and, left unset, never
 * itself disables Save -- so capability-form-dialog.tsx's own existing call
 * site (which never passes it) keeps exactly the disabling behavior it
 * already had: that dialog's own hook (use-capability-form.ts) tracks no
 * "differs from the loaded record" concept at all, and re-saving an
 * unmodified record there was never refused. The routed detail screen is
 * the one caller that does pass it, gating Save on top of the same
 * isSubmitting/inputSchema.isValid/outputSchema.isValid conditions this
 * component already applied -- the markup below is otherwise unchanged from
 * this file's own prior delivery, mirroring
 * connector-configuration-form-fields.tsx's own identical widening for its
 * own sibling route task.
 */

export type CapabilityFormFieldsProps = {
  readonly form: UseFormReturn<CapabilityFormValues>;
  readonly conceptOptions: readonly ConceptOption[];
  readonly inputSchema: JsonSchemaFieldState;
  readonly outputSchema: JsonSchemaFieldState;
  /** True only in edit mode -- see use-capability-form.ts's own header comment on why name/version are disabled rather than merely pre-filled. */
  readonly isEditingIdentity: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: (event?: BaseSyntheticEvent) => void;
  /** See this file's own header comment above. */
  readonly isDirty?: boolean;
};

const NATURE_OPTIONS: SelectOption[] = CAPABILITY_NATURES.map((nature) => ({
  value: nature,
  label: nature,
}));

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

export function CapabilityFormFields({
  form,
  conceptOptions,
  inputSchema,
  outputSchema,
  isEditingIdentity,
  isSubmitting,
  onSubmit,
  isDirty,
}: CapabilityFormFieldsProps): JSX.Element {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const conceptSelectOptions: SelectOption[] = conceptOptions.map((concept) => ({
    value: concept.name,
    label: concept.name,
  }));

  const isSaveDisabled =
    isSubmitting || !inputSchema.isValid || !outputSchema.isValid || isDirty === false;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex gap-4">
        <FormField label="Name" errorId="name-error" error={errors.name?.message}>
          <Input
            {...register("name")}
            disabled={isEditingIdentity || isSubmitting}
            aria-invalid={errors.name != null}
            aria-describedby={errors.name != null ? "name-error" : undefined}
          />
        </FormField>

        <FormField label="Version" errorId="version-error" error={errors.version?.message}>
          <Input
            {...register("version")}
            disabled={isEditingIdentity || isSubmitting}
            aria-invalid={errors.version != null}
            aria-describedby={errors.version != null ? "version-error" : undefined}
          />
        </FormField>
      </div>

      <FormField label="Nature" errorId="nature-error" error={errors.nature?.message}>
        <Controller
          control={control}
          name="nature"
          render={({ field }) => (
            <Select
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={NATURE_OPTIONS}
              disabled={isSubmitting}
              aria-invalid={errors.nature != null}
              aria-describedby={errors.nature != null ? "nature-error" : undefined}
            />
          )}
        />
      </FormField>

      <JsonTextareaField
        id="input_schema"
        label="Input schema"
        value={inputSchema.value}
        onChange={inputSchema.onChange}
        disabled={isSubmitting}
      />

      <JsonTextareaField
        id="output_schema"
        label="Output schema"
        value={outputSchema.value}
        onChange={outputSchema.onChange}
        disabled={isSubmitting}
      />

      <FormField label="Timeout (ms)" errorId="timeout-error" error={errors.timeout?.message}>
        <Input
          type="number"
          {...register("timeout", {
            setValueAs: (value: string) => (value === "" ? undefined : Number(value)),
          })}
          disabled={isSubmitting}
          aria-invalid={errors.timeout != null}
          aria-describedby={errors.timeout != null ? "timeout-error" : undefined}
        />
      </FormField>

      <FormField label="Connector" errorId="connector-error" error={errors.connector?.message}>
        <Input
          {...register("connector")}
          disabled={isSubmitting}
          aria-invalid={errors.connector != null}
          aria-describedby={errors.connector != null ? "connector-error" : undefined}
        />
      </FormField>

      <FormField label="Concept" errorId="concept-error" error={errors.concept?.message}>
        <Controller
          control={control}
          name="concept"
          render={({ field }) => (
            <Select
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={conceptSelectOptions}
              disabled={isSubmitting}
              placeholder="Select a concept"
              aria-invalid={errors.concept != null}
              aria-describedby={errors.concept != null ? "concept-error" : undefined}
            />
          )}
        />
      </FormField>

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting} disabled={isSaveDisabled}>
          Save
        </Button>
      </div>
    </form>
  );
}
