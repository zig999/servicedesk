import type { JSX } from "react";
import { useConnectorConfigurationHelper } from "../hooks/use-connector-configuration-helper";
import { ConnectorConfigurationHelperFields } from "./connector-configuration-helper-fields";
import { CONFIGURATION_HELPER_HEADING } from "../services/connector-configuration-messages";

export type ConnectorConfigurationHelperProps = {
  readonly connector: string;
  readonly onApply: (configurationText: string) => void;
};

export function ConnectorConfigurationHelper({
  connector,
  onApply,
}: ConnectorConfigurationHelperProps): JSX.Element {
  const state = useConnectorConfigurationHelper(connector);

  return (
    <div className="flex flex-col gap-4 pt-4 border-t border-border">
      <h3 className="text-lg font-semibold text-foreground">{CONFIGURATION_HELPER_HEADING}</h3>
      <ConnectorConfigurationHelperFields state={state} onApply={onApply} />
    </div>
  );
}
