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

    const [firstTextarea, secondTextarea] = screen.getAllByRole("textbox");
    fireEvent.change(firstTextarea, { target: { value: '{"a": 2}' } });
    expect(onChangeA).toHaveBeenCalledWith('{"a": 2}', true);
    expect(onChangeB).not.toHaveBeenCalled();

    fireEvent.change(secondTextarea, { target: { value: '{"b": 1}' } });
    expect(onChangeB).toHaveBeenCalledWith('{"b": 1}', true);
    expect(onChangeA).toHaveBeenCalledTimes(1);
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
