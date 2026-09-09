import { declaredInputSchemaShape } from '../capability-registry/capability-input-schema-shape.js';
import type { ICapabilitiesReader, RegisteredCapabilityForPlaceholderCheck } from './capabilities-reader.port.js';
import type {
  ConnectorConfigurationDraftUnresolvedItem,
  ConnectorConfigurationDraftUnresolvedReason,
} from './connector-configuration-draft.js';
import type { OpenApiOperationParameter, OpenApiParameterLocation } from './openapi-operation-reader.js';

const SUBJECT_PLACEHOLDER_KIND = 'subject';
const NO_CAPABILITY_REGISTERED: ConnectorConfigurationDraftUnresolvedReason = 'no-capability-registered';
const NO_MATCHING_INPUT_SCHEMA_PROPERTY: ConnectorConfigurationDraftUnresolvedReason =
  'no-matching-input-schema-property';
const COOKIE_HEADER_NAME = 'Cookie';
const COOKIE_SEGMENT_SEPARATOR = '; ';

type NameOutcome =
  | { readonly resolved: true; readonly value: string }
  | { readonly resolved: false; readonly reason: ConnectorConfigurationDraftUnresolvedReason };

export type SubjectPlaceholderPlacement = {
  readonly path: string;
  readonly query: Readonly<Record<string, string>>;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: Readonly<Record<string, string>>;
  readonly unresolved: readonly ConnectorConfigurationDraftUnresolvedItem[];
};

export type ResolveSubjectPlaceholdersOptions = {
  readonly connector: string;
  readonly path: string;
  readonly parameters: readonly OpenApiOperationParameter[];
  readonly requestBodyFieldNames: readonly string[];
  readonly capabilitiesReader: ICapabilitiesReader;
};

export async function resolveSubjectPlaceholders(
  options: ResolveSubjectPlaceholdersOptions,
): Promise<SubjectPlaceholderPlacement> {
  const { connector, path, parameters, requestBodyFieldNames, capabilitiesReader } = options;
  const registered = (await capabilitiesReader.readCapabilities()).filter(
    (capability) => capability.connector === connector,
  );
  const outcomes = outcomesByName(distinctNames(parameters, requestBodyFieldNames), registered);
  return {
    path: substitutedPath(path, parameters, outcomes),
    query: recordFor(parameters, 'query', outcomes),
    headers: headersWithCookie(parameters, outcomes),
    body: recordForNames(requestBodyFieldNames, outcomes),
    unresolved: unresolvedItems(outcomes),
  };
}

function distinctNames(
  parameters: readonly OpenApiOperationParameter[],
  requestBodyFieldNames: readonly string[],
): readonly string[] {
  return [...new Set([...parameters.map((parameter) => parameter.name), ...requestBodyFieldNames])];
}

function outcomesByName(
  names: readonly string[],
  registered: readonly RegisteredCapabilityForPlaceholderCheck[],
): ReadonlyMap<string, NameOutcome> {
  return new Map(names.map((name) => [name, outcomeFor(name, registered)]));
}

function outcomeFor(name: string, registered: readonly RegisteredCapabilityForPlaceholderCheck[]): NameOutcome {
  if (registered.length === 0) {
    return { resolved: false, reason: NO_CAPABILITY_REGISTERED };
  }
  const everyCapabilityDeclaresIt = registered.every((capability) =>
    declaredInputSchemaShape(capability.input_schema).properties.includes(name),
  );
  return everyCapabilityDeclaresIt
    ? { resolved: true, value: `\${${SUBJECT_PLACEHOLDER_KIND}:${name}}` }
    : { resolved: false, reason: NO_MATCHING_INPUT_SCHEMA_PROPERTY };
}

function positionValue(name: string, outcomes: ReadonlyMap<string, NameOutcome>): string {
  const outcome = outcomes.get(name);
  return outcome !== undefined && outcome.resolved ? outcome.value : `{${name}}`;
}

function unresolvedItems(
  outcomes: ReadonlyMap<string, NameOutcome>,
): readonly ConnectorConfigurationDraftUnresolvedItem[] {
  const items: ConnectorConfigurationDraftUnresolvedItem[] = [];
  for (const [name, outcome] of outcomes) {
    if (!outcome.resolved) {
      items.push({ name, reason: outcome.reason });
    }
  }
  return items;
}

function substitutedPath(
  path: string,
  parameters: readonly OpenApiOperationParameter[],
  outcomes: ReadonlyMap<string, NameOutcome>,
): string {
  return parameters
    .filter((parameter) => parameter.location === 'path')
    .reduce(
      (current, parameter) => current.replaceAll(`{${parameter.name}}`, positionValue(parameter.name, outcomes)),
      path,
    );
}

function recordFor(
  parameters: readonly OpenApiOperationParameter[],
  location: OpenApiParameterLocation,
  outcomes: ReadonlyMap<string, NameOutcome>,
): Readonly<Record<string, string>> {
  return recordForNames(
    parameters.filter((parameter) => parameter.location === location).map((parameter) => parameter.name),
    outcomes,
  );
}

function recordForNames(
  names: readonly string[],
  outcomes: ReadonlyMap<string, NameOutcome>,
): Readonly<Record<string, string>> {
  return Object.fromEntries(names.map((name) => [name, positionValue(name, outcomes)]));
}

function headersWithCookie(
  parameters: readonly OpenApiOperationParameter[],
  outcomes: ReadonlyMap<string, NameOutcome>,
): Readonly<Record<string, string>> {
  const headers = recordFor(parameters, 'header', outcomes);
  const cookieValue = cookieHeaderValue(parameters, outcomes);
  return cookieValue === undefined ? headers : { ...headers, [COOKIE_HEADER_NAME]: cookieValue };
}

function cookieHeaderValue(
  parameters: readonly OpenApiOperationParameter[],
  outcomes: ReadonlyMap<string, NameOutcome>,
): string | undefined {
  const cookieParameters = parameters.filter((parameter) => parameter.location === 'cookie');
  if (cookieParameters.length === 0) {
    return undefined;
  }
  return cookieParameters
    .map((parameter) => `${parameter.name}=${positionValue(parameter.name, outcomes)}`)
    .join(COOKIE_SEGMENT_SEPARATOR);
}
