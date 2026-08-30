import type { JSX } from "react";
import { useTestConnectorPanel } from "../hooks/use-test-connector-panel";
import { ConnectorTestPanelFields } from "./connector-test-panel-fields";
import { ConnectorTestPanelResult } from "./connector-test-panel-result";

/**
 * The Connector Configuration editor's Test section
 * (task/connector-configuration-authoring/test-connector-debug-panel):
 * exercise this connector configuration's own call once, through a
 * specific, already-registered capability that names it
 * (rules/integration/a-connector-configuration-is-tested-through-a-registered-capability),
 * and show the raw request sent and raw response received
 * (contracts/integration/connector-diagnostics). Rendered by
 * connector-configuration-form-dialog.tsx only in edit mode -- that node's
 * own "A connector configuration nothing yet references is not test-run
 * against a real subject through this action" is exactly why create mode
 * (no `connector` identity to scope the picker to yet) never renders it.
 *
 * ARC-02/ARC-03: all business logic (capability filtering, subject
 * assembly, dispatch) lives in useTestConnectorPanel; this component and
 * its two siblings (connector-test-panel-fields.tsx,
 * connector-test-panel-result.tsx) only read what that hook returns.
 *
 * `configurationText` (task/connector-test-panel-placeholder-attributes/
 * route-configuration-text-to-test-panel) is forwarded straight into
 * useTestConnectorPanel unread by this component itself -- exactly the plumbing that
 * task's own criteria state, carrying the connector configuration's own current
 * Configuration text one level further down from whichever caller already holds it live.
 */

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
      <ConnectorTestPanelResult
        isTesting={state.isTesting}
        testError={state.testError}
        result={state.result}
      />
    </section>
  );
}
