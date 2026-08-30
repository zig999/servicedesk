import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  CAPABILITY_PATH,
  CONCEPTS_PATH,
  LOADED_CAPABILITY,
  baseHandlers,
  createFetchStub,
  jsonResponse,
  mountCapabilityDetailScreen,
} from "./capability-detail-screen.test-support";

// Proof for task/capability-detail-concept-emphasis/concept-field-visual-emphasis's own
// criteria 1, 2, 3 and 5. capability-detail-screen.spec.ts's own existing assertions (criterion
// 6 of a different task) locate every field by screen.getByLabelText and never inspect a
// field's own container markup or className, so a build that left Concept's container as the
// same plain, unbordered div every other field already uses -- the very equal weight this task
// removes -- would satisfy every one of that file's assertions unchanged. This file adds the
// structural and interaction checks those criteria need and that suite cannot express.
//
// Criteria 4 (built only from cataloged components, no TUI source copied or forked) and ARC-01/
// ARC-04 of this project's own standard cover the identical concern -- whether a primitive is
// genuinely composed rather than reimplemented is a question this project's own standard already
// assigns `decided_by: reading` (see standards/frontend-typescript.yaml), because a rendered DOM
// query cannot tell a real import apart from a hand-copied equivalent producing the same markup.
// No test is written for it here; see this record's own `untested` entry.
//
// Criterion 6 (neither caller needs a prop or call-site change) and criterion 7 (the other seven
// fields' position, meaning and validation are unchanged) assert nothing this delivery could have
// broken without also breaking compilation or an existing, unmodified suite: capability-form-dialog.tsx
// and capability-detail-ready-view.tsx are both untouched by this delivery and both already compose
// CapabilityFormFields exactly as before, and capability-detail-screen.spec.ts,
// capability-detail-screen-save.spec.ts, capability-detail-screen-name-version-nature-row.spec.ts and
// capabilities-browser-screen-capability-form-schema.spec.ts -- none of them modified by this task --
// continue to render and pass through the new markup unmodified, which is what those two criteria
// themselves claim. No new test is written for them here.

afterEach(() => {
  vi.unstubAllGlobals();
});

const OTHER_SEVEN_LABELS = [
  "Name",
  "Version",
  "Nature",
  "Input schema",
  "Output schema",
  "Timeout (ms)",
  "Connector",
];

/** The closest ancestor (or the element itself) whose own class list carries the accent-alt
 * border token Panel's accent="alt" variant resolves to -- the one visual property this task's
 * own criteria 1-3 are about. No RTL query reaches an ancestor's own className; the alternative
 * (querying by a selector scoped to the field's own accessible role/name and then reading
 * className) still needs the same upward walk `closest` performs.
 *
 * Typed HTMLElement via `closest`'s own generic parameter, rather than the wider Element its
 * return type would otherwise carry: `within` (used by the heading-level test below) only
 * accepts an HTMLElement, and narrowing through the generic parameter keeps every call site
 * -- this one included -- free of a type assertion. */
function distinguishedAncestor(control: Element): HTMLElement | null {
  // There is no RTL query for "an ancestor container's own class list"; mirrors this codebase's
  // own established convention (case-simulation-subject-panel-json-view.spec.ts,
  // case-simulation-detail-evidence-tab.spec.ts) of a reasoned suppression where no RTL
  // alternative reaches the same DOM relationship. No eslint-disable is needed on the call
  // itself, unlike the closest() calls below that assign to a variable: no-node-access's own
  // selectors ("ExpressionStatement MemberExpression", "VariableDeclarator MemberExpression")
  // match a node access sitting directly inside one of those two statement kinds, and a
  // `return` is neither.
  return control.closest<HTMLElement>('[class*="border-accent-alt"]');
}

describe("CapabilityDetailScreen -- Concept's field container is visually distinguished from the other seven fields (criterion 1)", () => {
  it("wraps only Concept's control in an ancestor carrying the accent-alt border, none of the other seven fields' controls sit inside one", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const conceptControl = screen.getByLabelText("Concept");
    expect(distinguishedAncestor(conceptControl)).not.toBeNull();

    for (const label of OTHER_SEVEN_LABELS) {
      const control = screen.getByLabelText(label);
      expect(distinguishedAncestor(control)).toBeNull();
    }
  });
});

describe("CapabilityDetailScreen -- Concept no longer shares its former undistinguished weight with Timeout and Connector (criterion 2)", () => {
  it("carries the accent-alt border while Timeout's and Connector's own containers still do not", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const conceptControl = screen.getByLabelText("Concept");
    const timeoutControl = screen.getByLabelText("Timeout (ms)");
    const connectorControl = screen.getByLabelText("Connector");

    expect(distinguishedAncestor(conceptControl)).not.toBeNull();
    expect(distinguishedAncestor(timeoutControl)).toBeNull();
    expect(distinguishedAncestor(connectorControl)).toBeNull();
  });
});

