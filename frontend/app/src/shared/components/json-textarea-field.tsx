import { useMemo, type ChangeEvent, type JSX } from "react";
import { Textarea } from "@tui/ui/textarea";
import { Label } from "@tui/ui/label";
import { Button } from "@tui/ui/button";

/**
 * Shared JSON beautify/minify/inline-error textarea control
 * (task/capability-authoring/json-textarea-editor): one control every field
 * needing JSON text embeds, so the parsing, the "Beautify" reformatting and
 * the invalid-JSON error message are written once rather than by each of the
 * three consumers named in this task's own rationale (a capability's two
 * schemas, a connector configuration field, and the test-connector panel's
 * sample input) individually.
 *
 * A discriminated `JsonParseResult` (TYP-04) rather than a `value: unknown |
 * undefined` bag: `undefined`/`null` are themselves valid parsed JSON values
 * (`JSON.parse("null")` succeeds), so a sentinel would collide with a
 * legitimate parse result instead of distinguishing "did not parse" from it.
 */
type JsonParseResult =
  | { readonly ok: true; readonly value: unknown }
  | { readonly ok: false; readonly message: string };

function parseJsonText(text: string): JsonParseResult {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}

/**
 * Pure, exported alongside the control rather than reached through a ref: a
 * caller already holds the control's current text as its own controlled
 * `value` state (reported through `onChange` below), so submission reaches
 * for this function with that same string rather than the control needing an
 * imperative handle to hand it back out a second way. Returns `null` for
 * text that is not syntactically valid JSON -- a caller checks the `isValid`
 * flag `onChange` already reported before calling this, so `null` here is a
 * defensive second guard rather than the only guard.
 */
export function getJsonTextareaMinifiedValue(value: string): string | null {
  const parsed = parseJsonText(value);
  return parsed.ok ? JSON.stringify(parsed.value) : null;
}

/**
 * Props are the one shape every consumer wires: `value` is the control's
 * current display text (controlled, so a caller's own "Beautify"-produced or
 * typed text round-trips through it unchanged); `onChange` reports the new
 * text and whether it is syntactically valid JSON together, in the same
 * call, so a caller's own value state and its own validity state can never
 * fall out of sync with each other the way two independent callbacks could.
 */
export type JsonTextareaFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string, isValid: boolean) => void;
  readonly disabled?: boolean;
};

/**
 * A JSON-aware textarea: labeled, with a "Beautify" control that reformats
 * the current text as indented JSON without changing what it means as data
 * (`JSON.stringify(JSON.parse(value), null, 2)`, criterion 1), and an inline
 * error message next to the control while the current text does not parse
 * (criterion 2). No "touched" tracking gates that message -- the
 * specification states only that malformed text is refused, nothing about
 * deferring the message for a freshly empty field, and empty text is not
 * syntactically valid JSON either, so it is reported invalid the same as any
 * other malformed text (criterion 3, this task's own inference).
 */
export function JsonTextareaField({
  id,
  label,
  value,
  onChange,
  disabled,
}: JsonTextareaFieldProps): JSX.Element {
  const parsed = useMemo(() => parseJsonText(value), [value]);
  const errorId = `${id}-error`;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    const next = event.target.value;
    onChange(next, parseJsonText(next).ok);
  }

  function handleBeautify(): void {
    if (!parsed.ok) {
      return;
    }
    onChange(JSON.stringify(parsed.value, null, 2), true);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <Button
          type="button"
          variant="secondary"
          onClick={handleBeautify}
          disabled={disabled || !parsed.ok}
        >
          Beautify
        </Button>
      </div>
      <Textarea
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="min-h-40 font-mono"
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
