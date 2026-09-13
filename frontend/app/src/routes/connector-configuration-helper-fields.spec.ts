import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectorConfigurationHelperFields } from "./connector-configuration-helper-fields";
import type { ConnectorConfigurationHelperState } from "../hooks/use-connector-configuration-helper";
import type {
  ConnectorConfigurationDraft,
  ConnectorConfigurationDraftGeneratedCredential,
  DraftConnectorConfigurationRequestOutcome,
} from "../hooks/use-draft-connector-configuration-from-openapi";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ data: [] }), { status: 200 })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

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
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(ConnectorConfigurationHelperFields, { state: baseState(outcome), onApply: () => {} }),
    ),
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

const DISTINCTIVE_CONFIGURATION_TEXT = '{"address":"https://api.example.com/v2/translate","distinctive":true}';

const FETCH_REFUSAL: DraftConnectorConfigurationRequestOutcome = {
  kind: "openapi-document-not-fetched",
  link: "https://api.example.com/openapi.json",
  failure: { kind: "network-failure" },
};
const NOT_READABLE_REFUSAL: DraftConnectorConfigurationRequestOutcome = { kind: "openapi-document-not-readable" };
const OPERATION_NOT_FOUND_REFUSAL: DraftConnectorConfigurationRequestOutcome = {
  kind: "openapi-operation-not-found",
  path: "/v2/translate",
  method: "PATCH",
};
const UNRECOGNIZED_REFUSAL: DraftConnectorConfigurationRequestOutcome = { kind: "unrecognized-failure" };

