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
 */

export type ConnectorTestPanelProps = {
  readonly connector: string;
};

export function ConnectorTestPanel({ connector }: ConnectorTestPanelProps): JSX.Element {
  const state = useTestConnectorPanel(connector);

  return (
    <section>
      <h3>Test</h3>
      <ConnectorTestPanelFields state={state} />
      <ConnectorTestPanelResult
        isTesting={state.isTesting}
        testError={state.testError}
        result={state.result}
      />
    </section>
  );
}
