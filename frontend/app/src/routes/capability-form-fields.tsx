import type { BaseSyntheticEvent, JSX, ReactNode } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@tui/ui/input";
import { Label } from "@tui/ui/label";
import { Select, type SelectOption } from "@tui/ui/select";
import { CodeEditor } from "@tui/ui/code-editor";
import { Button } from "@tui/ui/button";
import { ButtonFooter } from "../shared/components/button-footer";
import { JsonCodeEditorField } from "../shared/components/json-code-editor-field";
import { CAPABILITY_NATURES, type CapabilityFormValues } from "../services/capability-form-schema";
import type { ConceptOption } from "../hooks/use-concept-options";
import type { JsonSchemaFieldState } from "../hooks/use-capability-form";
import { useCapabilitySchemaHelper } from "../hooks/use-capability-schema-helper";
import { useApplyToJsonSchemaField } from "../hooks/use-apply-to-json-schema-field";
import { CapabilitySchemaHelperFields } from "./capability-schema-helper-fields";
import { ConnectorConfigurationApplyConfirmationDialog } from "./connector-configuration-apply-confirmation-dialog";

export const CAPABILITY_FORM_ID = "capability-form";

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

const OUTPUT_SCHEMA_GUIDANCE =
  "O que é inserido aqui é JSON. Os nomes de campo lidos a partir dele são os caminhos " +
  "através do objeto properties de nível superior deste schema e de todo objeto " +
  "properties e todo schema items alcançável a partir dele. Esse caminho é construído " +
  "concatenando a chave própria de cada objeto ao caminho do seu pai com um ponto, e os " +
  "items próprios de cada array ao caminho do seu pai com colchetes. O type e a " +
  "description declarados no nó que cada caminho alcança, onde o schema os declara, são " +
  "lidos como a semântica declarada desse campo. Nenhum outro conteúdo deste schema é " +
  "lido ou validado. Uma description aqui declara o que seu valor significa e não " +
  "nomeia nenhuma decisão.";

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

  const schemaHelper = useCapabilitySchemaHelper();

  const conceptSelectOptions: SelectOption[] = conceptOptions.map((concept) => ({
    value: concept.name,
    label: concept.name,
  }));

  const isSaveDisabled =
    isSubmitting || !inputSchema.isValid || !outputSchema.isValid || isDirty === false;

  const inputSchemaApply = useApplyToJsonSchemaField(
    inputSchema,
    isDirty ?? inputSchema.value !== "",
  );
  const outputSchemaApply = useApplyToJsonSchemaField(
    outputSchema,
    isDirty ?? outputSchema.value !== "",
  );

  return (
    <form id={CAPABILITY_FORM_ID} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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

      <div className="flex flex-col gap-1">
        <Controller
          control={control}
          name="payload_notes"
          render={({ field }) => (
            <CodeEditor
              id="payload_notes"
              label="Payload notes"
              value={field.value ?? ""}
              onChange={(value) => field.onChange(value === "" ? undefined : value)}
              language="plaintext"
              height="10rem"
              disabled={isSubmitting}
              aria-invalid={errors.payload_notes != null}
              aria-describedby={errors.payload_notes != null ? "payload_notes-error" : undefined}
            />
          )}
        />
        {errors.payload_notes?.message != null && (
          <p id="payload_notes-error" role="alert" className="text-sm text-destructive">
            {errors.payload_notes.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <JsonCodeEditorField
          id="input_schema"
          label="Input schema"
          value={inputSchema.value}
          onChange={inputSchema.onChange}
          disabled={isSubmitting}
          tall
        />

        <div className="flex flex-col gap-1">
          <JsonCodeEditorField
            id="output_schema"
            label="Output schema"
            value={outputSchema.value}
            onChange={outputSchema.onChange}
            disabled={isSubmitting}
            tall
          />
          <p className="text-sm text-muted-foreground">{OUTPUT_SCHEMA_GUIDANCE}</p>
        </div>
      </div>

      <CapabilitySchemaHelperFields
        state={schemaHelper}
        onApplyInputSchema={inputSchemaApply.onApply}
        onApplyOutputSchema={outputSchemaApply.onApply}
      />

      <ConnectorConfigurationApplyConfirmationDialog
        diff={inputSchemaApply.applyConfirmationDiff}
        onOpenChange={inputSchemaApply.onApplyConfirmationOpenChange}
        onConfirm={inputSchemaApply.onConfirmApply}
      />

      <ConnectorConfigurationApplyConfirmationDialog
        diff={outputSchemaApply.applyConfirmationDiff}
        onOpenChange={outputSchemaApply.onApplyConfirmationOpenChange}
        onConfirm={outputSchemaApply.onConfirmApply}
      />

      <ButtonFooter>
        <Button
          type="submit"
          form={CAPABILITY_FORM_ID}
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
