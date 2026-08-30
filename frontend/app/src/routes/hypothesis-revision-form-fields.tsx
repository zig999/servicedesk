import type { BaseSyntheticEvent, JSX, ReactNode } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@tui/ui/input";
import { Textarea } from "@tui/ui/textarea";
import { Label } from "@tui/ui/label";
import { Select } from "@tui/ui/select";
import { Checkbox } from "@tui/ui/checkbox";
import { Button } from "@tui/ui/button";
import type { HypothesisRevisionFormValues } from "../services/hypothesis-revision-form-schema";
import type { ConceptOption } from "../hooks/use-concept-options";
import type { GlossaryVocabularyOptions } from "../hooks/use-glossary-vocabulary";

/**
 * The shared Revise/New-hypothesis form's own field markup
 * (task/manifest-hypothesis-authoring/revise-hypothesis-form): hypothesis
 * name (editable only on the New-hypothesis route, criteria 2 and 3),
 * subject type (always fixed, never editable, either route), criterion,
 * Collects (checkboxes over only the concepts the draft's subject type
 * accepts, criterion 4), resolution outcome and referral action/recipient
 * (each a glossary-backed dropdown, criterion 5). Kept in its own file, apart
 * from the screen's own loading/error composition, the same MNT-01-driven
 * split case-version-editor-form-fields.tsx already established.
 *
 * The label-wraps-control pattern (FormField below) and its own reasoning
 * are copied from case-version-editor-form-fields.tsx's own header comment
 * (TUI's Select never forwards an id to its inner combobox button) rather
 * than imported: that module declares its own FormField unexported, the
 * same MNT-03-kept-in-spirit convention this app's own DTO-mirroring
 * schema modules already follow for a small, repeated shape no shared
 * catalog names.
 */

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
};

/** One labeled field: the label wraps its own control, and an invalid control's error text sits beside it, linked back through aria-describedby (EDG-03, ACC-04). See case-version-editor-form-fields.tsx's own FormField for the full reasoning behind wrapping rather than a matching htmlFor/id pair. */
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
}: HypothesisRevisionFormFieldsProps): JSX.Element {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
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

      {/*
        Not FormField (above): that pattern wraps one control in one outer
        <label>, but each Checkbox below already renders its own <label
        htmlFor> around its own <input> (TUI's own checkbox.tsx) -- nesting
        that inside a second, outer <label> would associate several distinct
        controls with one label element, which is invalid HTML and leaves a
        screen reader unable to tell which control the outer label actually
        names. A <fieldset>/<legend> pair is the standard grouping semantics
        for a set of independently-labeled checkboxes instead (ACC-01,
        ACC-03) -- this task's own inference, disclosed in its delivery
        record.
      */}
      <fieldset
        className="flex flex-col gap-1 border-0 p-0"
        aria-describedby={errors.collects != null ? "collects-error" : undefined}
      >
        {/* Matches TUI's own Label default classes (label.tsx) so this
            caption reads the same as every FormField label above and below
            it, even though a <legend> -- not a Label -- is the correct
            element here (see this fieldset's own header comment). */}
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
              // `|| null` rather than case-version-editor-form-fields.tsx's
              // own `?? null`: that file's consolidation_register is
              // `string | undefined` (an optional field, so `??` alone
              // already converts its one empty case), but this schema's
              // resolution fields are required non-empty strings defaulting
              // to "" (never undefined) -- `??` would pass that "" straight
              // to Select's own `value`, showing no placeholder for an
              // unselected field. `||` treats the empty-string default the
              // same way `?? null` treats `undefined` there.
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

      <div className="flex items-center justify-end">
        <Button type="submit" disabled={isSubmitting}>
          Save hypothesis
        </Button>
      </div>
    </form>
  );
}
