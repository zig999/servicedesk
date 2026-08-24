/**
 * The Concept create/edit form's own state
 * (task/concept-authoring/concept-create-edit-form): name, accepts and ttl,
 * for the Glossary screen's Concepts tab. Mirrors this app's own
 * create(null)/edit(identity) shared-hook shape (use-edit-draft-version-form.ts,
 * use-new-draft-version-form.ts, this app's own inventory) -- `existing` is
 * the nullable identity: `null` selects create mode, a real GlossaryConcept
 * selects edit mode, pre-filled from it.
 *
 * Unlike that pair, both modes here dispatch the exact same request
 * (PUT /v1/glossary/concepts/{name}, contracts/glossary/glossary-authoring's
 * own register-concept operation) -- the confirmed product decision this
 * task's own Notes name: editing an existing concept is in-place mutation at
 * the same name, register-concept both creates and replaces whatever concept
 * stands at that name. This hook keeps that decision true structurally by
 * disabling the name field in edit mode (`isEditingName` below) rather than
 * only pre-filling it: a name edited during "edit" would register a *second*
 * concept at the new name while leaving the original one standing at the old
 * name (register-concept never deletes), which is not the in-place mutation
 * the confirmed decision describes. Disclosed as this task's own inference in
 * its delivery record.
 *
 * Reads the subject-type vocabulary through
 * use-glossary-vocabulary.ts's own useGlossaryVocabularyOptions (this app's
 * one shared vocabulary-options hook) for the accepts multi-select's own
 * option list -- domain/glossary/subject-type is the closed enumeration
 * `accepts` draws from (domain/glossary/concept: "accepts: subject-type,
 * many: true"). Business logic lives here rather than inline in the screen's
 * JSX (ARC-03), matching this app's own established convention.
 *
 * Needs no identity-loading query of its own: the Concepts tab's own list
 * read (use-glossary-concepts.ts) already holds every field this form edits
 * (name, accepts, ttl), so a caller opening the edit form passes that already-
 * loaded GlossaryConcept straight through as `existing` rather than this hook
 * issuing a second GET for the one concept being edited -- no such
 * single-concept read is part of this task's own scope. The only load this
 * hook's own "ready"/"loading"/"load-error" phases gate on is the accepts
 * multi-select's own vocabulary read.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRef, type BaseSyntheticEvent } from "react";
import { apiFetch } from "../services/api-client";
import { conceptFormSchema, type ConceptFormValues } from "../services/concept-form-schema";
import {
  useGlossaryVocabularyOptions,
  type GlossaryVocabularyOptions,
} from "./use-glossary-vocabulary";
import type { GlossaryConcept } from "./use-glossary-concepts";

/** Which of the two modes a caller opened the form in, and (edit mode only) which concept it edits. */
export type ConceptFormTarget =
  | { readonly mode: "create" }
  | { readonly mode: "edit"; readonly concept: GlossaryConcept };

export type ConceptFormState =
  | { readonly phase: "loading" }
  | { readonly phase: "load-error"; readonly retryLoad: () => void }
  | {
      readonly phase: "ready";
      readonly form: UseFormReturn<ConceptFormValues>;
      readonly subjectTypeOptions: GlossaryVocabularyOptions;
      /** True only in edit mode -- see this file's own header comment on why the name field is disabled rather than merely pre-filled. */
      readonly isEditingName: boolean;
      readonly isSubmitting: boolean;
      readonly onSubmit: (event?: BaseSyntheticEvent) => void;
    };

const GENERIC_SAVE_FAILURE_MESSAGE = "Something went wrong while saving this concept. Try again.";

/**
 * `existing`: `null` for create mode, or the concept being edited (edit
 * mode). `onSaved` runs after a successful register-concept call (both
 * modes) -- the caller uses it to close the form, matching this app's own
 * convention of leaving navigation/dialog-closing decisions to the screen
 * rather than this hook (use-edit-draft-version-form.ts's own release/discard
 * Dialogs close themselves the same way, through a caller-visible effect of
 * a successful mutation).
 */
