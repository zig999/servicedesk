import {
  generateCredentialPlaceholders,
  parameterDisplacedByCredential,
} from './generated-credential-placeholders.js';
import type { GeneratedCredentialPlacement } from './generated-credential-placeholders.js';
import { resolveSubjectPlaceholders } from './subject-placeholder-resolution.js';
import type { SubjectPlaceholderPlacement } from './subject-placeholder-resolution.js';
import { registeredMethodMismatch } from './registered-method-comparison.js';
import type { RegisteredConnectorConfigurationReader } from './registered-method-comparison.js';
import { readOpenApiOperation } from './openapi-operation-reader.js';
import type {
  OpenApiOperationParameter,
  OpenApiOperationReading,
  OpenApiOperationResponse,
  OpenApiSuccessResponseField,
} from './openapi-operation-reader.js';
import { draftedReadingNotes } from './connector-configuration-draft-reading-notes.js';
import { lowestStatusSuccessFieldsOf } from './success-response-field-selection.js';
import type { IOpenApiDocumentFetcher } from './openapi-document-fetcher.port.js';
import type { ICapabilitiesReader } from './capabilities-reader.port.js';
import type {
  ConnectorConfigurationDraft,
  ConnectorConfigurationDraftReadingNote,
  ConnectorConfigurationDraftResponseField,
  ConnectorConfigurationDraftStatusReading,
  ConnectorConfigurationDraftUnresolvedItem,
  ConnectorConfigurationDraftUnresolvedReason,
} from './connector-configuration-draft.js';

const COOKIE_HEADER_NAME = 'Cookie';
const COOKIE_SEGMENT_SEPARATOR = '; ';
const OCCUPIED_REASON: ConnectorConfigurationDraftUnresolvedReason = 'drafted-key-occupied-by-another-security-scheme';
const DENIED_STATUSES: ReadonlySet<string> = new Set(['401', '403', '407']);
const OK_STATUS_RANGE_MIN = 200;
const OK_STATUS_RANGE_MAX = 299;

export type GenerateConnectorConfigurationDraftOptions = {
  readonly connector: string;
  readonly link: string;
  readonly path: string;
  readonly method: string;
  readonly documentFetcher: IOpenApiDocumentFetcher;
  readonly capabilitiesReader: ICapabilitiesReader;
  readonly registry: RegisteredConnectorConfigurationReader;
};

type DraftedConfigurationInput = {
  readonly reading: OpenApiOperationReading;
  readonly subjectPlacement: SubjectPlaceholderPlacement;
  readonly credentialPlacement: GeneratedCredentialPlacement;
  readonly displaced: readonly OpenApiOperationParameter[];
};

type DraftedHeadersInput = {
  readonly subjectPlacement: SubjectPlaceholderPlacement;
  readonly credentialPlacement: GeneratedCredentialPlacement;
  readonly displacedCookieNames: ReadonlySet<string>;
};

type FinalCookieValueInput = {
  readonly subjectCookieHeader: string | undefined;
  readonly displacedCookieNames: ReadonlySet<string>;
  readonly credentialCookieSegments: readonly string[];
};

export async function generateConnectorConfigurationDraft(
  options: GenerateConnectorConfigurationDraftOptions,
): Promise<ConnectorConfigurationDraft> {
  const { connector, link, path, method, documentFetcher, capabilitiesReader, registry } = options;
  const documentText = await documentFetcher.fetchOpenApiDocument(link);
  const reading = readOpenApiOperation(documentText, path, method);
  const subjectPlacement = await resolveSubjectPlaceholders({
    connector,
    path,
    parameters: reading.parameters,
    requestBodyFieldNames: reading.requestBodyFieldNames,
    capabilitiesReader,
  });
  const credentialPlacement = generateCredentialPlaceholders({
    connector,
    requiredSecuritySchemes: reading.requiredSecuritySchemes,
  });
  const displaced = displacedParameters(reading.parameters, credentialPlacement);
  const methodMismatch = await registeredMethodMismatch(registry, connector, reading.method);
  return {
    connector,
    configuration: draftedConfigurationText({ reading, subjectPlacement, credentialPlacement, displaced }),
    unresolved: reconciledUnresolved(displaced, subjectPlacement.unresolved, credentialPlacement.unresolved),
    generated_credentials: credentialPlacement.generatedCredentials,
    status_readings: draftedStatusReadings(reading.responses),
    response_fields: draftedResponseFields(reading.successResponseFields),
    reading_notes: draftedReadingNotesOf(reading, path),
    ...(methodMismatch === undefined ? {} : { method_mismatch: methodMismatch }),
  };
}

function draftedReadingNotesOf(
  reading: OpenApiOperationReading,
  path: string,
): readonly ConnectorConfigurationDraftReadingNote[] {
  return draftedReadingNotes({
    method: reading.method,
    path,
    responses: reading.responses,
    successResponseReadings: reading.successResponseReadings,
    successResponseFields: reading.successResponseFields,
  });
}

function draftedConfigurationText(input: DraftedConfigurationInput): string {
  const { reading, subjectPlacement, credentialPlacement, displaced } = input;
  const query = { ...subjectPlacement.query, ...credentialPlacement.query };
  const headers = draftedHeaders({ subjectPlacement, credentialPlacement, displacedCookieNames: cookieNames(displaced) });
  const configuration: Record<string, unknown> = {
    method: reading.method.toUpperCase(),
    address: draftedAddress(subjectPlacement.path, reading.serversInEffect),
    ...(Object.keys(query).length > 0 ? { query } : {}),
    ...(Object.keys(headers).length > 0 ? { headers } : {}),
    ...(Object.keys(subjectPlacement.body).length > 0 ? { body: subjectPlacement.body } : {}),
    statusMap: draftedStatusMap(reading.responses),
    responseMap: draftedResponseMap(reading.successResponseFields),
  };
  return JSON.stringify(configuration);
}

