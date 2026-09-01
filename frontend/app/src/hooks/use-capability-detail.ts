import { useCallback, useEffect, useRef, useState, type BaseSyntheticEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiFetch } from "../services/api-client";
import { getJsonTextareaMinifiedValue } from "../shared/components/json-textarea-field";
import {
  capabilityFormSchema,
  type CapabilityFormValues,
} from "../services/capability-form-schema";
import { useConceptOptions, type ConceptOption } from "./use-concept-options";
import type { Capability } from "./use-capabilities";
import type { JsonSchemaFieldState } from "./use-capability-form";

export type CapabilityDetailState =
  | { readonly phase: "loading" }
  | { readonly phase: "load-error"; readonly retryLoad: () => void }
  | {
      readonly phase: "ready";
      readonly form: UseFormReturn<CapabilityFormValues>;
      readonly conceptOptions: readonly ConceptOption[];
      readonly inputSchema: JsonSchemaFieldState;
      readonly outputSchema: JsonSchemaFieldState;
      readonly isDirty: boolean;
      readonly isSubmitting: boolean;

      readonly isSubmitSuccessful: boolean;
      readonly onSubmit: (event?: BaseSyntheticEvent) => void;
    };

export function useCapabilityDetail(name: string, version: string): CapabilityDetailState {
  const queryClient = useQueryClient();

  const isSubmittingRef = useRef(false);

  const [inputSchemaValue, setInputSchemaValue] = useState("");
  const [inputSchemaValid, setInputSchemaValid] = useState(true);
  const [outputSchemaValue, setOutputSchemaValue] = useState("");
  const [outputSchemaValid, setOutputSchemaValid] = useState(true);

  const [inputSchemaBaseline, setInputSchemaBaseline] = useState("");
  const [outputSchemaBaseline, setOutputSchemaBaseline] = useState("");

  const query = useQuery({
    queryKey: ["capability", name, version],
    queryFn: () =>
      apiFetch<Capability>(
        `/v1/capabilities/${encodeURIComponent(name)}/${encodeURIComponent(version)}`,
      ),
  });
  const conceptOptions = useConceptOptions();

  const form = useForm<CapabilityFormValues>({
    resolver: zodResolver(capabilityFormSchema),
    defaultValues: { name, version },
  });

  useEffect(() => {
    if (query.data) {
      form.reset({
        name: query.data.name,
        version: query.data.version,
        nature: query.data.nature,
        timeout: query.data.timeout,
        connector: query.data.connector,
        concept: query.data.concept,
      });
      setInputSchemaValue(query.data.input_schema);

      setInputSchemaValid(getJsonTextareaMinifiedValue(query.data.input_schema) !== null);
      setInputSchemaBaseline(query.data.input_schema);
      setOutputSchemaValue(query.data.output_schema);
      setOutputSchemaValid(getJsonTextareaMinifiedValue(query.data.output_schema) !== null);
      setOutputSchemaBaseline(query.data.output_schema);
    }
  }, [query.data]);

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
    onSuccess: (_data, values) => {

      form.reset(values);
      setInputSchemaBaseline(inputSchemaValue);
      setOutputSchemaBaseline(outputSchemaValue);

      void queryClient.invalidateQueries({ queryKey: ["capabilities"] });
      void queryClient.invalidateQueries({ queryKey: ["capability", name, version] });
    },
  });

  const isLoadingConcepts = conceptOptions.isLoading;
  const isConceptsError = conceptOptions.isError;

  const handleInputSchemaChange = useCallback((value: string, isValid: boolean): void => {
    setInputSchemaValue(value);
    setInputSchemaValid(isValid);
  }, []);
  const handleOutputSchemaChange = useCallback((value: string, isValid: boolean): void => {
    setOutputSchemaValue(value);
    setOutputSchemaValid(isValid);
  }, []);

  if (query.isError || isConceptsError) {
    return {
      phase: "load-error",
      retryLoad: () => {
        void query.refetch();
        conceptOptions.refetch();
      },
    };
  }
  if (query.isLoading || isLoadingConcepts || !query.data) {
    return { phase: "loading" };
  }

  const isDirty =
    form.formState.isDirty ||
    getJsonTextareaMinifiedValue(inputSchemaValue) !== getJsonTextareaMinifiedValue(inputSchemaBaseline) ||
    getJsonTextareaMinifiedValue(outputSchemaValue) !== getJsonTextareaMinifiedValue(outputSchemaBaseline);

  const submit = form.handleSubmit((values) => {
    if (!inputSchemaValid || !outputSchemaValid) {
      return;
    }
    mutation.mutate(values);
  });

  const onSubmit = (event?: BaseSyntheticEvent): void => {
    if (isSubmittingRef.current) {
      event?.preventDefault();
      return;
    }
    isSubmittingRef.current = true;
    void submit(event).finally(() => {
      isSubmittingRef.current = false;
    });
  };

  return {
    phase: "ready",
    form,
    conceptOptions: conceptOptions.concepts,
    inputSchema: {
      value: inputSchemaValue,
      isValid: inputSchemaValid,
      onChange: handleInputSchemaChange,
    },
    outputSchema: {
      value: outputSchemaValue,
      isValid: outputSchemaValid,
      onChange: handleOutputSchemaChange,
    },
    isDirty,
    isSubmitting: mutation.isPending,
    isSubmitSuccessful: mutation.isSuccess,
    onSubmit,
  };
}
