// The pure translation step
// (task/http-observation-runtime/descriptor-placeholder-resolver): turns a
// Subject's attribute-values, the collection's own requester identity, and a
// connector's own opaque call configuration into the concrete address,
// query, headers and body of one outbound HTTP request, plus wherever a
// credential the call needs is placed. Reads no store, calls no network,
// executes no configuration as code: every '${kind[:argument]}' placeholder
// found anywhere inside a string value of the descriptor's address, query,
// headers or body is looked up and substituted as plain text, never
// evaluated (no eval, no Function constructor, no equivalent dynamic-code
// path — criterion 1). A credential travels the same way — a placeholder
// naming an environment variable by name, read from `process.env` (or an
// injected override) only at resolution time, never a plain-text secret
// value stored in the configuration row itself (criterion 2). The requester
// identity travels through this exact same substitution mechanism as a
// Subject-drawn value (criterion 4,
// rules/investigation/collection-runs-in-the-requester-scope): giving one
// connector's call a requester-scoped parameter is a change to that
// connector's own configuration alone, never a change to this module.
// Resolving a placeholder over an attribute the Subject does not carry, or
// carries empty, refuses before any request is assembled rather than
// substituting a missing or empty value (criterion 3).
//
// This module sits entirely outside the domain layer — case behavior,
// investigation factory, evaluation, vocabulary
// (constraints/the-domain-depends-on-no-infrastructure) — under its own
// http-connector/ directory, imported only by the future HTTP adapter this
// epic's own sibling task (task/http-observation-runtime/http-declarative-
// observation-source) builds behind the unchanged IObservationSource port.
// That port is, and stays, the one real interface at the domain boundary:
// nothing here declares a second, string-keyed or dynamically-looked-up path
// for domain code to reach this translation or its own credential-reading
// mechanism (criterion 5) — this task adds no caller of its own, the same
// posture task/connector-registration/connector-configuration-persistence
// already took for its own registry module.

import { ConnectorPlaceholderNotResolvedError } from '../errors/connector-placeholder-not-resolved.error.js';
import { IncompleteConnectorCallDescriptorError } from '../errors/incomplete-connector-call-descriptor.error.js';
import type { Subject } from '../investigation/subject.js';
import type { AssembledConnectorRequest, ConnectorCallDescriptor } from './connector-call-descriptor.js';

/** The kind name preceding an optional ':<argument>' inside one '${kind[:argument]}' placeholder token — named once rather than spelled out at each comparison (TYP-04). */
const SUBJECT_PLACEHOLDER_KIND = 'subject';
const REQUESTER_PLACEHOLDER_KIND = 'requester';
const CREDENTIAL_PLACEHOLDER_KIND = 'credential';

/** Separates a placeholder's kind from its argument inside one token, e.g. "subject:id" or "credential:ACME_API_KEY". */
const PLACEHOLDER_ARGUMENT_SEPARATOR = ':';

/** Matches every '${...}' placeholder occurring anywhere inside a string value — never a whole-string requirement, so a placeholder may sit beside literal text on either side of it. */
const PLACEHOLDER_PATTERN = /\$\{([^}]+)\}/g;

/** What one resolution needs to answer every placeholder it may meet: the Subject the collection stage assembled, the requester identity travelling the same way, and the environment a credential placeholder reads from. */
type PlaceholderResolutionContext = {
  readonly subject: Subject;
  readonly requester: string;
  readonly env: NodeJS.ProcessEnv;
};

/**
 * A connector's own call configuration, narrowed to the minimum shape this
 * resolver requires, as the type then knows it — connector-call-descriptor.ts's
 * own DeclaredConnectorCallDescriptor is declared inline here rather than
 * exported, the same "declared registration" narrowing shape
 * connector-configuration-registry.service.ts already establishes for its
 * own registration refusal.
 */
type DeclaredConnectorCallDescriptor = Readonly<Record<string, unknown>> & {
  readonly address: string;
  readonly query?: Readonly<Record<string, string>>;
  readonly headers?: Readonly<Record<string, string>>;
};

/**
 * Narrows a connector's own opaque call configuration — exactly the shape
 * connector-registry/connector-configuration.ts's own
 * ConnectorConfiguration.configuration already holds — to the minimum call
 * descriptor this resolver requires, refusing what departs from it before
 * any substitution is attempted.
 */
