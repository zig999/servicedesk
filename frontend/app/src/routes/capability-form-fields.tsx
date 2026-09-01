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

export type CapabilityFormFieldsProps = {
  readonly form: UseFormReturn<CapabilityFormValues>;
  readonly conceptOptions: readonly ConceptOption[];
  readonly inputSchema: JsonSchemaFieldState;
  readonly outputSchema: JsonSchemaFieldState;

  readonly isEditingIdentity: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: (event?: BaseSyntheticEvent) => void;

  readonly isDirty?: boolean;

  readonly trailingActions?: ReactNode;
};

const NATURE_OPTIONS: SelectOption[] = CAPABILITY_NATURES.map((nature) => ({
  value: nature,
  label: nature,
}));

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
  trailingActions,
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

      <div className="grid grid-cols-4 gap-4">
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
      </div>

      <FormField label="Connector" errorId="connector-error" error={errors.connector?.message}>
        <Input
          {...register("connector")}
          disabled={isSubmitting}
          aria-invalid={errors.connector != null}
          aria-describedby={errors.connector != null ? "connector-error" : undefined}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <JsonTextareaField
          id="input_schema"
          label="Input schema"
          value={inputSchema.value}
          onChange={inputSchema.onChange}
          disabled={isSubmitting}
          tall
        />

        <div className="flex flex-col gap-1">
          <JsonTextareaField
            id="output_schema"
            label="Output schema"
            value={outputSchema.value}
            onChange={outputSchema.onChange}
            disabled={isSubmitting}
            tall
          />
          {/*
            task/capability-output-schema-guidance/output-schema-field-guidance's own
            criteria 1-4: guidance beside the shared JsonTextareaField rather than inside it
            (JsonTextareaField itself is untouched, criterion 5 -- it has three other
            consumers this scope does not reach), stating what
            domain/investigation/field-semantics reads and what
            rules/glossary/a-description-states-meaning-never-policy holds a description to.
            A hint, never enforced (criterion 6): nothing here validates properties, so a
            schema whose fields declare no description still saves.
          */}
          <p className="text-sm text-muted-foreground">
            Para cada campo em <code>properties</code>, a plataforma lê seu próprio{" "}
            <code>type</code> e <code>description</code> como o significado declarado
            desse campo — nenhum outro conteúdo deste schema é lido ou validado. Uma
            description declara o que um valor significa (&quot;2 = suspenso por
            inadimplência&quot;), nunca uma decisão (&quot;quando 2, confirme a
            hipótese&quot;).
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" loading={isSubmitting} disabled={isSaveDisabled}>
          Save
        </Button>
        {trailingActions}
      </div>
    </form>
  );
}
