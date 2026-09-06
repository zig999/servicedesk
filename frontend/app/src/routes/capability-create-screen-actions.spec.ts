import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseHandlers,
  capabilityPutPath,
  createFetchStub,
  fillValidForm,
  jsonResponse,
  mountCapabilityCreateScreen,
  putCallCount,
} from "./capability-create-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const NAME = "translate-text";
const VERSION = "1.0.0";

describe("CapabilityCreateScreen -- a Cancel control returns to the listing without registering anything (criterion 7, disclosed inference)", () => {
  it("renders Cancel as a link addressed at the capabilities listing", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const cancel = screen.getByRole("link", { name: "Cancel" });
    expect(cancel.getAttribute("href")).toBe("/capabilities");
  });

  it("navigates to the capabilities listing when Cancel is clicked, issuing no PUT", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [capabilityPutPath(NAME, VERSION)]: () => jsonResponse({ name: NAME, version: VERSION }),
      }),
    );
    const router = await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ name: NAME, version: VERSION });

    fireEvent.click(screen.getByRole("link", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe("CapabilityCreateScreen -- offers no Discard control, having read no registration (criterion 6)", () => {
  it("renders no Discard changes control anywhere on the create surface", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    expect(screen.queryByRole("button", { name: "Discard changes" })).toBeNull();
  });
});
