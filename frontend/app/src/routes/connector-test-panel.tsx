import type { JSX } from "react";
import { useTestConnectorPanel } from "../hooks/use-test-connector-panel";
import { ConnectorTestPanelFields } from "./connector-test-panel-fields";
import { ConnectorTestPanelResult } from "./connector-test-panel-result";

export type ConnectorTestPanelProps = {
  readonly connector: string;
  readonly configurationText: string;
};

export function ConnectorTestPanel({
  connector,
  configurationText,
}: ConnectorTestPanelProps): JSX.Element {
  const state = useTestConnectorPanel(connector, configurationText);

  return (
    <section className="flex flex-col gap-4 pt-4 border-t border-border">
      <h3 className="text-lg font-semibold text-foreground">Test</h3>
      <ConnectorTestPanelFields state={state} />
      <ConnectorTestPanelResult testOutcome={state.testOutcome} />
    </section>
  );
}
