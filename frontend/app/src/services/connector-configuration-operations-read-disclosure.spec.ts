import { describe, expect, it } from "vitest";
import { operationsReadDisclosureStateForOutcome } from "./connector-configuration-operations-read-disclosure";
import {
  OPERATIONS_NOT_LISTED_NOT_READABLE_MESSAGE,
  OPERATIONS_NOT_LISTED_UNRECOGNIZED_FAILURE_MESSAGE,
  openApiFetchFailureText,
} from "./connector-configuration-messages";
import type { OpenApiDocumentOperationsReadOutcome } from "../hooks/use-openapi-document-operations";

function refused(state: ReturnType<typeof operationsReadDisclosureStateForOutcome>) {
  if (state.kind !== "refused") {
    throw new Error("connector-configuration-operations-read-disclosure proof: expected a refused disclosure");
  }
  return state;
}

describe("operationsReadDisclosureStateForOutcome -- no refusal is stated before the operation answers (criterion 6, demonstrates no-operations-read-refusal-is-stated-before-the-operation-answers)", () => {
  it("maps idle to {kind: 'none'} and pending to {kind: 'pending'}, neither ever a refusal", () => {
    const idle: OpenApiDocumentOperationsReadOutcome = { kind: "idle" };
    const pending: OpenApiDocumentOperationsReadOutcome = { kind: "pending" };

    expect(operationsReadDisclosureStateForOutcome(idle)).toEqual({ kind: "none" });
    expect(operationsReadDisclosureStateForOutcome(pending)).toEqual({ kind: "pending" });
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

    expect(state.message).toContain("não foi possível obter o link");
    expect(state.message).toContain(openApiFetchFailureText({ kind: "network-failure" }));
  });

  it("names a timeout as the reason the link could not be fetched", () => {
    const state = refused(
      operationsReadDisclosureStateForOutcome({
        kind: "openapi-document-not-fetched",
        failure: { kind: "timeout" },
      }),
    );

    expect(state.message).toContain("não foi possível obter o link");
    expect(state.message).toContain(openApiFetchFailureText({ kind: "timeout" }));
  });

  it("names status-outside-2xx together with the answered status", () => {
    const state = refused(
      operationsReadDisclosureStateForOutcome({
        kind: "openapi-document-not-fetched",
        failure: { kind: "status-outside-2xx", status: 503 },
      }),
    );

    expect(state.message).toContain("não foi possível obter o link");
    expect(state.message).toContain("503");
  });
});

describe("operationsReadDisclosureStateForOutcome -- an unreadable document is stated distinctly from an unfetchable link (criteria 3, 4)", () => {
  it("states the fetched document could not be read as an OpenAPI 3.x document", () => {
    const state = refused(operationsReadDisclosureStateForOutcome({ kind: "openapi-document-not-readable" }));

    expect(state.message).toContain(OPERATIONS_NOT_LISTED_NOT_READABLE_MESSAGE);
    expect(state.message).not.toContain("não foi possível obter o link");
  });
});

describe("operationsReadDisclosureStateForOutcome -- an unrecognised refusal is stated as neither named condition (criterion 5)", () => {
  it("states a reason this helper does not recognise, naming neither the fetch nor the readability wording", () => {
    const state = refused(operationsReadDisclosureStateForOutcome({ kind: "unrecognized-failure" }));

    expect(state.message).toBe(OPERATIONS_NOT_LISTED_UNRECOGNIZED_FAILURE_MESSAGE);
    expect(state.message).not.toContain("não foi possível obter o link");
    expect(state.message).not.toContain(OPERATIONS_NOT_LISTED_NOT_READABLE_MESSAGE);
  });
});

describe("operationsReadDisclosureStateForOutcome -- an outstanding read and a document declaring no operation are read at the projection layer (drafted-answer-disclosure/operations-read-states criteria 1, 2)", () => {
  it("maps the pending outcome to the pending disclosure state", () => {
    expect(operationsReadDisclosureStateForOutcome({ kind: "pending" })).toEqual({ kind: "pending" });
  });

  it("maps an operations outcome carrying zero operations to the empty disclosure state", () => {
    expect(
      operationsReadDisclosureStateForOutcome({ kind: "operations", operations: [] }),
    ).toEqual({ kind: "empty" });
  });
});

describe("operationsReadDisclosureStateForOutcome -- the boundaries the two new states do not cross stay at none (regression)", () => {
  it("maps an operations outcome carrying one operation to the none disclosure state, not empty", () => {
    expect(
      operationsReadDisclosureStateForOutcome({
        kind: "operations",
        operations: [{ path: "/widgets", method: "get" }],
      }),
    ).toEqual({ kind: "none" });
  });

  it("maps the idle outcome to the none disclosure state, not pending", () => {
    expect(operationsReadDisclosureStateForOutcome({ kind: "idle" })).toEqual({ kind: "none" });
  });
});
