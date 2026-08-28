// The declared shape of a capability's input_schema
// (rules/integration/a-capability-input-schema-holds-a-well-formed-object): a
// top-level `properties` object, and, where declared, a `required` array
// that is a subset of `properties`' own keys. This is the direct structural
// sibling of citation-validation.ts's own declaredFieldsOf (the inventory's
// own naming) — the same defensive, never-throw posture for a malformed
// value — kept as an independent implementation rather than imported from
// that investigation-layer file: domain/integration/capability-registry's
// own "the most generic piece of the system" already states the dependency
// runs the other way (investigation reads capability-registry, e.g.
// http-declarative-observation-source.adapter.ts's own imports of Capability
// and ICapabilityQuery), so a capability-registry module importing from
// citation-validation.ts would run against that grain. Reused instead of
// duplicated is inputSchemaShapeProblems itself, called both by
// registerCapability's own refusal (capability-registry.service.ts) and by
// declaredInputSchemaShape below, so there is exactly one JSON-shape parser
// for this schema's own structure, not two.

/** The declared shape of one input schema, as a reader that only needs the shape (never a refusal) consumes it. */
export type DeclaredInputSchemaShape = {
  readonly properties: readonly string[];
  readonly required: readonly string[];
};

const EMPTY_SHAPE: DeclaredInputSchemaShape = { properties: [], required: [] };

/**
 * Every way an already-parsed input schema value departs from the declared
 * shape (rules/integration/a-capability-input-schema-holds-a-well-formed-object):
 * it declares a top-level `properties` that is not an object, or it
 * declares a `required` that is not an array, or one that names a key
 * `properties` does not hold. A schema declaring no `properties` key at all
 * is read as declaring it empty, never as a departure (this task's own
 * inference, disclosed in its delivery record: refusing bare omission would
 * also refuse the many already-registered and already-tested capabilities
 * across this codebase that declare no subject attribute by omitting
 * `properties` entirely, and this rule's own "an empty properties object is
 * a valid declaration on its own" reaches that same "a capability whose
 * connector reads nothing from the subject ... declares no attribute" case
 * whichever way that emptiness is spelled — declaredFieldsOf's own
 * established reading of output_schema already treats an absent
 * `properties` the identical way). `required`'s own keys
 * are checked against the declared `properties` keys — empty where
 * `properties` itself is malformed — so a schema departing in both ways at
 * once is named by both problems together, one MalformedCapabilityInputSchemaError
 * naming every departure (this rule's own criterion).
 */
export function inputSchemaShapeProblems(parsed: unknown): readonly string[] {
  const problems: string[] = [];
  const propertiesValue = isPlainObject(parsed) ? parsed.properties : undefined;
  const propertiesIsObject = propertiesValue === undefined || isPlainObject(propertiesValue);
  if (!isPlainObject(parsed) || !propertiesIsObject) {
    problems.push('properties is not declared as an object');
  }
  const propertyKeys = isPlainObject(propertiesValue) ? Object.keys(propertiesValue) : [];
  problems.push(...requiredProblems(isPlainObject(parsed) ? parsed.required : undefined, propertyKeys));
  return problems;
}

/** The `required` half of inputSchemaShapeProblems, split out so neither function crosses thirty lines (MNT-01). */
function requiredProblems(requiredValue: unknown, propertyKeys: readonly string[]): readonly string[] {
  if (requiredValue === undefined) {
    return [];
  }
  if (!Array.isArray(requiredValue)) {
    return ['required is not declared as an array'];
  }
  const absentKeys = requiredValue.filter((key) => typeof key !== 'string' || !propertyKeys.includes(key));
  return absentKeys.length > 0 ? [`required names a key absent from properties: ${absentKeys.join(', ')}`] : [];
}

/**
 * The declared shape of a capability's input_schema, read defensively for
 * every consumer that only needs the shape rather than a refusal —
 * properties and required both empty for a schema that is not parseable
 * JSON, or that departs from the declared shape in any way, the same
 * "malformed is nothing declared, never a fault at read" posture this
 * rule's own legacy clause gives a capability registered before this check
 * existed, wherever the shape is read. registerCapability's own refusal
 * check (capability-registry.service.ts) calls inputSchemaShapeProblems
 * above directly against an input_schema already confirmed to parse, since
 * a refusal must name what specifically departed — this permissive reader
 * is for every other consumer, none of which exists inside this task's own
 * file set yet (the rationale's own "case-input-requirements derivation").
 */
export function declaredInputSchemaShape(inputSchema: string | undefined): DeclaredInputSchemaShape {
  if (inputSchema === undefined) {
    return EMPTY_SHAPE;
  }
  const parsed = parseJsonOrUndefined(inputSchema);
  if (inputSchemaShapeProblems(parsed).length > 0 || !isPlainObject(parsed)) {
    return EMPTY_SHAPE;
  }
  const properties = isPlainObject(parsed.properties) ? Object.keys(parsed.properties) : [];
  const required = Array.isArray(parsed.required)
    ? parsed.required.filter((item): item is string => typeof item === 'string')
    : [];
  return { properties, required };
}

/** Parses text as JSON, answering undefined rather than throwing where it is not valid JSON at all. */
function parseJsonOrUndefined(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** Whether a parsed JSON value is a non-null, non-array object — the only shape this check reads keys from. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
