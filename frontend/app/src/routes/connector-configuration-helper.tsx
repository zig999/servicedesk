import type { JSX } from "react";
import { useConnectorConfigurationHelper } from "../hooks/use-connector-configuration-helper";
import { ConnectorConfigurationHelperFields } from "./connector-configuration-helper-fields";

export type ConnectorConfigurationHelperProps = {
  readonly connector: string;
};

export function ConnectorConfigurationHelper({
  connector,
}: ConnectorConfigurationHelperProps): JSX.Element {
  const state = useConnectorConfigurationHelper(connector);

  return (
    <div className="flex flex-col gap-4 pt-4 border-t border-border">
      <h3 className="text-lg font-semibold text-foreground">Configuration Helper</h3>
      <ConnectorConfigurationHelperFields state={state} />
    </div>
  );
}
