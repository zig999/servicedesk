/**
 * The Connector Configuration create/edit form's own state
 * (task/connector-configuration-authoring/connector-configuration-create-edit-form):
 * connector and configuration, for the new Connector Configurations screen.
 * Mirrors use-capability-form.ts's own create(null)/edit(existing)
 * shared-hook shape exactly -- `existing` is the nullable identity: `null`
 * selects create mode, a real ConnectorConfiguration selects edit mode,
 * pre-filled from it.
 *
 * Both modes dispatch the same request, PUT /v1/connectors/{connector}
 * (contracts/integration/connector-configuration-registry's own register
 * operation) -- domain/integration/connector-configuration's own
 * responsibility states this is create-or-replace-in-place by name
 * ("Hold, by name, whatever configuration a connector currently answers to,
 * replacing it whole on every edit rather than merging into what stood
 * before"), so `connector` is disabled in edit mode
 * (`isEditingIdentity` below) rather than only pre-filled -- editing it
 * during "edit" would register a *second* connector configuration at the
 * new name while leaving the original standing at the old one, the same
 * reasoning use-capability-form.ts's own header comment states in full for
 * why name/version are disabled rather than merely pre-filled in that form.
 *
 * `configuration` is tracked as plain component state here, not as a
 * react-hook-form field validated by connector-configuration-form-schema.ts:
 * it pairs the shared JsonTextareaField's own current text with the
 * validity flag its onChange reports in the same call
 * (json-textarea-field.tsx's own header comment on why value and validity
 * are reported together), so a caller's copy of one can never fall out of
 * sync with the other. Submission is blocked while it is invalid
 * (criterion 4, "the value persisted on save is the minified JSON"
 * presupposes a value that parses at all), and the value dispatched on save
 * is always getJsonTextareaMinifiedValue(currentText) rather than the raw
 * display text -- exactly the two behaviors that module exports for.
 *
 * Needs no identity-loading query of its own: the Connector Configurations
 * screen's own list read (use-connector-configurations.ts) already holds
 * both fields this form edits, so a caller opening the edit form passes
 * that already-loaded ConnectorConfiguration straight through as `existing`
 * rather than this hook issuing a second GET for the one configuration
 * being edited -- mirroring use-capability-form.ts's own header comment on
 * the same choice.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRef, useState, type BaseSyntheticEvent } from "react";
import { apiFetch, ApiError } from "../services/api-client";
import { uiStateForApiError, type UiErrorStateKind } from "../services/error-ui-state";
import { getJsonTextareaMinifiedValue } from "../shared/components/json-textarea-field";
import {
  connectorConfigurationFormSchema,
  type ConnectorConfigurationFormValues,
} from "../services/connector-configuration-form-schema";
import type { ConnectorConfiguration } from "./use-connector-configurations";

/**
 * Whether `text` satisfies rules/integration/
 * a-connector-configuration-holds-a-well-formed-object: syntactically valid
 * JSON *and* shaped as an object, not merely parseable. Corrects this hook's
 * own `configurationValid` guard (the `configuration.onChange` handler
 * below), which previously trusted the `isValid` flag JsonTextareaField's
 * own onChange reports directly -- that flag (json-textarea-field.tsx's own
 * parseJsonText) only proves `JSON.parse` did not throw, so a syntactically
 * valid JSON array or `null` read as valid even though neither is the object
 * shape the registry requires, letting this screen's create mode dispatch a
 * register-connector request the registry always refuses with HTTP 422
 * ConnectorConfigurationNotWellFormedError
 * (task/connector-capability-create-detail-route/
 * connector-configuration-create-route's own corrective delivery, following
 * a failure-diagnostician finding against the running suite).
 *
 * Mirrors use-connector-configuration-detail.ts's own
 * isValidConfigurationObject exactly, added there by a prior corrective
 * delivery for the same rule over the sibling routed edit screen -- read
 * that file's own header comment for the full reasoning, repeated here
 * rather than imported because it is this hook's own module-private guard,
 * not a shape either file exposes to the other.
 *
 * Deliberately scoped to this one hook rather than a change to
 * getJsonTextareaMinifiedValue/parseJsonText themselves
 * (json-textarea-field.tsx): that function also drives this hook's own
 * save-payload minification and is read unchanged by use-capability-form.ts's
 * own inputSchemaValid/outputSchemaValid -- tightening it there would change
 * all of those at once, none of which this correction's own scope reaches.
 * Reads the already-parsed value off the minified string
 * getJsonTextareaMinifiedValue already computed rather than a second,
 * independent `JSON.parse` call -- that string is only produced once
 * `parseJsonText` succeeded, so parsing it back here is guaranteed to
 * succeed too.
 */
function isValidConfigurationObject(text: string): boolean {
  const minified = getJsonTextareaMinifiedValue(text);
  if (minified === null) {
    return false;
  }
  const parsed: unknown = JSON.parse(minified);
  return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
}

/** Which of the two modes a caller opened the form in, and (edit mode only) which connector configuration it edits. */
export type ConnectorConfigurationFormTarget =
  | { readonly mode: "create" }
  | { readonly mode: "edit"; readonly connectorConfiguration: ConnectorConfiguration };

