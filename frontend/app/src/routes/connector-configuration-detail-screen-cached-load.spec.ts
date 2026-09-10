import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  CONFIGURATION_PATH,
  CONNECTOR,
  INVALID_CONFIGURATION,
  LOADED_CONFIGURATION,
  UPDATED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  mountConnectorConfigurationDetailScreen,
  prettyPrinted,
} from "./connector-configuration-detail-screen.test-support";

const INVALID_CONFIGURATION_WARNING =
  "This connector configuration's stored value must be a JSON object. Correct it before Save can succeed.";

const PLACEHOLDER_CONFIGURATION = '{"address":"https://api.example.com/${subject:account-id}"}';

afterEach(() => {
  vi.unstubAllGlobals();
});

function pendingResponse(): Promise<Response> {
  return new Promise<Response>(() => {
    // Never settles: the further read of the same configuration stays outstanding for the
    // whole test.
  });
}

async function openDiscardDialog(): Promise<void> {
  fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
  await screen.findByRole("dialog");
}

function discardConfirmButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Discard changes" });
}

describe("ConnectorConfigurationDetailScreen -- an answer already held by the client at the screen's first render (criterion 1; demonstrates a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding; UNDERDETERMINED note 2)", () => {
  it("presents the connector name and the configuration exactly as the held answer carries them, and states nothing to the effect the configuration is still being read, while a further read of the same configuration remains outstanding underneath -- an implementation that leaves the fields at their loading defaults, or that states the still-being-read condition alongside the held answer, would fail this", async () => {
    const fetchMock = createFetchStub(
      baseHandlers(LOADED_CONFIGURATION, { [CONFIGURATION_PATH]: pendingResponse }),
    );

    await mountConnectorConfigurationDetailScreen(fetchMock, undefined, {
      connector: CONNECTOR,
      configuration: LOADED_CONFIGURATION,
    });

    expect(screen.getByLabelText<HTMLInputElement>("Connector").value).toBe(CONNECTOR);
    expect(screen.getByLabelText<HTMLTextAreaElement>("Configuration").value).toBe(
      prettyPrinted(LOADED_CONFIGURATION),
    );
    expect(screen.queryByText(`Loading connector configuration ${CONNECTOR}…`)).toBeNull();
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Discard changes" })).toBeTruthy();
  });
});

describe("ConnectorConfigurationDetailScreen -- an already-held well-formed configuration states no malformed-configuration condition (criterion 3)", () => {
  it("shows the configuration exactly as held and no malformed-configuration warning, at the screen's first render", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));

    await mountConnectorConfigurationDetailScreen(fetchMock, undefined, {
      connector: CONNECTOR,
      configuration: LOADED_CONFIGURATION,
    });

    expect(screen.getByLabelText<HTMLTextAreaElement>("Configuration").value).toBe(
      prettyPrinted(LOADED_CONFIGURATION),
    );
    expect(screen.queryByText(INVALID_CONFIGURATION_WARNING)).toBeNull();
  });
});

describe("ConnectorConfigurationDetailScreen -- an already-held answer with no edit offers no discard and no register act (criterion 4; demonstrates a-presented-connector-configuration-with-no-edit-offers-no-discard-and-no-submission)", () => {
  it("disables Save and Discard changes at the screen's first render, before the operator has touched any field -- an implementation whose dirtiness baseline is not seeded from the held answer would enable one or both", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));

    await mountConnectorConfigurationDetailScreen(fetchMock, undefined, {
      connector: CONNECTOR,
      configuration: LOADED_CONFIGURATION,
    });

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
    expect(
      screen.getByRole("button", { name: "Discard changes" }).hasAttribute("disabled"),
    ).toBe(true);
  });
});

describe("ConnectorConfigurationDetailScreen -- discarding an edit made over an already-held answer returns exactly to that answer (criterion 5)", () => {
  it("returns the configuration field to exactly what the held answer carried, once the operator edits it and confirms Discard", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));

    await mountConnectorConfigurationDetailScreen(fetchMock, undefined, {
      connector: CONNECTOR,
      configuration: LOADED_CONFIGURATION,
    });
    const configurationField = screen.getByLabelText<HTMLTextAreaElement>("Configuration");

    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });
    await openDiscardDialog();
    fireEvent.click(discardConfirmButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(configurationField.value).toBe(prettyPrinted(LOADED_CONFIGURATION));
  });
});

describe("ConnectorConfigurationDetailScreen -- the test surface derives its subject attributes from the held answer's own configuration (criterion 6)", () => {
  it("names the added Attribute row after the placeholder embedded in the held answer's configuration", async () => {
    const fetchMock = createFetchStub(baseHandlers(PLACEHOLDER_CONFIGURATION));

    await mountConnectorConfigurationDetailScreen(fetchMock, undefined, {
      connector: CONNECTOR,
      configuration: PLACEHOLDER_CONFIGURATION,
    });

    fireEvent.click(screen.getByRole("button", { name: "Add attribute" }));

    expect(screen.getByLabelText<HTMLInputElement>("Attribute").value).toBe("account-id");
  });
});

describe("ConnectorConfigurationDetailScreen -- discard returns to the surface's own later read rather than to the answer first held (UNDERDETERMINED note 4)", () => {
  it("returns the configuration to what the surface's own further read most recently answered, once that read has landed with different content, rather than to the answer the screen was first presented holding -- an implementation that always discards back to the first-held answer, regardless of a later read, would fail this", async () => {
    const SUPERSEDING_CONFIGURATION = '{"key":"superseded"}';
    const fetchMock = createFetchStub(baseHandlers(SUPERSEDING_CONFIGURATION));

    await mountConnectorConfigurationDetailScreen(fetchMock, undefined, {
      connector: CONNECTOR,
      configuration: LOADED_CONFIGURATION,
    });
    const configurationField = screen.getByLabelText<HTMLTextAreaElement>("Configuration");

    await waitFor(() =>
      expect(configurationField.value).toBe(prettyPrinted(SUPERSEDING_CONFIGURATION)),
    );

    fireEvent.change(configurationField, { target: { value: '{"key":"further-edit"}' } });
    await openDiscardDialog();
    fireEvent.click(discardConfirmButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(configurationField.value).toBe(prettyPrinted(SUPERSEDING_CONFIGURATION));
  });
});

describe("ConnectorConfigurationDetailScreen -- an already-held configuration that is not well-formed JSON is still stated as such (UNDERDETERMINED note 5)", () => {
  it("states the malformed-configuration warning for a held answer whose configuration is not well-formed JSON object text, distinguishably from the load-error reading -- an implementation staying silent about it, or stating it indistinguishably from an outstanding, failed, refused or returned reading, would fail this", async () => {
    const fetchMock = createFetchStub(baseHandlers(INVALID_CONFIGURATION));

    await mountConnectorConfigurationDetailScreen(fetchMock, undefined, {
      connector: CONNECTOR,
      configuration: INVALID_CONFIGURATION,
    });

    expect(screen.getByText(INVALID_CONFIGURATION_WARNING)).toBeTruthy();
    expect(screen.queryByText(`Loading connector configuration ${CONNECTOR}…`)).toBeNull();
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });
});
