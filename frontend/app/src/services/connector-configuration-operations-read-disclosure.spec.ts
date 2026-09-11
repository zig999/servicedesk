import { describe, expect, it } from "vitest";
import { operationsReadDisclosureStateForOutcome } from "./connector-configuration-operations-read-disclosure";
import type { OpenApiDocumentOperationsReadOutcome } from "../hooks/use-openapi-document-operations";

function refused(state: ReturnType<typeof operationsReadDisclosureStateForOutcome>) {
  if (state.kind !== "refused") {
    throw new Error("connector-configuration-operations-read-disclosure proof: expected a refused disclosure");
  }
  return state;
}

describe("operationsReadDisclosureStateForOutcome -- no refusal is stated before the operation answers (criterion 6, demonstrates no-operations-read-refusal-is-stated-before-the-operation-answers)", () => {
  it("maps both idle and pending to exactly {kind: 'none'}", () => {
    const idle: OpenApiDocumentOperationsReadOutcome = { kind: "idle" };
    const pending: OpenApiDocumentOperationsReadOutcome = { kind: "pending" };

    expect(operationsReadDisclosureStateForOutcome(idle)).toEqual({ kind: "none" });
    expect(operationsReadDisclosureStateForOutcome(pending)).toEqual({ kind: "none" });
  });
});

describe("operationsReadDisclosureStateForOutcome -- an unfetchable link names the fetch failure kind (criteria 1, 2)", () => {
  it("names a network failure as the reason the link could not be fetched", () => {
    const state = refused(
      operationsReadDisclosureStateForOutcome({
        kind: "openapi-document-not-fetched",
        failure: { kind: "network-failure" },
      }),
    );

    expect(state.message).toContain("could not be fetched");
    expect(state.message).toContain("network failure");
  });

  it("names a timeout as the reason the link could not be fetched", () => {
    const state = refused(
      operationsReadDisclosureStateForOutcome({
        kind: "openapi-document-not-fetched",
        failure: { kind: "timeout" },
      }),
    );

    expect(state.message).toContain("could not be fetched");
    expect(state.message).toContain("timeout");
  });

  it("names status-outside-2xx together with the answered status", () => {
    const state = refused(
      operationsReadDisclosureStateForOutcome({
        kind: "openapi-document-not-fetched",
        failure: { kind: "status-outside-2xx", status: 503 },
      }),
    );

    expect(state.message).toContain("could not be fetched");
    expect(state.message).toContain("503");
  });
});

describe("operationsReadDisclosureStateForOutcome -- an unreadable document is stated distinctly from an unfetchable link (criteria 3, 4)", () => {
  it("states the fetched document could not be read as an OpenAPI 3.x document", () => {
    const state = refused(operationsReadDisclosureStateForOutcome({ kind: "openapi-document-not-readable" }));

    expect(state.message).toContain("could not be read as an OpenAPI 3.x document");
    expect(state.message).not.toContain("could not be fetched");
  });
});

describe("operationsReadDisclosureStateForOutcome -- an unrecognised refusal is stated as neither named condition (criterion 5)", () => {
  it("states a reason this helper does not recognise, naming neither the fetch nor the readability wording", () => {
    const state = refused(operationsReadDisclosureStateForOutcome({ kind: "unrecognized-failure" }));

    expect(state.message).toContain("does not recognise");
    expect(state.message).not.toContain("could not be fetched");
    expect(state.message).not.toContain("could not be read as an OpenAPI 3.x document");
  });
});
