import type { BaseSyntheticEvent, JSX, ReactNode } from "react";
import { Controller, type Control, type UseFormReturn } from "react-hook-form";
import { Input } from "@tui/ui/input";
import { Label } from "@tui/ui/label";
import { Checkbox } from "@tui/ui/checkbox";
import { Button } from "@tui/ui/button";
import type { ConceptFormValues } from "../services/concept-form-schema";
import type { GlossaryVocabularyOptions } from "../hooks/use-glossary-vocabulary";

/**
 * The Concept create/edit form's own field markup
 * (task/concept-authoring/concept-create-edit-form): name, accepts and ttl --
 * kept in its own file, apart from the Dialog composing it, matching this
 * app's own established convention of splitting a create/edit form's field
 * markup out from the screen/dialog that mounts it
 * (case-version-editor-form-fields.tsx).
 *
 * Name and TTL each use the same label-wraps-control convention that file
 * already established (FormField below): the label wraps its own control
 * rather than a matching htmlFor/id pair, kept for consistency across every
 * form field this app renders even though Input itself (unlike TUI's own
 * Select) does forward a caller's id to its native element.
 *
 * Accepts is this app's own first multi-select (this task's own inventory
 * risk: "No multi-select control exists anywhere in this app's UI-kit usage
 * today ... Compose a simple multi-select yourself over the existing
 * Select/Button/Label/Checkbox primitives"): a labeled group of Checkboxes,
 * one per domain/glossary/subject-type option, rather than a dropdown --
 * simplest composition that lets an operator both see and toggle more than
 * one selection at once, over primitives this UI kit already ships
 * (Checkbox). Composed as its own AcceptsField below rather than reusing
 * FormField, since FormField wraps exactly one control inside one Label, and
 * a group of Checkboxes needs its own group-level label and error instead
 * (a native `<fieldset>`/`<legend>` pair, which associates the group's own
 * label with every Checkbox inside it without extra aria wiring). Disclosed
 * as this task's own inference in its delivery record: the multi-select's own
 * shape, since no precedent exists to follow or diverge from.
 */

export type ConceptFormFieldsProps = {
  readonly form: UseFormReturn<ConceptFormValues>;
  readonly subjectTypeOptions: GlossaryVocabularyOptions;
  /** True only in edit mode -- see use-concept-form.ts's own header comment on why the name field is disabled rather than merely pre-filled. */
  readonly isEditingName: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: (event?: BaseSyntheticEvent) => void;
};

/** One labeled field: the label wraps its own control, and an invalid control's error text sits beside it, linked back through aria-describedby (EDG-03, ACC-04) -- the same convention case-version-editor-form-fields.tsx's own FormField already established. */
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

/**
 * The accepts multi-select itself (criteria 3 and 4): one Checkbox per
 * subject-type option, its own checked state read from -- and its own toggle
 * written back to -- the form's own `accepts` array field through a single
 * Controller, so react-hook-form (and this form's own zod resolver) sees
 * exactly the selected set, no more and no fewer, on every change.
 */
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

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          Save
        </Button>
      </div>
    </form>
  );
}
