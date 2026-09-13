import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
  createFetchStub,
  jsonResponse,
  mountConnectorConfigurationCreateScreen,
} from "./connector-configuration-create-screen.test-support";
import type { Capability } from "../hooks/use-capabilities";
import {
  RESPONSE_MAP_COVERAGE_CANNOT_BE_READ_MESSAGE,
  responseMapExpectedFieldText,
  responseMapKeyReadByNoneText,
  responseMapKeyReadText,
} from "../services/connector-configuration-messages";

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

async function mountWithCapabilities(
  capabilities: readonly Capability[],
): Promise<ReturnType<typeof createFetchStub>> {
  const fetchMock = createFetchStub({
    [CAPABILITIES_PATH]: () => jsonResponse({ data: capabilities }),
  });
  await mountConnectorConfigurationCreateScreen(fetchMock);
  return fetchMock;
}

async function typeConnector(connector: string): Promise<void> {
  const field = await screen.findByLabelText<HTMLInputElement>("Conector");
  fireEvent.change(field, { target: { value: connector } });
}

async function typeConfiguration(text: string): Promise<void> {
  const field = await screen.findByLabelText<HTMLTextAreaElement>("Configuração");
  fireEvent.change(field, { target: { value: text } });
}

const REPRESENTATIVE_CONFIGURATION = JSON.stringify({
  responseMap: { covered: "$.covered", orphan: "$.orphan" },
});

describe(
  "ConnectorConfigurationFormFields -- the responseMap coverage statement states a read key, " +
    "a read-by-none key and an expected-but-unnamed field together, over the Configuration " +
    "field's own content (criteria 1, 2, 3 and 5)",
  () => {
    it("renders all three findings for a representative configuration typed into the field", async () => {
      await mountWithCapabilities([capability()]);
      await typeConnector(CONNECTOR);
      await typeConfiguration(REPRESENTATIVE_CONFIGURATION);

      expect(
        await screen.findByText(responseMapKeyReadText("covered", ["acme-lookup (1.0.0)"])),
      ).toBeTruthy();
      expect(screen.getByText(responseMapKeyReadByNoneText("orphan"))).toBeTruthy();
      expect(
        screen.getByText(responseMapExpectedFieldText("acme-lookup (1.0.0)", "expectedOnly")),
      ).toBeTruthy();
    });
  },
);

describe(
  "ConnectorConfigurationFormFields -- no capability registered for the connector states that " +
    "which fields an observation would carry cannot be read (criterion 4 as rendered)",
  () => {
    it("renders the cannot-be-read message when no capability is registered for the typed connector", async () => {
      await mountWithCapabilities([]);
      await typeConnector(CONNECTOR);
      await typeConfiguration(REPRESENTATIVE_CONFIGURATION);

      expect(
        await screen.findByText(RESPONSE_MAP_COVERAGE_CANNOT_BE_READ_MESSAGE),
      ).toBeTruthy();
    });
  },
);

describe(
  "ConnectorConfigurationFormFields -- the responseMap coverage statement carries no claim of " +
    "its own (task's own UNDERDETERMINED entry on withholding submission, refuted)",
  () => {
    it("leaves Save enabled while a key is read by no capability and an expected field stands unnamed", async () => {
      await mountWithCapabilities([capability()]);
      await typeConnector(CONNECTOR);
      await typeConfiguration(REPRESENTATIVE_CONFIGURATION);

      await screen.findByText(responseMapKeyReadByNoneText("orphan"));
      await screen.findByText(responseMapExpectedFieldText("acme-lookup (1.0.0)", "expectedOnly"));

      expect(screen.getByRole("button", { name: "Salvar" }).hasAttribute("disabled")).toBe(false);
    });
  },
);

describe(
  "ConnectorConfigurationFormFields -- the responseMap coverage statement is read from the " +
    "capability list this area already holds, adding no second registry read (criterion 7)",
  () => {
    it("issues a single request to the capability registry despite repeated edits to the Configuration field", async () => {
      const fetchMock = await mountWithCapabilities([capability()]);
      await typeConnector(CONNECTOR);
      await typeConfiguration(REPRESENTATIVE_CONFIGURATION);
      await screen.findByText(responseMapKeyReadText("covered", ["acme-lookup (1.0.0)"]));

      await typeConfiguration(
        JSON.stringify({ responseMap: { covered: "$.covered", orphan: "$.orphan", extra: "$.extra" } }),
      );
      await screen.findByText(responseMapKeyReadByNoneText("extra"));

      const capabilitiesCalls = fetchMock.mock.calls.filter(
        ([input]) => (typeof input === "string" ? input : input.toString()) === CAPABILITIES_PATH,
      );
      expect(capabilitiesCalls).toHaveLength(1);
    });
  },
);
