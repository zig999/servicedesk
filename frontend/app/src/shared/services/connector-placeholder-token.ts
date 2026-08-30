/**
 * The subject-placeholder token grammar rules/integration/an-http-connector-configuration-declares-its-call
 * states for a connector configuration's own address, query, headers and body:
 * a placeholder is written as the literal text form '${kind}' or '${kind:argument}',
 * a placeholder naming a Subject attribute as '${subject:<attribute-name>}'.
 * Held here, feature-neutral, because more than one feature reads this grammar --
 * services/simulation-subject-derivation.ts (the case-simulation feature's own Subject
 * derivation) is its first consumer and the one this module was extracted out of
 * (task/connector-test-panel-placeholder-attributes/extract-connector-placeholder-parsing),
 * and the connector-authoring test panel this same task's own inventory names as a second,
 * not-yet-written consumer is why this sits under shared/services/ rather than beside
 * simulation-subject-derivation.ts itself.
 *
 * Mirrors this project's own backend implementation of the same rule,
 * src/http-connector/connector-request-resolver.ts (PLACEHOLDER_PATTERN
 * `/\$\{([^}]+)\}/g`, splitPlaceholderToken's kind/argument split at the first ':',
 * and a filter narrowing a split token to one naming the "subject" kind with a
 * non-empty argument) -- confirmed identical by reading that file, the same
 * confirmation simulation-subject-derivation.ts's own header comment already recorded
 * before this extraction.
 */

/** The kind name preceding an optional ':<argument>' inside one '${kind[:argument]}' placeholder token -- named once rather than spelled out at each comparison (TYP-04 in spirit: one governed constant rather than a literal repeated at each callsite). */
export const SUBJECT_PLACEHOLDER_KIND = "subject";

/** Separates a placeholder's own kind from its argument inside one token, e.g. "subject:account-id". */
export const PLACEHOLDER_ARGUMENT_SEPARATOR = ":";

/** Matches every '${...}' placeholder occurring anywhere inside a string value -- never a whole-string requirement, mirroring connector-request-resolver.ts's own PLACEHOLDER_PATTERN. */
export const PLACEHOLDER_PATTERN = /\$\{([^}]+)\}/g;

/**
 * Splits one placeholder token (the text between '${' and '}') into its kind and its
 * optional argument, at the first PLACEHOLDER_ARGUMENT_SEPARATOR -- mirrors
 * connector-request-resolver.ts's own splitPlaceholderToken exactly. A token carrying no
 * separator at all (a bare '${requester}') splits to that whole token as its kind, with
 * no argument.
 */
export function splitPlaceholderToken(token: string): readonly [kind: string, argument: string | undefined] {
  const separatorIndex = token.indexOf(PLACEHOLDER_ARGUMENT_SEPARATOR);
  return separatorIndex === -1
    ? [token, undefined]
    : [token.slice(0, separatorIndex), token.slice(separatorIndex + 1)];
}

/**
 * Narrows one split placeholder token to a Subject-attribute placeholder naming a
 * non-empty attribute -- the filter keeping only kind === "subject", mirroring
 * connector-request-resolver.ts's own isSubjectAttributeToken. A "requester" or
 * "credential" token, or a bare "${subject}" naming no attribute at all, is excluded
 * rather than treated as an error: recognizing and skipping what this filter does not
 * name is this grammar's own reading, not a malformed-configuration refusal (which is a
 * different connector-implementation concern this module does not reach).
 */
export function isSubjectPlaceholderToken(
  parts: readonly [string, string | undefined],
): parts is readonly [string, string] {
  return parts[0] === SUBJECT_PLACEHOLDER_KIND && parts[1] !== undefined && parts[1] !== "";
}
