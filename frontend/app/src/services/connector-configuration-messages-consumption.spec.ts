import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectorConfigurationHelper } from "../routes/connector-configuration-helper";
import { ConnectorConfigurationHelperFields } from "../routes/connector-configuration-helper-fields";
import type { ConnectorConfigurationHelperState } from "../hooks/use-connector-configuration-helper";
import {
  createFetchStub,
  jsonResponse,
  mountConnectorConfigurationCreateScreen,
} from "../routes/connector-configuration-create-screen.test-support";
import {
  APPLY_CONFIRMATION_DIALOG_TITLE,
  CONFIGURATION_HELPER_HEADING,
  CONFIGURATION_HELPER_REQUEST_DRAFT_BUTTON,
  CONFIGURATION_HELPER_WAITING_ON_CONNECTOR_NAME_MESSAGE,
} from "./connector-configuration-messages";

function stateWith(overrides: Partial<ConnectorConfigurationHelperState> = {}): ConnectorConfigurationHelperState {
  return {
    link: "",
    onLinkChange: () => {},
    operations: [],
    operationsOutcome: { kind: "idle" },
    onChooseOperation: () => {},
    path: "",
    method: "",
    onRequestDraft: () => {},
    outcome: { kind: "idle" },
    ...overrides,
  };
}

describe("ConnectorConfigurationHelperFields -- the connector-missing waiting message is the module's own text, not a duplicate literal (criterion 1)", () => {
  it("renders the same string CONFIGURATION_HELPER_WAITING_ON_CONNECTOR_NAME_MESSAGE holds when no connector name stands", () => {
    render(
      createElement(ConnectorConfigurationHelperFields, {
        state: stateWith({ connector: "", path: "/v2/translate", method: "POST" }),
        onApply: () => {},
      }),
    );

    expect(screen.getByText(CONFIGURATION_HELPER_WAITING_ON_CONNECTOR_NAME_MESSAGE)).toBeTruthy();
  });
});

describe("ConnectorConfigurationHelperFields -- the Request Draft button's label is the module's own text, not a duplicate literal (criterion 1)", () => {
  it("renders the same string CONFIGURATION_HELPER_REQUEST_DRAFT_BUTTON holds as the button's accessible name once a connector name and a chosen operation both stand", () => {
    render(
      createElement(ConnectorConfigurationHelperFields, {
        state: stateWith({ connector: "deepl-connector", path: "/v2/translate", method: "POST" }),
        onApply: () => {},
      }),
    );

    expect(
      screen.getByRole("button", { name: CONFIGURATION_HELPER_REQUEST_DRAFT_BUTTON }),
    ).toBeTruthy();
  });
});

describe("ConnectorConfigurationHelper -- the section heading is the module's own text, not a duplicate literal (criterion 1)", () => {
  it("renders the same string CONFIGURATION_HELPER_HEADING holds as the section's own heading", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(ConnectorConfigurationHelper, { connector: "", onApply: () => {} }),
      ),
    );

    expect(screen.getByRole("heading", { name: CONFIGURATION_HELPER_HEADING })).toBeTruthy();
  });
});

const DRAFT_ROUTE = "/v1/draft-connector-configuration-from-openapi";
const OPERATOR_LINK = "https://api.example.com/openapi.json";
const HELPER_OPERATION = { path: "/v2/translate", method: "POST" };

function operationsReadRoute(link: string): string {
  return `/v1/read-openapi-document-operations?link=${encodeURIComponent(link)}`;
}

describe("ConnectorConfigurationFormFields -- the apply-confirmation dialog's title is the module's own text, not a duplicate literal (criterion 2)", () => {
  it("titles the dialog with the same string APPLY_CONFIRMATION_DIALOG_TITLE holds, once a draft is offered over an unsaved edit", async () => {
    const fetchMock = createFetchStub({
      [DRAFT_ROUTE]: () =>
        jsonResponse({
          connector: "deepl-connector",
          configuration: '{"distinctive":true}',
          unresolved: [],
          generated_credentials: [],
          status_readings: [],
          response_fields: [],
          reading_notes: [],
        }),
      [operationsReadRoute(OPERATOR_LINK)]: () => jsonResponse({ operations: [HELPER_OPERATION] }),
    });
    await mountConnectorConfigurationCreateScreen(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuração");
    fireEvent.change(configurationField, { target: { value: '{"typed":"not-submitted"}' } });

    fireEvent.change(await screen.findByLabelText<HTMLInputElement>("Conector"), {
      target: { value: "deepl-connector" },
    });
    fireEvent.change(screen.getByLabelText("Link do documento OpenAPI"), {
      target: { value: OPERATOR_LINK },
    });
    fireEvent.click(screen.getByLabelText("Operação"));
    const option = await screen.findByRole("option", {
      name: `${HELPER_OPERATION.path} — ${HELPER_OPERATION.method}`,
    });
    fireEvent.mouseDown(option);
    fireEvent.click(screen.getByRole("button", { name: "Solicitar rascunho" }));
    await screen.findByRole("button", { name: "Aplicar" });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => {
      expect(within(dialog).getByText(APPLY_CONFIRMATION_DIALOG_TITLE)).toBeTruthy();
    });
  });
});
