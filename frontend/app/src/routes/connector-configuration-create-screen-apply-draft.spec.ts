import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  createFetchStub,
  jsonResponse,
  mountConnectorConfigurationCreateScreen,
  putCallCount,
} from "./connector-configuration-create-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const DRAFT_ENDPOINT_PATH = "/v1/draft-connector-configuration-from-openapi";
const CONNECTOR_NAME = "deepl-connector";
const WELL_FORMED_APPLIED_TEXT = JSON.stringify({ distinctive: true }, null, 2);
const NOT_AN_OBJECT_APPLIED_TEXT = "42";

function draftResponse(configurationText: string): Response {
  return jsonResponse({
    connector: CONNECTOR_NAME,
    configuration: configurationText,
    unresolved: [],
    generated_credentials: [],
  });
}

async function fillHelperRequestFields(): Promise<void> {
  fireEvent.change(await screen.findByLabelText<HTMLInputElement>("Connector"), {
    target: { value: CONNECTOR_NAME },
  });
  fireEvent.change(screen.getByLabelText("OpenAPI document link"), {
    target: { value: "https://api.example.com/openapi.json" },
  });
  fireEvent.change(screen.getByLabelText("Operation path"), { target: { value: "/v2/translate" } });
  fireEvent.change(screen.getByLabelText("Operation method"), { target: { value: "POST" } });
}

async function applyAnsweredDraft(configurationText: string): Promise<{
  fetchMock: ReturnType<typeof createFetchStub>;
  router: Awaited<ReturnType<typeof mountConnectorConfigurationCreateScreen>>;
}> {
  const fetchMock = createFetchStub({
    [DRAFT_ENDPOINT_PATH]: () => draftResponse(configurationText),
  });
  const router = await mountConnectorConfigurationCreateScreen(fetchMock);

  await fillHelperRequestFields();
  fireEvent.click(screen.getByRole("button", { name: "Request Draft" }));

  await screen.findByRole("button", { name: "Apply" });
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));

  return { fetchMock, router };
}

describe("ConnectorConfigurationCreateScreen -- applying an answered draft writes its configuration text into the Configuration field (criterion 1)", () => {
  it("shows the drafted configuration text in the Configuration field after Apply", async () => {
    await applyAnsweredDraft(WELL_FORMED_APPLIED_TEXT);

    await waitFor(() =>
      expect(screen.getByLabelText<HTMLTextAreaElement>("Configuration").value).toBe(
        WELL_FORMED_APPLIED_TEXT,
      ),
    );
  });
});

describe("ConnectorConfigurationCreateScreen -- applying an answered draft dispatches no save request, so every registered connector configuration stands unchanged (criteria 2 and 3)", () => {
  it("issues no PUT to the registry when Apply is clicked", async () => {
    const { fetchMock } = await applyAnsweredDraft(WELL_FORMED_APPLIED_TEXT);

    await waitFor(() =>
      expect(screen.getByLabelText<HTMLTextAreaElement>("Configuration").value).toBe(
        WELL_FORMED_APPLIED_TEXT,
      ),
    );
    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe("ConnectorConfigurationCreateScreen -- applying an answered draft leaves the operator on the same, unsubmitted surface (criterion 4)", () => {
  it("stays on /connectors/new with the applied text still held rather than submitted", async () => {
    const { router } = await applyAnsweredDraft(WELL_FORMED_APPLIED_TEXT);

    await waitFor(() =>
      expect(screen.getByLabelText<HTMLTextAreaElement>("Configuration").value).toBe(
        WELL_FORMED_APPLIED_TEXT,
      ),
    );
    expect(router.state.location.pathname).toBe("/connectors/new");
  });
});

describe("ConnectorConfigurationCreateScreen -- applying an answered draft leaves the Connector field exactly as it stood (criterion 5)", () => {
  it("keeps the typed connector name unchanged after Apply", async () => {
    await applyAnsweredDraft(WELL_FORMED_APPLIED_TEXT);

    await waitFor(() =>
      expect(screen.getByLabelText<HTMLTextAreaElement>("Configuration").value).toBe(
        WELL_FORMED_APPLIED_TEXT,
      ),
    );
    expect(screen.getByLabelText<HTMLInputElement>("Connector").value).toBe(CONNECTOR_NAME);
  });
});

describe("ConnectorConfigurationCreateScreen -- applying a draft whose text is not a well-formed object leaves Save disabled (criterion 6, recomputed rather than trusted)", () => {
  it("keeps Save disabled after applying non-object JSON text, despite the wiring passing a valid hint", async () => {
    await applyAnsweredDraft(NOT_AN_OBJECT_APPLIED_TEXT);

    await waitFor(() =>
      expect(screen.getByLabelText<HTMLTextAreaElement>("Configuration").value).toBe(
        NOT_AN_OBJECT_APPLIED_TEXT,
      ),
    );
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Save" }).disabled).toBe(true);
  });
});

describe("ConnectorConfigurationCreateScreen -- applying a well-formed draft's text enables Save, recomputed from the drafted content itself (criterion 6, recomputed from real content)", () => {
  it("flips Save from disabled to enabled once a well-formed draft is applied to a field that started invalid and empty", async () => {
    const fetchMock = createFetchStub({
      [DRAFT_ENDPOINT_PATH]: () => draftResponse(WELL_FORMED_APPLIED_TEXT),
    });
    await mountConnectorConfigurationCreateScreen(fetchMock);

    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Save" }).disabled).toBe(true);

    await fillHelperRequestFields();
    fireEvent.click(screen.getByRole("button", { name: "Request Draft" }));
    await screen.findByRole("button", { name: "Apply" });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() =>
      expect(screen.getByRole<HTMLButtonElement>("button", { name: "Save" }).disabled).toBe(false),
    );
  });
});
