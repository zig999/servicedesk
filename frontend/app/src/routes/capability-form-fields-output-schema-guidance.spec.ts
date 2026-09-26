import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
// Criterion 10 mounts the create screen and the detail screen inside one test body to compare
// their rendered guidance text directly; automatic cleanup only runs between separate it()s, not
// between renders inside one, so the test unmounts the first render itself before the second.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { cleanup } from "@testing-library/react";
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

// The six claim statements the rewritten paragraph carries -- the path claim (criterion 1) and
// the concatenation grammar that builds it (criterion 2) are stated as two separate sentences,
// alongside the JSON claim (3), the declared-semantics claim (4), the nothing-else-read claim
// (5) and the description-meaning claim (6). Criterion 7's own test below reuses this same list
// to check that no further sentence appears beyond these six.
const CLAIM_PATTERNS: readonly RegExp[] = [
  /o que é inserido aqui é json/i,
  /os nomes de campo lidos a partir dele são os caminhos através do objeto properties de nível superior deste schema e de todo objeto properties e todo schema items alcançável a partir dele/i,
  /esse caminho é construído concatenando a chave própria de cada objeto ao caminho do seu pai com um ponto, e os items próprios de cada array ao caminho do seu pai com colchetes/i,
  /o type e a description declarados no nó que cada caminho alcança, onde o schema os declara, são lidos como a semântica declarada desse campo/i,
  /nenhum outro conteúdo deste schema é lido ou validado/i,
  /uma description aqui declara o que seu valor significa e não nomeia nenhuma decisão/i,
];

describe("CapabilityFormFields — the guidance states the field names are the full recursive paths through the schema (criterion 1)", () => {
  it("states that the read field names are the paths through the schema's own top-level properties object and every properties object and items schema reachable beneath it", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent).toMatch(CLAIM_PATTERNS[1]);
  });
});

describe("CapabilityFormFields — the guidance states how such a path is built (criterion 2)", () => {
  it("states that each object's own key is joined onto its parent's own path with a dot, and an array's own items is joined onto its parent's own path with brackets", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent).toMatch(CLAIM_PATTERNS[2]);
  });
});

describe("CapabilityFormFields — the guidance states that what is entered is JSON (criterion 3)", () => {
  it("states that the entered content is JSON", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent).toMatch(/o que é inserido aqui é json\./i);
  });
});

describe("CapabilityFormFields — the guidance states a reached node's own type and description are read as its declared semantics (criterion 4)", () => {
  it("states that the type and description declared at the node each path reaches, where the schema states them, are read as that field's declared semantics", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent).toMatch(CLAIM_PATTERNS[3]);
  });
});

describe("CapabilityFormFields — the guidance states nothing else in the schema is read or validated (criterion 5)", () => {
  it("states that no other content of the entered schema is read or validated", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent).toMatch(CLAIM_PATTERNS[4]);
  });
});

describe("CapabilityFormFields — the guidance states a description declares meaning and names no decision (criterion 6)", () => {
  it("states that a description entered there states what its value means and names no decision", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent).toMatch(CLAIM_PATTERNS[5]);
  });
});

describe("CapabilityFormFields — the guidance makes no claim beyond the three nodes bounding it (criterion 7)", () => {
  it("carries no sentence that fails to match one of the six known claim statements", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    const sentences = (guidance?.textContent ?? "")
      .split(".")
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);

    expect(sentences.length).toBeGreaterThan(0);
    for (const sentence of sentences) {
      expect(CLAIM_PATTERNS.some((pattern) => pattern.test(sentence))).toBe(true);
    }
  });
});

describe("CapabilityFormFields — the guidance carries no worked example of its own (criterion 8)", () => {
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

describe("CapabilityFormFields — the guidance contains none of the forbidden vocabulary (criterion 9)", () => {
  it("names no refusal, check or read-only-nature vocabulary anywhere in the guidance", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent ?? "").not.toMatch(
      /recusa|rejeit|erro\b|inválid|obrigatóri|verificaç|checagem|somente leitura|read-only|natureza/i,
    );
  });
});

describe("CapabilityFormFields — the guidance renders the same text on the create screen and on the detail screen (criterion 10)", () => {
  it("renders identical guidance text beside the Output schema entry on both screens", async () => {
    const createFetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(createFetchMock);
    await screen.findByLabelText("Connector");
    const createGuidanceText = findGuidanceParagraph(document.body)?.textContent;
    expect(createGuidanceText).toBeTruthy();

    cleanup();
    vi.unstubAllGlobals();

    const detailFetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(detailFetchMock);
    await screen.findByLabelText("Output schema");
    const detailGuidanceText = findGuidanceParagraph(document.body)?.textContent;

    expect(detailGuidanceText).toBe(createGuidanceText);
  });
});

describe("CapabilityFormFields — the surface does not refuse an output schema declaring properties only beneath a nested items schema (criterion 11)", () => {
  it("does not disable Save for an output schema whose properties are declared only beneath a nested items schema", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({
      outputSchema:
        '{"type":"object","properties":{"installations":{"type":"array","items":{"type":"object","properties":{"state":{"type":"string"}}}}}}',
    });

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(false);
  });
});

describe("CapabilityFormFields — the surface does not refuse an output schema whose nested node carries neither type nor description (criterion 12)", () => {
  it("does not disable Save for an output schema whose nested node carries neither type nor description", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({
      outputSchema: '{"properties":{"container":{"type":"object","properties":{"status":{}}}}}',
    });

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(false);
  });
});

// The six canonical claim sentences, lowercase and unpunctuated, in the order the guidance
// states them. Unlike CLAIM_PATTERNS above -- which only checks that each of these appears
// somewhere inside a sentence -- this list is compared by exact equality against every
// sentence the guidance renders, so a sentence carrying a claim plus anything else (a worked
// example tacked onto it, or a further fact about how a path is built that the claim itself
// does not state) fails here even though it would still satisfy every CLAIM_PATTERNS check.
const EXACT_CLAIM_SENTENCES: readonly string[] = [
  "o que é inserido aqui é json",
  "os nomes de campo lidos a partir dele são os caminhos através do objeto properties de nível superior deste schema e de todo objeto properties e todo schema items alcançável a partir dele",
  "esse caminho é construído concatenando a chave própria de cada objeto ao caminho do seu pai com um ponto, e os items próprios de cada array ao caminho do seu pai com colchetes",
  "o type e a description declarados no nó que cada caminho alcança, onde o schema os declara, são lidos como a semântica declarada desse campo",
  "nenhum outro conteúdo deste schema é lido ou validado",
  "uma description aqui declara o que seu valor significa e não nomeia nenhuma decisão",
];

describe("CapabilityFormFields — the guidance's six sentences carry exactly their own claim and nothing appended to it", () => {
  it("renders exactly the six canonical claim sentences, in order, with no worked example or further path-shape fact folded into any of them", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    const sentences = (guidance?.textContent ?? "")
      .split(".")
      .map((sentence) => sentence.trim().toLowerCase())
      .filter((sentence) => sentence.length > 0);

    expect(sentences).toEqual(EXACT_CLAIM_SENTENCES);
  });
});
