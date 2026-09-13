import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConnectorConfigurationHelperFields } from "./connector-configuration-helper-fields";
import type { ConnectorConfigurationHelperState } from "../hooks/use-connector-configuration-helper";
import type {
  ConnectorConfigurationDraft,
  DraftConnectorConfigurationRequestOutcome,
} from "../hooks/use-draft-connector-configuration-from-openapi";

function normalized(element: HTMLElement): string {
  return (element.textContent ?? "").replace(/\s+/g, " ").trim();
}

function baseState(outcome: DraftConnectorConfigurationRequestOutcome): ConnectorConfigurationHelperState {
  return {
    link: "",
    onLinkChange: () => {},
    operations: [],
    operationsOutcome: { kind: "idle" },
    onChooseOperation: () => {},
    path: "",
    onPathChange: () => {},
    method: "",
    onMethodChange: () => {},
    onRequestDraft: () => {},
    outcome,
  };
}

function renderHelperFields(outcome: DraftConnectorConfigurationRequestOutcome) {
  return render(
    createElement(ConnectorConfigurationHelperFields, { state: baseState(outcome), onApply: () => {} }),
  );
}

const BASE_DRAFT: ConnectorConfigurationDraft = {
  connector: "deepl-connector",
  configuration: "{}",
  unresolved: [],
  generated_credentials: [],
  status_readings: [],
  response_fields: [],
  reading_notes: [],
};

describe("ConnectorConfigurationHelperFields -- every response field the answer carries is stated with its name, its path and its status, and, only where carried, its declared type, its declared required listing and its envelope (criteria 1, 2, 3, 4; rule's response-fields clause)", () => {
  it("renders exactly the given response fields, each by its own name, path and status, and the optional attributes only where each is carried", () => {
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "drafted",
      draft: {
        ...BASE_DRAFT,
        response_fields: [
          { name: "email", path: "data.email", status: "200" },
          {
            name: "role",
            path: "data.roles[0].name",
            status: "200",
            declared_type: "string",
            declared_required: true,
            envelope: "data",
          },
        ],
      },
    };

    renderHelperFields(outcome);

    const items = screen.getAllByRole("listitem").map(normalized);
    expect(items).toEqual([
      "email — caminho: data.email, status: 200",
      "role — caminho: data.roles[0].name, status: 200 (tipo declarado: string) (obrigatório declarado: sim) (envelope: data)",
    ]);
  });
});

describe("ConnectorConfigurationHelperFields -- a response field's declared_required: false is stated as a carried value, not omitted like an absent one (criterion 4)", () => {
  it("renders 'declared required: no' for a field whose declared_required is false, with no declared-type or envelope parenthetical it did not carry", () => {
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "drafted",
      draft: {
        ...BASE_DRAFT,
        response_fields: [{ name: "active", path: "data.active", status: "200", declared_required: false }],
      },
    };

    renderHelperFields(outcome);

    expect(normalized(screen.getByRole("listitem"))).toBe(
      "active — caminho: data.active, status: 200 (obrigatório declarado: não)",
    );
  });
});

describe("ConnectorConfigurationHelperFields -- no response field the answer did not carry is stated when the draft carries none (criterion 5)", () => {
  it("renders no Response fields section", () => {
    renderHelperFields({ kind: "drafted", draft: BASE_DRAFT });

    expect(screen.queryByText("Campos de resposta")).toBeNull();
  });
});
