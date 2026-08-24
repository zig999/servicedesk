/**
 * The Capability create/edit form's own state
 * (task/capability-authoring/capability-create-edit-form): name, version,
 * nature, both JSON schemas, timeout, connector and concept, for the
 * Capabilities Browser screen. Mirrors use-concept-form.ts's own
 * create(null)/edit(existing) shared-hook shape exactly -- `existing` is the
 * nullable identity: `null` selects create mode, a real Capability selects
 * edit mode, pre-filled from it.
 *
 * Both modes dispatch the same request, PUT /v1/capabilities/{name}/{version}
 * (contracts/integration/capability-registry's own register-capability
 * operation, the already-confirmed create-or-replace-in-place semantics
 * this task's own Notes state) -- the confirmed product decision this
 * task's own Notes name: editing an existing capability is in-place
 * mutation at the same (name, version), differing from create only in
 * whether name/version are pre-filled and whether they are editable. This
 * hook keeps that decision true structurally by disabling both fields in
 * edit mode (`isEditingIdentity` below) rather than only pre-filling them --
 * the same reasoning use-concept-form.ts's own `isEditingName` already
 * states for a single-field identity: editing either during "edit" would
 * register a *second* capability at the new (name, version) while leaving
 * the original standing at the old one (register-capability never
 * deletes), which is not the in-place mutation the confirmed decision
 * describes.
 *
 * input_schema and output_schema are tracked as plain component state here,
 * not as react-hook-form fields validated by capability-form-schema.ts:
 * each pairs the shared JsonTextareaField's own current text with the
 * validity flag its onChange reports in the same call
 * (json-textarea-field.tsx's own header comment on why value and validity
 * are reported together), so a caller's copy of one can never fall out of
 * sync with the other. Submission is blocked while either is invalid
 * (criterion 3, "the value persisted on save is the minified JSON"
 * presupposes a value that parses at all), and the value dispatched on save
 * is always getJsonTextareaMinifiedValue(currentText) rather than the raw
 * display text -- exactly the two behaviors that module exports for.
 *
 * Reads the concept vocabulary through use-concept-options.ts's own
 * useConceptOptions for the concept single-select's own option list
 * (criterion 4) -- gated by the same "loading"/"load-error"/"ready" phases
 * use-concept-form.ts already keeps for its own subject-type vocabulary
 * read, since this form cannot render a concept selector before that list
 * has loaded.
 *
 * Needs no identity-loading query of its own: the Capabilities Browser's
 * own list read (use-capabilities.ts) already holds every field this form
 * edits, so a caller opening the edit form passes that already-loaded
 * Capability straight through as `existing` rather than this hook issuing
 * a second GET for the one capability being edited.
 *
 * `nature` defaults to "read-only" in create mode rather than starting
 * unselected: rules/integration/a-capability-is-read-only and
 * domain/integration/capability-nature's own description ("mutating exists
 * as a value so the registry has something to refuse") together state that
 * read-only is the only nature the registry ever accepts -- pre-selecting
 * it removes an always-wrong default without adding a domain fact this
 * form did not already know (the operator can still choose "mutating" and
 * submit it, which the registry still refuses exactly as before). This
 * task's own inference, disclosed in its delivery record: no criterion
 * states what the nature field's own initial selection should be.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRef, useState, type BaseSyntheticEvent } from "react";
import { apiFetch, ApiError } from "../services/api-client";
import { uiStateForApiError, type UiErrorStateKind } from "../services/error-ui-state";
import { getJsonTextareaMinifiedValue } from "../shared/components/json-textarea-field";
import { capabilityFormSchema, type CapabilityFormValues } from "../services/capability-form-schema";
import { useConceptOptions, type ConceptOption } from "./use-concept-options";
import type { Capability } from "./use-capabilities";

/** Which of the two modes a caller opened the form in, and (edit mode only) which capability it edits. */
export type CapabilityFormTarget =
  | { readonly mode: "create" }
  | { readonly mode: "edit"; readonly capability: Capability };

/** One JSON-schema field's own controlled text plus the validity JsonTextareaField's own onChange last reported for it (json-textarea-field.tsx's own JsonTextareaFieldProps shape, re-exposed here since input_schema/output_schema live outside react-hook-form). */
export type JsonSchemaFieldState = {
  readonly value: string;
  readonly isValid: boolean;
  readonly onChange: (value: string, isValid: boolean) => void;
};

export type CapabilityFormState =
  | { readonly phase: "loading" }
  | { readonly phase: "load-error"; readonly retryLoad: () => void }
  | {
      readonly phase: "ready";
      readonly form: UseFormReturn<CapabilityFormValues>;
      readonly conceptOptions: readonly ConceptOption[];
      readonly inputSchema: JsonSchemaFieldState;
      readonly outputSchema: JsonSchemaFieldState;
      /** True only in edit mode -- see this file's own header comment on why name/version are disabled rather than merely pre-filled. */
      readonly isEditingIdentity: boolean;
      readonly isSubmitting: boolean;
      readonly onSubmit: (event?: BaseSyntheticEvent) => void;
    };

const GENERIC_SAVE_FAILURE_MESSAGE =
  "Something went wrong while saving this capability. Try again.";

