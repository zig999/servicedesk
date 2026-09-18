import type { ChangeEvent, JSX } from "react";

type CodeEditorTestDoubleProps = {
  readonly id?: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly label?: string;
  readonly language?: "json" | "javascript" | "typescript" | "plaintext";
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly "aria-invalid"?: boolean | "true" | "false";
  readonly "aria-describedby"?: string;
  readonly "aria-label"?: string;
};

function beautifyJson(value: string): string | null {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return null;
  }
}

/**
 * jsdom cannot drive CodeMirror's contenteditable surface (no value setter, no real
 * caret/selection model), so route-level tests substitute this plain-textarea stand-in
 * for @tui/ui/code-editor, wired via vite.config.ts's test-only alias. CodeMirror's own
 * behavior is covered by its Storybook/Playwright component tests, not here. Mirrors just
 * enough of the real component's contract (label association, the "json" language's
 * Beautify button) for callers' own tests to exercise their wiring against it.
 */
export function CodeEditor({
  id,
  value,
  onChange,
  label,
  language = "plaintext",
  disabled,
  placeholder,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
}: CodeEditorTestDoubleProps): JSX.Element {
  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    onChange(event.target.value);
  }

  function handleBeautify(): void {
    const pretty = beautifyJson(value);
    if (pretty !== null) {
      onChange(pretty);
    }
  }

  const textarea = (
    <textarea
      id={id}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
    />
  );

  return (
    <div>
      {language === "json" && (
        <button
          type="button"
          onClick={handleBeautify}
          disabled={disabled || beautifyJson(value) === null}
        >
          Beautify
        </button>
      )}
      {label == null ? textarea : <label>{label}{textarea}</label>}
    </div>
  );
}
