type JsonParseResult =
  | { readonly ok: true; readonly value: unknown }
  | { readonly ok: false; readonly message: string };

export function parseJsonText(text: string): JsonParseResult {
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
