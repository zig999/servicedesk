import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  SIMULATE_CASE_PATH,
  SLUG,
  VERSION,
  fillSubjectReadyInView,
  inconclusiveHypothesisEvaluation,
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

async function mountReady(): Promise<void> {
  await mountReadyView({ slug: SLUG, version: VERSION, state: readyState() });
  await fillSubjectReadyInView();
  await waitFor(() =>
    expect(screen.getByRole("button", { name: /Simulate case/ }).hasAttribute("disabled")).toBe(
      false,
    ),
  );
}

function rowElements(): readonly HTMLElement[] {
  return screen.getAllByRole("button").filter((element) => element.tagName === "TR");
}

describe("CaseSimulationReadyView -- selecting a hypothesis opens Detail for whichever run produced its evaluation (criterion 4)", () => {
  it("opens the Detail region for a hypothesis's evaluation from a completed full-case run", async () => {
    stubFetch({ [SIMULATE_CASE_PATH]: () => jsonResponse(simulateCaseResult()) });
    await mountReady();

    fireEvent.click(screen.getByRole("button", { name: /Simulate case/ }));
    await screen.findByText("Case result");

    fireEvent.click(rowElements()[0]);

    expect(screen.getByRole("heading", { level: 3, name: "hypothesis-a" })).toBeTruthy();
    expect(screen.getByText("confirmed")).toBeTruthy();
    expect(
      screen.getByText("The customer disputes a charge the account never authorized."),
    ).toBeTruthy();
  });

  it("opens the Detail region for a hypothesis's evaluation from a single-hypothesis run, exactly as it would from a full-case run", async () => {
    stubFetch({
      [simulateHypothesisPath(SLUG, VERSION)]: () =>
        jsonResponse(simulateHypothesisResult(inconclusiveHypothesisEvaluation("hypothesis-a"))),
    });
    await mountReady();

    const simulateRowButton = screen.getByRole("button", {
      name: "Simulate hypothesis at position 1",
    });
    fireEvent.click(simulateRowButton);
    await waitFor(() => expect(simulateRowButton.hasAttribute("disabled")).toBe(false));

    fireEvent.click(rowElements()[0]);

    expect(screen.getByRole("heading", { level: 3, name: "hypothesis-a" })).toBeTruthy();
    expect(screen.getByText("inconclusive")).toBeTruthy();
  });

  it("keeps showing the placeholder message for a selected hypothesis that has not produced an evaluation this session, even though it was clicked", async () => {
    stubFetch();
    await mountReady();

    fireEvent.click(rowElements()[1]);

    expect(
      screen.getByText("Select a hypothesis with a result to see its detail."),
    ).toBeTruthy();
    expect(screen.queryByRole("heading", { level: 3, name: "hypothesis-b" })).toBeNull();
  });
});
