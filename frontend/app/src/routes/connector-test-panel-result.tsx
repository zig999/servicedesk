import type { JSX } from "react";
import type { TestDispatchOutcome } from "../hooks/use-test-connector-panel";

export type ConnectorTestPanelResultProps = {
  readonly testOutcome: TestDispatchOutcome;
};

export function ConnectorTestPanelResult({
  testOutcome,
}: ConnectorTestPanelResultProps): JSX.Element | null {
  if (testOutcome.kind === "idle") {
    return null;
  }

  if (testOutcome.kind === "pending") {
    return <p>Sending test call…</p>;
  }

  if (testOutcome.kind === "failed") {
    return <p role="alert" className="text-sm text-destructive">{testOutcome.message}</p>;
  }

  const { result } = testOutcome;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <section className="flex flex-col gap-2 min-w-0">
        <h4 className="font-semibold text-foreground">Request sent</h4>
        <p>Method: {result.request.method}</p>
        <p className="break-all">Address: {result.request.address}</p>
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
