import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  CONCEPTS_PATH,
  baseHandlers,
  capabilityPutPath,
  createFetchStub,
  errorResponse,
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

describe("CapabilityCreateScreen -- the route to the capabilities listing renders while the concept read is outstanding (criterion 4)", () => {
  it("renders a Capabilities link addressed at the listing while the concept vocabulary is still loading", async () => {
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => new Promise<Response>(() => {}),
    });
    await mountCapabilityCreateScreen(fetchMock);

    await screen.findByText("Loading…");
    expect(screen.getByRole("link", { name: "Capabilities" }).getAttribute("href")).toBe(
      "/capabilities",
    );
  });
});

describe("CapabilityCreateScreen -- the route to the capabilities listing renders once the concept read has failed (criterion 5)", () => {
  it("renders the Capabilities link beside Retry once the concept vocabulary fails to load", async () => {
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    await mountCapabilityCreateScreen(fetchMock);

    await screen.findByRole("button", { name: "Retry" });
    expect(screen.getByRole("link", { name: "Capabilities" }).getAttribute("href")).toBe(
      "/capabilities",
    );
  });
});

describe("CapabilityCreateScreen -- the route to the capabilities listing renders once the surface is ready to author (criterion 6)", () => {
  it("renders the Capabilities link once the concept vocabulary has loaded and the form is ready", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityCreateScreen(fetchMock);

    await screen.findByLabelText("Connector");
    expect(screen.getByRole("link", { name: "Capabilities" }).getAttribute("href")).toBe(
      "/capabilities",
    );
  });
});

describe("CapabilityCreateScreen -- taking the route to the capabilities listing registers nothing (criterion 7)", () => {
  it("navigates to the capabilities listing when Capabilities is clicked, issuing no PUT even with a valid form filled in", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [capabilityPutPath(NAME, VERSION)]: () => jsonResponse({ name: NAME, version: VERSION }),
      }),
    );
    const router = await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ name: NAME, version: VERSION });

    fireEvent.click(screen.getByRole("link", { name: "Capabilities" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe("CapabilityCreateScreen -- the route to the capabilities listing is not dropped while a save is pending (UNDERDETERMINED, from the specification)", () => {
  it("keeps the Capabilities link rendered while a save is pending -- an implementation offering the route on only the three readings the criteria name, and dropping it on every other reading, would fail this", async () => {
    let resolvePut!: (response: Response) => void;
    const pendingPut = new Promise<Response>((resolve) => {
      resolvePut = resolve;
    });
    const fetchMock = createFetchStub(
      baseHandlers({
        [capabilityPutPath(NAME, VERSION)]: () => pendingPut,
      }),
    );
    const router = await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ name: NAME, version: VERSION });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true),
    );

    expect(screen.getByRole("link", { name: "Capabilities" }).getAttribute("href")).toBe(
      "/capabilities",
    );

    resolvePut(jsonResponse({ name: NAME, version: VERSION }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(`/capabilities/${NAME}/${VERSION}`),
    );
  });
});
