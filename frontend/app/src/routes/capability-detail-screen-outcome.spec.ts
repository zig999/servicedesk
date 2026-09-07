import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

import { toast } from "sonner";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  CAPABILITY_PATH,
  LOADED_CAPABILITY,
  baseHandlers,
  createFetchStub,
  errorResponse,
  jsonResponse,
  mountCapabilityDetailScreen,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
});

describe("CapabilityDetailScreen -- a refused save states a distinguishable outcome to the operator (criterion 4)", () => {
  it("shows the registry's own distinguishable refusal message when the edit is refused", async () => {
    const fetchMock = createFetchStub(
      baseHandlers(undefined, undefined, {
        [CAPABILITY_PATH]: (method) =>
          method === "PUT"
            ? errorResponse("CapabilityNotReadOnlyError", 422)
            : jsonResponse(LOADED_CAPABILITY),
      }),
    );
    await mountCapabilityDetailScreen(fetchMock);
    const connectorField = await screen.findByLabelText<HTMLInputElement>("Connector");
    fireEvent.change(connectorField, { target: { value: "a-different-connector" } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "This capability's declared nature is not read-only; the registry only accepts read-only capabilities.",
      ),
    );
  });

  it("falls back to a generic message for a refusal this surface does not recognise", async () => {
    const fetchMock = createFetchStub(
      baseHandlers(undefined, undefined, {
        [CAPABILITY_PATH]: (method) =>
          method === "PUT"
            ? errorResponse("SomeUpstreamRefusal", 500)
            : jsonResponse(LOADED_CAPABILITY),
      }),
    );
    await mountCapabilityDetailScreen(fetchMock);
    const connectorField = await screen.findByLabelText<HTMLInputElement>("Connector");
    fireEvent.change(connectorField, { target: { value: "a-different-connector" } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong while saving this capability. Try again.",
      ),
    );
  });
});
