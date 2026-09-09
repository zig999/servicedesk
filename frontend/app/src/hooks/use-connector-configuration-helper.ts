import { useState } from "react";
import {
  useDraftConnectorConfigurationFromOpenApi,
  type DraftConnectorConfigurationRequestOutcome,
} from "./use-draft-connector-configuration-from-openapi";

export type ConnectorConfigurationHelperState = {
  readonly link: string;
  readonly onLinkChange: (value: string) => void;
  readonly path: string;
  readonly onPathChange: (value: string) => void;
  readonly method: string;
  readonly onMethodChange: (value: string) => void;
  readonly onRequestDraft: () => void;
  readonly outcome: DraftConnectorConfigurationRequestOutcome;
};

export function useConnectorConfigurationHelper(
  connector: string,
): ConnectorConfigurationHelperState {
  const { requestDraft, outcome } = useDraftConnectorConfigurationFromOpenApi(connector);

  const [link, setLink] = useState("");
  const [path, setPath] = useState("");
  const [method, setMethod] = useState("");

  return {
    link,
    onLinkChange: setLink,
    path,
    onPathChange: setPath,
    method,
    onMethodChange: setMethod,
    onRequestDraft: () => {
      requestDraft({ link, path, method });
    },
    outcome,
  };
}
