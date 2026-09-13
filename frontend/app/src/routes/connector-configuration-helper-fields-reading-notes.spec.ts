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

describe("ConnectorConfigurationHelperFields -- every reading note the answer carries is stated with its subject and a kind label that is never the raw kind token, and, only where carried, its detail beside the subject (criteria 1, 2, 3; rule's reading-notes clause)", () => {
  it("renders each note's own subject paired with a translated kind label, and the detail only for the note that carries one", () => {
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "drafted",
      draft: {
        ...BASE_DRAFT,
        reading_notes: [
          { kind: "envelope-read-through", subject: "data", detail: "single-property envelope" },
          { kind: "default-response-not-drafted", subject: "default" },
        ],
      },
    };

    renderHelperFields(outcome);

    const items = screen.getAllByRole("listitem").map(normalized);
    expect(items).toHaveLength(2);

    expect(items[0]).toContain("data");
    expect(items[0]).not.toContain("envelope-read-through");
    expect(items[0]).toContain("(detalhe: single-property envelope)");

    expect(items[1]).toContain("default");
    expect(items[1]).not.toContain("default-response-not-drafted");
    expect(items[1]).not.toContain("(detalhe:");
  });
});

describe("ConnectorConfigurationHelperFields -- no reading note the answer did not carry is stated when the draft carries none (criterion 5)", () => {
  it("renders no Reading notes section", () => {
    renderHelperFields({ kind: "drafted", draft: BASE_DRAFT });

    expect(screen.queryByText("Notas de leitura")).toBeNull();
  });
});
