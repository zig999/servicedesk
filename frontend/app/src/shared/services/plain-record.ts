/**
 * Whether a parsed JSON value is a well-formed configuration object --
 * rules/integration/a-connector-configuration-holds-a-well-formed-object's own "a null
 * value and an array included" are both syntactically valid JSON that is still refused,
 * so the shape a well-formed configuration's own text must parse to is exactly a plain,
 * non-null, non-array object, the same shape domain/integration/connector-configuration
 * requires of a registered configuration's own text.
 *
 * Held here, feature-neutral, because more than one feature read this same shape by
 * declaring its own private, identical copy of the check before this extraction
 * (task/connector-test-panel-placeholder-attributes/deduplicate-configuration-object-check):
 * services/simulation-subject-derivation.ts's own isPlainRecord and
 * hooks/use-test-connector-panel.ts's own parsesAsConfigurationObject each re-derived the
 * same typeof/null/Array.isArray expression rather than calling one shared primitive.
 *
 * Mirrors this project's own backend implementation of the same rule,
 * src/http-connector/connector-request-resolver.ts's own isPlainObject -- confirmed
 * identical by reading that file, the same confirmation simulation-subject-derivation.ts's
 * own header comment already recorded before this extraction. That backend module sits in
 * a different target from this frontend initiative and is not itself touched here.
 */

/**
 * Whether `value` is a plain, non-null, non-array object -- the only shape a connector
 * configuration's own descriptor, or a value parsed from one, is ever read as. Named for
 * the fact it establishes rather than for a single caller: a whole configuration's own
 * JSON.parse() result and a nested field within it (a declared query, headers or body)
 * are both checked against this exact shape.
 */
export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