describe("ConnectorConfigurationHelperFields -- idle renders neither a refusal nor a draft", () => {
  it("shows no drafting line, no alert and no drafted disclosure while idle", () => {
    renderHelperFields({ kind: "idle" });

    expect(screen.queryByText("Rascunhando a configuração do conector…")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText("Configuração rascunhada")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- a pending request shows a drafting line (disclosed inference)", () => {
  it("shows the drafting line and neither an alert nor a drafted disclosure while pending", () => {
    renderHelperFields({ kind: "pending" });

    expect(screen.getByText("Rascunhando a configuração do conector…")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText("Configuração rascunhada")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- an answered draft's configuration text is disclosed verbatim (criterion 1)", () => {
  it("renders the draft's own configuration text unmodified", () => {
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "drafted",
      draft: { ...BASE_DRAFT, configuration: DISTINCTIVE_CONFIGURATION_TEXT },
    };

    renderHelperFields(outcome);

    expect(screen.getByText(DISTINCTIVE_CONFIGURATION_TEXT)).toBeTruthy();
  });
});

describe("ConnectorConfigurationHelperFields -- each unresolved item is disclosed by its own name, paired with a translated reason (criterion 2)", () => {
  it("shows the item's name and a reason label that is not the raw reason string", () => {
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "drafted",
      draft: { ...BASE_DRAFT, unresolved: [{ name: "api-key", reason: "no-capability-registered" }] },
    };

    renderHelperFields(outcome);

    const item = screen.getByRole("listitem");
    expect(normalized(item)).toMatch(/^api-key:\s+\S.+/);
    expect(normalized(item)).not.toContain("no-capability-registered");
  });
});

describe("ConnectorConfigurationHelperFields -- an empty unresolved list discloses no unresolved item (criterion 3)", () => {
  it("renders no Unresolved section", () => {
    renderHelperFields({ kind: "drafted", draft: BASE_DRAFT });

    expect(screen.queryByText("Não resolvidos")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- each generated credential is disclosed by name and security scheme (criterion 4)", () => {
  it("shows the credential's own name and security scheme", () => {
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "drafted",
      draft: { ...BASE_DRAFT, generated_credentials: [{ name: "api-key", security_scheme: "apiKey" }] },
    };

    renderHelperFields(outcome);

    expect(normalized(screen.getByRole("listitem"))).toBe("api-key: apiKey");
  });
});

type GeneratedCredentialWithLeakedValue = ConnectorConfigurationDraftGeneratedCredential & {
  readonly value: string;
};

describe("ConnectorConfigurationHelperFields -- no credential value ever renders (criterion 5)", () => {
  it("shows no leaked value even when the answered credential smuggles one in", () => {
    const credentialWithValue: GeneratedCredentialWithLeakedValue = {
      name: "api-key",
      security_scheme: "apiKey",
      value: "sk-should-never-be-disclosed",
    };
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "drafted",
      draft: { ...BASE_DRAFT, generated_credentials: [credentialWithValue] },
    };

    const { container } = renderHelperFields(outcome);

    expect(container.textContent).not.toContain("sk-should-never-be-disclosed");
  });
});

describe("ConnectorConfigurationHelperFields -- an empty generated-credentials list discloses no credential (criterion 8, generated-credentials part)", () => {
  it("renders no Generated credentials section", () => {
    renderHelperFields({ kind: "drafted", draft: BASE_DRAFT });

    expect(screen.queryByText("Credenciais geradas")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- a method mismatch discloses both methods under separate labels (criterion 6)", () => {
  it("shows the registered and drafted methods, neither in place of the other", () => {
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "drafted",
      draft: { ...BASE_DRAFT, method_mismatch: { registered: "GET", operation: "POST" } },
    };

    renderHelperFields(outcome);

    const line = normalized(screen.getByText(/Registrado/));
    expect(line).toContain("Registrado: GET");
    expect(line).toContain("Rascunhado: POST");
  });
});

describe("ConnectorConfigurationHelperFields -- no method mismatch is disclosed when the draft names none (criterion 7)", () => {
  it("renders no Method mismatch section", () => {
    renderHelperFields({ kind: "drafted", draft: BASE_DRAFT });

    expect(screen.queryByText("Divergência de método")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- every status reading the answer carries is stated with its status, its ending and, where the document declared one, its declared description, and no status the answer did not carry (criteria 1, 2, 3, 5; rule's status_readings clause; scenario's status-readings clause)", () => {
  it("renders exactly the given status readings, each by its own status, its own ending and its declared_as where carried", () => {
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "drafted",
      draft: {
        ...BASE_DRAFT,
        status_readings: [
          { status: "200", ending: "record-stub-response", declared_as: "Successful profile retrieval" },
          { status: "403", ending: "forbidden-not-drafted" },
          { status: "503", ending: "unavailable-not-drafted" },
        ],
      },
    };

    renderHelperFields(outcome);

    const items = screen.getAllByRole("listitem").map(normalized);
    expect(items).toEqual([
      "Status 200 — desfecho: record-stub-response (declarado como: Successful profile retrieval)",
      "Status 403 — desfecho: forbidden-not-drafted",
      "Status 503 — desfecho: unavailable-not-drafted",
    ]);
  });
});

describe("ConnectorConfigurationHelperFields -- a status reading's status and its ending are distinguishable from one another, neither standing for the other (criterion 4)", () => {
  it("renders the status and the ending under their own distinct labels, so neither could be read as the other", () => {
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "drafted",
      draft: { ...BASE_DRAFT, status_readings: [{ status: "422", ending: "validation-error-passed-through" }] },
    };

    renderHelperFields(outcome);

    expect(normalized(screen.getByRole("listitem"))).toBe("Status 422 — desfecho: validation-error-passed-through");
  });
});

describe("ConnectorConfigurationHelperFields -- no status the answer did not carry is stated when the draft carries none (criterion 5)", () => {
  it("renders no status reading at all", () => {
    renderHelperFields({ kind: "drafted", draft: BASE_DRAFT });

    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});

describe("ConnectorConfigurationHelperFields -- a fetch refusal is disclosed as an alert with no draft part beside it (criterion 9)", () => {
  it("shows the fetch-refusal message as an alert and no drafted disclosure", () => {
    renderHelperFields(FETCH_REFUSAL);

    expect(screen.getByRole("alert").textContent).toContain("não foi possível obter o link");
    expect(screen.queryByText("Configuração rascunhada")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- a document-not-readable refusal is disclosed as an alert with no draft part beside it (criterion 10)", () => {
  it("shows the document-not-readable message as an alert and no drafted disclosure", () => {
    renderHelperFields(NOT_READABLE_REFUSAL);

    expect(screen.getByRole("alert").textContent).toContain("não pôde ser lido como um documento OpenAPI 3.x");
    expect(screen.queryByText("Configuração rascunhada")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- an operation-not-found refusal is disclosed as an alert with no draft part beside it (criterion 11)", () => {
  it("shows the method and path as an alert and no drafted disclosure", () => {
    renderHelperFields(OPERATION_NOT_FOUND_REFUSAL);

    const alertText = screen.getByRole("alert").textContent ?? "";
    expect(alertText).toContain("PATCH");
    expect(alertText).toContain("/v2/translate");
    expect(screen.queryByText("Configuração rascunhada")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- an unrecognised failure is disclosed as its own alert, distinct from the three named refusals (criterion 12)", () => {
  it("shows a fallback message reusing none of the three named refusal sentences, and no drafted disclosure", () => {
    renderHelperFields(UNRECOGNIZED_REFUSAL);

    const alertText = screen.getByRole("alert").textContent ?? "";
    expect(alertText).not.toContain("não foi possível obter o link");
    expect(alertText).not.toContain("não pôde ser lido como um documento OpenAPI 3.x");
    expect(alertText).not.toContain("não declara nenhuma operação");
    expect(screen.queryByText("Configuração rascunhada")).toBeNull();
  });
});

