import type { BaseSyntheticEvent, JSX, ReactNode } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@tui/ui/input";
import { Textarea } from "@tui/ui/textarea";
import { Label } from "@tui/ui/label";
import { Select } from "@tui/ui/select";
import { Checkbox } from "@tui/ui/checkbox";
import { Button } from "@tui/ui/button";
import { ButtonFooter } from "../shared/components/button-footer";
import type { HypothesisRevisionFormValues } from "../services/hypothesis-revision-form-schema";
import type { ConceptOption } from "../hooks/use-concept-options";
import type { GlossaryVocabularyOptions } from "../hooks/use-glossary-vocabulary";

export const HYPOTHESIS_REVISION_FORM_ID = "hypothesis-revision-form";

export type HypothesisRevisionFormFieldsProps = {
  readonly form: UseFormReturn<HypothesisRevisionFormValues>;
  readonly hypothesisNameEditable: boolean;
  readonly subjectType: string;
  readonly collectsOptions: readonly ConceptOption[];
  readonly outcomeOptions: GlossaryVocabularyOptions;
  readonly actionOptions: GlossaryVocabularyOptions;
  readonly recipientOptions: GlossaryVocabularyOptions;
  readonly isSubmitting: boolean;
  readonly onSubmit: (event?: BaseSyntheticEvent) => void;

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

export function HypothesisRevisionFormFields({
  form,
  hypothesisNameEditable,
  subjectType,
  collectsOptions,
  outcomeOptions,
  actionOptions,
  recipientOptions,
  isSubmitting,
  onSubmit,
  trailingActions,
}: HypothesisRevisionFormFieldsProps): JSX.Element {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <form
      id={HYPOTHESIS_REVISION_FORM_ID}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4"
    >
      <div className="flex gap-4">
        <FormField
          label="Hypothesis name"
          errorId="hypothesis_name-error"
          error={errors.hypothesis_name?.message}
        >
          <Input
            {...register("hypothesis_name")}
            disabled={!hypothesisNameEditable || isSubmitting}
            aria-invalid={errors.hypothesis_name != null}
            aria-describedby={errors.hypothesis_name != null ? "hypothesis_name-error" : undefined}
          />
        </FormField>

        <FormField label="Subject type (from draft, fixed)" errorId="subject-error">
          <Input value={subjectType} disabled readOnly />
        </FormField>
      </div>

      <FormField label="Criterion" errorId="criterion-error" error={errors.criterion?.message}>
        <Textarea
          {...register("criterion")}
          disabled={isSubmitting}
          aria-invalid={errors.criterion != null}
          aria-describedby={errors.criterion != null ? "criterion-error" : undefined}
        />
      </FormField>

      <fieldset
        className="flex flex-col gap-1 border-0 p-0"
        aria-describedby={errors.collects != null ? "collects-error" : undefined}
      >
        <legend className="block text-sm leading-none font-medium tracking-wider text-accent uppercase">
          Collects
        </legend>
        <Controller
          control={control}
          name="collects"
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              {collectsOptions.map((concept) => {
                const checked = field.value.includes(concept.name);
                return (
                  <Checkbox
                    key={concept.name}
                    id={`collects-${concept.name}`}
                    checked={checked}
                    disabled={isSubmitting}
                    onChange={(event) => {
                      field.onChange(
                        event.target.checked
                          ? [...field.value, concept.name]
                          : field.value.filter((name) => name !== concept.name),
                      );
                    }}
                  >
                    {concept.name}
                  </Checkbox>
                );
              })}
            </div>
          )}
        />
        {errors.collects?.message != null && (
          <p id="collects-error" role="alert" className="text-sm text-destructive">
            {errors.collects.message}
          </p>
        )}
      </fieldset>

      <div className="flex gap-4">
        <FormField
          label="Resolution outcome"
          errorId="resolution.outcome-error"
          error={errors.resolution?.outcome?.message}
        >
          <Controller
            control={control}
            name="resolution.outcome"
            render={({ field }) => (

              <Select
                value={field.value || null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={outcomeOptions.options}
                disabled={isSubmitting}
                placeholder="Select an outcome"
                aria-invalid={errors.resolution?.outcome != null}
                aria-describedby={
                  errors.resolution?.outcome != null ? "resolution.outcome-error" : undefined
                }
              />
            )}
          />
        </FormField>

        <FormField
          label="Referral action"
          errorId="resolution.referral.action-error"
          error={errors.resolution?.referral?.action?.message}
        >
          <Controller
            control={control}
            name="resolution.referral.action"
            render={({ field }) => (
              <Select
                value={field.value || null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={actionOptions.options}
                disabled={isSubmitting}
                placeholder="Select an action"
                aria-invalid={errors.resolution?.referral?.action != null}
                aria-describedby={
                  errors.resolution?.referral?.action != null
                    ? "resolution.referral.action-error"
                    : undefined
                }
              />
            )}
          />
        </FormField>

        <FormField
          label="Referral recipient"
          errorId="resolution.referral.recipient-error"
          error={errors.resolution?.referral?.recipient?.message}
        >
          <Controller
            control={control}
            name="resolution.referral.recipient"
            render={({ field }) => (
              <Select
                value={field.value || null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={recipientOptions.options}
                disabled={isSubmitting}
                placeholder="Select a recipient"
                aria-invalid={errors.resolution?.referral?.recipient != null}
                aria-describedby={
                  errors.resolution?.referral?.recipient != null
                    ? "resolution.referral.recipient-error"
                    : undefined
                }
              />
            )}
          />
        </FormField>
      </div>

      <ButtonFooter>
        <Button type="submit" form={HYPOTHESIS_REVISION_FORM_ID} disabled={isSubmitting}>
          Save hypothesis
        </Button>
        {trailingActions}
      </ButtonFooter>
    </form>
  );
}
