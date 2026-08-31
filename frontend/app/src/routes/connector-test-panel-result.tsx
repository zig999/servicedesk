import type { JSX } from "react";
import type { TestDispatchOutcome } from "../hooks/use-test-connector-panel";

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
 * (criterion 7): `testOutcome` is read straight from useTestConnectorPanel's
 * own local dispatch-outcome state (task/connector-test-panel-dispatch-state/
 * discriminate-test-dispatch-outcome) and rendered, nothing more -- one
 * discriminated field in place of the isTesting/result/testError props this
 * component used to take, so a stale "succeeded" result and a fresh "failed"
 * error can never both be true of the one value read here.
 */

export type ConnectorTestPanelResultProps = {
  readonly testOutcome: TestDispatchOutcome;
};

export function ConnectorTestPanelResult({
  testOutcome,
}: ConnectorTestPanelResultProps): JSX.Element | null {
  if (testOutcome.kind === "pending") {
    return <p>Sending test call…</p>;
  }

  if (testOutcome.kind === "failed") {
    return <p role="alert" className="text-sm text-destructive">{testOutcome.error}</p>;
  }

  if (testOutcome.kind === "idle") {
    return null;
  }

  const { result } = testOutcome;

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
