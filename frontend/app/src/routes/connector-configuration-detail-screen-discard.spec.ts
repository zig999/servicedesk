import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  LOADED_CONFIGURATION,
  UPDATED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  mountConnectorConfigurationDetailScreen,
  prettyPrinted,
  putCallCount,
} from "./connector-configuration-detail-screen.test-support";

// Proof for task/connector-capability-detail-editing/connector-configuration-detail-route's own
// criterion 5 (the discard-changes control), the disclosed inference that "originally loaded
// values" moves to what was just saved once a save succeeds, and the disclosed inference that
// discard needs no confirmation step. Criteria 1/3/6/8 live in
// connector-configuration-detail-screen.spec.ts and criterion 4/7's save behavior lives in
// connector-configuration-detail-screen-save.spec.ts -- split this way to stay under this
// project's own max-lines rule (MNT-01). All three share
// connector-configuration-detail-screen.test-support.ts's own fixtures and mounting helper.

afterEach(() => {
  vi.unstubAllGlobals();
});

async function mountReady(): Promise<{
  fetchMock: ReturnType<typeof createFetchStub>;
  configurationField: HTMLTextAreaElement;
}> {
  const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
  await mountConnectorConfigurationDetailScreen(fetchMock);
  const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");
  return { fetchMock, configurationField };
}

describe("ConnectorConfigurationDetailScreen -- Discard changes (criterion 5)", () => {
  it("disables the Discard control while there is nothing to discard", async () => {
    await mountReady();

    expect(
      screen.getByRole("button", { name: "Discard changes" }).hasAttribute("disabled"),
    ).toBe(true);
  });

  it("enables Discard once the configuration is edited, and resets the field back to its originally loaded value when clicked, re-disabling Save", async () => {
    const { configurationField } = await mountReady();

    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });
    expect(
      screen.getByRole("button", { name: "Discard changes" }).hasAttribute("disabled"),
    ).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));

    expect(configurationField.value).toBe(prettyPrinted(LOADED_CONFIGURATION));
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
    expect(
      screen.getByRole("button", { name: "Discard changes" }).hasAttribute("disabled"),
    ).toBe(true);
  });

  it("shows no confirmation step before discarding -- the field resets on the same click, with no dialog appearing (disclosed inference)", async () => {
    const { configurationField } = await mountReady();
    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(configurationField.value).toBe(prettyPrinted(LOADED_CONFIGURATION));
  });
});

describe("ConnectorConfigurationDetailScreen -- discard falls back to what was just saved, not the original pre-save value (disclosed inference)", () => {
  it("resets to the just-saved configuration once a save has succeeded, rather than the value loaded before it", async () => {
    const { configurationField, fetchMock } = await mountReady();

    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    await screen.findByText("Saved.");

    fireEvent.change(configurationField, { target: { value: '{"key":"further"}' } });
    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));

    // A value discard plays back through configuration.onChange reaches JsonTextareaField as an
    // externally-loaded value (never through its own handleChange/handleBeautify), so it is
    // reformatted the same way any freshly loaded value is
    // (json-textarea-pretty-print-on-load) -- prettyPrinted(UPDATED_CONFIGURATION) is therefore
    // the correct expectation here, not the raw compact string the operator originally typed.
    // If discard fell back to the original pre-save load instead of what was just saved, this
    // would read prettyPrinted(LOADED_CONFIGURATION) instead.
    expect(configurationField.value).toBe(prettyPrinted(UPDATED_CONFIGURATION));
  });
});
