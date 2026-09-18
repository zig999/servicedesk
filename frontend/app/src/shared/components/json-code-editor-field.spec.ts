import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { JsonCodeEditorField } from "./json-code-editor-field";

describe("JsonCodeEditorField", () => {
  it("reformats compact JSON as two-space indented, pretty-printed text that parses back to the exact same data (Beautify)", () => {
    const onChange = vi.fn();

    const compact = '{"z":  1,   "a":[1,2,  3]}';

    render(
      createElement(JsonCodeEditorField, {
        id: "schema",
        label: "Schema",
        value: compact,
        onChange,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Beautify" }));

    const expected = '{\n  "z": 1,\n  "a": [\n    1,\n    2,\n    3\n  ]\n}';
    expect(onChange).toHaveBeenCalledWith(expected, true);
  });

  it("disables the Beautify control while the current text does not parse as JSON", () => {
    const onChange = vi.fn();

    render(
      createElement(JsonCodeEditorField, {
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
      createElement(JsonCodeEditorField, {
        id: "schema",
        label: "Schema",
        value: "{not valid json",
        onChange: vi.fn(),
      }),
    );

    const errorMessage = screen.getByRole("alert");
    expect(errorMessage.textContent).toContain("Invalid JSON");

    const control = screen.getByRole("textbox");
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(control.getAttribute("aria-describedby")).toBe(errorMessage.id);
  });

  it("shows no inline error message while the current text is valid JSON", () => {
    render(
      createElement(JsonCodeEditorField, {
        id: "schema",
        label: "Schema",
        value: '{"a": 1}',
        onChange: vi.fn(),
      }),
    );

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBe("false");
  });

  it("shows the inline error message for a freshly empty field, with no untouched grace period", () => {
    render(
      createElement(JsonCodeEditorField, {
        id: "schema",
        label: "Schema",
        value: "",
        onChange: vi.fn(),
      }),
    );

    expect(screen.getByRole("alert")).not.toBeNull();
  });

  it("carries the JSON parser's own diagnostic in the inline error text, rather than one fixed sentence, for different malformed input", () => {
    const view = render(
      createElement(JsonCodeEditorField, {
        id: "schema",
        label: "Schema",
        value: "{",
        onChange: vi.fn(),
      }),
    );
    const firstMessage = screen.getByRole("alert").textContent;
    view.unmount();

    render(
      createElement(JsonCodeEditorField, {
        id: "schema",
        label: "Schema",
        value: '{"a": }',
        onChange: vi.fn(),
      }),
    );
    const secondMessage = screen.getByRole("alert").textContent;

    expect(firstMessage).toContain("Invalid JSON:");
    expect(secondMessage).toContain("Invalid JSON:");

    expect(firstMessage).not.toBe(secondMessage);
  });

  it("reports newly typed text together with true when it parses as valid JSON", () => {
    const onChange = vi.fn();
    render(
      createElement(JsonCodeEditorField, {
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
      createElement(JsonCodeEditorField, {
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

  it("reports a compact valid JSON value reformatted as pretty-printed text and marked valid immediately on mount, before any interaction", () => {
    const onChange = vi.fn();

    const compact = '{"z":1,"a":[1,2,3]}';

    render(
      createElement(JsonCodeEditorField, {
        id: "schema",
        label: "Schema",
        value: compact,
        onChange,
      }),
    );

    const expected = '{\n  "z": 1,\n  "a": [\n    1,\n    2,\n    3\n  ]\n}';
    expect(onChange).toHaveBeenCalledWith(expected, true);
  });

  it("never calls onChange on mount when the loaded value is already in its own pretty-printed form (edge case: a value at that boundary)", () => {
    const onChange = vi.fn();
    const alreadyPretty = '{\n  "a": 1\n}';

    render(
      createElement(JsonCodeEditorField, {
        id: "schema",
        label: "Schema",
        value: alreadyPretty,
        onChange,
      }),
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it("leaves the value exactly as passed and never calls onChange for it, when it is not valid JSON, on mount", () => {
    const onChange = vi.fn();
    const raw = "{not valid json";

    render(
      createElement(JsonCodeEditorField, {
        id: "schema",
        label: "Schema",
        value: raw,
        onChange,
      }),
    );

    const control = screen.getByRole("textbox");
    if (!(control instanceof HTMLTextAreaElement)) {
      throw new Error("expected the JSON field's own control to be a textarea element");
    }
    expect(control.value).toBe(raw);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("operates independently across two field instances sharing the same props shape, so editing one never reports through the other's onChange", () => {
    const onChangeA = vi.fn();
    const onChangeB = vi.fn();

    render(
      createElement(
        "div",
        null,
        createElement(JsonCodeEditorField, {
          id: "capability-input-schema",
          label: "Input schema",
          value: '{"a": 1}',
          onChange: onChangeA,
        }),
        createElement(JsonCodeEditorField, {
          id: "connector-configuration",
          label: "Configuration",
          value: "{not valid",
          onChange: onChangeB,
        }),
      ),
    );

    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);

    expect(onChangeB).not.toHaveBeenCalled();

    const [firstControl, secondControl] = screen.getAllByRole("textbox");
    fireEvent.change(firstControl, { target: { value: '{"a": 2}' } });
    expect(onChangeA).toHaveBeenCalledWith('{"a": 2}', true);
    expect(onChangeB).not.toHaveBeenCalled();

    const onChangeACallsSoFar = onChangeA.mock.calls.length;
    fireEvent.change(secondControl, { target: { value: '{"b": 1}' } });
    expect(onChangeB).toHaveBeenCalledWith('{"b": 1}', true);
    expect(onChangeA).toHaveBeenCalledTimes(onChangeACallsSoFar);
  });
});
