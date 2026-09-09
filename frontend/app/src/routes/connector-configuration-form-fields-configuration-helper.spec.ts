import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  connectorPutPath,
  createFetchStub as createCreateScreenFetchStub,
  jsonResponse,
  mountConnectorConfigurationCreateScreen,
  putCallCount as createScreenPutCallCount,
} from "./connector-configuration-create-screen.test-support";
import {
  LOADED_CONFIGURATION,
  baseHandlers as detailScreenBaseHandlers,
  createFetchStub as createDetailScreenFetchStub,
  mountConnectorConfigurationDetailScreen,
} from "./connector-configuration-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const DRAFT_ROUTE = "/v1/draft-connector-configuration-from-openapi";
const OPERATOR_LINK = "https://api.example.com/openapi.json";

function draftJsonResponse(): Response {
  return jsonResponse({
    connector: "any-connector",
    configuration: "{}",
    unresolved: [],
    generated_credentials: [],
  });
}

function errorResponse(code: string): Response {
  return new Response(JSON.stringify({ error: { code, message: code } }), { status: 422 });
}

async function mountCreateScreenWithHelper() {
  const fetchMock = createCreateScreenFetchStub({ [DRAFT_ROUTE]: draftJsonResponse });
  await mountConnectorConfigurationCreateScreen(fetchMock);
  await screen.findByLabelText("Configuration");
  return fetchMock;
}

async function mountDetailScreenWithHelper() {
  const fetchMock = createDetailScreenFetchStub(
    detailScreenBaseHandlers(LOADED_CONFIGURATION, { [DRAFT_ROUTE]: draftJsonResponse }),
  );
  await mountConnectorConfigurationDetailScreen(fetchMock);
  await screen.findByLabelText("Configuration");
  return fetchMock;
}

describe("ConnectorConfigurationFormFields -- the Configuration Helper section sits beneath the Configuration field on the create screen (criterion 1)", () => {
  it("places the Configuration Helper heading after the Configuration field in document order", async () => {
    await mountCreateScreenWithHelper();

    const configurationField = screen.getByLabelText("Configuration");
    const helperHeading = screen.getByRole("heading", { name: "Configuration Helper" });

    expect(
      Boolean(
        configurationField.compareDocumentPosition(helperHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);
  });
});

describe("ConnectorConfigurationFormFields -- the Configuration Helper section sits beneath the Configuration field on the ready detail view (criterion 2)", () => {
  it("places the Configuration Helper heading after the Configuration field in document order", async () => {
    await mountDetailScreenWithHelper();

    const configurationField = screen.getByLabelText("Configuration");
    const helperHeading = screen.getByRole("heading", { name: "Configuration Helper" });

    expect(
      Boolean(
        configurationField.compareDocumentPosition(helperHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);
  });
});

describe("ConnectorConfigurationFormFields -- the Configuration Helper is rendered inline in the same form as the Configuration field, on no screen or dialog of its own (criterion 3)", () => {
  it("shares the Configuration field's own owning <form> and opens no dialog, on the create screen", async () => {
    const fetchMock = createCreateScreenFetchStub({ [DRAFT_ROUTE]: draftJsonResponse });
    const router = await mountConnectorConfigurationCreateScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    const configurationField = screen.getByLabelText<HTMLTextAreaElement>("Configuration");
    const linkInput = screen.getByLabelText<HTMLInputElement>("OpenAPI document link");

    expect(linkInput.form).not.toBeNull();
    expect(linkInput.form).toBe(configurationField.form);
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.change(linkInput, { target: { value: OPERATOR_LINK } });
    expect(router.state.location.pathname).toBe("/connectors/new");
  });

  it("shares the Configuration field's own owning <form> and opens no dialog, on the ready detail view", async () => {
    await mountDetailScreenWithHelper();

    const configurationField = screen.getByLabelText<HTMLTextAreaElement>("Configuration");
    const linkInput = screen.getByLabelText<HTMLInputElement>("OpenAPI document link");

    expect(linkInput.form).not.toBeNull();
    expect(linkInput.form).toBe(configurationField.form);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("ConnectorConfigurationFormFields -- the section offers a control naming the OpenAPI document link (criterion 4)", () => {
  it("renders an editable OpenAPI document link control that holds what the operator types", async () => {
    await mountCreateScreenWithHelper();

    const linkInput = screen.getByLabelText<HTMLInputElement>("OpenAPI document link");
    fireEvent.change(linkInput, { target: { value: OPERATOR_LINK } });

    expect(linkInput.value).toBe(OPERATOR_LINK);
  });
});

describe("ConnectorConfigurationFormFields -- the section offers controls naming one operation by its path and method (criterion 5)", () => {
  it("renders editable Operation path and Operation method controls that hold what the operator types", async () => {
    await mountCreateScreenWithHelper();

    const pathInput = screen.getByLabelText<HTMLInputElement>("Operation path");
    const methodInput = screen.getByLabelText<HTMLInputElement>("Operation method");
    fireEvent.change(pathInput, { target: { value: "/v2/translate" } });
    fireEvent.change(methodInput, { target: { value: "POST" } });

    expect(pathInput.value).toBe("/v2/translate");
    expect(methodInput.value).toBe("POST");
  });
});

describe("ConnectorConfigurationFormFields -- the section's control dispatches the draft request with the stated link and named operation (criterion 6)", () => {
  it("issues a POST to the draft route carrying the current connector, link, path and method, when Request Draft is clicked", async () => {
    const fetchMock = await mountCreateScreenWithHelper();

    fireEvent.change(screen.getByLabelText("Connector"), { target: { value: "deepl-connector" } });
    fireEvent.change(screen.getByLabelText("OpenAPI document link"), { target: { value: OPERATOR_LINK } });
    fireEvent.change(screen.getByLabelText("Operation path"), { target: { value: "/v2/translate" } });
    fireEvent.change(screen.getByLabelText("Operation method"), { target: { value: "POST" } });

    fireEvent.click(screen.getByRole("button", { name: "Request Draft" }));

    await waitFor(() => {
      expect(fetchMock.mock.calls.filter(([input]) => input === DRAFT_ROUTE)).toHaveLength(1);
    });
    const draftCall = fetchMock.mock.calls.find(([input]) => input === DRAFT_ROUTE);
    const rawBody = draftCall?.[1]?.body;
    if (typeof rawBody !== "string") {
      throw new Error("configuration-helper proof: expected a string request body on the draft call");
    }
    expect(JSON.parse(rawBody)).toEqual({
      connector: "deepl-connector",
      link: OPERATOR_LINK,
      path: "/v2/translate",
      method: "POST",
    });
  });
});

describe("ConnectorConfigurationFormFields -- requesting a draft issues no request to the operator-stated document link itself (constraints/the-openapi-document-is-fetched-by-the-backend)", () => {
  it("never calls fetch with the operator's own link, only with the published draft route", async () => {
    const fetchMock = await mountCreateScreenWithHelper();

    fireEvent.change(screen.getByLabelText("OpenAPI document link"), { target: { value: OPERATOR_LINK } });
    fireEvent.click(screen.getByRole("button", { name: "Request Draft" }));

    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([input]) => input === DRAFT_ROUTE)).toBe(true);
    });
    expect(fetchMock.mock.calls.some(([input]) => input === OPERATOR_LINK)).toBe(false);
  });
});

describe("ConnectorConfigurationFormFields -- nothing the section offers submits the surface's form or invokes its save path (criterion 7)", () => {
  it("issues no PUT request when Request Draft is clicked, even while Save itself is enabled", async () => {
    const fetchMock = createCreateScreenFetchStub({
      [DRAFT_ROUTE]: draftJsonResponse,
      [connectorPutPath("deepl-connector")]: () =>
        jsonResponse({ connector: "deepl-connector", configuration: "{}" }),
    });
    await mountConnectorConfigurationCreateScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    fireEvent.change(screen.getByLabelText("Connector"), { target: { value: "deepl-connector" } });
    fireEvent.change(screen.getByLabelText("Configuration"), { target: { value: "{}" } });
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(false);

    fireEvent.change(screen.getByLabelText("OpenAPI document link"), { target: { value: OPERATOR_LINK } });
    fireEvent.click(screen.getByRole("button", { name: "Request Draft" }));

    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([input]) => input === DRAFT_ROUTE)).toBe(true);
    });
    expect(createScreenPutCallCount(fetchMock)).toBe(0);
  });
});

