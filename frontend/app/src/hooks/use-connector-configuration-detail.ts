/**
 * Loads one connector configuration by its own identity and tracks
 * dirty/save state for the routed connector-configuration detail/edit screen
 * (task/connector-capability-detail-editing/connector-configuration-detail-hook;
 * that screen itself is a later, separate task --
 * task/connector-capability-detail-editing/connector-configuration-detail-route
 * -- this file only exposes the data layer it will consume).
 *
 * Follows use-edit-draft-version-form.ts's own routed-hook convention
 * (loading | load-error | ready phase union, a useQuery keyed by identity, a
 * useEffect re-seeding state on load, an isSubmittingRef guard against
 * double-submit) rather than use-connector-configuration-form.ts's own
 * dialog convention of reading an already-fetched row from the list
 * screen's cache -- a direct navigation or a page refresh reaches this route
 * with no such cache to read from, so this hook issues its own GET,
 * independent of use-connector-configurations.ts's own list query.
 *
 * The `form`/`configuration` field shapes mirror
 * use-connector-configuration-form.ts's own exactly (a react-hook-form
 * `connector` field validated by connector-configuration-form-schema.ts,
 * `configuration` tracked as plain text plus the validity flag
 * JsonTextareaField's own onChange reports in the same call) rather than a
 * second, differently-shaped pair -- `connector` is always disabled at the
 * call site (this hook never offers a create mode; it always loads an
 * existing record by identity), the same reasoning
 * use-connector-configuration-form.ts's own header comment states for why an
 * identity field is disabled once a record exists, but it is still tracked
 * through react-hook-form so this shape can be handed straight to the
 * existing connector-configuration-form-fields.tsx markup unchanged.
 *
 * isDirty is deliberately not react-hook-form's own formState.isDirty
 * alone: `configuration` lives outside react-hook-form (the same reasoning
 * use-connector-configuration-form.ts already gives), so it needs its own
 * comparison against the baseline this hook re-seeds on every load and every
 * successful save (STA-03 -- computed inline on every render, never mirrored
 * into its own state kept in sync by an effect).
 *
 * That comparison reads both sides through getJsonTextareaMinifiedValue --
 * the same pure function already exported for deriving what a save persists
 * -- rather than comparing the two raw strings directly. This is this task's
 * own inference: task/connector-capability-detail-editing/
 * json-textarea-pretty-print-on-load (already delivered, confirmed by
 * reading json-textarea-field.tsx in full) makes JsonTextareaField
 * pretty-print a syntactically valid loaded value on mount through its own
 * onChange, which updates this hook's `configurationValue` state a tick
 * after the load effect below has already set the baseline to the server's
 * raw (frequently minified) text -- a raw-string comparison would read as
 * dirty immediately after every load, with no edit having happened.
 * Minifying both sides before comparing is exactly the canonicalization this
 * module already performs for the save path, so reusing it here reports a
 * difference only where the JSON content itself changed, never where only
 * its formatting did (matching the connector-configuration detail route
 * task's own criterion: "differs from its originally loaded values").
 *
 * What happens when a save is refused (rules/integration/
 * a-connector-configuration-holds-a-well-formed-object) is deliberately not
 * handled here beyond letting the mutation settle -- this task's own Notes
 * name that as the connector-configuration detail route task's own concern,
 * which owns showing the registry's refusal to the operator once it exists.
 */

import { useEffect, useRef, useState, type BaseSyntheticEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiFetch } from "../services/api-client";
import { getJsonTextareaMinifiedValue } from "../shared/components/json-textarea-field";
import {
  connectorConfigurationFormSchema,
  type ConnectorConfigurationFormValues,
} from "../services/connector-configuration-form-schema";
import type { ConnectorConfiguration } from "./use-connector-configurations";
import type { ConfigurationFieldState } from "./use-connector-configuration-form";

