import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  SIMULATE_CASE_PATH,
  SLUG,
  VERSION,
  bodySubject,
  errorResponse,
  fillSubjectReadyInView,
  inconclusiveCaseEvaluation,
  jsonResponse,
  mountReadyView,
  readyState,
  simulateCaseResult,
  simulateHypothesisPath,
  simulateHypothesisResult,
  stubFetch,
} from "./case-simulation-ready-view.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function countCallsTo(fetchMock: { mock: { calls: unknown[][] } }, path: string): number {
  return fetchMock.mock.calls.filter(([input]) => {
    const url = typeof input === "string" ? input : String(input);
    return url === path;
  }).length;
}

async function mountReady(): Promise<void> {
  await mountReadyView({ slug: SLUG, version: VERSION, state: readyState() });
  await fillSubjectReadyInView();
  await waitFor(() =>
    expect(screen.getByRole("button", { name: /Simulate case/ }).hasAttribute("disabled")).toBe(
      false,
    ),
  );
}

describe("CaseSimulationReadyView -- disabled while a dispatch is already in flight, across the header and the table together (criterion 2)", () => {
  it("disables the header's own action and every row's own action while a case-level dispatch is in flight, re-enabling both once it settles", async () => {
    let resolveFetch: ((response: Response) => void) | undefined;
    const pending = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    stubFetch({ [SIMULATE_CASE_PATH]: () => pending });
    await mountReady();

    fireEvent.click(screen.getByRole("button", { name: /Simulate case/ }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Simulate case/ }).hasAttribute("disabled")).toBe(
        true,
      ),
    );
    for (const button of screen.getAllByRole("button", {
      name: /Simulate hypothesis at position/,
    })) {
      expect(button.hasAttribute("disabled")).toBe(true);
    }

    resolveFetch?.(jsonResponse(simulateCaseResult()));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Simulate case/ }).hasAttribute("disabled")).toBe(
        false,
      ),
    );
  });

  it("issues no second request when the header's own Simulate case action is clicked again while one is still in flight", async () => {
    let resolveFetch: ((response: Response) => void) | undefined;
    const pending = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    const fetchMock = stubFetch({ [SIMULATE_CASE_PATH]: () => pending });
    await mountReady();
    const callsBeforeClick = countCallsTo(fetchMock, SIMULATE_CASE_PATH);

    const button = screen.getByRole("button", { name: /Simulate case/ });
    fireEvent.click(button);
    await waitFor(() => expect(button.hasAttribute("disabled")).toBe(true));
    fireEvent.click(button);

    const callsAfterClick = countCallsTo(fetchMock, SIMULATE_CASE_PATH);
    expect(callsAfterClick).toBe(callsBeforeClick + 1);

    resolveFetch?.(jsonResponse(simulateCaseResult()));
    await waitFor(() => expect(button.hasAttribute("disabled")).toBe(false));
  });
});

describe("CaseSimulationReadyView -- both dispatches read the one subject the Subject region shows (criterion 3)", () => {
  it("dispatches the row's own Simulate action carrying exactly the account-id value just typed into the Subject region", async () => {
    let capturedSubject: unknown;
    stubFetch({
      [simulateHypothesisPath(SLUG, VERSION)]: (_method, body) => {
        capturedSubject = bodySubject(body);
        return jsonResponse(simulateHypothesisResult());
      },
    });
    await mountReady();

    fireEvent.click(screen.getByRole("button", { name: "Simulate hypothesis at position 1" }));

    await waitFor(() => expect(capturedSubject).toBeDefined());
    expect(capturedSubject).toEqual({
      type: "billing-dispute",
      attributes: [{ attribute: "account-id", value: "acct-1" }],
    });
  });
});

describe("CaseSimulationReadyView -- only a completed full-case run populates the Case result region (criterion 5)", () => {
  it("shows no Case result region after a completed single-hypothesis run", async () => {
    stubFetch({
      [simulateHypothesisPath(SLUG, VERSION)]: () => jsonResponse(simulateHypothesisResult()),
    });
    await mountReady();

    fireEvent.click(screen.getByRole("button", { name: "Simulate hypothesis at position 1" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Simulate hypothesis at position 1" }).hasAttribute(
          "disabled",
        ),
      ).toBe(false),
    );
    expect(screen.queryByText("Case result")).toBeNull();
  });

  it("shows the Case result region after a completed full-case run", async () => {
    stubFetch({ [SIMULATE_CASE_PATH]: () => jsonResponse(simulateCaseResult()) });
    await mountReady();

    fireEvent.click(screen.getByRole("button", { name: /Simulate case/ }));

    expect(await screen.findByText("Case result")).toBeTruthy();
  });
});

describe("CaseSimulationReadyView -- the error banner reflects only a dispatch failure, never a returned verdict (criterion 7)", () => {
  it("shows the dispatch-error banner after a case-level operation failure", async () => {
    stubFetch({ [SIMULATE_CASE_PATH]: () => errorResponse("SomeUpstreamError", 500) });
    await mountReady();

    fireEvent.click(screen.getByRole("button", { name: /Simulate case/ }));

    expect(await screen.findByRole("alert")).toBeTruthy();
  });

  it("shows no error banner after a completed full-case run that resolved every hypothesis inconclusive", async () => {
    stubFetch({
      [SIMULATE_CASE_PATH]: () =>
        jsonResponse(
          simulateCaseResult({
            evaluations: [inconclusiveCaseEvaluation("hypothesis-a"), inconclusiveCaseEvaluation("hypothesis-b")],
          }),
        ),
    });
    await mountReady();

    fireEvent.click(screen.getByRole("button", { name: /Simulate case/ }));

    await screen.findByText("Case result");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
