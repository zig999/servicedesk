import type { BaseSyntheticEvent, JSX, ReactNode } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@tui/ui/input";
import { Textarea } from "@tui/ui/textarea";
import { Label } from "@tui/ui/label";
import { Select, type SelectOption } from "@tui/ui/select";
import type { CaseVersionFormValues } from "../services/case-version-form-schema";
import { CONSOLIDATION_REGISTERS } from "../services/case-version-form-schema";
import type { GlossaryVocabularyOptions } from "../hooks/use-glossary-vocabulary";

export const CASE_VERSION_EDITOR_FORM_ID = "case-version-editor-form";

export type CaseVersionEditorFormFieldsProps = {
  readonly form: UseFormReturn<CaseVersionFormValues>;
  readonly savedAt: string | null;
  readonly isBlocked: boolean;
  readonly outcomeOptions: GlossaryVocabularyOptions;
  readonly actionOptions: GlossaryVocabularyOptions;
  readonly recipientOptions: GlossaryVocabularyOptions;
  readonly onSubmit: (event?: BaseSyntheticEvent) => void;
  readonly onFieldBlur: () => void;

  readonly isReadOnly?: boolean;
};

const CONSOLIDATION_REGISTER_OPTIONS: SelectOption[] = CONSOLIDATION_REGISTERS.map(
  (register) => ({ value: register, label: register }),
);

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

export function CaseVersionEditorFormFields({
  form,
  savedAt,
  isBlocked,
  outcomeOptions,
  actionOptions,
  recipientOptions,
  onSubmit,
  onFieldBlur,
  isReadOnly = false,
}: CaseVersionEditorFormFieldsProps): JSX.Element {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <form
      id={CASE_VERSION_EDITOR_FORM_ID}
      onSubmit={isReadOnly ? undefined : onSubmit}
      onBlur={isReadOnly ? undefined : onFieldBlur}
      noValidate
      className="flex flex-col gap-4"
    >
      <FormField label="Title" errorId="title-error" error={errors.title?.message}>
        <Input
          {...register("title")}
          disabled={isBlocked}
          aria-invalid={errors.title != null}
          aria-describedby={errors.title != null ? "title-error" : undefined}
        />
      </FormField>

      <FormField
        label="When to use"
        errorId="when_to_use-error"
        error={errors.when_to_use?.message}
      >
        <Textarea
          {...register("when_to_use")}
          disabled={isBlocked}
          aria-invalid={errors.when_to_use != null}
          aria-describedby={errors.when_to_use != null ? "when_to_use-error" : undefined}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Subject type" errorId="subject-error">
          <Input {...register("subject")} disabled={isBlocked} />
        </FormField>

        <FormField label="Consolidation register" errorId="consolidation_register-error">
          <Controller
            control={control}
            name="consolidation_register"
            render={({ field }) => (
              <Select
                value={field.value ?? null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={CONSOLIDATION_REGISTER_OPTIONS}
                disabled={isBlocked}
                placeholder="Not set"
              />
            )}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField
          label="Fallback outcome"
          errorId="fallback.outcome-error"
          error={errors.fallback?.outcome?.message}
        >
          <Controller
            control={control}
            name="fallback.outcome"
            render={({ field }) => (
              <Select
                value={field.value ?? null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={outcomeOptions.options}
                disabled={isBlocked}
                placeholder="Select an outcome"
                aria-invalid={errors.fallback?.outcome != null}
                aria-describedby={
                  errors.fallback?.outcome != null ? "fallback.outcome-error" : undefined
                }
              />
            )}
          />
        </FormField>

        <FormField
          label="Fallback referral (action)"
          errorId="fallback.referral.action-error"
          error={errors.fallback?.referral?.action?.message}
        >
          <Controller
            control={control}
            name="fallback.referral.action"
            render={({ field }) => (
              <Select
                value={field.value ?? null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={actionOptions.options}
                disabled={isBlocked}
                placeholder="Select an action"
                aria-invalid={errors.fallback?.referral?.action != null}
                aria-describedby={
                  errors.fallback?.referral?.action != null
                    ? "fallback.referral.action-error"
                    : undefined
                }
              />
            )}
          />
        </FormField>

        <FormField
          label="Fallback referral (recipient)"
          errorId="fallback.referral.recipient-error"
          error={errors.fallback?.referral?.recipient?.message}
        >
          <Controller
            control={control}
            name="fallback.referral.recipient"
            render={({ field }) => (
              <Select
                value={field.value ?? null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={recipientOptions.options}
                disabled={isBlocked}
                placeholder="Select a recipient"
                aria-invalid={errors.fallback?.referral?.recipient != null}
                aria-describedby={
                  errors.fallback?.referral?.recipient != null
                    ? "fallback.referral.recipient-error"
                    : undefined
                }
              />
            )}
          />
        </FormField>
      </div>

      {!isReadOnly && (
        <span aria-live="polite" className="text-sm text-muted-foreground">
          {savedAt != null ? `Last saved ${savedAt}` : null}
        </span>
      )}
    </form>
  );
}