export type ConnectorConfigurationDetailState =
  | { readonly phase: "loading" }
  | { readonly phase: "load-error"; readonly retryLoad: () => void }
  | {
      readonly phase: "ready";
      readonly form: UseFormReturn<ConnectorConfigurationFormValues>;
      readonly configuration: ConfigurationFieldState;
      readonly isDirty: boolean;
      readonly isSubmitting: boolean;
      readonly onSubmit: (event?: BaseSyntheticEvent) => void;
    };

/**
 * `connector` is the record's own identity (domain/integration/
 * connector-configuration), read by the caller from the route's own path
 * param -- this hook issues its own GET for it (criterion 1) rather than
 * expecting an already-loaded record, so a direct navigation or a page
 * refresh loads correctly with no list screen involved.
 */
export function useConnectorConfigurationDetail(
  connector: string,
): ConnectorConfigurationDetailState {
  const queryClient = useQueryClient();

  // Guards a second Save click arriving before react-hook-form's own
  // validation for the first one has resolved -- same synchronous
  // leading-edge guard use-connector-configuration-form.ts's own header
  // comment documents in full.
  const isSubmittingRef = useRef(false);

  const [configurationValue, setConfigurationValue] = useState("");
  const [configurationValid, setConfigurationValid] = useState(true);
  // The most recently loaded-or-saved configuration text (criteria 3-5) --
  // re-seeded by the load effect below and by a successful save's own
  // onSuccess, never by anything else.
  const [configurationBaseline, setConfigurationBaseline] = useState("");

  const query = useQuery({
    queryKey: ["connector-configuration", connector],
    queryFn: () =>
      apiFetch<ConnectorConfiguration>(`/v1/connectors/${encodeURIComponent(connector)}`),
  });

  const form = useForm<ConnectorConfigurationFormValues>({
    resolver: zodResolver(connectorConfigurationFormSchema),
    defaultValues: { connector },
  });

  // Re-seeds the form and the configuration baseline once the record loads
  // (criterion 1) -- `form` is react-hook-form's own stable object across
  // renders, so it is deliberately left out of this effect's own dependency
  // array, mirroring use-edit-draft-version-form.ts's own reasoning: only a
  // freshly loaded record should re-seed these values.
  useEffect(() => {
    if (query.data) {
      form.reset({ connector: query.data.connector });
      setConfigurationValue(query.data.configuration);
      setConfigurationValid(true);
      setConfigurationBaseline(query.data.configuration);
    }
  }, [query.data]);

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
      // criterion 5: re-baselines to what was just saved -- the values just
      // submitted, not whatever the response body happens to carry, so this
      // never depends on register-connector's own response wire shape.
      form.reset({ connector });
      setConfigurationBaseline(configurationValue);
      // criterion 6: both the list query and this hook's own single-record
      // query are invalidated, so neither screen is left reading stale data.
      void queryClient.invalidateQueries({ queryKey: ["connector-configurations"] });
      void queryClient.invalidateQueries({ queryKey: ["connector-configuration", connector] });
    },
  });

  if (query.isError) {
    return {
      phase: "load-error",
      retryLoad: () => {
        void query.refetch();
      },
    };
  }
  if (query.isLoading || !query.data) {
    return { phase: "loading" };
  }

  // criteria 3-4: differs from the baseline once minified, so pretty-printing
  // a loaded value (json-textarea-pretty-print-on-load) or clicking
  // Beautify never reads as dirty on its own -- see this file's own header
  // comment.
  const isDirty =
    form.formState.isDirty ||
    getJsonTextareaMinifiedValue(configurationValue) !== getJsonTextareaMinifiedValue(configurationBaseline);

  const submit = form.handleSubmit((values) => {
    if (!configurationValid) {
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
    configuration: {
      value: configurationValue,
      isValid: configurationValid,
      onChange: (value, isValid) => {
        setConfigurationValue(value);
        setConfigurationValid(isValid);
      },
    },
    isDirty,
    isSubmitting: mutation.isPending,
    onSubmit,
  };
}
