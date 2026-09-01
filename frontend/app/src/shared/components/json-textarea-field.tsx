import { useEffect, useMemo, useRef, type ChangeEvent, type JSX } from "react";
import { Textarea } from "@tui/ui/textarea";
import { Label } from "@tui/ui/label";
import { Button } from "@tui/ui/button";
import { cn } from "@tui/lib/cn";

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

export function getJsonTextareaMinifiedValue(value: string): string | null {
  const parsed = parseJsonText(value);
  return parsed.ok ? JSON.stringify(parsed.value) : null;
}

export type JsonTextareaFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string, isValid: boolean) => void;
  readonly disabled?: boolean;
  readonly tall?: boolean;
};

export function JsonTextareaField({
  id,
  label,
  value,
  onChange,
  disabled,
  tall,
}: JsonTextareaFieldProps): JSX.Element {
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

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    selfInitiatedRef.current = true;
    const next = event.target.value;
    onChange(next, parseJsonText(next).ok);
  }

  function handleBeautify(): void {
    if (!parsed.ok) {
      return;
    }
    selfInitiatedRef.current = true;
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
        className={cn(tall ? "min-h-[12.5rem]" : "min-h-40", "font-mono")}
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
