import { ConnectorPlaceholderNotResolvedError } from '../errors/connector-placeholder-not-resolved.error.js';
import { IncompleteConnectorCallDescriptorError } from '../errors/incomplete-connector-call-descriptor.error.js';
import type { Subject } from '../investigation/subject.js';
import type { AssembledConnectorRequest, ConnectorCallDescriptor } from './connector-call-descriptor.js';

const SUBJECT_PLACEHOLDER_KIND = 'subject';
const REQUESTER_PLACEHOLDER_KIND = 'requester';
const CREDENTIAL_PLACEHOLDER_KIND = 'credential';

const PLACEHOLDER_ARGUMENT_SEPARATOR = ':';

const PLACEHOLDER_PATTERN = /\$\{([^}]+)\}/g;

type PlaceholderResolutionContext = {
  readonly subject: Subject;
  readonly requester: string;
  readonly env: NodeJS.ProcessEnv;
};

type DeclaredConnectorCallDescriptor = Readonly<Record<string, unknown>> & {
  readonly address: string;
  readonly query?: Readonly<Record<string, string>>;
  readonly headers?: Readonly<Record<string, string>>;
};

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

export type ResolveConnectorRequestOptions = {
  readonly configuration: Readonly<Record<string, unknown>>;
  readonly subject: Subject;
  readonly requester: string;
  readonly env?: NodeJS.ProcessEnv;
};

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

function refuseDescriptorDepartures(
  configuration: Readonly<Record<string, unknown>>,
): asserts configuration is DeclaredConnectorCallDescriptor {
  const problems = descriptorProblems(configuration);
  if (problems.length > 0) {
    throw new IncompleteConnectorCallDescriptorError(problems);
  }
}

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

function substituteString(template: string, context: PlaceholderResolutionContext): string {
  return template.replace(PLACEHOLDER_PATTERN, (_whole, token: string) => resolvePlaceholderToken(token, context));
}

function substituteStringRecord(
  record: Readonly<Record<string, string>>,
  context: PlaceholderResolutionContext,
): Record<string, string> {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, substituteString(value, context)]));
}

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

function splitPlaceholderToken(token: string): readonly [string, string | undefined] {
  const separatorIndex = token.indexOf(PLACEHOLDER_ARGUMENT_SEPARATOR);
  return separatorIndex === -1 ? [token, undefined] : [token.slice(0, separatorIndex), token.slice(separatorIndex + 1)];
}

export function subjectAttributePlaceholderNamesIn(configurationText: string): readonly string[] {
  return [...configurationText.matchAll(PLACEHOLDER_PATTERN)]
    .map((match) => splitPlaceholderToken(match[1]))
    .filter(isSubjectAttributeToken)
    .map(([, argument]) => argument);
}

function isSubjectAttributeToken(parts: readonly [string, string | undefined]): parts is readonly [string, string] {
  return parts[0] === SUBJECT_PLACEHOLDER_KIND && parts[1] !== undefined && parts[1] !== '';
}

function requireArgument(token: string, argument: string | undefined): string {
  if (argument === undefined || argument === '') {
    throw new IncompleteConnectorCallDescriptorError([
      `placeholder "\${${token}}" names no attribute or variable to resolve`,
    ]);
  }
  return argument;
}

function resolveSubjectPlaceholder(attributeName: string, subject: Subject): string {
  const match = subject.attributes.find((pair) => pair.attribute === attributeName);
  if (match === undefined || match.value === '') {
    throw new ConnectorPlaceholderNotResolvedError('subject-attribute', attributeName);
  }
  return match.value;
}

function resolveCredentialPlaceholder(envVarName: string, env: NodeJS.ProcessEnv): string {
  const value = env[envVarName];
  if (value === undefined || value === '') {
    throw new ConnectorPlaceholderNotResolvedError('credential', envVarName);
  }
  return value;
}

function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Readonly<Record<string, string>> {
  return isPlainObject(value) && Object.values(value).every((entry) => typeof entry === 'string');
}