export function useConceptForm(
  existing: GlossaryConcept | null,
  onSaved: () => void,
): ConceptFormState {
  const queryClient = useQueryClient();
  const subjectTypeOptions = useGlossaryVocabularyOptions("subject-type");

  // Guards the dispatch itself against a second Save click arriving before
  // react-hook-form's own (async, zod) validation has resolved for the
  // first one -- mutation.isPending only flips (and with it the rendered
  // disabled Button) once mutate() actually runs, which is after that
  // validation settles, so a second click landing inside that window would
  // otherwise pass the disabled check and dispatch a second register-concept
  // request for one operator action. Set synchronously on the leading edge
  // of every onSubmit call and cleared once handleSubmit's own returned
  // promise settles either way (validation failed, so mutate() never ran;
  // or validation passed and mutate() already ran synchronously before this
  // clears) -- a plain ref rather than component state, since the value
  // must be read and written inside the same synchronous click dispatch,
  // before any re-render could apply a state update.
  const isDispatchingRef = useRef(false);

  const form = useForm<ConceptFormValues>({
    resolver: zodResolver(conceptFormSchema),
    defaultValues: {
      name: existing?.name ?? "",
      accepts: existing ? [...existing.accepts] : [],
      ttl: existing?.ttl,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ConceptFormValues) =>
      apiFetch<GlossaryConcept>(`/v1/glossary/concepts/${encodeURIComponent(values.name)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accepts: values.accepts, ttl: values.ttl }),
      }),
    onSuccess: () => {
      // criterion 5: the Concepts tab reflects the change afterward --
      // invalidating the exact query key use-glossary-concepts.ts's own
      // useGlossaryConcepts reads through is what makes that tab refetch.
      void queryClient.invalidateQueries({ queryKey: ["glossary", "concepts-with-ttl"] });
      // Also invalidates use-concept-options.ts's own sibling cache entry
      // (["glossary", "concepts"]) -- a distinct query key over the exact
      // same GET /v1/glossary/concepts endpoint this mutation just changed
      // the response of (that hook's own header comment on why the two keys
      // are kept apart). Left stale, use-hypothesis-revision-form.ts's own
      // consumer of that hook would keep filtering against the
      // pre-registration set of concepts until something else happened to
      // invalidate it. This task's own inference, disclosed in its delivery
      // record: no criterion of this task names that screen, but this is a
      // cache-correctness completion over data this exact mutation writes,
      // not a widening of this task's own UI surface.
      void queryClient.invalidateQueries({ queryKey: ["glossary", "concepts"] });
      onSaved();
    },
    onError: () => {
      // register-concept (GlossaryService.registerConcept, confirmed
      // directly against src/src/glossary/glossary.service.ts) throws no
      // domain error of its own -- it writes whatever registration it is
      // given, so no new entry is needed in error-ui-state.ts's own registry
      // (this task's own inventory risk names adding one only "for any new
      // refusal this task's backend surface can return", and this surface
      // returns none beyond the route's own generic body-validation 400,
      // already surfaced through react-hook-form's own field errors before
      // this mutation is ever dispatched). This mirrors
      // use-edit-draft-version-form.ts's own generic, non-domain fallback for
      // the same reason: something must tell the operator the save did not
      // happen, and no criterion of this task names wording for a failure
      // this specific.
      toast.error(GENERIC_SAVE_FAILURE_MESSAGE);
    },
  });

  if (subjectTypeOptions.isError) {
    return {
      phase: "load-error",
      retryLoad: () => subjectTypeOptions.refetch(),
    };
  }
  if (subjectTypeOptions.isLoading) {
    return { phase: "loading" };
  }

  const submit = form.handleSubmit((values) => {
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
    subjectTypeOptions,
    isEditingName: existing !== null,
    isSubmitting: mutation.isPending,
    onSubmit,
  };
}
