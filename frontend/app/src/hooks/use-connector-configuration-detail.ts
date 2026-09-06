import { useCallback, useEffect, useRef, useState, type BaseSyntheticEvent } from "react";
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

function isValidConfigurationObject(text: string): boolean {
  const minified = getJsonTextareaMinifiedValue(text);
  if (minified === null) {
    return false;
  }
  const parsed: unknown = JSON.parse(minified);
  return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
}

export type ConnectorConfigurationDetailState =
  | { readonly phase: "loading" }
  | { readonly phase: "load-error"; readonly retryLoad: () => void }
  | {
      readonly phase: "ready";
      readonly form: UseFormReturn<ConnectorConfigurationFormValues>;
      readonly configuration: ConfigurationFieldState;
      readonly isDirty: boolean;
      readonly isSubmitting: boolean;

      readonly isSubmitSuccessful: boolean;
      readonly onSubmit: (event?: BaseSyntheticEvent) => void;
    };

export function useConnectorConfigurationDetail(
  connector: string,
): ConnectorConfigurationDetailState {
  const queryClient = useQueryClient();

  const isSubmittingRef = useRef(false);

  const [configurationValue, setConfigurationValue] = useState("");
  const [configurationValid, setConfigurationValid] = useState(true);

  const [configurationBaseline, setConfigurationBaseline] = useState("");

  const query = useQuery({
    queryKey: ["connector-configuration", connector],
    queryFn: () =>
      apiFetch<ConnectorConfiguration>(`/v1/connectors/${encodeURIComponent(connector)}`),
  });

  const [syncedConfigurationData, setSyncedConfigurationData] = useState(query.data);
  if (query.data !== syncedConfigurationData) {
    setSyncedConfigurationData(query.data);
    if (query.data) {
      setConfigurationValid(isValidConfigurationObject(query.data.configuration));
    }
  }

  const form = useForm<ConnectorConfigurationFormValues>({
    resolver: zodResolver(connectorConfigurationFormSchema),
    defaultValues: { connector },
  });

  useEffect(() => {
    if (query.data) {
      form.reset({ connector: query.data.connector });
      setConfigurationValue(query.data.configuration);
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

      form.reset({ connector });
      setConfigurationBaseline(configurationValue);

      void queryClient.invalidateQueries({ queryKey: ["connector-configurations"] });
      void queryClient.invalidateQueries({ queryKey: ["connector-configuration", connector] });
    },
  });

  const handleConfigurationChange = useCallback((value: string): void => {
    setConfigurationValue(value);
    setConfigurationValid(isValidConfigurationObject(value));
  }, []);

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

      onChange: handleConfigurationChange,
    },
    isDirty,
    isSubmitting: mutation.isPending,
    isSubmitSuccessful: mutation.isSuccess,
    onSubmit,
  };
}