function draftedResponseMap(fields: readonly OpenApiSuccessResponseField[]): Readonly<Record<string, string>> {
  return Object.fromEntries(lowestStatusSuccessFieldsOf(fields).map((field) => [field.name, field.path]));
}

function draftedResponseFields(
  fields: readonly OpenApiSuccessResponseField[],
): readonly ConnectorConfigurationDraftResponseField[] {
  return lowestStatusSuccessFieldsOf(fields).map(responseFieldOf);
}

function responseFieldOf(field: OpenApiSuccessResponseField): ConnectorConfigurationDraftResponseField {
  const { name, path, status, declaredType, declaredRequired, envelope } = field;
  return {
    name,
    path,
    status,
    ...(declaredType === undefined ? {} : { declared_type: declaredType }),
    ...(declaredRequired === undefined ? {} : { declared_required: declaredRequired }),
    ...(envelope === undefined ? {} : { envelope }),
  };
}

function statusResponses(responses: readonly OpenApiOperationResponse[]): readonly OpenApiOperationResponse[] {
  return responses.filter((response) => response.kind === 'status');
}

function statusEnding(status: string): ConnectorConfigurationDraftStatusReading['ending'] {
  if (DENIED_STATUSES.has(status)) {
    return 'denied';
  }
  const numericStatus = Number(status);
  return numericStatus >= OK_STATUS_RANGE_MIN && numericStatus <= OK_STATUS_RANGE_MAX ? 'ok' : 'unavailable';
}

function draftedStatusMap(responses: readonly OpenApiOperationResponse[]): Readonly<Record<string, string>> {
  return Object.fromEntries(statusResponses(responses).map((response) => [response.key, statusEnding(response.key)]));
}

function draftedStatusReadings(
  responses: readonly OpenApiOperationResponse[],
): readonly ConnectorConfigurationDraftStatusReading[] {
  return statusResponses(responses).map(statusReadingOf);
}

function statusReadingOf(response: OpenApiOperationResponse): ConnectorConfigurationDraftStatusReading {
  const ending = statusEnding(response.key);
  return response.description === undefined
    ? { status: response.key, ending }
    : { status: response.key, ending, declared_as: response.description };
}

function draftedHeaders(input: DraftedHeadersInput): Readonly<Record<string, string>> {
  const { subjectPlacement, credentialPlacement, displacedCookieNames } = input;
  const ownHeaders = withoutCookieKey(subjectPlacement.headers);
  const cookieValue = finalCookieValue({
    subjectCookieHeader: subjectCookieHeaderValue(subjectPlacement.headers),
    displacedCookieNames,
    credentialCookieSegments: credentialPlacement.cookieSegments,
  });
  const merged: Record<string, string> = { ...ownHeaders, ...credentialPlacement.headers };
  if (cookieValue !== undefined) {
    merged[COOKIE_HEADER_NAME] = cookieValue;
  }
  return merged;
}

function finalCookieValue(input: FinalCookieValueInput): string | undefined {
  const { subjectCookieHeader, displacedCookieNames, credentialCookieSegments } = input;
  const ownSegments = (subjectCookieHeader ?? '')
    .split(COOKIE_SEGMENT_SEPARATOR)
    .filter((segment) => segment.length > 0 && !displacedCookieNames.has(cookieSegmentName(segment)));
  const segments = [...ownSegments, ...credentialCookieSegments];
  return segments.length > 0 ? segments.join(COOKIE_SEGMENT_SEPARATOR) : undefined;
}

function cookieSegmentName(segment: string): string {
  return segment.slice(0, segment.indexOf('='));
}

function subjectCookieHeaderValue(headers: Readonly<Record<string, string>>): string | undefined {
  return Object.entries(headers).find(([key]) => key === COOKIE_HEADER_NAME)?.[1];
}

function withoutCookieKey(headers: Readonly<Record<string, string>>): Readonly<Record<string, string>> {
  return Object.fromEntries(Object.entries(headers).filter(([key]) => key !== COOKIE_HEADER_NAME));
}

function draftedAddress(path: string, serversInEffect: readonly string[]): string {
  const first = serversInEffect[0];
  return first === undefined ? path : `${withoutTrailingSlash(first)}${path}`;
}

function withoutTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function displacedParameters(
  parameters: readonly OpenApiOperationParameter[],
  credentialPlacement: GeneratedCredentialPlacement,
): readonly OpenApiOperationParameter[] {
  return parameters.filter((parameter) => parameterDisplacedByCredential(parameter, credentialPlacement) !== undefined);
}

function cookieNames(displaced: readonly OpenApiOperationParameter[]): ReadonlySet<string> {
  return new Set(displaced.filter((parameter) => parameter.location === 'cookie').map((parameter) => parameter.name));
}

function reconciledUnresolved(
  displaced: readonly OpenApiOperationParameter[],
  subjectUnresolved: readonly ConnectorConfigurationDraftUnresolvedItem[],
  credentialUnresolved: readonly ConnectorConfigurationDraftUnresolvedItem[],
): readonly ConnectorConfigurationDraftUnresolvedItem[] {
  const displacedNames = new Set(displaced.map((parameter) => parameter.name));
  const kept = subjectUnresolved.filter((item) => !displacedNames.has(item.name));
  const displacedItems = [...displacedNames].map((name) => ({ name, reason: OCCUPIED_REASON }));
  return [...kept, ...displacedItems, ...credentialUnresolved];
}
