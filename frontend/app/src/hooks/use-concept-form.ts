import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRef, type BaseSyntheticEvent } from "react";
import { apiFetch, ApiError } from "../services/api-client";
import { uiStateForApiError, type UiErrorStateKind } from "../services/error-ui-state";
import { conceptFormSchema, type ConceptFormValues } from "../services/concept-form-schema";
import {
  useGlossaryVocabularyOptions,
  type GlossaryVocabularyOptions,
} from "./use-glossary-vocabulary";
import type { GlossaryConcept } from "./use-glossary-concepts";

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

      readonly isEditingName: boolean;
      readonly isSubmitting: boolean;
      readonly onSubmit: (event?: BaseSyntheticEvent) => void;
    };

const GENERIC_SAVE_FAILURE_MESSAGE = "Something went wrong while saving this concept. Try again.";

const SAVE_FAILURE_MESSAGE_BY_KIND: Partial<Record<UiErrorStateKind, string>> = {
  "concept-description-required":
    "A concept must state what it means; add a description before saving.",
};

function saveFailureMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const state = uiStateForApiError(error);
    return SAVE_FAILURE_MESSAGE_BY_KIND[state.kind] ?? GENERIC_SAVE_FAILURE_MESSAGE;
  }
  return GENERIC_SAVE_FAILURE_MESSAGE;
}

export function useConceptForm(
  existing: GlossaryConcept | null,
  onSaved: () => void,
): ConceptFormState {
  const queryClient = useQueryClient();
  const subjectTypeOptions = useGlossaryVocabularyOptions("subject-type");

  const isDispatchingRef = useRef(false);

  const form = useForm<ConceptFormValues>({
    resolver: zodResolver(conceptFormSchema),
    defaultValues: {
      name: existing?.name ?? "",
      accepts: existing ? [...existing.accepts] : [],
      ttl: existing?.ttl,
      description: existing?.description ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ConceptFormValues) =>
      apiFetch<GlossaryConcept>(`/v1/glossary/concepts/${encodeURIComponent(values.name)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accepts: values.accepts,
          ttl: values.ttl,
          description: values.description,
        }),
      }),
    onSuccess: () => {

      void queryClient.invalidateQueries({ queryKey: ["glossary", "concepts-with-ttl"] });

      void queryClient.invalidateQueries({ queryKey: ["glossary", "concepts"] });
      onSaved();
    },
    onError: (error) => {

      toast.error(saveFailureMessage(error));
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
