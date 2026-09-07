import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

import { toast } from "sonner";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  CONFIGURATION_PATH,
  CONNECTOR,
  LOADED_CONFIGURATION,
  UPDATED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  errorResponse,
  jsonResponse,
  mountConnectorConfigurationDetailScreen,
} from "./connector-configuration-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
});

describe("ConnectorConfigurationDetailScreen -- a successful save states its outcome only through the pre-existing inline status, never a second toast (disclosed inference)", () => {
  it("saves successfully with no toast call at all -- a stray toast.success on this surface would throw against this file's own sonner stub, which declares no success function", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");
    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Saved.")).toBeTruthy();
    expect(toast.error).not.toHaveBeenCalled();
  });
});

describe("ConnectorConfigurationDetailScreen -- a refused save states a distinguishable outcome to the operator (criterion 4)", () => {
  it("shows the registry's own distinguishable refusal message when the edit is refused as not well-formed", async () => {
    const fetchMock = createFetchStub(
      baseHandlers(LOADED_CONFIGURATION, {
        [CONFIGURATION_PATH]: (method) =>
          method === "PUT"
            ? errorResponse("ConnectorConfigurationNotWellFormedError", 422)
            : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
      }),
    );
    await mountConnectorConfigurationDetailScreen(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");
    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "This configuration is not syntactically valid JSON.",
      ),
    );
  });

  it("falls back to a generic message for a refusal this surface does not recognise", async () => {
    const fetchMock = createFetchStub(
      baseHandlers(LOADED_CONFIGURATION, {
        [CONFIGURATION_PATH]: (method) =>
          method === "PUT"
            ? errorResponse("SomeUpstreamRefusal", 500)
            : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
      }),
    );
    await mountConnectorConfigurationDetailScreen(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");
    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong while saving this connector configuration. Try again.",
      ),
    );
  });
});
