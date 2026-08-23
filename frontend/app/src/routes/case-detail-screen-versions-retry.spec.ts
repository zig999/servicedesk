import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  createFetchStub,
  mountCaseDetailScreen,
  VERSIONS_PATH,
} from "./case-hypotheses-tab.test-support";

// task/case-authoring-console/every-load-error-offers-retry's own criterion 2 (Case
// Detail's Versions tab) plus the two cross-cutting behaviors this task's own record
// asks every one of its three retry controls to satisfy: exactly one more request per
// Retry click, and a second failure following Retry still leaving the Retry control in
// place rather than getting the screen stuck. Split into its own sibling file (rather
// than added to case-detail-screen.spec.ts, already at 243 lines and close enough to
// this project's own three-hundred-line MNT-01 cap that four more assertions would
// cross it) mirroring case-detail-screen-hypotheses-tab.spec.ts's own established
// precedent for splitting this exact screen's proof by concern. Reuses
// case-hypotheses-tab.test-support.ts's own mountCaseDetailScreen and createFetchStub --
// the same fixtures case-detail-screen-hypotheses-tab.spec.ts already mounts this exact
// screen with, and the same VERSIONS_PATH it stubs.

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseDetailScreen's Versions tab retry control (criterion 2)", () => {
  it("re-issues GET /v1/cases/{slug}/versions when Retry is clicked, rendering the version list once that retry succeeds", async () => {
    let versionsCallCount = 0;
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => {
        versionsCallCount += 1;
        if (versionsCallCount === 1) {
          throw new Error("network down");
        }
        return jsonResponse({ data: [{ version: 1, state: "draft" }] });
      },
    });

    await mountCaseDetailScreen(fetchMock);

    expect(await screen.findByText("Unable to load this case's version timeline.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByRole("table")).toBeTruthy();
    expect(screen.queryByText("Unable to load this case's version timeline.")).toBeNull();
    expect(versionsCallCount).toBe(2);
  });
});

describe("CaseDetailScreen's Versions tab retry control (criterion 4)", () => {
  it("issues no request other than GET /v1/cases/{slug}/versions when Retry is clicked", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => {
        throw new Error("network down");
      },
    });

    await mountCaseDetailScreen(fetchMock);
    await screen.findByText("Unable to load this case's version timeline.");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    for (const call of fetchMock.mock.calls) {
      const url = typeof call[0] === "string" ? call[0] : call[0].toString();
      expect(url).toBe(VERSIONS_PATH);
    }
  });
});

describe("CaseDetailScreen's Versions tab retry control -- exactly one more request", () => {
  it("issues exactly one more request per Retry click, never zero and never more than one", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => {
        throw new Error("network down");
      },
    });

    await mountCaseDetailScreen(fetchMock);
    await screen.findByText("Unable to load this case's version timeline.");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});

describe("CaseDetailScreen's Versions tab retry control -- repeated failure", () => {
  it("still shows the failure message and Retry control after a second failure following Retry, rather than getting stuck", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => {
        throw new Error("network down");
      },
    });

    await mountCaseDetailScreen(fetchMock);
    await screen.findByText("Unable to load this case's version timeline.");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    expect(screen.getByText("Unable to load this case's version timeline.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(screen.queryByText("Loading version timeline…")).toBeNull();
  });
});
