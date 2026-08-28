import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  JsonTextareaField,
  getJsonTextareaMinifiedValue,
} from "./json-textarea-field";

// This file stays .spec.ts (not .spec.tsx), matching this codebase's existing
// convention for component specs (see status-table.spec.ts, conflict-banner.spec.ts).
// Rendering is done through React.createElement rather than JSX syntax, since a
// .ts file is parsed by esbuild's "ts" loader, which does not accept JSX.
//
// vite.config.ts's test.globals: true registers @testing-library/react's own
// auto-cleanup against the global afterEach, so no manual cleanup() call is
// needed here (testing-library/no-manual-cleanup).

describe("JsonTextareaField", () => {
  it("reformats compact JSON as two-space indented, pretty-printed text that parses back to the exact same data (Beautify)", () => {
    const onChange = vi.fn();
    // Extra insignificant whitespace in the source proves the control is not
    // merely echoing the original text back reformatted by coincidence.
    const compact = '{"z":  1,   "a":[1,2,  3]}';

    render(
      createElement(JsonTextareaField, {
        id: "schema",
        label: "Schema",
        value: compact,
        onChange,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Beautify" }));

    // Hardcoded rather than computed by re-running JSON.stringify/JSON.parse
    // in the test itself: a computed expectation would pass even if the
    // control performed a different, wrong transformation that happened to
    // agree with the test's own (identical) computation. This literal is the
    // one correct two-space-indented rendering of {z:1, a:[1,2,3]}, so any
    // wrong formatting or any data corruption both show up as a mismatch.
    const expected =
      '{\n  "z": 1,\n  "a": [\n    1,\n    2,\n    3\n  ]\n}';
    expect(onChange).toHaveBeenCalledWith(expected, true);
  });

  it("disables the Beautify control while the current text does not parse as JSON", () => {
    const onChange = vi.fn();

    render(
      createElement(JsonTextareaField, {
        id: "schema",
        label: "Schema",
        value: '{"a":',
        onChange,
      }),
    );
    const beautifyButton = screen.getByRole("button", { name: "Beautify" });
    if (!(beautifyButton instanceof HTMLButtonElement)) {
      throw new Error("expected the Beautify control to be a button element");
    }
    expect(beautifyButton.disabled).toBe(true);

    fireEvent.click(beautifyButton);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows an inline error message linked to the control when the current text does not parse as JSON", () => {
    render(
      createElement(JsonTextareaField, {
        id: "schema",
        label: "Schema",
        value: "{not valid json",
        onChange: vi.fn(),
      }),
    );

    const errorMessage = screen.getByRole("alert");
    expect(errorMessage.textContent).toContain("Invalid JSON");

    const textarea = screen.getByRole("textbox");
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
    expect(textarea.getAttribute("aria-describedby")).toBe(errorMessage.id);
  });

  it("shows no inline error message while the current text is valid JSON", () => {
    render(
      createElement(JsonTextareaField, {
        id: "schema",
        label: "Schema",
        value: '{"a": 1}',
        onChange: vi.fn(),
      }),
    );

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBe(
      "false",
    );
  });

  it("shows the inline error message for a freshly empty field, with no untouched grace period", () => {
    render(
      createElement(JsonTextareaField, {
        id: "schema",
        label: "Schema",
        value: "",
        onChange: vi.fn(),
      }),
    );

    // No prior interaction happened -- this is the control's very first
    // render with an empty value -- so a message here proves the error is
    // not gated behind any "has the user touched this field yet" tracking.
    expect(screen.getByRole("alert")).not.toBeNull();
  });

  it("carries the JSON parser's own diagnostic in the inline error text, rather than one fixed sentence, for different malformed input", () => {
    const view = render(
      createElement(JsonTextareaField, {
        id: "schema",
        label: "Schema",
        value: "{",
        onChange: vi.fn(),
      }),
    );
    const firstMessage = screen.getByRole("alert").textContent;
    view.unmount();

    render(
      createElement(JsonTextareaField, {
        id: "schema",
        label: "Schema",
        value: '{"a": }',
        onChange: vi.fn(),
      }),
    );
    const secondMessage = screen.getByRole("alert").textContent;

    expect(firstMessage).toContain("Invalid JSON:");
    expect(secondMessage).toContain("Invalid JSON:");
    // Two different malformed inputs producing two different messages rules
    // out a single fixed business sentence standing in for both.
    expect(firstMessage).not.toBe(secondMessage);
  });

  it("reports newly typed text together with true when it parses as valid JSON", () => {
    const onChange = vi.fn();
    render(
      createElement(JsonTextareaField, {
        id: "schema",
        label: "Schema",
        value: "{}",
        onChange,
      }),
    );

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: '{"a": 1}' },
    });

    expect(onChange).toHaveBeenCalledWith('{"a": 1}', true);
  });

  it("marks the newly typed text invalid, rather than passing it through as acceptable, when it does not parse as JSON", () => {
    const onChange = vi.fn();
    render(
      createElement(JsonTextareaField, {
        id: "schema",
        label: "Schema",
        value: "{}",
        onChange,
      }),
    );

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: '{"a":' },
    });

    expect(onChange).toHaveBeenCalledWith('{"a":', false);
  });

  // Proof for task/connector-capability-detail-editing/json-textarea-pretty-print-on-load's
  // own criteria 1 and 2: a syntactically valid loaded value is reformatted as indented text
  // and reported through onChange immediately on mount (criterion 1), and a value that is not
  // valid JSON is left exactly as passed, with the load effect never touching it at all
  // (criterion 2). Also proves that record's own disclosed inference: a "load" is recognized
  // generically, on any value transition this control did not itself produce, not only on its
  // very first render -- since neither existing caller (both dialogs) ever exercises that
  // second case today, it is provable only at this control's own level.

  it("reports a compact valid JSON value reformatted as pretty-printed text and marked valid immediately on mount, before any interaction (criterion 1)", () => {
    const onChange = vi.fn();
    // Extra insignificant whitespace, the same reasoning as the Beautify test above: a value
    // already in the pretty form would trivially "equal" its own reformatting even if the
    // mount effect did nothing at all, so the fixture must be minified to prove the effect ran.
    const compact = '{"z":1,"a":[1,2,3]}';

    render(
      createElement(JsonTextareaField, {
        id: "schema",
        label: "Schema",
        value: compact,
        onChange,
      }),
    );

    // Hardcoded rather than computed, for the same reason as the Beautify test above.
    const expected = '{\n  "z": 1,\n  "a": [\n    1,\n    2,\n    3\n  ]\n}';
    expect(onChange).toHaveBeenCalledWith(expected, true);
  });

  it("never calls onChange on mount when the loaded value is already in its own pretty-printed form (edge case: a value at criterion 1's own boundary)", () => {
    const onChange = vi.fn();
    const alreadyPretty = '{\n  "a": 1\n}';

    render(
      createElement(JsonTextareaField, {
        id: "schema",
        label: "Schema",
        value: alreadyPretty,
        onChange,
      }),
    );

    // A value already indistinguishable from its own reformatting is not itself "left in
    // the minified form it was passed" (criterion 1's own condition), so there is nothing
    // to report -- and a spurious call here would be exactly the kind of update a caller
    // holding this text in its own state could loop on.
    expect(onChange).not.toHaveBeenCalled();
  });

  it("leaves the value exactly as passed and never calls onChange for it, when it is not valid JSON, on mount (criterion 2)", () => {
    const onChange = vi.fn();
    const raw = "{not valid json";

    render(
      createElement(JsonTextareaField, {
        id: "schema",
        label: "Schema",
        value: raw,
        onChange,
      }),
    );

    const textarea = screen.getByRole("textbox");
    if (!(textarea instanceof HTMLTextAreaElement)) {
      throw new Error("expected the JSON field's own control to be a textarea element");
    }
    expect(textarea.value).toBe(raw);
    // Never called at all, not merely "not called with a reformatted value" -- the load effect
    // for an invalid value returns before reaching onChange, so nothing about this field is
    // reported back to a caller on mount.
    expect(onChange).not.toHaveBeenCalled();
  });

  it("pretty-prints a second, externally-loaded value too, not only the component's very first render (disclosed inference)", () => {
    const onChange = vi.fn();
    function props(value: string) {
      return { id: "schema", label: "Schema", value, onChange };
    }

    const { rerender } = render(createElement(JsonTextareaField, props('{"a":1}')));

    // Completes the mount's own round trip exactly as a real controlled caller would --
    // feeding the reformatted text this control just reported back in as its own `value`
    // prop -- so the control settles into the same state it would be in inside a real
    // dialog, rather than this test asserting anything about a caller nothing here builds.
    const mountCall = onChange.mock.calls[0];
    if (mountCall === undefined || typeof mountCall[0] !== "string") {
      throw new Error(
        "expected the mount-time load effect to have reported a pretty-printed string",
      );
    }
    rerender(createElement(JsonTextareaField, props(mountCall[0])));
    onChange.mockClear();

    // A caller replacing the loaded value entirely from outside -- never through this
    // control's own handleChange or handleBeautify -- is the second half of "on mount and
    // whenever a new value is loaded into it" this task's own objective states, and the
    // disclosed inference that such a transition is always treated as a load, whenever it
    // is not self-produced, rather than only on the component's very first render.
    rerender(createElement(JsonTextareaField, props('{"b":2}')));

    expect(onChange).toHaveBeenCalledWith('{\n  "b": 2\n}', true);
  });

  it("operates independently across two field instances sharing the same props shape, so editing one never reports through the other's onChange", () => {
    const onChangeA = vi.fn();
    const onChangeB = vi.fn();

    render(
      createElement(
        "div",
        null,
        createElement(JsonTextareaField, {
          id: "capability-input-schema",
          label: "Input schema",
          value: '{"a": 1}',
          onChange: onChangeA,
        }),
        createElement(JsonTextareaField, {
          id: "connector-configuration",
          label: "Configuration",
          value: "{not valid",
          onChange: onChangeB,
        }),
      ),
    );

    // The second instance's invalid text is the only one that should surface
    // an inline error, proving the two mounted instances read only their own
    // `value` rather than sharing any state through the shared props shape.
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);
    // The first field's own value, '{"a": 1}', is valid JSON that is not itself
    // pretty-printed, so task/connector-capability-detail-editing/json-textarea-pretty-print-on-load's
    // own mount-time load-normalization effect already reported one onChange call for it
    // before either textarea is touched (proved on its own terms above); the second field
    // never parses, so that same effect never calls its own onChange at all.
    expect(onChangeB).not.toHaveBeenCalled();

    const [firstTextarea, secondTextarea] = screen.getAllByRole("textbox");
    fireEvent.change(firstTextarea, { target: { value: '{"a": 2}' } });
    expect(onChangeA).toHaveBeenCalledWith('{"a": 2}', true);
    expect(onChangeB).not.toHaveBeenCalled();

    // Captured immediately before touching the second field, rather than hardcoded, so this
    // assertion stays about cross-instance independence -- no further call ever reaches
    // onChangeA once only the second field changes -- without re-asserting, a second time and
    // with a brittle literal, the mount-time call count already proved on its own above.
    const onChangeACallsSoFar = onChangeA.mock.calls.length;
    fireEvent.change(secondTextarea, { target: { value: '{"b": 1}' } });
    expect(onChangeB).toHaveBeenCalledWith('{"b": 1}', true);
    expect(onChangeA).toHaveBeenCalledTimes(onChangeACallsSoFar);
  });
});