describe("CapabilityDetailScreen -- Concept stays in its existing grid-cols-3 row rather than relocating (the implementation record's own disclosed inference)", () => {
  it("keeps Concept, Timeout and Connector as siblings inside one shared grid row", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const conceptControl = screen.getByLabelText("Concept");
    const timeoutControl = screen.getByLabelText("Timeout (ms)");
    const connectorControl = screen.getByLabelText("Connector");

    // The shared row itself is reached the same way as distinguishedAncestor above -- no RTL
    // query walks upward from an already-queried element to its own ancestor.
    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    const conceptRow = conceptControl.closest(".grid-cols-3");
    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    const timeoutRow = timeoutControl.closest(".grid-cols-3");
    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    const connectorRow = connectorControl.closest(".grid-cols-3");

    expect(conceptRow).not.toBeNull();
    expect(timeoutRow).toBe(conceptRow);
    expect(connectorRow).toBe(conceptRow);
  });
});

describe("CapabilityDetailScreen -- Concept's distinguishing container resolves only to declared semantic tokens (criterion 3)", () => {
  it("carries border-accent-alt and bg-surface, and no raw px, hex or rgb value", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const container = distinguishedAncestor(screen.getByLabelText("Concept"));
    if (container === null) {
      throw new Error(
        "capability-detail-screen-concept-emphasis proof: expected Concept's control to sit inside a distinguishing container",
      );
    }

    expect(container.className).toContain("border-accent-alt");
    expect(container.className).toContain("bg-surface");
    expect(container.className).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(container.className).not.toMatch(/\d+px/);
    expect(container.className).not.toMatch(/rgba?\(/);
  });
});

describe("CapabilityDetailScreen -- Concept's notched Panel title sits at heading level 2, not the primitive's own default of 3", () => {
  it("renders a level-2 heading inside Concept's own distinguished container, carrying an accessible name distinct from the field's own label", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const container = distinguishedAncestor(screen.getByLabelText("Concept"));
    if (container === null) {
      throw new Error(
        "capability-detail-screen-concept-emphasis proof: expected Concept's control to sit inside a distinguishing container",
      );
    }

    // Queries the level explicitly rather than pinning the title's own literal text: no
    // criterion this task states names a specific caption, and the panel's title wording is
    // free to change later without this test describing a regression that did not happen.
    // What must hold, and would fail if it stopped holding, is that exactly one level-2
    // heading sits inside Concept's own distinguishing container, and it is not itself named
    // "Concept" -- reintroducing that name here would recreate the duplicate-accessible-name
    // collision (aria-labelledby vs. FormField's own label) this delivery's fix removed.
    const heading = within(container).getByRole("heading", { level: 2 });
    expect(heading.textContent).not.toBe("Concept");
  });
});

describe("CapabilityDetailScreen -- Concept's Select keeps its own value/onChange wiring inside the new wrapper (criterion 5)", () => {
  it("still lets an operator change the selected concept, nested inside the Panel wrap", async () => {
    const fetchMock = createFetchStub(
      baseHandlers(undefined, undefined, {
        [CONCEPTS_PATH]: () =>
          jsonResponse({
            data: [
              { name: "some-concept", accepts: ["capability"] },
              { name: "other-concept", accepts: ["capability"] },
            ],
          }),
      }),
    );
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const trigger = screen.getByLabelText("Concept");
    expect(trigger.textContent).toContain("some-concept");

    fireEvent.click(trigger);
    const listbox = screen.getByRole("listbox");
    fireEvent.mouseDown(within(listbox).getByRole("option", { name: "other-concept" }));

    expect(screen.getByLabelText("Concept").textContent).toContain("other-concept");
  });
});

describe("CapabilityDetailScreen -- Concept's Select stays disabled exactly while a save is in flight (criterion 5)", () => {
  it("disables Concept's control only for the duration of a pending save, re-enabling once it resolves", async () => {
    let resolvePut!: (response: Response) => void;
    const pendingPut = new Promise<Response>((resolve) => {
      resolvePut = resolve;
    });
    const fetchMock = createFetchStub(
      baseHandlers(undefined, undefined, {
        [CAPABILITY_PATH]: (method: string) =>
          method === "PUT" ? pendingPut : jsonResponse(LOADED_CAPABILITY),
      }),
    );
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const connectorField = screen.getByLabelText<HTMLInputElement>("Connector");
    fireEvent.change(connectorField, { target: { value: "a-different-connector" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const conceptControl = screen.getByLabelText("Concept");
    await waitFor(() => expect(conceptControl.hasAttribute("disabled")).toBe(true));

    resolvePut(jsonResponse({}));

    await waitFor(() => expect(conceptControl.hasAttribute("disabled")).toBe(false));
  });
});