export function asConnectorCallDescriptor(
  configuration: Readonly<Record<string, unknown>>,
): ConnectorCallDescriptor {
  refuseDescriptorDepartures(configuration);
  return {
    address: configuration.address,
    query: configuration.query,
    headers: configuration.headers,
    body: configuration.body,
  };
}

/** What one resolveConnectorRequest call takes: the connector's own opaque configuration, the Subject and requester the collection stage carries, and an optional environment override for testing (the same override-the-default-source shape env.ts's own loadEnv already establishes). */
export type ResolveConnectorRequestOptions = {
  readonly configuration: Readonly<Record<string, unknown>>;
  readonly subject: Subject;
  readonly requester: string;
  readonly env?: NodeJS.ProcessEnv;
};

/**
 * Resolves one connector's own call configuration against a Subject and a
 * requester into the concrete address, query, headers and body of one
 * outbound HTTP request — the whole translation this task exists for.
 * Throws before returning anything where the configuration is not a
 * well-formed descriptor, or where any placeholder it names cannot be
 * resolved; never returns a request carrying an unresolved placeholder or a
 * missing/empty substituted value.
 */
export function resolveConnectorRequest(options: ResolveConnectorRequestOptions): AssembledConnectorRequest {
  const { configuration, subject, requester, env = process.env } = options;
  const descriptor = asConnectorCallDescriptor(configuration);
  const context: PlaceholderResolutionContext = { subject, requester, env };
  return {
    address: substituteString(descriptor.address, context),
    query: substituteStringRecord(descriptor.query ?? {}, context),
    headers: substituteStringRecord(descriptor.headers ?? {}, context),
    body: descriptor.body === undefined ? undefined : substituteValue(descriptor.body, context),
  };
}

/** Refuses a configuration that departs from the minimum call-descriptor shape this resolver requires, narrowing it for every caller past this point. */
function refuseDescriptorDepartures(
  configuration: Readonly<Record<string, unknown>>,
): asserts configuration is DeclaredConnectorCallDescriptor {
  const problems = descriptorProblems(configuration);
  if (problems.length > 0) {
    throw new IncompleteConnectorCallDescriptorError(problems);
  }
}

/** Every way one configuration departs from the minimum call-descriptor shape, in terms a reader of the refusal can act on. */
function descriptorProblems(configuration: Readonly<Record<string, unknown>>): string[] {
  const problems: string[] = [];
  if (typeof configuration.address !== 'string' || configuration.address === '') {
    problems.push('address is not a non-empty string');
  }
  if (configuration.query !== undefined && !isStringRecord(configuration.query)) {
    problems.push('query is declared but is not a plain object of string values');
  }
  if (configuration.headers !== undefined && !isStringRecord(configuration.headers)) {
    problems.push('headers is declared but is not a plain object of string values');
  }
  return problems;
}

/** Substitutes every '${...}' placeholder inside one string template — the one place a Subject-drawn value, the requester or a credential ever enters an assembled request, always as plain text (never evaluated as code). */
function substituteString(template: string, context: PlaceholderResolutionContext): string {
  return template.replace(PLACEHOLDER_PATTERN, (_whole, token: string) => resolvePlaceholderToken(token, context));
}

/** Substitutes every value of a flat string record — query or headers as the descriptor declared them. */
function substituteStringRecord(
  record: Readonly<Record<string, string>>,
  context: PlaceholderResolutionContext,
): Record<string, string> {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, substituteString(value, context)]));
}

/** Substitutes placeholders throughout an arbitrarily nested body — a string leaf is substituted, an array or plain object is walked recursively, and any other value (number, boolean, null) passes through unchanged. */
function substituteValue(value: unknown, context: PlaceholderResolutionContext): unknown {
  if (typeof value === 'string') {
    return substituteString(value, context);
  }
  if (Array.isArray(value)) {
    return value.map((item: unknown) => substituteValue(item, context));
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, substituteValue(entry, context)]));
  }
  return value;
}