describe("ConnectorConfigurationFormFields -- the Connector field, the Configuration field and the Actions footer remain present and reachable on both screens (criterion 8)", () => {
  it("keeps Connector, Configuration and the Actions group's Save control reachable by their existing labels on the create screen", async () => {
    await mountCreateScreenWithHelper();

    expect(screen.getByLabelText("Connector")).toBeTruthy();
    expect(screen.getByLabelText("Configuration")).toBeTruthy();
    const footer = screen.getByRole("group", { name: "Actions" });
    expect(within(footer).getByRole("button", { name: "Save" })).toBeTruthy();
  });

  it("keeps Connector, Configuration and the Actions group's Save control reachable by their existing labels on the ready detail view", async () => {
    await mountDetailScreenWithHelper();

    expect(screen.getByLabelText("Connector")).toBeTruthy();
    expect(screen.getByLabelText("Configuration")).toBeTruthy();
    const footer = screen.getByRole("group", { name: "Actions" });
    expect(within(footer).getByRole("button", { name: "Save" })).toBeTruthy();
  });
});

describe("ConnectorConfigurationFormFields -- Request Draft is disabled only while its own request is pending (disclosed inference)", () => {
  it("disables Request Draft once clicked, while the draft request is outstanding", async () => {
    let resolveDraft: ((value: Response) => void) | undefined;
    const pendingResponse = new Promise<Response>((resolve) => {
      resolveDraft = resolve;
    });
    const fetchMock = createCreateScreenFetchStub({ [DRAFT_ROUTE]: () => pendingResponse });
    await mountConnectorConfigurationCreateScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    const requestDraftButton = screen.getByRole("button", { name: "Request Draft" });
    expect(requestDraftButton.hasAttribute("disabled")).toBe(false);

    fireEvent.click(requestDraftButton);
    await waitFor(() => expect(requestDraftButton.hasAttribute("disabled")).toBe(true));

    resolveDraft?.(draftJsonResponse());
    await waitFor(() => expect(requestDraftButton.hasAttribute("disabled")).toBe(false));
  });

  it("re-enables Request Draft after a refused draft request, rather than leaving it disabled", async () => {
    const fetchMock = createCreateScreenFetchStub({
      [DRAFT_ROUTE]: () => errorResponse("OpenApiDocumentNotReadableError"),
    });
    await mountConnectorConfigurationCreateScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    const requestDraftButton = screen.getByRole("button", { name: "Request Draft" });
    fireEvent.click(requestDraftButton);

    await waitFor(() => expect(fetchMock.mock.calls.some(([input]) => input === DRAFT_ROUTE)).toBe(true));
    await waitFor(() => expect(requestDraftButton.hasAttribute("disabled")).toBe(false));
  });
});
