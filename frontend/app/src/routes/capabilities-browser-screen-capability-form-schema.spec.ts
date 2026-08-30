import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { mountCapabilitiesScreen } from "./capabilities-browser-screen.test-support";

// Proof for task/connector-capability-create-detail-route/capabilities-browser-create-action's
// own criterion 4 -- "New capability" renders while the capability list is loading, as it does
// today. capabilities-browser-screen.tsx's own header comment states why: the button sits
// unconditionally in the header row, outside renderBody()'s own isLoading/isError/empty-length
// branches, so hiding a create action behind an unrelated read state would block authoring a
// capability for a reason that has nothing to do with it. The empty-state half of this same
// criterion is already covered, unmodified, by capabilities-browser-screen.spec.ts's own
// pre-existing "renders an explicit empty-state message ... still offering the New capability
// action" test; the failed-to-load half lives in the sibling
// capabilities-browser-screen-capability-form-save.spec.ts.
//
// Every describe block this file's own prior delivery held here -- task/capability-authoring/
// capability-create-edit-form's own criteria 3 and 4 (the shared form's own JSON beautify/minify
// textarea and its single-select concept field) -- is retired outright rather than rewritten:
// both were reached exclusively through the popup Dialog this screen's own "New capability"
// button opened, and this task's own criterion 2 removes that path entirely -- no interaction
// reaches a Dialog from this screen any more (capabilities-browser-screen-detail.spec.ts's own
// header comment). The routed create screen's own proof (capability-create-screen.spec.ts /
// capability-create-screen-save.spec.ts) exercises the same shared useCapabilityForm hook in
// create mode for its own criteria, but neither restates a beautify-then-minify round trip on
// the schema fields nor a second concept selection replacing a first one -- disclosed as
// untested in this task's own proof record rather than left silent.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilitiesBrowserScreen — the New capability action while the list is loading (criterion 4)", () => {
  it("renders New capability before GET /v1/capabilities responds", async () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    await mountCapabilitiesScreen(fetchMock);

    expect(screen.getByText("Loading capabilities…")).toBeTruthy();
    expect(screen.getByRole("button", { name: "New capability" })).toBeTruthy();
  });
});
