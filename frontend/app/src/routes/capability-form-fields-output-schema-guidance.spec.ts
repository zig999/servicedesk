import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  baseHandlers as createScreenBaseHandlers,
  createFetchStub as createCreateScreenFetchStub,
  fillValidForm,
  mountCapabilityCreateScreen,
} from "./capability-create-screen.test-support";
import { baseHandlers, createFetchStub, mountCapabilityDetailScreen } from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function findGuidanceParagraph(container: HTMLElement): HTMLElement | null {
  return (
    Array.from(container.querySelectorAll("p")).find((p) =>
      /o que é inserido aqui é json/i.test(p.textContent ?? ""),
    ) ?? null
  );
}

describe("CapabilityFormFields — the output-schema guidance renders wherever the entry stands (criterion 1)", () => {
  it("renders the guidance paragraph beside the create screen's own Output schema editor", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    expect(findGuidanceParagraph(document.body)).toBeTruthy();
  });

  it("renders the same guidance paragraph beside the detail screen's own Output schema editor", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Output schema");

    expect(findGuidanceParagraph(document.body)).toBeTruthy();
  });
});

describe("CapabilityFormFields — the guidance states that what is entered is JSON (criterion 2)", () => {
  it("states that the entered content is JSON", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent).toMatch(/o que é inserido aqui é json\./i);
  });
});

describe("CapabilityFormFields — the guidance states the read field names are the schema's own top-level properties keys (criterion 3)", () => {
  it("states that the read field names are the keys of the schema's own top-level properties object", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent).toMatch(
      /os nomes de campo lidos a partir dele são as chaves do próprio objeto properties de nível superior deste schema/i,
    );
  });
});

describe("CapabilityFormFields — the guidance states a key's own type and description are read as its declared semantics (criterion 4)", () => {
  it("states that each such key's own type and description, where the schema states them, are read as that field's declared semantics", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent).toMatch(
      /o type e a description declarados por cada uma dessas chaves, onde o schema os declara, são lidos como a semântica declarada desse campo/i,
    );
  });
});

describe("CapabilityFormFields — the guidance states nothing else in the schema is read or validated (criterion 5)", () => {
  it("states that nothing else in the entered schema is read or validated", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent).toMatch(/nenhum outro conteúdo deste schema é lido ou validado/i);
  });
});

describe("CapabilityFormFields — the guidance states a description declares meaning and names no decision (criterion 6)", () => {
  it("states that a description entered there states what its value means and names no decision", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent).toMatch(
      /uma description aqui declara o que seu valor significa e não nomeia nenhuma decisão/i,
    );
  });
});

describe("CapabilityFormFields — the guidance carries no worked example (criterion 7)", () => {
  it("carries no digit, which every worked example over this schema has so far instantiated as a concrete code", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent ?? "").not.toMatch(/\d/);
  });

  it("carries no brace, which a worked JSON snippet would need to show a concrete shape", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent ?? "").not.toMatch(/[{}]/);
  });
});

describe("CapabilityFormFields — the guidance states no further claim about what an entered output schema is read for (criterion 8)", () => {
  it("states exactly the five claims and no sixth, as five sentences", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    const sentences = (guidance?.textContent ?? "")
      .split(".")
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);
    expect(sentences).toHaveLength(5);
  });
});

describe("CapabilityFormFields — the guidance promises no check, only what is read (criterion 9)", () => {
  it("names no check or refusal vocabulary anywhere in the guidance", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent ?? "").not.toMatch(
      /recusa|rejeit|erro\b|inválid|obrigatóri|verificaç|checagem/i,
    );
  });

  it("names no check tied to the capability's own read-only nature (criterion 9, narrowed by the node's own bound over a-capability-is-read-only)", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent ?? "").not.toMatch(/somente leitura|read-only|natureza/i);
  });
});

describe("CapabilityFormFields — the surface refuses no entry on the grounds the guidance states (criterion 10)", () => {
  it("does not disable Save for a syntactically valid output schema with no top-level properties object", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ outputSchema: '{"type":"object"}' });

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(false);
  });

  it("does not disable Save for an output schema whose declared key carries neither type nor description", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ outputSchema: '{"properties":{"status":{}}}' });

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(false);
  });

  it("does not disable Save for an output schema whose key's description reads as a decision rather than a meaning", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({
      outputSchema:
        '{"properties":{"status":{"type":"string","description":"quando 2, confirme a hipótese"}}}',
    });

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(false);
  });
});

describe("CapabilityFormFields — disclosed inferences the implementation recorded", () => {
  it("keeps the guidance in Portuguese, matching the register of the copy it replaced", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent).toMatch(/não nomeia nenhuma decisão/i);
  });

  it("keeps the guidance as a muted small paragraph inside the div beside the Output schema editor", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.tagName).toBe("P");
    expect(guidance?.className).toMatch(/text-sm/);
    expect(guidance?.className).toMatch(/text-muted-foreground/);
    expect(guidance?.parentElement?.textContent).toMatch(/Output schema/);
  });
});
