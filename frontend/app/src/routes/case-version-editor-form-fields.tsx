import type { BaseSyntheticEvent, JSX, ReactNode } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@tui/ui/input";
import { Textarea } from "@tui/ui/textarea";
import { Label } from "@tui/ui/label";
import { Select, type SelectOption } from "@tui/ui/select";
import { Button } from "@tui/ui/button";
import type { CaseVersionFormValues } from "../services/case-version-form-schema";
import { CONSOLIDATION_REGISTERS } from "../services/case-version-form-schema";
import type { GlossaryVocabularyOptions } from "../hooks/use-glossary-vocabulary";
import type { SaveStatus } from "../hooks/use-edit-draft-version-form";

/**
 * The Version Editor's own field markup (task/version-editor/
 * edit-draft-version), the wireframe's own field set (proposal §2.3, quoted
 * in this task's `sources`): title, when_to_use, subject, consolidation_register,
 * fallback outcome and fallback referral (action+recipient). subject is a
 * declared attribute like every other (domain/knowledge/case-version) and is
 * corrected the same way while the version stays in draft
 * (task/subject-field-fixed-bug/subject-follows-isblocked) -- it renders
 * `disabled` through `isBlocked`, never unconditionally. Kept in its own file, apart from
 * case-version-editor-screen.tsx's own loading/error composition, so
 * neither file grows toward MNT-01's three-hundred-line limit.
 *
 * Every field's label wraps its own control (FormField below) rather than
 * pointing at it through a matching htmlFor/id pair: TUI's own Select
 * (select.types.ts) spreads a caller's props only onto its outer wrapping
 * div, never onto its inner `role="combobox"` button, so an id placed on
 * Select would never reach the one element a screen reader actually
 * announces. Wrapping is the one association technique that still reaches
 * that button regardless -- native HTML treats any labelable descendant
 * (a real `<button>`, which Select's trigger is) as the label's target --
 * and it works identically for Input and Textarea, so every field uses it
 * rather than mixing two association styles for no functional reason.
 *
 * task/version-editor/view-released-version-read-only adds `isReadOnly`
 * (optional, defaulting to `false`): every field here already renders
 * `disabled` through `isBlocked` for a released version's own load, but that
 * alone still mounted this same form's own Save control, merely inert --
 * `isReadOnly` omits it outright instead, and its own onSubmit/onBlur wiring
 * with it, so a released version's read-only render carries no control that
 * could change it.
 */

export type CaseVersionEditorFormFieldsProps = {
  readonly form: UseFormReturn<CaseVersionFormValues>;
  readonly status: SaveStatus;
  readonly savedAt: string | null;
  readonly isBlocked: boolean;
  readonly outcomeOptions: GlossaryVocabularyOptions;
  readonly actionOptions: GlossaryVocabularyOptions;
  readonly recipientOptions: GlossaryVocabularyOptions;
  readonly onSubmit: (event?: BaseSyntheticEvent) => void;
  readonly onFieldBlur: () => void;
  /**
   * task/version-editor/view-released-version-read-only's own flag
   * (useEditDraftVersionForm's own `isReadOnly`, "ready" phase): every field
   * above already renders `disabled` once `isBlocked` is true, which a
   * released version's own load already sets -- but that alone still mounts
   * this form's own Save control, merely inert (this project's own inventory
   * risk on this exact component: "no distinct 'read-only, no actions at
   * all' rendering path"). `true` here omits the Save control and its own
   * onSubmit/onBlur wiring outright, satisfying this task's own criterion
   * ("shows no Save … control") rather than only disabling it. Defaults to
   * `false` so every other caller (the draft-editing and blank-form call
   * sites, neither of which sets it) renders exactly as before.
   */
  readonly isReadOnly?: boolean;
};

const CONSOLIDATION_REGISTER_OPTIONS: SelectOption[] = CONSOLIDATION_REGISTERS.map(
  (register) => ({ value: register, label: register }),
);

/**
 * One labeled field: the label wraps its own control, and an invalid
 * control's error text sits beside it, linked back through
 * aria-describedby (EDG-03, ACC-04). The wrapped control sits in its own
 * `normal-case`/`tracking-normal`/`font-normal`/`text-foreground` div
 * rather than directly inside Label's own element: `text-transform`,
 * `letter-spacing`, `font-weight` and `color` are all CSS-inherited
 * properties, and Label's own default classes (uppercase, wide tracking,
 * accent color) would otherwise cascade into whatever text the wrapped
 * Input, Textarea or Select renders -- resetting them here keeps the
 * caption's own distinct styling while the control's own text renders
 * exactly as it would outside a label.
 */
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
  status,
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

      <div className="flex gap-4">
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

      <div className="flex gap-4">
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
        <div className="flex items-center justify-between">
          {/*
            ACC-07: this text changes with no page navigation when a save
            completes, so its own change is announced through aria-live
            rather than left to a sighted user's own glance at the footer.
          */}
          <span aria-live="polite" className="text-sm text-muted-foreground">
            {savedAt != null ? `Last saved ${savedAt}` : null}
          </span>
          <Button type="submit" disabled={isBlocked || status === "clean"}>
            Save changes
          </Button>
        </div>
      )}
    </form>
  );
}
