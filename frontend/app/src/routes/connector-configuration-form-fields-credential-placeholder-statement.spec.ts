import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  createFetchStub,
  mountConnectorConfigurationCreateScreen,
} from "./connector-configuration-create-screen.test-support";
import {
  CREDENTIAL_PLACEHOLDER_STATEMENTS_HEADING,
  credentialPlaceholderStatementText,
} from "../services/connector-configuration-messages";

afterEach(() => {
  vi.unstubAllGlobals();
});

async function typeConfiguration(text: string): Promise<void> {
  const fetchMock = createFetchStub();
  await mountConnectorConfigurationCreateScreen(fetchMock);
  const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuração");
  fireEvent.change(configurationField, { target: { value: text } });
}

describe(
  "ConnectorConfigurationFormFields -- the credential-placeholder statement names the " +
    "credential, its server-side resolution and that nothing here checks it (criteria 1 through " +
    "3 as rendered, whole)",
  () => {
    it("renders the credential statement naming the placeholder, its server-side resolution at a test or an observation, and that nothing on this surface checks it", async () => {
      await typeConfiguration(
        JSON.stringify({
          method: "POST",
          statusMap: { "200": "ok" },
          responseMap: { id: "value" },
          address: "https://api.example.com/${credential:api-key}",
        }),
      );

      expect(screen.getByText(CREDENTIAL_PLACEHOLDER_STATEMENTS_HEADING)).toBeTruthy();
      expect(screen.getByText(credentialPlaceholderStatementText("api-key"))).toBeTruthy();
    });
  },
);

describe(
  "ConnectorConfigurationFormFields -- no credential-placeholder statement renders where the " +
    "field's own content embeds none",
  () => {
    it("renders no credential-placeholder heading or statement when the Configuration field embeds none", async () => {
      await typeConfiguration(
        JSON.stringify({
          method: "POST",
          statusMap: { "200": "ok" },
          responseMap: { id: "value" },
          address: "https://api.example.com",
        }),
      );

      expect(screen.queryByText(CREDENTIAL_PLACEHOLDER_STATEMENTS_HEADING)).toBeNull();
    });
  },
);

describe(
  "ConnectorConfigurationFormFields -- the credential-placeholder statement carries no claim of " +
    "its own (task's own UNDERDETERMINED entry on withholding submission, refuted)",
  () => {
    it("leaves Save enabled while the credential-placeholder statement stands", async () => {
      await typeConfiguration(
        JSON.stringify({
          method: "POST",
          statusMap: { "200": "ok" },
          responseMap: { id: "value" },
          address: "https://api.example.com/${credential:api-key}",
        }),
      );

      await screen.findByText(credentialPlaceholderStatementText("api-key"));

      expect(screen.getByRole("button", { name: "Salvar" }).hasAttribute("disabled")).toBe(false);
    });
  },
);

describe(
  "ConnectorConfigurationFormFields -- no statement reports a result of having checked whether " +
    "a credential placeholder resolves (criterion 4)",
  () => {
    it("reports no resolution-check result for the credential placeholder beyond the statement's own text", async () => {
      await typeConfiguration(
        JSON.stringify({
          method: "POST",
          statusMap: { "200": "ok" },
          responseMap: { id: "value" },
          address: "https://api.example.com",
          headers: { Authorization: "Bearer ${credential:api-key}" },
        }),
      );

      await screen.findByText(credentialPlaceholderStatementText("api-key"));

      const list = screen
        .getAllByRole("list")
        .find(
          (candidate) =>
            within(candidate).queryByText(credentialPlaceholderStatementText("api-key")) !== null,
        );
      if (list === undefined) {
        throw new Error(
          "credential-placeholder-statement proof: expected a rendered list carrying the credential statement",
        );
      }
      expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    });
  },
);
