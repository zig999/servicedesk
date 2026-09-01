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

      readonly isEditingIdentity: boolean;
      readonly isSubmitting: boolean;
      readonly onSubmit: (event?: BaseSyntheticEvent) => void;
    };

const GENERIC_SAVE_FAILURE_MESSAGE =
  "Something went wrong while saving this capability. Try again.";

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

function saveFailureMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const state = uiStateForApiError(error);
    return SAVE_FAILURE_MESSAGE_BY_KIND[state.kind] ?? GENERIC_SAVE_FAILURE_MESSAGE;
  }
  return GENERIC_SAVE_FAILURE_MESSAGE;
}

export function useCapabilityForm(
  existing: Capability | null,
  onSaved: () => void,
): CapabilityFormState {
  const queryClient = useQueryClient();
  const conceptOptions = useConceptOptions();

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

      void queryClient.invalidateQueries({ queryKey: ["capabilities"] });
      onSaved();
    },
    onError: (error) => {

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
