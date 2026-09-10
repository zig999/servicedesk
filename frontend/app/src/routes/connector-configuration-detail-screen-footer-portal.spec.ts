import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

import { toast } from "sonner";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import {
  CONFIGURATION_PATH,
  CONNECTOR,
  LOADED_CONFIGURATION,
  UPDATED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  errorResponse,
  jsonResponse,
  parsedPutBody,
  putCallCount,
} from "./connector-configuration-detail-screen.test-support";
import { mountConnectorConfigurationDetailScreenWithFooterSlot } from "./connector-configuration-detail-screen-footer-portal.test-support";
import { CONNECTOR_CONFIGURATION_FORM_ID } from "./connector-configuration-form-fields";

const SAVE_BUTTON = { name: "Save" };
const CANCEL_BUTTON = { name: "Cancel" };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
});

async function mountReadyWithFooterSlot(entries?: readonly string[]): Promise<{
  fetchMock: ReturnType<typeof createFetchStub>;
  configurationField: HTMLTextAreaElement;
  router: Awaited<ReturnType<typeof mountConnectorConfigurationDetailScreenWithFooterSlot>>;
}> {
  const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
  const router = await mountConnectorConfigurationDetailScreenWithFooterSlot(fetchMock, entries);
  const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");
  return { fetchMock, configurationField, router };
}

describe("the save control's form owner survives the footer portal (criterion 1)", () => {
  it("keeps the screen's own form as the Save button's form owner even though the button renders outside that form's DOM subtree", async () => {
    await mountReadyWithFooterSlot();

    const saveButton = screen.getByRole<HTMLButtonElement>("button", SAVE_BUTTON);
    const formOwner = saveButton.form;

    expect(formOwner?.id).toBe(CONNECTOR_CONFIGURATION_FORM_ID);
    expect(formOwner?.contains(saveButton)).toBe(false);
  });
});

describe("activating save with the footer slot present issues the registration for the connector the route names (criterion 2)", () => {
  it("issues a PUT to this connector's own configuration endpoint once the configuration is edited to a materially different value", async () => {
    const { configurationField, fetchMock } = await mountReadyWithFooterSlot();

    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });
    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    const putCall = fetchMock.mock.calls.find(
      ([, init]) => (init?.method ?? "GET").toUpperCase() === "PUT",
    );
    expect(putCall?.[0]).toBe(CONFIGURATION_PATH);
    expect(parsedPutBody(fetchMock)).toEqual({ configuration: UPDATED_CONFIGURATION });
  });
});

describe("a registration answered with the footer slot present states it registered, naming the connector (criterion 3)", () => {
  it("renders the inline Saved. acknowledgement together with this connector's name in the screen's own heading", async () => {
    const { configurationField } = await mountReadyWithFooterSlot();

    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });
    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    expect(await screen.findByText("Saved.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: `Connector ${CONNECTOR}` })).toBeTruthy();
  });
});

describe("no outcome is stated before the registry answers, even with the footer slot present (this task's Notes name an optimistic 'registered' statement on activation as passing every stated criterion; this test is what refuses exactly that candidate)", () => {
  it("states neither a Saved. acknowledgement nor a refusal while the register-connector call is still outstanding, and states Saved. only once it resolves", async () => {
    let resolvePut!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolvePut = resolve;
    });
    const fetchMock = createFetchStub(
      baseHandlers(LOADED_CONFIGURATION, {
        [CONFIGURATION_PATH]: (method) =>
          method === "PUT"
            ? pending
            : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
      }),
    );
    await mountConnectorConfigurationDetailScreenWithFooterSlot(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");
    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    await waitFor(() => {
      expect(screen.getByRole("button", SAVE_BUTTON).hasAttribute("disabled")).toBe(true);
    });
    expect(screen.queryByText("Saved.")).toBeNull();
    expect(toast.error).not.toHaveBeenCalled();

    await act(async () => {
      resolvePut(jsonResponse({ connector: CONNECTOR, configuration: UPDATED_CONFIGURATION }));
    });

    expect(await screen.findByText("Saved.")).toBeTruthy();
  });
});

describe("a refused registration with the footer slot present states that nothing registered and the recognised refusal that answered it (criterion 4)", () => {
  it("states the recognised, distinguishable refusal message and renders no Saved. acknowledgement", async () => {
    const fetchMock = createFetchStub(
      baseHandlers(LOADED_CONFIGURATION, {
        [CONFIGURATION_PATH]: (method) =>
          method === "PUT"
            ? errorResponse("ConnectorConfigurationNotWellFormedError", 422)
            : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
      }),
    );
    await mountConnectorConfigurationDetailScreenWithFooterSlot(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");
    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "This configuration is not syntactically valid JSON.",
      ),
    );
    expect(screen.queryByText("Saved.")).toBeNull();
  });
});

describe("a refusal naming no condition this surface recognises is stated as a generic failure, distinguishably from the recognised refusal above, with the footer slot present (this task's Notes name a passthrough of whatever text the answer held as passing every stated criterion; this test, together with the one above, is what refuses exactly that candidate)", () => {
  it("falls back to the generic failure message and renders no Saved. acknowledgement", async () => {
    const fetchMock = createFetchStub(
      baseHandlers(LOADED_CONFIGURATION, {
        [CONFIGURATION_PATH]: (method) =>
          method === "PUT"
            ? errorResponse("SomeUpstreamRefusal", 500)
            : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
      }),
    );
    await mountConnectorConfigurationDetailScreenWithFooterSlot(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");
    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong while saving this connector configuration. Try again.",
      ),
    );
    expect(screen.queryByText("Saved.")).toBeNull();
  });
});

describe("activating abandon with the footer slot present issues no registration, even after an edit (criterion 5)", () => {
  it("issues no PUT to the connector configuration endpoint, even after the configuration was edited", async () => {
    const { configurationField, fetchMock } = await mountReadyWithFooterSlot();
    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    fireEvent.click(screen.getByRole("button", CANCEL_BUTTON));

    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe("activating abandon with the footer slot present returns to the screen the authoring was opened from (criterion 5)", () => {
  it("navigates back to the origin surface rather than a fixed destination", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    const router = await mountConnectorConfigurationDetailScreenWithFooterSlot(fetchMock, [
      "/origin-surface",
      `/connectors/${CONNECTOR}`,
    ]);
    await screen.findByLabelText("Configuration");

    fireEvent.click(screen.getByRole("button", CANCEL_BUTTON));

    await waitFor(() => expect(router.state.location.pathname).toBe("/origin-surface"));
  });
});

describe("activating abandon with the footer slot present falls back to the listing with no surface to return to (this task's Notes name doing nothing instead as passing every stated criterion; this test is what refuses exactly that candidate)", () => {
  it("navigates to /connectors when the authoring surface was reached with no earlier history entry", async () => {
    const { router } = await mountReadyWithFooterSlot();

    fireEvent.click(screen.getByRole("button", CANCEL_BUTTON));

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors"));
  });
});
