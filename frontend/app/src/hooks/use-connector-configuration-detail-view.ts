import { useEffect, useRef, useState } from "react";
import {
  useConnectorConfigurationDetail,
  type ConnectorConfigurationDetailState,
} from "./use-connector-configuration-detail";

export type ConnectorConfigurationDetailViewState =
  | Extract<ConnectorConfigurationDetailState, { phase: "loading" | "load-error" }>
  | (Extract<ConnectorConfigurationDetailState, { phase: "ready" }> & {

      readonly onDiscard: () => void;

      readonly justSaved: boolean;

      readonly registeredConfigurationText: string;
    });

export function useConnectorConfigurationDetailView(
  connector: string,
): ConnectorConfigurationDetailViewState {
  const detail = useConnectorConfigurationDetail(connector);
  const isReady = detail.phase === "ready";

  const [configurationBaseline, setConfigurationBaseline] = useState({
    value: "",
    isValid: true,
  });

  const wasSubmitSuccessfulRef = useRef(false);
  const [justSaved, setJustSaved] = useState(false);

  const currentIsDirty = isReady ? detail.isDirty : null;
  const currentConfigurationValue = isReady ? detail.configuration.value : null;
  const currentConfigurationValid = isReady ? detail.configuration.isValid : null;
  const currentIsSubmitSuccessful = isReady ? detail.isSubmitSuccessful : null;

  useEffect(() => {
    if (isReady && currentIsDirty === false) {
      setConfigurationBaseline({
        value: currentConfigurationValue ?? "",
        isValid: currentConfigurationValid ?? true,
      });
    }
  }, [isReady, currentIsDirty, currentConfigurationValue, currentConfigurationValid]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const succeeded = currentIsSubmitSuccessful ?? false;
    const dirty = currentIsDirty ?? false;
    if (succeeded && !wasSubmitSuccessfulRef.current) {
      setJustSaved(true);
    } else if (dirty) {
      setJustSaved(false);
    }
    wasSubmitSuccessfulRef.current = succeeded;
  }, [isReady, currentIsSubmitSuccessful, currentIsDirty]);

  if (detail.phase !== "ready") {
    return detail;
  }

  return {
    ...detail,
    onDiscard: () => {
      detail.form.reset({ connector });
      detail.configuration.onChange(configurationBaseline.value, configurationBaseline.isValid);
      setJustSaved(false);
    },
    justSaved,
    registeredConfigurationText: configurationBaseline.value,
  };
}
