import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  baseHandlers as createScreenBaseHandlers,
  createFetchStub as createCreateScreenFetchStub,
  mountCapabilityCreateScreen,
} from "./capability-create-screen.test-support";
import { baseHandlers, createFetchStub, mountCapabilityDetailScreen } from "./capability-detail-screen.test-support";

// Proof for task/capability-output-schema-guidance/output-schema-field-guidance's own criteria
// 1, 2, 3 and 4 -- the guidance renders in both compositions of CapabilityFormFields (the
// routed create screen, and the routed detail screen) and states what the platform reads and
// what a description may say.
//
// Criterion 1's own "the dialog shows this guidance" is reached here through the routed create
// screen instead: task/connector-capability-create-detail-route/
// capabilities-browser-create-action's own criterion 2 removed the only path the Capabilities
// Browser ever had to open the popup Dialog ("New capability" now navigates instead of opening
// it, capabilities-browser-screen.tsx's own header comment), so that Dialog can no longer be
// reached from anywhere in this app any more. CapabilityFormFields' own create-mode composition
// now lives at the routed create screen instead (capability-create-screen.tsx), which composes
// it exactly the same way the Dialog's own create-mode branch did -- the guidance markup itself
// is untouched (capability-form-fields.tsx is not this task's own file); only how this test
// reaches that composition moved, mirroring capabilities-browser-screen-detail.spec.ts's own
// identical reasoning for its own sibling criteria.
//
// Criteria 5 and 6 (JsonTextareaField unchanged for its other consumers; the guidance enforces
// nothing) are not independently tested: criterion 5 is a claim about which files this task did
// not open, verified by reading the diff rather than by a test that could observe no difference
// either way; criterion 6 already holds for every existing schema test in
// capability-create-screen-save.spec.ts and capability-detail-screen-save.spec.ts, none of which
// fills a description into any property and all of which still save successfully -- a new test
// asserting the same absence would restate what those suites already exercise. Split into its
// own file rather than folded into either sibling suite, since it is the one guidance both
// compositions share.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityFormFields — the routed create screen shows the output_schema field-semantics guidance (criterion 1)", () => {
  it("renders guidance beside the Output schema editor naming type and description as what the platform reads", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance).toBeTruthy();
    expect(guidance?.textContent).toMatch(/nenhum outro conteúdo deste schema é lido ou validado/i);
  });
});

describe("CapabilityFormFields — the guidance states a description says meaning, never a decision (criterion 3, disclosed inference)", () => {
  it("contrasts a meaning example against a decision example in the same paragraph", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance?.textContent).toContain("2 = suspenso por inadimplência");
    expect(guidance?.textContent).toContain("quando 2, confirme a hipótese");
  });
});

describe("CapabilityFormFields — the routed detail screen shows the same guidance at its output_schema editor (criterion 2)", () => {
  it("renders the same guidance text beside the routed screen's own Output schema editor", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Output schema");

    const guidance = findGuidanceParagraph(document.body);
    expect(guidance).toBeTruthy();
    expect(guidance?.textContent).toMatch(/nenhum outro conteúdo deste schema é lido ou validado/i);
  });
});

/** The guidance's own text is split across plain text and `<code>` elements, so a plain
 * getByText string/regex match (which looks for one node's own contiguous text) cannot find it
 * -- this walks every `<p>` and checks its full `textContent` (which does concatenate across
 * child elements) instead, the officially recommended pattern for text split by markup. */
function findGuidanceParagraph(container: HTMLElement): HTMLElement | null {
  return (
    Array.from(container.querySelectorAll("p")).find((p) =>
      /a plataforma lê seu próprio/i.test(p.textContent ?? ""),
    ) ?? null
  );
}
