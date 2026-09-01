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

function isValidConfigurationObject(text: string): boolean {
  const minified = getJsonTextareaMinifiedValue(text);
  if (minified === null) {
    return false;
  }
  const parsed: unknown = JSON.parse(minified);
  return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
}

export type ConfigurationFieldState = {
  readonly value: string;
  readonly isValid: boolean;
  readonly onChange: (value: string, isValid: boolean) => void;
};

export type ConnectorConfigurationFormState = {
  readonly form: UseFormReturn<ConnectorConfigurationFormValues>;
  readonly configuration: ConfigurationFieldState;

  readonly isEditingIdentity: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: (event?: BaseSyntheticEvent) => void;
};

const GENERIC_SAVE_FAILURE_MESSAGE =
  "Something went wrong while saving this connector configuration. Try again.";

const SAVE_FAILURE_MESSAGE_BY_KIND: Partial<Record<UiErrorStateKind, string>> = {
  "connector-configuration-not-well-formed":
    "This configuration is not syntactically valid JSON.",
};

function saveFailureMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const state = uiStateForApiError(error);
    return SAVE_FAILURE_MESSAGE_BY_KIND[state.kind] ?? GENERIC_SAVE_FAILURE_MESSAGE;
  }
  return GENERIC_SAVE_FAILURE_MESSAGE;
}

export function useConnectorConfigurationForm(
  existing: ConnectorConfiguration | null,
  onSaved: () => void,
): ConnectorConfigurationFormState {
  const queryClient = useQueryClient();

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

      void queryClient.invalidateQueries({ queryKey: ["connector-configurations"] });
      onSaved();
    },
    onError: (error) => {

      toast.error(saveFailureMessage(error));
    },
  });

  const submit = form.handleSubmit((values) => {

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
