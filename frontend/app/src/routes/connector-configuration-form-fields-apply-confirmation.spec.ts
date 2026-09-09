import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  createFetchStub as createCreateScreenFetchStub,
  jsonResponse,
  mountConnectorConfigurationCreateScreen,
  putCallCount as createScreenPutCallCount,
} from "./connector-configuration-create-screen.test-support";
import {
  CONNECTOR,
  LOADED_CONFIGURATION,
  baseHandlers as detailScreenBaseHandlers,
  createFetchStub as createDetailScreenFetchStub,
  mountConnectorConfigurationDetailScreen,
  prettyPrinted,
  putCallCount as detailScreenPutCallCount,
} from "./connector-configuration-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const DRAFT_ROUTE = "/v1/draft-connector-configuration-from-openapi";

const DRAFTED_CONFIGURATION_TEXT = JSON.stringify(
  { address: "https://api.example.com/v2/translate", distinctive: true },
  null,
  2,
);
const UNSAVED_DETAIL_EDIT_TEXT = JSON.stringify({ key: "unsaved-edit" }, null, 2);
const OPERATOR_TYPED_TEXT = JSON.stringify({ typed: "not-submitted" }, null, 2);

function draftResponse(configurationText: string): Response {
  return jsonResponse({
    connector: CONNECTOR,
    configuration: configurationText,
    unresolved: [],
    generated_credentials: [],
  });
}

async function mountDetailReady(): Promise<{
  fetchMock: ReturnType<typeof createDetailScreenFetchStub>;
  configurationField: HTMLTextAreaElement;
}> {
  const fetchMock = createDetailScreenFetchStub(
    detailScreenBaseHandlers(LOADED_CONFIGURATION, {
      [DRAFT_ROUTE]: () => draftResponse(DRAFTED_CONFIGURATION_TEXT),
    }),
  );
  await mountConnectorConfigurationDetailScreen(fetchMock);
  const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");
  await waitFor(() => expect(configurationField.value).toBe(prettyPrinted(LOADED_CONFIGURATION)));
  return { fetchMock, configurationField };
}

async function mountCreateReady(): Promise<{
  fetchMock: ReturnType<typeof createCreateScreenFetchStub>;
  configurationField: HTMLTextAreaElement;
}> {
  const fetchMock = createCreateScreenFetchStub({
    [DRAFT_ROUTE]: () => draftResponse(DRAFTED_CONFIGURATION_TEXT),
  });
  await mountConnectorConfigurationCreateScreen(fetchMock);
  const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");
  return { fetchMock, configurationField };
}

async function offerDraft(): Promise<void> {
  fireEvent.change(screen.getByLabelText("OpenAPI document link"), {
    target: { value: "https://api.example.com/openapi.json" },
  });
  fireEvent.change(screen.getByLabelText("Operation path"), { target: { value: "/v2/translate" } });
  fireEvent.change(screen.getByLabelText("Operation method"), { target: { value: "POST" } });
  fireEvent.click(screen.getByRole("button", { name: "Request Draft" }));
  await screen.findByRole("button", { name: "Apply" });
}

function clickOuterApply(): void {
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
}

function confirmationDialog(): HTMLElement {
  return screen.getByRole("dialog");
}

function confirmApplyButton(): HTMLElement {
  return within(confirmationDialog()).getByRole("button", { name: "Apply" });
}

function keepEditingButton(): HTMLElement {
  return within(confirmationDialog()).getByRole("button", { name: "Keep editing" });
}

describe("ConnectorConfigurationFormFields -- on the ready detail view, applying a draft over a differing unsaved edit opens a confirmation dialog rather than replacing anything yet (criteria 1 and 6)", () => {
  it("opens a confirmation dialog and leaves the Configuration field's value exactly as the operator left it", async () => {
    const { configurationField } = await mountDetailReady();
    fireEvent.change(configurationField, { target: { value: UNSAVED_DETAIL_EDIT_TEXT } });

    await offerDraft();
    clickOuterApply();

    await screen.findByRole("dialog");
    expect(within(confirmationDialog()).getByText("Apply drafted configuration?")).toBeTruthy();
    expect(configurationField.value).toBe(UNSAVED_DETAIL_EDIT_TEXT);
  });
});

describe("ConnectorConfigurationFormFields -- declining the ready detail view's apply confirmation leaves the unsaved edit untouched (criterion 3)", () => {
  it("keeps the Configuration field's value exactly as it stood, writing none of the draft's text, once Keep editing is clicked", async () => {
    const { configurationField } = await mountDetailReady();
    fireEvent.change(configurationField, { target: { value: UNSAVED_DETAIL_EDIT_TEXT } });
    await offerDraft();
    clickOuterApply();
    await screen.findByRole("dialog");

    fireEvent.click(keepEditingButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(configurationField.value).toBe(UNSAVED_DETAIL_EDIT_TEXT);
  });
});

describe("ConnectorConfigurationFormFields -- confirming the ready detail view's apply replaces the unsaved edit with the draft's configuration text (criterion 4)", () => {
  it("writes the draft's own configuration text into the Configuration field once the dialog's Apply button is clicked", async () => {
    const { configurationField } = await mountDetailReady();
    fireEvent.change(configurationField, { target: { value: UNSAVED_DETAIL_EDIT_TEXT } });
    await offerDraft();
    clickOuterApply();
    await screen.findByRole("dialog");

    fireEvent.click(confirmApplyButton());

    await waitFor(() => expect(configurationField.value).toBe(DRAFTED_CONFIGURATION_TEXT));
  });
});

describe("ConnectorConfigurationFormFields -- on the ready detail view, applying a draft while nothing is unsaved is never refused by the confirmation rule (criterion 5)", () => {
  it("applies the draft immediately, opening no confirmation dialog, when the Configuration field holds no unsaved edit", async () => {
    const { configurationField } = await mountDetailReady();

    await offerDraft();
    clickOuterApply();

    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(configurationField.value).toBe(DRAFTED_CONFIGURATION_TEXT));
  });
});

