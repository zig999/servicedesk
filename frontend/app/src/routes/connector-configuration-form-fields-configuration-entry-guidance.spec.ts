import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  createFetchStub,
  mountConnectorConfigurationCreateScreen,
} from "./connector-configuration-create-screen.test-support";
import {
  CONFIGURATION_ENTRY_GUIDANCE_IS_JSON_OBJECT_MESSAGE,
  CONFIGURATION_ENTRY_GUIDANCE_PLACEHOLDER_FORMS_MESSAGE,
  CONFIGURATION_ENTRY_GUIDANCE_READS_CALL_PARTS_MESSAGE,
  CONFIGURATION_ENTRY_GUIDANCE_READS_KEYS_MESSAGE,
} from "../services/connector-configuration-messages";

afterEach(() => {
  vi.unstubAllGlobals();
});

const WELL_FORMED_CONFIGURATION_TEXT = '{"method":"GET"}';
const NOT_WELL_FORMED_CONFIGURATION_TEXT = "{not valid json";

function guidanceListItems(): string[] {
  const guidanceList = screen.getByRole("list");
  return within(guidanceList)
    .getAllByRole("listitem")
    .map((item) => item.textContent ?? "");
}

describe.each([
  { label: "an empty Configuration field", configurationText: "" },
  { label: "a well-formed JSON object", configurationText: WELL_FORMED_CONFIGURATION_TEXT },
  { label: "not-well-formed JSON text", configurationText: NOT_WELL_FORMED_CONFIGURATION_TEXT },
])(
  "ConnectorConfigurationFormFields -- the Configuration entry's guidance states its four bounded " +
    "claims and no other, unconditionally, over $label (criteria 1, 2, 3, 4, 5 and 6; " +
    "rules/integration/a-connector-configuration-entry-states-what-the-http-connector-reads-from-it)",
  ({ configurationText }) => {
    it("renders exactly the four guidance messages, in that order, as the guidance list's own items", async () => {
      const fetchMock = createFetchStub();
      await mountConnectorConfigurationCreateScreen(fetchMock);
      const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuração");
      fireEvent.change(configurationField, { target: { value: configurationText } });

      expect(guidanceListItems()).toEqual([
        CONFIGURATION_ENTRY_GUIDANCE_IS_JSON_OBJECT_MESSAGE,
        CONFIGURATION_ENTRY_GUIDANCE_READS_KEYS_MESSAGE,
        CONFIGURATION_ENTRY_GUIDANCE_READS_CALL_PARTS_MESSAGE,
        CONFIGURATION_ENTRY_GUIDANCE_PLACEHOLDER_FORMS_MESSAGE,
      ]);
    });
  },
);

describe(
  "ConnectorConfigurationFormFields -- the well-formedness gate on Save stands untouched beside " +
    "the guidance's own unconditional rendering (criterion 6; UNDERDETERMINED note on " +
    "rules/integration/a-connector-configuration-surface-offers-no-submission-while-its-content-is-not-well-formed)",
  () => {
    it("keeps Save disabled while the Configuration field holds text that is not well-formed JSON object text, even though the guidance itself renders in full", async () => {
      const fetchMock = createFetchStub();
      await mountConnectorConfigurationCreateScreen(fetchMock);
      fireEvent.change(await screen.findByLabelText<HTMLInputElement>("Conector"), {
        target: { value: "deepl-connector" },
      });
      fireEvent.change(screen.getByLabelText<HTMLTextAreaElement>("Configuração"), {
        target: { value: NOT_WELL_FORMED_CONFIGURATION_TEXT },
      });

      expect(screen.getByRole("button", { name: "Salvar" }).hasAttribute("disabled")).toBe(true);
      expect(guidanceListItems()).toHaveLength(4);
    });
  },
);
