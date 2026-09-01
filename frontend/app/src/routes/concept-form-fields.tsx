import type { BaseSyntheticEvent, JSX, ReactNode } from "react";
import { Controller, type Control, type UseFormReturn } from "react-hook-form";
import { Input } from "@tui/ui/input";
import { Textarea } from "@tui/ui/textarea";
import { Label } from "@tui/ui/label";
import { Checkbox } from "@tui/ui/checkbox";
import { Button } from "@tui/ui/button";
import type { ConceptFormValues } from "../services/concept-form-schema";
import type { GlossaryVocabularyOptions } from "../hooks/use-glossary-vocabulary";

export type ConceptFormFieldsProps = {
  readonly form: UseFormReturn<ConceptFormValues>;
  readonly subjectTypeOptions: GlossaryVocabularyOptions;

  readonly isEditingName: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: (event?: BaseSyntheticEvent) => void;
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

function AcceptsField({
  control,
  options,
  error,
  disabled,
}: {
  control: Control<ConceptFormValues>;
  options: GlossaryVocabularyOptions["options"];
  error?: string;
  disabled: boolean;
}): JSX.Element {
  return (
    <Controller
      control={control}
      name="accepts"
      render={({ field }) => {
        const selected = field.value;
        function toggle(value: string, isChecked: boolean): void {
          field.onChange(
            isChecked ? [...selected, value] : selected.filter((item) => item !== value),
          );
        }
        return (
          <fieldset
            className="flex flex-col gap-1"
            aria-invalid={error != null}
            aria-describedby={error != null ? "accepts-error" : undefined}
          >
            <legend className="text-xs font-semibold tracking-wide text-accent uppercase">
              Accepts
            </legend>
            <div className="flex flex-col gap-2 pt-1">
              {options.map((option) => (
                <Checkbox
                  key={option.value}
                  checked={selected.includes(option.value)}
                  onChange={(event) => toggle(option.value, event.target.checked)}
                  disabled={disabled}
                >
                  {option.label}
                </Checkbox>
              ))}
            </div>
            {error != null && (
              <p id="accepts-error" role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </fieldset>
        );
      }}
    />
  );
}

export function ConceptFormFields({
  form,
  subjectTypeOptions,
  isEditingName,
  isSubmitting,
  onSubmit,
}: ConceptFormFieldsProps): JSX.Element {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField label="Name" errorId="name-error" error={errors.name?.message}>
        <Input
          {...register("name")}
          disabled={isEditingName || isSubmitting}
          aria-invalid={errors.name != null}
          aria-describedby={errors.name != null ? "name-error" : undefined}
        />
      </FormField>

      <AcceptsField
        control={control}
        options={subjectTypeOptions.options}
        error={errors.accepts?.message}
        disabled={isSubmitting}
      />

      <FormField label="TTL (seconds)" errorId="ttl-error" error={errors.ttl?.message}>
        <Input
          type="number"
          {...register("ttl", { valueAsNumber: true })}
          disabled={isSubmitting}
          aria-invalid={errors.ttl != null}
          aria-describedby={errors.ttl != null ? "ttl-error" : undefined}
        />
      </FormField>

      {/*
        domain/glossary/concept's fourth attribute
        (rules/glossary/a-concept-declares-its-description): what the named
        observation means, free text rather than a single-line value -- a
        Textarea (@tui/ui/textarea) rather than Input, the same control
        hypothesis-revision-form-fields.tsx's own Criterion field already uses
        for a comparable free-text, non-JSON attribute (that field's own
        register/disabled/aria-invalid/aria-describedby wiring, copied here
        unchanged).
      */}
      <FormField
        label="Description"
        errorId="description-error"
        error={errors.description?.message}
      >
        <Textarea
          {...register("description")}
          disabled={isSubmitting}
          aria-invalid={errors.description != null}
          aria-describedby={errors.description != null ? "description-error" : undefined}
        />
      </FormField>

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          Save
        </Button>
      </div>
    </form>
  );
}
