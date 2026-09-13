import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
  createFetchStub,
  jsonResponse,
  mountConnectorConfigurationCreateScreen,
} from "./connector-configuration-create-screen.test-support";
import type { Capability } from "../hooks/use-capabilities";
import {
  CONFIGURATION_NOT_A_JSON_OBJECT_MESSAGE,
  credentialPlaceholderStatementText,
  httpConnectorMethodDepartureText,
  responseMapExpectedFieldText,
  responseMapKeyReadByNoneText,
  subjectPlaceholderUndeclaredText,
} from "../services/connector-configuration-messages";
import { HTTP_CONNECTOR_METHODS } from "../services/connector-configuration-http-departures";

afterEach(() => {
  vi.unstubAllGlobals();
});

const CAPABILITIES_PATH = "/v1/capabilities";
const CONNECTOR = "acme-connector";

function capability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: "acme-lookup",
    version: "1.0.0",
    nature: "read-only",
    input_schema: JSON.stringify({ properties: {} }),
    output_schema: JSON.stringify({ properties: { covered: {}, expectedOnly: {} } }),
    timeout: 5000,
    connector: CONNECTOR,
    concept: "lookup",
    ...overrides,
  };
}

async function mountWithCapabilities(capabilities: readonly Capability[]): Promise<void> {
  const fetchMock = createFetchStub({
    [CAPABILITIES_PATH]: () => jsonResponse({ data: capabilities }),
  });
  await mountConnectorConfigurationCreateScreen(fetchMock);
}

async function typeConnector(connector: string): Promise<void> {
  const field = await screen.findByLabelText<HTMLInputElement>("Conector");
  fireEvent.change(field, { target: { value: connector } });
}

async function typeConfiguration(text: string): Promise<void> {
  const field = await screen.findByLabelText<HTMLTextAreaElement>("Configuração");
  fireEvent.change(field, { target: { value: text } });
}

function saveButtonDisabled(): boolean {
  return screen.getByRole("button", { name: "Salvar" }).hasAttribute("disabled");
}

describe(
  "ConnectorConfigurationFormFields -- text that parses as JSON but is not a plain object " +
    "withholds Save and states the one narrow gap's own message (criteria 1 and 2, the " +
    "parses-to-non-object sub-case)",
  () => {
    it("withholds Save and states the not-an-object message for a JSON array", async () => {
      await mountWithCapabilities([]);
      await typeConfiguration(JSON.stringify(["a", "b"]));

      expect(screen.getByText(CONFIGURATION_NOT_A_JSON_OBJECT_MESSAGE)).toBeTruthy();
      expect(saveButtonDisabled()).toBe(true);
    });

    it("withholds Save and states the not-an-object message for a JSON number", async () => {
      await mountWithCapabilities([]);
      await typeConfiguration(JSON.stringify(42));

      expect(screen.getByText(CONFIGURATION_NOT_A_JSON_OBJECT_MESSAGE)).toBeTruthy();
      expect(saveButtonDisabled()).toBe(true);
    });

    it("withholds Save and states the not-an-object message for JSON null", async () => {
      await mountWithCapabilities([]);
      await typeConfiguration("null");

      expect(screen.getByText(CONFIGURATION_NOT_A_JSON_OBJECT_MESSAGE)).toBeTruthy();
      expect(saveButtonDisabled()).toBe(true);
    });
  },
);

describe(
  "ConnectorConfigurationFormFields -- text that fails to parse at all draws only " +
    "JsonTextareaField's own error, never the not-an-object statement (the two not-well-formed " +
    "sub-cases do not overlap)",
  () => {
    it("renders only the Invalid JSON error, withholds Save, and renders no not-an-object statement", async () => {
      await mountWithCapabilities([]);
      await typeConfiguration("{ this is not json");

      const alerts = screen.getAllByRole("alert");
      expect(alerts.some((alert) => alert.textContent?.startsWith("Invalid JSON:"))).toBe(true);
      expect(screen.queryByText(CONFIGURATION_NOT_A_JSON_OBJECT_MESSAGE)).toBeNull();
      expect(saveButtonDisabled()).toBe(true);
    });
  },
);

describe(
  "ConnectorConfigurationFormFields -- well-formed JSON object text withholds nothing on the " +
    "well-formedness ground (the well-formed boundary)",
  () => {
    it("renders neither not-well-formed statement and leaves Save enabled for well-formed JSON object text", async () => {
      await mountWithCapabilities([]);
      await typeConfiguration(
        JSON.stringify({
          method: "POST",
          statusMap: { "200": "ok" },
          responseMap: { id: "value" },
          address: "https://api.example.com",
        }),
      );

      expect(screen.queryByText(CONFIGURATION_NOT_A_JSON_OBJECT_MESSAGE)).toBeNull();
      expect(screen.queryAllByRole("alert").some((alert) => alert.textContent?.startsWith("Invalid JSON:"))).toBe(
        false,
      );
      expect(saveButtonDisabled()).toBe(false);
    });
  },
);

describe(
  "ConnectorConfigurationFormFields -- an HTTP-connector departure, an undeclared subject " +
    "placeholder, a credential placeholder, a read-by-none responseMap key and an unnamed " +
    "expected field standing together withhold nothing (criteria 3 through 7, combined)",
  () => {
    it("leaves Save enabled despite all four sibling readiness statements standing at once over one well-formed configuration", async () => {
      await mountWithCapabilities([capability()]);
      await typeConnector(CONNECTOR);
      await typeConfiguration(
        JSON.stringify({
          method: "get",
          statusMap: { "200": "ok" },
          responseMap: { covered: "$.covered", orphan: "$.orphan" },
          address: "https://api.example.com/${subject:account-id}/${credential:api-key}",
        }),
      );

      expect(
        await screen.findByText(httpConnectorMethodDepartureText("get", HTTP_CONNECTOR_METHODS)),
      ).toBeTruthy();
      expect(
        screen.getByText(subjectPlaceholderUndeclaredText("account-id", ["acme-lookup (1.0.0)"])),
      ).toBeTruthy();
      expect(screen.getByText(credentialPlaceholderStatementText("api-key"))).toBeTruthy();
      expect(screen.getByText(responseMapKeyReadByNoneText("orphan"))).toBeTruthy();
      expect(
        screen.getByText(responseMapExpectedFieldText("acme-lookup (1.0.0)", "expectedOnly")),
      ).toBeTruthy();

      expect(saveButtonDisabled()).toBe(false);
    });
  },
);
