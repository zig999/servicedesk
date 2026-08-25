/**
 * Loads one capability by its own identity -- name and version together
 * (domain/integration/capability, "identified by name and version") -- and
 * tracks dirty/save state for the routed capability detail/edit screen
 * (task/connector-capability-detail-editing/capability-detail-hook; that
 * screen itself is a later, separate task; this file only exposes the data
 * layer it will consume).
 *
 * Mirrors use-connector-configuration-detail.ts's own routed-hook convention
 * exactly (this task's own instruction to mirror it): a loading | load-error
 * | ready phase union, a useQuery keyed by identity issuing its own GET
 * independent of use-capabilities.ts's own list query, a useEffect re-seeding
 * state on load, an isSubmittingRef guard against double-submit, and
 * re-baselining both the form and every JSON field on a successful save
 * rather than trusting the response body's own wire shape for it.
 *
 * The `form`/`inputSchema`/`outputSchema` field shapes mirror
 * use-capability-form.ts's own dialog convention exactly: name, version,
 * nature, timeout, connector and concept through react-hook-form
 * (capabilityFormSchema), input_schema and output_schema each tracked as
 * plain component state paired with the validity flag JsonTextareaField's
 * own onChange reports in the same call -- JsonSchemaFieldState itself is
 * reused from use-capability-form.ts (a type import only; that file's own
 * runtime code is untouched, per this task's own restriction) rather than a
 * second, hand-copied shape.
 *
 * Unlike that dialog, this hook never offers a create mode -- it always
 * loads an existing record by identity, the same reasoning
 * use-connector-configuration-detail.ts's own header comment gives for why
 * its own identity field is always disabled at the call site. This hook
 * deliberately exposes no isEditingIdentity flag of its own for that,
 * mirroring that same sibling exactly: whether name/version render disabled
 * is the later route task's own call-site decision (capability-form-fields.tsx
 * itself already takes that flag as a prop use-capability-form.ts's dialog
 * supplies conditionally; this hook's own caller supplies it as the fixed
 * literal `true` instead), not a fact this data layer needs to hold.
 *
 * conceptOptions is this task's own inference, disclosed here: no criterion
 * of this task names it, but `concept` is a vocabulary-backed single-select
 * the same way use-capability-form.ts's own "ready" phase already exposes
 * conceptOptions for capability-form-fields.tsx to render it, and this
 * task's own "What it is" names this hook as "the data layer the new
 * capability route depends on". This app's own established convention for a
 * routed detail screen (this task's own inventory: "delegates to a hook
 * returning a loading/load-error/ready phase union", and
 * use-edit-draft-version-form.ts's own bundling of outcomeOptions,
 * actionOptions, recipientOptions and conceptOptions behind its one hook) is
 * that every read a ready-phase render needs comes from that one hook, never
 * a second fetch the screen adds on its own -- so the vocabulary read this
 * task's own read-first list points at (use-capability-form.ts's own
 * useConceptOptions call) belongs here rather than being left for the later
 * route task to invent a second time. Read alongside the identity GET below
 * through the same loading/load-error gate, mirroring
 * use-edit-draft-version-form.ts's own multiple-vocabulary gating
 * (isLoadingGlossary/isGlossaryError).
 *
 * isDirty is deliberately not react-hook-form's own formState.isDirty alone:
 * input_schema and output_schema both live outside react-hook-form (the
 * same reasoning use-capability-form.ts already gives), so each needs its
 * own comparison against the baseline this hook re-seeds on every load and
 * every successful save (STA-03 -- computed inline on every render, never
 * mirrored into its own state kept in sync by an effect). That comparison
 * reads both sides through getJsonTextareaMinifiedValue rather than the two
 * raw strings directly, for the exact reason
 * use-connector-configuration-detail.ts's own header comment states in full:
 * json-textarea-pretty-print-on-load makes JsonTextareaField pretty-print a
 * syntactically valid loaded value on mount through its own onChange, a tick
 * after the load effect below has already set the baseline to the server's
 * raw (frequently minified) text -- a raw-string comparison would read as
 * dirty immediately after every load, with no edit having happened.
 * Minifying both sides before comparing reports a difference only where the
 * JSON content itself changed, never where only its formatting did.
 *
 * What happens when a save is refused (the four register-capability
 * refusals use-capability-form.ts's own SAVE_FAILURE_MESSAGE_BY_KIND names)
 * is deliberately not handled here beyond letting the mutation settle -- the
 * same reasoning use-connector-configuration-detail.ts's own header comment
 * gives for its own save path: this task's own criteria name no failure
 * wording, and showing the registry's refusal to the operator is the later
 * capability detail route task's own concern.
 */

import { useEffect, useRef, useState, type BaseSyntheticEvent } from "react";
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
      readonly onSubmit: (event?: BaseSyntheticEvent) => void;
    };

/**
 * `name` and `version` together are the record's own identity
 * (domain/integration/capability) -- read by the caller from the route's
 * own path params. This hook issues its own GET for that identity
 * (criterion 1) rather than expecting an already-loaded record, so a direct
 * navigation or a page refresh loads correctly with no list screen involved.
 */
export function useCapabilityDetail(name: string, version: string): CapabilityDetailState {
  const queryClient = useQueryClient();

  // Guards a second Save click arriving before react-hook-form's own
  // validation for the first one has resolved -- same synchronous
  // leading-edge guard use-connector-configuration-detail.ts's own header
  // comment documents in full.
  const isSubmittingRef = useRef(false);

  const [inputSchemaValue, setInputSchemaValue] = useState("");
  const [inputSchemaValid, setInputSchemaValid] = useState(true);
  const [outputSchemaValue, setOutputSchemaValue] = useState("");
  const [outputSchemaValid, setOutputSchemaValid] = useState(true);
  // The most recently loaded-or-saved schema text (criteria 3-5) -- re-seeded
  // by the load effect below and by a successful save's own onSuccess, never
  // by anything else.
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

  // Re-seeds the form and both schema baselines once the record loads
  // (criterion 1) -- `form` is react-hook-form's own stable object across
  // renders, so it is deliberately left out of this effect's own dependency
  // array, mirroring use-connector-configuration-detail.ts's own reasoning:
  // only a freshly loaded record should re-seed these values.
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
      setInputSchemaValid(true);
      setInputSchemaBaseline(query.data.input_schema);
      setOutputSchemaValue(query.data.output_schema);
      setOutputSchemaValid(true);
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
      // criterion 5: re-baselines to what was just submitted, not whatever
      // the response body happens to carry, so this never depends on
      // register-capability's own response wire shape.
      form.reset(values);
      setInputSchemaBaseline(inputSchemaValue);
      setOutputSchemaBaseline(outputSchemaValue);
      // criterion 6: both the list query and this hook's own single-record
      // query are invalidated, so neither screen is left reading stale data.
      void queryClient.invalidateQueries({ queryKey: ["capabilities"] });
      void queryClient.invalidateQueries({ queryKey: ["capability", name, version] });
    },
  });

  const isLoadingConcepts = conceptOptions.isLoading;
  const isConceptsError = conceptOptions.isError;

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

  // criteria 3-4: differs from the baseline once minified, so pretty-printing
  // a loaded value (json-textarea-pretty-print-on-load) or clicking
  // Beautify never reads as dirty on its own -- see this file's own header
  // comment.
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
    isDirty,
    isSubmitting: mutation.isPending,
    onSubmit,
  };
}
