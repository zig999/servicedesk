import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
  createFetchStub,
  jsonResponse,
  mountConnectorConfigurationCreateScreen,
} from "./connector-configuration-create-screen.test-support";
import type { Capability } from "../hooks/use-capabilities";
import {
  SUBJECT_PLACEHOLDER_CANNOT_BE_CHECKED_MESSAGE,
  subjectPlaceholderDeclaredText,
  subjectPlaceholderUndeclaredText,
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
    input_schema: JSON.stringify({ properties: { "account-id": {} } }),
    output_schema: JSON.stringify({}),
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

describe(
  "ConnectorConfigurationFormFields -- the subject-placeholder statement renders each of its " +
    "three readings (criteria 1, 2 and 3 as rendered)",
  () => {
    it("renders the declared statement when every registered capability declares the placeholder's attribute", async () => {
      await mountWithCapabilities([capability()]);
      await typeConnector(CONNECTOR);
      await typeConfiguration(JSON.stringify({ address: "${subject:account-id}" }));

      expect(await screen.findByText(subjectPlaceholderDeclaredText("account-id"))).toBeTruthy();
    });

    it("renders the undeclared statement, naming the capability that does not declare the placeholder's attribute", async () => {
      const nonDeclaring = capability({
        name: "billing-capability",
        version: "2.0.0",
        input_schema: JSON.stringify({ properties: {} }),
      });
      await mountWithCapabilities([nonDeclaring]);
      await typeConnector(CONNECTOR);
      await typeConfiguration(JSON.stringify({ address: "${subject:account-id}" }));

      expect(
        await screen.findByText(
          subjectPlaceholderUndeclaredText("account-id", ["billing-capability (2.0.0)"]),
        ),
      ).toBeTruthy();
    });

    it("renders the cannot-be-checked message when no capability is registered for the connector", async () => {
      await mountWithCapabilities([]);
      await typeConnector(CONNECTOR);
      await typeConfiguration(JSON.stringify({ address: "${subject:account-id}" }));

      expect(await screen.findByText(SUBJECT_PLACEHOLDER_CANNOT_BE_CHECKED_MESSAGE)).toBeTruthy();
    });
  },
);

describe(
  "ConnectorConfigurationFormFields -- the subject-placeholder statement carries no claim of " +
    "its own (task's own UNDERDETERMINED entry on withholding submission, refuted)",
  () => {
    it("leaves Save enabled while the undeclared subject-placeholder statement stands", async () => {
      const nonDeclaring = capability({ input_schema: JSON.stringify({ properties: {} }) });
      await mountWithCapabilities([nonDeclaring]);
      await typeConnector(CONNECTOR);
      await typeConfiguration(JSON.stringify({ address: "${subject:account-id}" }));

      await screen.findByText(
        subjectPlaceholderUndeclaredText("account-id", ["acme-lookup (1.0.0)"]),
      );

      expect(screen.getByRole("button", { name: "Salvar" }).hasAttribute("disabled")).toBe(false);
    });
  },
);

describe(
  "ConnectorConfigurationFormFields -- the subject-placeholder statement is read from the " +
    "capability list this area already holds, adding no second registry read (criterion 5)",
  () => {
    it("issues a single request to the capability registry despite repeated edits to the Configuration field", async () => {
      const fetchMock = await mountWithCapabilities([capability()]);
      await typeConnector(CONNECTOR);
      await typeConfiguration(JSON.stringify({ address: "${subject:account-id}" }));
      await screen.findByText(subjectPlaceholderDeclaredText("account-id"));

      await typeConfiguration(JSON.stringify({ address: "${subject:account-id}", extra: "x" }));
      await screen.findByText(subjectPlaceholderDeclaredText("account-id"));

      const capabilitiesCalls = fetchMock.mock.calls.filter(
        ([input]) => (typeof input === "string" ? input : input.toString()) === CAPABILITIES_PATH,
      );
      expect(capabilitiesCalls).toHaveLength(1);
    });
  },
);
