import { createElement, Fragment } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseSimulationEvidenceItem } from "./case-simulation-evidence-item";
import type { SimulationEvidenceItem } from "./case-simulation-detail-types";

function testItem(overrides: Partial<SimulationEvidenceItem> = {}): SimulationEvidenceItem {
  return {
    concept: "Balance",
    result: "ok",
    elapsedMs: 120,
    observation: JSON.stringify({ balance: 42 }),
    inputs: "{}",
    observedAt: "2026-01-01T00:00:00.000Z",
    ttl: 3600,
    capabilityName: "translate-text",
    capabilityVersion: "1.0.0",
    connector: "deepl-connector",
    capabilityPayloadNotes: "",
    fields: [],
    conceptDescription: "",
    ...overrides,
  };
}

describe("CaseSimulationEvidenceItem -- a non-ok item claims no observation (criterion 2 of task/evidence-detail/case-evidence-display; UNDERDETERMINED entry on result_detail)", () => {
  it("shows the item's own result and result_detail, and renders no Observation block, for a timeout item", () => {
    render(
      createElement(CaseSimulationEvidenceItem, {
        item: testItem({
          concept: "Balance",
          result: "timeout",
          resultDetail: "Connector timed out after 5s.",
        }),
      }),
    );

    expect(screen.getByText("timeout")).toBeTruthy();
    expect(screen.getByText("Connector timed out after 5s.")).toBeTruthy();
    expect(screen.queryByText("Observation")).toBeNull();
  });

  it("still renders the Observation block, pretty-printed, for an ok item", () => {
    render(
      createElement(CaseSimulationEvidenceItem, {
        item: testItem({ concept: "Balance", result: "ok" }),
      }),
    );

    expect(screen.getByText("Observation")).toBeTruthy();
  });
});

describe("CaseSimulationEvidenceItem -- observed_at is shown as the raw UTC instant the item carries (criterion 3; rules/investigation/an-evidence-items-observed-at-is-a-utc-instant; UNDERDETERMINED entry on local-zone rendering)", () => {
  it("renders the item's own observed_at string verbatim, suffixed UTC, with no local-zone or Date-object reformatting", () => {
    render(
      createElement(CaseSimulationEvidenceItem, {
        item: testItem({ observedAt: "2026-03-15T08:45:12.345Z" }),
      }),
    );

    expect(screen.getByText("2026-03-15T08:45:12.345Z UTC")).toBeTruthy();
  });
});

describe("CaseSimulationEvidenceItem -- ttl is a bare count of seconds read off the item (criterion 3; rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation)", () => {
  it("renders the item's own ttl number, suffixed with seconds, with no recomputation or unit conversion", () => {
    render(createElement(CaseSimulationEvidenceItem, { item: testItem({ ttl: 7421 }) }));

    expect(screen.getByText("ttl 7421s")).toBeTruthy();
  });
});

describe("CaseSimulationEvidenceItem -- inputs are shown with a resolved credential masked (criterion 3; rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked)", () => {
  it("masks every resolved credential value with the fixed text ***REDACTED*** whichever credential and however long, leaves an item with no credential value shown whole, and shows an item's recorded empty inputs as empty", () => {
    const withCredentials = testItem({
      concept: "billing",
      inputs:
        '{"authorization":"Bearer ${credential:api-key}","retry":"${credential:a-very-long-connector-secret-name}"}',
    });
    const withoutCredential = testItem({ concept: "identity", inputs: '{"account":"12345"}' });
    const withEmptyInputs = testItem({ concept: "history", inputs: "{}" });

    render(
      createElement(
        Fragment,
        null,
        createElement(CaseSimulationEvidenceItem, { key: "billing", item: withCredentials }),
        createElement(CaseSimulationEvidenceItem, { key: "identity", item: withoutCredential }),
        createElement(CaseSimulationEvidenceItem, { key: "history", item: withEmptyInputs }),
      ),
    );

    expect(
      screen.getByText(
        '{\n  "authorization": "Bearer ***REDACTED***",\n  "retry": "***REDACTED***"\n}',
        { normalizer: (text) => text },
      ),
    ).toBeTruthy();
    expect(
      screen.getByText('{\n  "account": "12345"\n}', { normalizer: (text) => text }),
    ).toBeTruthy();
    expect(screen.getByText("{}", { normalizer: (text) => text })).toBeTruthy();
  });
});