/** The `configuration` field's own controlled text plus the validity JsonTextareaField's own onChange last reported for it (json-textarea-field.tsx's own JsonTextareaFieldProps shape, re-exposed here since `configuration` lives outside react-hook-form -- the same convention use-capability-form.ts's own JsonSchemaFieldState already establishes for input_schema/output_schema). */
export type ConfigurationFieldState = {
  readonly value: string;
  readonly isValid: boolean;
  readonly onChange: (value: string, isValid: boolean) => void;
};

export type ConnectorConfigurationFormState = {
  readonly form: UseFormReturn<ConnectorConfigurationFormValues>;
  readonly configuration: ConfigurationFieldState;
  /** True only in edit mode -- see this file's own header comment on why `connector` is disabled rather than merely pre-filled. */
  readonly isEditingIdentity: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: (event?: BaseSyntheticEvent) => void;
};

const GENERIC_SAVE_FAILURE_MESSAGE =
  "Something went wrong while saving this connector configuration. Try again.";

/**
 * The wording for the one domain refusal register-connector can return
 * (rules/integration/a-connector-configuration-holds-a-well-formed-object,
 * this task's own criterion set, confirmed against
 * src/src/errors/status-map.ts and error-ui-state.ts, both updated by this
 * task to name it): no criterion states exact wording, so this message is
 * this task's own inference, disclosed in its delivery record -- mirroring
 * use-capability-form.ts's own SAVE_FAILURE_MESSAGE_BY_KIND convention for
 * the same reason.
 */
const SAVE_FAILURE_MESSAGE_BY_KIND: Partial<Record<UiErrorStateKind, string>> = {
  "connector-configuration-not-well-formed":
    "This configuration is not syntactically valid JSON.",
};

/** Resolves a save failure to the message it should show the operator -- the specific wording above for the one named refusal, or the generic fallback for anything else (including a non-ApiError thrown value). */
function saveFailureMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const state = uiStateForApiError(error);
    return SAVE_FAILURE_MESSAGE_BY_KIND[state.kind] ?? GENERIC_SAVE_FAILURE_MESSAGE;
  }
  return GENERIC_SAVE_FAILURE_MESSAGE;
}

/**
 * `existing`: `null` for create mode, or the connector configuration being
 * edited (edit mode). `onSaved` runs after a successful register-connector
 * call (both modes) -- the caller uses it to close the form, matching
 * use-capability-form.ts's own convention of leaving navigation/dialog-closing
 * decisions to the screen rather than this hook.
 */
export function useConnectorConfigurationForm(
  existing: ConnectorConfiguration | null,
  onSaved: () => void,
): ConnectorConfigurationFormState {
  const queryClient = useQueryClient();

  // Guards the dispatch itself against a second Save click arriving before
  // react-hook-form's own (async, zod) validation has resolved for the
  // first one -- the same synchronous leading-edge guard
  // use-capability-form.ts's own header comment documents in full.
  const isDispatchingRef = useRef(false);

  const [configurationValue, setConfigurationValue] = useState(existing?.configuration ?? "");
  const [configurationValid, setConfigurationValid] = useState(existing !== null);

  const form = useForm<ConnectorConfigurationFormValues>({
    resolver: zodResolver(connectorConfigurationFormSchema),
    defaultValues: {
      connector: existing?.connector ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ConnectorConfigurationFormValues) =>
      apiFetch<ConnectorConfiguration>(
        `/v1/connectors/${encodeURIComponent(values.connector)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            configuration: getJsonTextareaMinifiedValue(configurationValue),
          }),
        },
      ),
    onSuccess: () => {
      // criterion 5: the Connector Configurations screen reflects the
      // current configuration afterward -- invalidating the exact query key
      // use-connector-configurations.ts's own useConnectorConfigurations
      // reads through is what makes that screen refetch.
      void queryClient.invalidateQueries({ queryKey: ["connector-configurations"] });
      onSaved();
    },
    onError: (error) => {
      // The registry's well-formedness refusal reaches the operator as a
      // distinguishable, specific message rather than a generic or absent
      // one (rules/integration/a-connector-configuration-holds-a-well-formed-object).
      toast.error(saveFailureMessage(error));
    },
  });

  const submit = form.handleSubmit((values) => {
    // criterion 4: submission is blocked while the configuration field is
    // invalid, ahead of even attempting to dispatch the request.
    if (!configurationValid) {
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
    form,
    configuration: {
      value: configurationValue,
      isValid: configurationValid,
      // `isValid` as reported by JsonTextareaField's own onChange is a
      // parse-only check (json-textarea-field.tsx's own parseJsonText); this
      // hook derives its own configurationValid from
      // isValidConfigurationObject above instead of trusting that flag
      // directly, so an edit to a syntactically valid but non-object value
      // (an array, a bare string, a number, `true`, or `null`) reads as
      // invalid the same as use-connector-configuration-detail.ts's own
      // handleConfigurationChange already does for the sibling routed edit
      // screen.
      onChange: (value) => {
        setConfigurationValue(value);
        setConfigurationValid(isValidConfigurationObject(value));
      },
    },
    isEditingIdentity: existing !== null,
    isSubmitting: mutation.isPending,
    onSubmit,
  };
}
