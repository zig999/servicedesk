import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseSimulationDetailEvidenceTab } from "./case-simulation-detail-evidence-tab";
import {
  testCalledJudgment,
  testEvidenceItem,
} from "./case-simulation-detail-panel.test-support";
import type { SimulationJudgmentCall } from "./case-simulation-detail-types";

const NOT_CALLED: SimulationJudgmentCall = { called: false };

describe("CaseSimulationDetailEvidenceTab -- per collected concept (criterion 3)", () => {
  it("shows the result, the capability reference and the elapsed time for a collected concept with matching evidence", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [
          testEvidenceItem({
            concept: "Balance",
            result: "ok",
            elapsedMs: 120,
            capabilityName: "translate-text",
            capabilityVersion: "1.0.0",
            connector: "deepl-connector",
          }),
        ],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getByText("ok")).toBeTruthy();
    expect(screen.getByText("translate-text 1.0.0 → deepl-connector")).toBeTruthy();
    expect(screen.getByText("120 ms")).toBeTruthy();
  });

  it("shows result_detail when the evidence item carries one", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [
          testEvidenceItem({ concept: "Balance", resultDetail: "Rate limited, retried once." }),
        ],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getByText("Rate limited, retried once.")).toBeTruthy();
  });

  it("shows no result_detail text when the evidence item carries none", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [testEvidenceItem({ concept: "Balance" })],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.queryByText("Rate limited, retried once.")).toBeNull();
  });

  it("shows the observation pretty-printed inside a collapsible 'Observation' block", () => {
    const observation = JSON.stringify({ balance: 42, currency: "USD" });
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [testEvidenceItem({ concept: "Balance", observation })],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getByText("Observation")).toBeTruthy();
    expect(
      screen.getByText(JSON.stringify(JSON.parse(observation), null, 2), {
        normalizer: (text) => text,
      }),
    ).toBeTruthy();
  });

  it("falls back to the raw observation string, verbatim, when it does not parse as JSON", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [
          testEvidenceItem({ concept: "Balance", observation: "plain text observation" }),
        ],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getByText("plain text observation", { normalizer: (text) => text })).toBeTruthy();
  });

  it("shows every collected concept with matching evidence, one entry each", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance", "AccountStatus"],
        evidence: [
          testEvidenceItem({ concept: "Balance" }),
          testEvidenceItem({
            concept: "AccountStatus",
            connector: "core-banking-connector",
          }),
        ],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Balance")).toBeTruthy();
    expect(screen.getByText("AccountStatus")).toBeTruthy();
  });

  it("omits a collected concept with no matching evidence entry, rather than rendering an error or placeholder row (inference)", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance", "MissingConcept"],
        evidence: [testEvidenceItem({ concept: "Balance" })],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.queryByText("MissingConcept")).toBeNull();
  });

  it("shows an explicit empty message when no collected concept has matching evidence", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Nowhere"],
        evidence: [],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getByText("No evidence collected for this hypothesis.")).toBeTruthy();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("shows only the evidence for concepts this hypothesis collects, never an evidence item for a concept it does not", () => {

    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [
          testEvidenceItem({ concept: "Balance" }),
          testEvidenceItem({ concept: "AccountStatus" }),
        ],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Balance")).toBeTruthy();
    expect(screen.queryByText("AccountStatus")).toBeNull();
  });
});

describe("CaseSimulationDetailEvidenceTab -- the collapsible observation block is a native disclosure (inference)", () => {
  it("renders the observation inside a native <details>/<summary> element, not a bespoke wrapper", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [testEvidenceItem({ concept: "Balance" })],
        judgmentCall: NOT_CALLED,
      }),
    );

    const summary = screen.getByText("Observation");
    expect(summary.tagName).toBe("SUMMARY");
    // eslint-disable-next-line testing-library/no-node-access -- confirming the native disclosure element itself is the point of this test
    const disclosure = summary.closest("details");
    expect(disclosure).not.toBeNull();
    expect(disclosure?.tagName).toBe("DETAILS");
  });
});

describe("CaseSimulationDetailEvidenceTab -- the result's own color (inference)", () => {
  it("colors an ok result bg-success", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [testEvidenceItem({ concept: "Balance", result: "ok" })],
        judgmentCall: NOT_CALLED,
      }),
    );

    const item = screen.getByRole("listitem");
    // eslint-disable-next-line testing-library/no-node-access -- mirrors this app's own established precedent (status-table.spec.ts, case-detail-screen.spec.ts): a result's color dot is aria-hidden and decorative, so no RTL role/text/label query can reach it.
    expect(item.querySelector(".bg-success")).not.toBeNull();
  });

  it("colors a timeout result bg-warning", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [testEvidenceItem({ concept: "Balance", result: "timeout" })],
        judgmentCall: NOT_CALLED,
      }),
    );

    const item = screen.getByRole("listitem");
    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    expect(item.querySelector(".bg-warning")).not.toBeNull();
  });

  it("colors a denied result bg-destructive", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [testEvidenceItem({ concept: "Balance", result: "denied" })],
        judgmentCall: NOT_CALLED,
      }),
    );

    const item = screen.getByRole("listitem");
    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    expect(item.querySelector(".bg-destructive")).not.toBeNull();
  });

  it("colors an unavailable result bg-muted-foreground", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [testEvidenceItem({ concept: "Balance", result: "unavailable" })],
        judgmentCall: NOT_CALLED,
      }),
    );

    const item = screen.getByRole("listitem");
    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    expect(item.querySelector(".bg-muted-foreground")).not.toBeNull();
  });
});

describe("CaseSimulationDetailEvidenceTab -- the judgment summary line (criterion 6)", () => {
  it("shows the judgment's model, prompt version, token usage and elapsed time when a call happened", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: [],
        evidence: [],
        judgmentCall: testCalledJudgment({
          model: "gpt-4o",
          promptVersion: "v3",
          usage: { inputTokens: 12, outputTokens: 34 },
          elapsedMs: 567,
        }),
      }),
    );

    expect(screen.getByText("Judgment gpt-4o · prompt v3 · 12 in / 34 out · 567 ms")).toBeTruthy();
  });

  it("shows no judgment summary line when no call happened", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: [],
        evidence: [],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.queryByText(/^Judgment /)).toBeNull();
  });
});
