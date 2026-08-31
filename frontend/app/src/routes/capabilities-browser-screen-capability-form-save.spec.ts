import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  createCapabilitiesFetchStub,
  mountCapabilitiesScreen,
} from "./capabilities-browser-screen.test-support";

// Proof for task/connector-capability-create-detail-route/capabilities-browser-create-action's
// own criterion 4 -- "New capability" renders while the capability list has failed to load, as
// it does today. capabilities-browser-screen.tsx's own header comment states why: the button
// sits unconditionally in the header row, outside renderBody()'s own isLoading/isError/
// empty-length branches, so hiding a create action behind an unrelated read failure would block
// authoring a capability for a reason that has nothing to do with it. The loading-state half of
// this same criterion lives in the sibling
// capabilities-browser-screen-capability-form-schema.spec.ts, and the empty-state half is
// already covered, unmodified, by capabilities-browser-screen.spec.ts's own pre-existing
// "renders an explicit empty-state message ... still offering the New capability action" test.
//
// Every describe block this file's own prior delivery held here -- task/capability-authoring/
// capability-create-edit-form's own criteria 5 and 6 (a non-read-only nature's refusal reaching
// the operator as a specific message, and a successful create persisting the declared contract)
// -- is retired outright rather than rewritten: both were reached exclusively through the popup
// Dialog this screen's own "New capability" button opened, and this task's own criterion 2
// removes that path entirely -- no interaction reaches a Dialog from this screen any more
// (capabilities-browser-screen-detail.spec.ts's own header comment). The equivalent
// PUT-dispatch, refusal-message and successful-navigation behavior for the create path is proven
// instead through the routed create screen's own proof
// (capability-create-screen-save.spec.ts's own criteria 8-12,
// task/connector-capability-create-detail-route/capability-create-route), which composes the
// same shared useCapabilityForm hook in create mode. Its own PUT-body assertions there use
// schemas already given as minified JSON (`'{"a":1}'`, `'{"b":2}'`) rather than typed as
// beautified text, so the beautify-then-minify-on-save transform this file's own prior delivery
// proved for the create path is not independently re-proven anywhere after this change --
// disclosed as untested in this task's own proof record rather than left silent.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilitiesBrowserScreen — the New capability action while the list has failed to load (criterion 4)", () => {
  it("renders New capability when GET /v1/capabilities fails", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => {
        throw new Error("network down");
      },
    });
    await mountCapabilitiesScreen(fetchMock);

    expect(await screen.findByText("Capabilities could not be loaded.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "New capability" })).toBeTruthy();
  });
});
