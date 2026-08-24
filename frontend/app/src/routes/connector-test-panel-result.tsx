import type { JSX } from "react";
import type { TestConnectorResult } from "../hooks/use-test-connector-panel";

/**
 * The raw request sent and raw outcome received by the one test-connector
 * call issued (task/connector-configuration-authoring/test-connector-debug-panel,
 * criteria 4-6): every value is rendered as the transport actually carried
 * it -- JSON.stringify(value, null, 2) inside <pre>, never a parsed or
 * summarized rendering -- including for a timeout or a raw error, each
 * shown as its own distinct outcome rather than folded into one message
 * (criterion 6, testConnectorOutcomeSchema's own discriminated union).
 *
 * Nothing here is written to any cache, store or persisted resource
 * (criterion 7): `result` is read straight from useTestConnectorPanel's own
 * in-memory mutation state and rendered, nothing more.
 */

export type ConnectorTestPanelResultProps = {
  readonly isTesting: boolean;
  readonly testError: string | null;
  readonly result: TestConnectorResult | null;
};

export function ConnectorTestPanelResult({
  isTesting,
  testError,
  result,
}: ConnectorTestPanelResultProps): JSX.Element | null {
  if (isTesting) {
    return <p>Sending test call…</p>;
  }

  if (testError !== null) {
    return <p role="alert">{testError}</p>;
  }

  if (result === null) {
    return null;
  }

  return (
    <div>
      <section>
        <h4>Request sent</h4>
        <p>Method: {result.request.method}</p>
        <p>Address: {result.request.address}</p>
        <p>Headers</p>
        <pre>{JSON.stringify(result.request.headers, null, 2)}</pre>
        <p>Body</p>
        <pre>{JSON.stringify(result.request.body ?? null, null, 2)}</pre>
      </section>

      <section>
        <h4>Response received</h4>
        {result.response.kind === "response" && (
          <>
            <p>Status: {result.response.status}</p>
            <p>Elapsed: {result.response.elapsedMs}ms</p>
            <p>Headers</p>
            <pre>{JSON.stringify(result.response.headers, null, 2)}</pre>
            <p>Body</p>
            <pre>{JSON.stringify(result.response.body ?? null, null, 2)}</pre>
          </>
        )}
        {result.response.kind === "timed-out" && (
          <p role="alert">Timed out after {result.response.elapsedMs}ms</p>
        )}
        {result.response.kind === "error" && (
          <>
            <p role="alert">Elapsed: {result.response.elapsedMs}ms</p>
            <pre>{result.response.message}</pre>
          </>
        )}
      </section>
    </div>
  );
}
