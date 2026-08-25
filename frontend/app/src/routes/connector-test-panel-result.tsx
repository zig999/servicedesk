import type { JSX } from "react";
import type { TestConnectorResult } from "../hooks/use-test-connector-panel";

/**
 * The raw request sent and raw outcome received by the one test-connector
 * call issued (task/connector-configuration-authoring/test-connector-debug-panel,
 * criteria 4-6): every value is rendered as the transport actually carried
 * it -- JSON.stringify(value, null, 2) inside <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto">, never a parsed or
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
    return <p role="alert" className="text-sm text-destructive">{testError}</p>;
  }

  if (result === null) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <section className="flex flex-col gap-2 min-w-0">
        <h4 className="font-semibold text-foreground">Request sent</h4>
        <p>Method: {result.request.method}</p>
        <p>Address: {result.request.address}</p>
        <p className="text-sm text-muted-foreground">Headers</p>
        <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto">{JSON.stringify(result.request.headers, null, 2)}</pre>
        <p className="text-sm text-muted-foreground">Body</p>
        <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto">{JSON.stringify(result.request.body ?? null, null, 2)}</pre>
      </section>

      <section className="flex flex-col gap-2 min-w-0">
        <h4 className="font-semibold text-foreground">Response received</h4>
        {result.response.kind === "response" && (
          <>
            <p>Status: {result.response.status}</p>
            <p>Elapsed: {result.response.elapsedMs}ms</p>
            <p className="text-sm text-muted-foreground">Headers</p>
            <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto">{JSON.stringify(result.response.headers, null, 2)}</pre>
            <p className="text-sm text-muted-foreground">Body</p>
            <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto">{JSON.stringify(result.response.body ?? null, null, 2)}</pre>
          </>
        )}
        {result.response.kind === "timed-out" && (
          <p role="alert" className="text-sm text-destructive">Timed out after {result.response.elapsedMs}ms</p>
        )}
        {result.response.kind === "error" && (
          <>
            <p role="alert" className="text-sm text-destructive">Elapsed: {result.response.elapsedMs}ms</p>
            <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto">{result.response.message}</pre>
          </>
        )}
      </section>
    </div>
  );
}