/**
 * The wording for each of the four domain refusals register-capability can
 * now return (this task's own Notes, confirmed against
 * src/src/errors/status-map.ts and error-ui-state.ts, both updated by this
 * task to name these four): criterion 5 requires the registry's own nature
 * refusal to reach the operator as a distinguishable message rather than
 * the generic fallback above, and the other three are given the same
 * treatment for the same reason -- no criterion states exact wording for
 * any of the four, so each message is this task's own inference, disclosed
 * in its delivery record.
 */
const SAVE_FAILURE_MESSAGE_BY_KIND: Partial<Record<UiErrorStateKind, string>> = {
  "capability-not-read-only":
    "This capability's declared nature is not read-only; the registry only accepts read-only capabilities.",
  "incomplete-capability-contract":
    "This capability does not declare its contract completely; every field of its contract is required.",
  "capability-schema-not-well-formed":
    "The input schema or the output schema is not syntactically valid JSON.",
  "concept-already-answered":
    "Another capability already answers this concept; each concept resolves to exactly one capability.",
};

/** Resolves a save failure to the message it should show the operator -- the specific wording above for one of the four named refusals, or the generic fallback for anything else (including a non-ApiError thrown value). */
function saveFailureMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const state = uiStateForApiError(error);
    return SAVE_FAILURE_MESSAGE_BY_KIND[state.kind] ?? GENERIC_SAVE_FAILURE_MESSAGE;
  }
  return GENERIC_SAVE_FAILURE_MESSAGE;
}

/**
 * `existing`: `null` for create mode, or the capability being edited (edit
 * mode). `onSaved` runs after a successful register-capability call (both
 * modes) -- the caller uses it to close the form, matching
 * use-concept-form.ts's own convention of leaving navigation/dialog-closing
 * decisions to the screen rather than this hook.
 */
export function useCapabilityForm(
  existing: Capability | null,
  onSaved: () => void,
): CapabilityFormState {
  const queryClient = useQueryClient();
  const conceptOptions = useConceptOptions();

  // Guards the dispatch itself against a second Save click arriving before
  // react-hook-form's own (async, zod) validation has resolved for the
  // first one -- the same synchronous leading-edge guard
  // use-concept-form.ts's own header comment documents in full.
  const isDispatchingRef = useRef(false);

  const [inputSchemaValue, setInputSchemaValue] = useState(existing?.input_schema ?? "");
  const [inputSchemaValid, setInputSchemaValid] = useState(existing !== null);
  const [outputSchemaValue, setOutputSchemaValue] = useState(existing?.output_schema ?? "");
  const [outputSchemaValid, setOutputSchemaValid] = useState(existing !== null);

  const form = useForm<CapabilityFormValues>({
    resolver: zodResolver(capabilityFormSchema),
    defaultValues: {
      name: existing?.name ?? "",
      version: existing?.version ?? "",
      nature: existing?.nature ?? "read-only",
      timeout: existing?.timeout,
      connector: existing?.connector ?? "",
      concept: existing?.concept ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: CapabilityFormValues) =>
      apiFetch<Capability>(
        `/v1/capabilities/${encodeURIComponent(values.name)}/${encodeURIComponent(values.version)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nature: values.nature,
            input_schema: getJsonTextareaMinifiedValue(inputSchemaValue),
            output_schema: getJsonTextareaMinifiedValue(outputSchemaValue),
            timeout: values.timeout,
            connector: values.connector,
            concept: values.concept,
          }),
        },
      ),
    onSuccess: () => {
      // criterion 6: the Capabilities Browser screen reflects the change
      // afterward -- invalidating the exact query key use-capabilities.ts's
      // own useCapabilities reads through is what makes that screen refetch.
      void queryClient.invalidateQueries({ queryKey: ["capabilities"] });
      onSaved();
    },
    onError: (error) => {
      // criterion 5: a non-read-only nature (and the other three registry
      // refusals this task's Notes name) reaches the operator as a
      // distinguishable, specific message rather than a generic or absent
      // one.
      toast.error(saveFailureMessage(error));
    },
  });

  if (conceptOptions.isError) {
    return {
      phase: "load-error",
      retryLoad: () => conceptOptions.refetch(),
    };
  }
  if (conceptOptions.isLoading) {
    return { phase: "loading" };
  }

  const submit = form.handleSubmit((values) => {
    // criterion 3: submission is blocked while either JSON schema field is
    // invalid, ahead of even attempting to dispatch the request.
    if (!inputSchemaValid || !outputSchemaValid) {
      return;
    }
    mutation.mutate(values);
  });

  const onSubmit = (event?: BaseSyntheticEvent): void => {
    if (isDispatchingRef.current) {
      event?.preventDefault();
      return;
    }
    isDispatchingRef.current = true;
    void submit(event).finally(() => {
      isDispatchingRef.current = false;
    });
  };

  return {
    phase: "ready",
    form,
    conceptOptions: conceptOptions.concepts,
    inputSchema: {
      value: inputSchemaValue,
      isValid: inputSchemaValid,
      onChange: (value, isValid) => {
        setInputSchemaValue(value);
        setInputSchemaValid(isValid);
      },
    },
    outputSchema: {
      value: outputSchemaValue,
      isValid: outputSchemaValid,
      onChange: (value, isValid) => {
        setOutputSchemaValue(value);
        setOutputSchemaValid(isValid);
      },
    },
    isEditingIdentity: existing !== null,
    isSubmitting: mutation.isPending,
    onSubmit,
  };
}