// Proof for task/capability-detail-layout/schema-editor-height-increase's own criterion 4:
// JsonTextareaField's own default rendered height, used by any consumer that does not
// explicitly opt into the taller `tall` variant, remains 160px/10rem. Criteria 1-2 (the
// capability form's input-schema/output-schema fields render at 200px/12.5rem) and criterion 3
// (the connector-configuration form's configuration field keeps 160px/10rem) are each proven at
// the call site that criterion names -- capability-detail-screen-schema-editor-height.spec.ts and
// connector-configuration-detail-screen-configuration-height.spec.ts -- since each is a claim
// about how a specific consumer wires this prop, not about this component in isolation.
describe("JsonTextareaField -- default height when tall is not passed (task/capability-detail-layout/schema-editor-height-increase, criterion 4)", () => {
  it("renders the shared 10rem/160px minimum-height class when the tall prop is left unset entirely", () => {
    render(
      createElement(JsonTextareaField, {
        id: "schema",
        label: "Schema",
        value: "{}",
        onChange: vi.fn(),
      }),
    );

    const textarea = screen.getByRole("textbox");
    // min-h-40 is Tailwind's own 10rem/160px minimum-height utility -- the class this component
    // carried before this task and the one every consumer not explicitly opting into the taller
    // variant still renders.
    expect(textarea.className).toContain("min-h-40");
    // Asserted as an explicit exclusion, not merely "min-h-40 present": a build that applied both
    // classes at once would leave Tailwind's own cascade order, rather than this component's own
    // conditional, to decide which minimum height actually wins.
    expect(textarea.className).not.toContain("min-h-[12.5rem]");
  });
});

describe("getJsonTextareaMinifiedValue", () => {
  it("strips insignificant whitespace from indented, pretty-printed text", () => {
    const pretty = '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}';

    expect(getJsonTextareaMinifiedValue(pretty)).toBe('{"a":1,"b":[1,2]}');
  });

  it("returns the same minified string for the same data whether the text is currently shown compact or pretty-printed", () => {
    const compact = '{"a":1,"b":[1,2]}';
    const pretty = '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}';

    // Asserted against the same literal on both sides, rather than only
    // against each other: comparing the two results to one another alone
    // would pass just as well if both happened to be null or both wrong in
    // the same way, proving nothing about what either actually returned.
    expect(getJsonTextareaMinifiedValue(compact)).toBe('{"a":1,"b":[1,2]}');
    expect(getJsonTextareaMinifiedValue(pretty)).toBe('{"a":1,"b":[1,2]}');
  });

  it("returns null for text that is not syntactically valid JSON", () => {
    expect(getJsonTextareaMinifiedValue("{not valid")).toBeNull();
  });

  it("returns null for an empty string, rather than treating absent text as valid JSON", () => {
    expect(getJsonTextareaMinifiedValue("")).toBeNull();
  });
});