/** Resolves one placeholder token (the text between '${' and '}') to the plain text it stands for, refusing a kind this resolver does not recognize. */
function resolvePlaceholderToken(token: string, context: PlaceholderResolutionContext): string {
  const [kind, argument] = splitPlaceholderToken(token);
  if (kind === SUBJECT_PLACEHOLDER_KIND) {
    return resolveSubjectPlaceholder(requireArgument(token, argument), context.subject);
  }
  if (kind === REQUESTER_PLACEHOLDER_KIND) {
    return context.requester;
  }
  if (kind === CREDENTIAL_PLACEHOLDER_KIND) {
    return resolveCredentialPlaceholder(requireArgument(token, argument), context.env);
  }
  throw new IncompleteConnectorCallDescriptorError([
    `placeholder "\${${token}}" names an unrecognized kind "${kind}"`,
  ]);
}

/** Splits one placeholder token into its kind and its optional argument, at the first separator. */
function splitPlaceholderToken(token: string): readonly [string, string | undefined] {
  const separatorIndex = token.indexOf(PLACEHOLDER_ARGUMENT_SEPARATOR);
  return separatorIndex === -1 ? [token, undefined] : [token.slice(0, separatorIndex), token.slice(separatorIndex + 1)];
}

/**
 * Every Subject-attribute placeholder name embedded anywhere inside one
 * connector configuration's own call text —
 * (task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check,
 * rules/integration/a-connector-placeholder-is-declared-by-its-capability)
 * never a requester or credential placeholder, since that rule's own "only a
 * placeholder naming a Subject attribute is held to this" leaves nothing for
 * a capability's declared properties to check either against. Shares
 * PLACEHOLDER_PATTERN and splitPlaceholderToken with substituteString above
 * rather than a second regex over the same text (the inventory's own
 * must_not_duplicate note). Never throws: a bare "${subject}" naming no
 * attribute at all is skipped rather than refused, since raising a refusal
 * over what this reads is the reconciliation check's own consumer's concern
 * (connector-registry/connector-placeholder-declaration-check.ts), not this
 * read itself.
 */
export function subjectAttributePlaceholderNamesIn(configurationText: string): readonly string[] {
  return [...configurationText.matchAll(PLACEHOLDER_PATTERN)]
    .map((match) => splitPlaceholderToken(match[1]))
    .filter(isSubjectAttributeToken)
    .map(([, argument]) => argument);
}

/** Narrows one split placeholder token to a Subject-attribute placeholder naming a non-empty attribute — see subjectAttributePlaceholderNamesIn above for why a bare "${subject}" is skipped rather than refused here. */
function isSubjectAttributeToken(parts: readonly [string, string | undefined]): parts is readonly [string, string] {
  return parts[0] === SUBJECT_PLACEHOLDER_KIND && parts[1] !== undefined && parts[1] !== '';
}

/** Requires a placeholder's own argument to be declared and non-empty — a "subject" or "credential" placeholder naming nothing to resolve is a malformed descriptor, not a resolution failure. */
function requireArgument(token: string, argument: string | undefined): string {
  if (argument === undefined || argument === '') {
    throw new IncompleteConnectorCallDescriptorError([
      `placeholder "\${${token}}" names no attribute or variable to resolve`,
    ]);
  }
  return argument;
}

/** Resolves one Subject-attribute placeholder, refusing before any request is assembled where the Subject does not carry that attribute, or carries it as the empty string (criterion 3). */
function resolveSubjectPlaceholder(attributeName: string, subject: Subject): string {
  const match = subject.attributes.find((pair) => pair.attribute === attributeName);
  if (match === undefined || match.value === '') {
    throw new ConnectorPlaceholderNotResolvedError('subject-attribute', attributeName);
  }
  return match.value;
}

/** Resolves one credential placeholder by reading the named environment variable at resolution time — never a plain-text value stored in the configuration itself (criterion 2) — refusing where it is unset or empty. */
function resolveCredentialPlaceholder(envVarName: string, env: NodeJS.ProcessEnv): string {
  const value = env[envVarName];
  if (value === undefined || value === '') {
    throw new ConnectorPlaceholderNotResolvedError('credential', envVarName);
  }
  return value;
}

/** Whether a parsed value is a non-null, non-array object — the only shape a declared query, headers or body object is read as. */
function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Whether a value is a plain object whose own values are all strings — the shape query and headers must take when declared at all. */
function isStringRecord(value: unknown): value is Readonly<Record<string, string>> {
  return isPlainObject(value) && Object.values(value).every((entry) => typeof entry === 'string');
}
