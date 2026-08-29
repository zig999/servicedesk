import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  CONCEPT_OPTIONS_PATH,
  capabilitiesPage,
  conceptOptionsPage,
  createCapabilitiesFetchStub,
  jsonResponse,
  mountCapabilitiesScreen,
} from "./capabilities-browser-screen.test-support";
import { baseHandlers, createFetchStub, mountCapabilityDetailScreen } from "./capability-detail-screen.test-support";

// Proof for task/capability-output-schema-guidance/output-schema-field-guidance's own criteria
// 1, 2, 3 and 4 -- the guidance renders in both compositions of CapabilityFormFields (the
// dialog, and the routed detail screen) and states what the platform reads and what a
// description may say. Criteria 5 and 6 (JsonTextareaField unchanged for its other consumers;
// the guidance enforces nothing) are not independently tested: criterion 5 is a claim about
// which files this task did not open, verified by reading the diff rather than by a test that
// could observe no difference either way; criterion 6 already holds for every existing schema
// test in capabilities-browser-screen-capability-form-schema.spec.ts and
// capability-detail-screen-save.spec.ts, none of which fills a description into any property
// and all of which still save successfully -- a new test asserting the same absence would
// restate what those suites already exercise. Split into its own file rather than folded into
// either sibling suite, since it is the one guidance both compositions share.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityFormFields — the dialog shows the output_schema field-semantics guidance (criterion 1)", () => {
  it("renders guidance beside the Output schema editor naming type and description as what the platform reads", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("No capabilities are currently registered.");
    fireEvent.click(screen.getByRole("button", { name: "New capability" }));
    const dialog = await screen.findByRole("dialog");
    await within(dialog).findByLabelText("Name");

    const guidance = findGuidanceParagraph(dialog);
    expect(guidance).toBeTruthy();
    expect(guidance?.textContent).toMatch(/no other content of this schema is read or validated/i);
  });
});

describe("CapabilityFormFields — the guidance states a description says meaning, never a decision (criterion 3, disclosed inference)", () => {
  it("contrasts a meaning example against a decision example in the same paragraph", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("No capabilities are currently registered.");
    fireEvent.click(screen.getByRole("button", { name: "New capability" }));
    const dialog = await screen.findByRole("dialog");
    await within(dialog).findByLabelText("Name");

    const guidance = findGuidanceParagraph(dialog);
    expect(guidance?.textContent).toContain("2 = suspended for delinquency");
    expect(guidance?.textContent).toContain("when 2, confirm the hypothesis");
  });
});

describe("CapabilityFormFields — the routed detail screen shows the same guidance at its output_schema editor (criterion 2)", () => {
  it("renders the same guidance text beside the routed screen's own Output schema editor", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Output schema");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance).toBeTruthy();
    expect(guidance?.textContent).toMatch(/no other content of this schema is read or validated/i);
  });
});

/** The guidance's own text is split across plain text and `<code>` elements, so a plain
 * getByText string/regex match (which looks for one node's own contiguous text) cannot find it
 * -- this walks every `<p>` and checks its full `textContent` (which does concatenate across
 * child elements) instead, the officially recommended pattern for text split by markup. */
function findGuidanceParagraph(container: HTMLElement): HTMLElement | null {
  return (
    Array.from(container.querySelectorAll("p")).find((p) =>
      /the platform reads its own/i.test(p.textContent ?? ""),
    ) ?? null
  );
}
