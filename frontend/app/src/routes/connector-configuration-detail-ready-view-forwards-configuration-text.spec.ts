import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  mountConnectorConfigurationDetailScreen,
  putCallCount,
} from "./connector-configuration-detail-screen.test-support";

const CONFIGURATION_WITH_ACCOUNT_ID_PLACEHOLDER =
  '{"address":"https://api.example.com/${subject:account-id}"}';
const CONFIGURATION_WITH_REGION_PLACEHOLDER =
  '{"address":"https://api.example.com/${subject:region}"}';

afterEach(() => {
  vi.unstubAllGlobals();
});

function attributeNames(): readonly string[] {
  return screen
    .queryAllByLabelText<HTMLInputElement>("Attribute")
    .map((input) => input.value);
}

function clickAddAttribute(): void {
  fireEvent.click(screen.getByRole("button", { name: "Add attribute" }));
}

describe("ConnectorConfigurationDetailReadyView — Add attribute reconciles against the registered configuration text, not an unsaved edit (criterion 3)", () => {
  it("keeps reconciling against the last registered text after Configuration is edited but not saved", async () => {
    const fetchMock = createFetchStub(baseHandlers(CONFIGURATION_WITH_ACCOUNT_ID_PLACEHOLDER));
    await mountConnectorConfigurationDetailScreen(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");

    clickAddAttribute();
    expect(attributeNames()).toEqual(["account-id"]);

    fireEvent.change(configurationField, {
      target: { value: CONFIGURATION_WITH_REGION_PLACEHOLDER },
    });

    clickAddAttribute();

    expect(attributeNames()).toEqual(["account-id"]);
  });
});

describe("ConnectorConfigurationDetailReadyView — Add attribute reconciles against the just-saved configuration text once a save lands (criterion 4)", () => {
  it("reconciles against the newly saved text the next time Add attribute is clicked after a successful save", async () => {
    const fetchMock = createFetchStub(baseHandlers(CONFIGURATION_WITH_ACCOUNT_ID_PLACEHOLDER));
    await mountConnectorConfigurationDetailScreen(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");

    clickAddAttribute();
    expect(attributeNames()).toEqual(["account-id"]);

    fireEvent.change(configurationField, {
      target: { value: CONFIGURATION_WITH_REGION_PLACEHOLDER },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    await screen.findByText("Saved.");

    clickAddAttribute();

    expect(attributeNames()).toEqual(["region"]);
  });
});
