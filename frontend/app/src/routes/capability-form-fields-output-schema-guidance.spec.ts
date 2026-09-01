import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  baseHandlers as createScreenBaseHandlers,
  createFetchStub as createCreateScreenFetchStub,
  mountCapabilityCreateScreen,
} from "./capability-create-screen.test-support";
import { baseHandlers, createFetchStub, mountCapabilityDetailScreen } from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityFormFields — the routed create screen shows the output_schema field-semantics guidance (criterion 1)", () => {
  it("renders guidance beside the Output schema editor naming type and description as what the platform reads", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance).toBeTruthy();
    expect(guidance?.textContent).toMatch(/nenhum outro conteúdo deste schema é lido ou validado/i);
  });
});

describe("CapabilityFormFields — the guidance states a description says meaning, never a decision (criterion 3, disclosed inference)", () => {
  it("contrasts a meaning example against a decision example in the same paragraph", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent).toContain("2 = suspenso por inadimplência");
    expect(guidance?.textContent).toContain("quando 2, confirme a hipótese");
  });
});

describe("CapabilityFormFields — the routed detail screen shows the same guidance at its output_schema editor (criterion 2)", () => {
  it("renders the same guidance text beside the routed screen's own Output schema editor", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Output schema");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance).toBeTruthy();
    expect(guidance?.textContent).toMatch(/nenhum outro conteúdo deste schema é lido ou validado/i);
  });
});

function findGuidanceParagraph(container: HTMLElement): HTMLElement | null {
  return (
    Array.from(container.querySelectorAll("p")).find((p) =>
      /a plataforma lê seu próprio/i.test(p.textContent ?? ""),
    ) ?? null
  );
}
