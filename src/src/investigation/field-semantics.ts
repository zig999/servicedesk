// domain/investigation/field-semantics as data: one field a capability's own
// output schema declares, read structurally from that schema's own top-level
// `properties` object — the key names the field, and its own `type` and
// `description`, where the schema states them, are read as this field's
// declared semantics. No other content of that schema is read or validated:
// an operator's own hint, never enforced (domain/investigation/field-semantics).
//
// This is the third structural output_schema reader in this codebase,
// deliberately independent of investigation/citation-validation.ts's own
// declaredFieldsOf and capability-registry/capability-input-schema-shape.ts's
// own declaredInputSchemaShape — both already documented at length as
// parallel implementations rather than a shared import, each for its own
// reason (a name-only read against the field rule, and the input schema's
// shape against the opposite dependency direction) — rather than importing
// either: this module answers a third, narrower question neither of those
// two answers (one field's own type and description, not merely a set of
// field names), so it follows the same documented, deliberate-duplication
// convention (this task's own inference, recorded in the delivery record)
// with its own copy of the identical defensive, never-throw parse helpers,
// rather than trying to collapse three readers of the same shape into one
// shared function.

/**
 * One field a capability's own output schema declares
 * (domain/investigation/field-semantics), snapshotted onto the evidence item
 * that names it: the key is this field's name, and its own `type` and
 * `description` travel along exactly where the schema states them as
 * strings.
 */
export type FieldSemantics = {
  readonly name: string;
  readonly type?: string;
  readonly description?: string;
};

/**
 * The fields one capability's output schema declares, read structurally as a
 * JSON Schema's top-level `properties` keys, each carrying its own `type`
 * and `description` exactly where the schema states them as strings — no
 * other content of that schema is read or validated
 * (domain/investigation/field-semantics' own "an operator's own hint, never
 * enforced"). Answers an empty array for a schema that is not parseable
 * JSON, or that holds no top-level `properties` object, the same
 * "malformed or absent is nothing declared, never a fault" posture
 * declaredFieldsOf and declaredInputSchemaShape already keep for their own
 * schemas.
 */
export function fieldSemanticsOf(outputSchema: string | undefined): readonly FieldSemantics[] {
  if (outputSchema === undefined) {
    return [];
  }
  const parsed = parseJsonOrUndefined(outputSchema);
  if (!isPlainObject(parsed) || !isPlainObject(parsed.properties)) {
    return [];
  }
  return Object.entries(parsed.properties).map(([name, value]) => fieldSemanticsFrom(name, value));
}

/** One property key's own declared semantics: its name, plus its own `type` and `description` exactly where that key's declared value states them as strings — anything else that value declares is not read (domain/investigation/field-semantics' own "no other content of that schema is read or validated"). */
function fieldSemanticsFrom(name: string, value: unknown): FieldSemantics {
  const declared = isPlainObject(value) ? value : {};
  return {
    name,
    ...(typeof declared.type === 'string' ? { type: declared.type } : {}),
    ...(typeof declared.description === 'string' ? { description: declared.description } : {}),
  };
}

/** Parses text as JSON, answering undefined rather than throwing where it is not valid JSON at all — the same convention citation-validation.ts's own parseJsonOrUndefined keeps, restated here rather than imported (this module's own deliberate independence, see this file's own header). */
function parseJsonOrUndefined(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** Whether a parsed JSON value is a non-null, non-array object — the only shape this reader reads keys from, for a schema's own top level, its `properties` value, or one property's own declared value alike. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
