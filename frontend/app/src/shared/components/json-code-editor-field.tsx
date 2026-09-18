import { useEffect, useMemo, useRef, type JSX } from "react";
import { CodeEditor } from "@tui/ui/code-editor";
import { parseJsonText } from "../lib/json-text";

export type JsonCodeEditorFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string, isValid: boolean) => void;
  readonly disabled?: boolean;
  readonly tall?: boolean;
};

export function JsonCodeEditorField({
  id,
  label,
  value,
  onChange,
  disabled,
  tall,
}: JsonCodeEditorFieldProps): JSX.Element {
  const parsed = useMemo(() => parseJsonText(value), [value]);
  const errorId = `${id}-error`;

  const selfInitiatedRef = useRef(false);

  useEffect(() => {
    if (selfInitiatedRef.current) {
      selfInitiatedRef.current = false;
      return;
    }
    if (!parsed.ok) {
      return;
    }
    const pretty = JSON.stringify(parsed.value, null, 2);
    if (pretty !== value) {
      selfInitiatedRef.current = true;
      onChange(pretty, true);
    }
  }, [parsed, value, onChange]);

  function handleChange(next: string): void {
    selfInitiatedRef.current = true;
    onChange(next, parseJsonText(next).ok);
  }

  return (
    <div className="flex flex-col gap-1">
      <CodeEditor
        id={id}
        label={label}
        value={value}
        onChange={handleChange}
        language="json"
        disabled={disabled}
        height={tall ? "12.5rem" : "10rem"}
        aria-invalid={!parsed.ok}
        aria-describedby={!parsed.ok ? errorId : undefined}
      />
      {!parsed.ok && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          Invalid JSON: {parsed.message}
        </p>
      )}
    </div>
  );
}