describe("ConnectorConfigurationFormFields -- on the ready detail view, asking for, declining and confirming the apply confirmation issues no register-connector call (criterion 7)", () => {
  it("issues no PUT to the registry through the whole ask/decline/ask/confirm sequence", async () => {
    const { fetchMock, configurationField } = await mountDetailReady();
    fireEvent.change(configurationField, { target: { value: UNSAVED_DETAIL_EDIT_TEXT } });
    await offerDraft();

    clickOuterApply();
    await screen.findByRole("dialog");
    fireEvent.click(keepEditingButton());
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    clickOuterApply();
    await screen.findByRole("dialog");
    fireEvent.click(confirmApplyButton());
    await waitFor(() => expect(configurationField.value).toBe(DRAFTED_CONFIGURATION_TEXT));

    expect(detailScreenPutCallCount(fetchMock)).toBe(0);
  });
});

describe("ConnectorConfigurationFormFields -- the apply confirmation dialog's own wording and button styling (disclosed inference)", () => {
  it("titles the dialog, describes the unsaved edit it would replace, and styles Apply as destructive against a plain Keep editing", async () => {
    const { configurationField } = await mountDetailReady();
    fireEvent.change(configurationField, { target: { value: UNSAVED_DETAIL_EDIT_TEXT } });
    await offerDraft();
    clickOuterApply();
    await screen.findByRole("dialog");

    const dialog = confirmationDialog();
    expect(within(dialog).getByText("Apply drafted configuration?")).toBeTruthy();
    expect(
      within(dialog).getByText(
        "Applying this drafted configuration will replace the edit you have not saved in the Configuration field. This cannot be undone.",
      ),
    ).toBeTruthy();
    expect(confirmApplyButton().className).toMatch(/destructive/);
    expect(keepEditingButton().className).not.toMatch(/destructive/);
  });
});

describe("ConnectorConfigurationFormFields -- on the create screen, applying a draft over unsubmitted, operator-entered content opens a confirmation dialog rather than replacing anything yet (criteria 2 and 6)", () => {
  it("opens a confirmation dialog and leaves the Configuration field's value exactly as the operator typed it", async () => {
    const { configurationField } = await mountCreateReady();
    fireEvent.change(configurationField, { target: { value: OPERATOR_TYPED_TEXT } });

    await offerDraft();
    clickOuterApply();

    await screen.findByRole("dialog");
    expect(within(confirmationDialog()).getByText("Apply drafted configuration?")).toBeTruthy();
    expect(configurationField.value).toBe(OPERATOR_TYPED_TEXT);
  });
});

describe("ConnectorConfigurationFormFields -- declining the create screen's apply confirmation leaves the operator's typed content untouched (criterion 3)", () => {
  it("keeps the Configuration field's value exactly as typed, writing none of the draft's text, once Keep editing is clicked", async () => {
    const { configurationField } = await mountCreateReady();
    fireEvent.change(configurationField, { target: { value: OPERATOR_TYPED_TEXT } });
    await offerDraft();
    clickOuterApply();
    await screen.findByRole("dialog");

    fireEvent.click(keepEditingButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(configurationField.value).toBe(OPERATOR_TYPED_TEXT);
  });
});

describe("ConnectorConfigurationFormFields -- confirming the create screen's apply replaces the typed content with the draft's configuration text (criterion 4)", () => {
  it("writes the draft's own configuration text into the Configuration field once the dialog's Apply button is clicked", async () => {
    const { configurationField } = await mountCreateReady();
    fireEvent.change(configurationField, { target: { value: OPERATOR_TYPED_TEXT } });
    await offerDraft();
    clickOuterApply();
    await screen.findByRole("dialog");

    fireEvent.click(confirmApplyButton());

    await waitFor(() => expect(configurationField.value).toBe(DRAFTED_CONFIGURATION_TEXT));
  });
});

describe("ConnectorConfigurationFormFields -- on the create screen, applying a draft while the Configuration field is still empty is never refused by the confirmation rule (criterion 5)", () => {
  it("applies the draft immediately, opening no confirmation dialog, when the Configuration field holds no unsubmitted edit", async () => {
    const { configurationField } = await mountCreateReady();

    await offerDraft();
    clickOuterApply();

    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(configurationField.value).toBe(DRAFTED_CONFIGURATION_TEXT));
  });
});

describe("ConnectorConfigurationFormFields -- on the create screen, asking for, declining and confirming the apply confirmation issues no register-connector call (criterion 7)", () => {
  it("issues no PUT to the registry through the whole ask/decline/ask/confirm sequence", async () => {
    const { fetchMock, configurationField } = await mountCreateReady();
    fireEvent.change(configurationField, { target: { value: OPERATOR_TYPED_TEXT } });
    await offerDraft();

    clickOuterApply();
    await screen.findByRole("dialog");
    fireEvent.click(keepEditingButton());
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    clickOuterApply();
    await screen.findByRole("dialog");
    fireEvent.click(confirmApplyButton());
    await waitFor(() => expect(configurationField.value).toBe(DRAFTED_CONFIGURATION_TEXT));

    expect(createScreenPutCallCount(fetchMock)).toBe(0);
  });
});
