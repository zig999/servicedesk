import { load as loadYamlDocument } from 'js-yaml';
import { OpenApiDocumentNotReadableError } from '../errors/openapi-document-not-readable.error.js';
import { OpenApiOperationNotFoundError } from '../errors/openapi-operation-not-found.error.js';

type PlainObject = Readonly<Record<string, unknown>>;

export type OpenApiParameterLocation = 'path' | 'query' | 'header' | 'cookie';

export type OpenApiOperationParameter = {
  readonly name: string;
  readonly location: OpenApiParameterLocation;
};

export type OpenApiRequiredSecurityScheme =
  | {
      readonly schemeName: string;
      readonly kind: 'apiKey';
      readonly name: string;
      readonly location: 'header' | 'query' | 'cookie';
    }
  | { readonly schemeName: string; readonly kind: 'http'; readonly httpScheme: string }
  | { readonly schemeName: string; readonly kind: 'oauth2' | 'openIdConnect' | 'mutualTLS' };

export type OpenApiSecuritySchemeKind = OpenApiRequiredSecurityScheme['kind'];

export type OpenApiOperationReading = {
  readonly method: string;
  readonly parameters: readonly OpenApiOperationParameter[];
  readonly requestBodyFieldNames: readonly string[];
  readonly requiredSecuritySchemes: readonly OpenApiRequiredSecurityScheme[];
  readonly serversInEffect: readonly string[];
};

type OperationEntry = {
  readonly pathItem: unknown;
  readonly operation: PlainObject;
  readonly operationKey: string;
};

type RawOpenApiParameter = PlainObject & {
  readonly name: string;
  readonly in: OpenApiParameterLocation;
};

export function readOpenApiOperation(documentText: string, path: string, method: string): OpenApiOperationReading {
  const document = parsedOpenApiDocument(documentText);
  refuseUnsupportedVersion(document);
  const { pathItem, operation, operationKey } = operationEntry(document, path, method);
  return {
    method: operationKey,
    parameters: parametersOf(document, pathItem, operation),
    requestBodyFieldNames: requestBodyFieldNamesOf(document, operation),
    requiredSecuritySchemes: requiredSecuritySchemesOf(document, operation),
    serversInEffect: serversInEffectOf(pathItem, operation, document),
  };
}

function serversInEffectOf(pathItem: unknown, operation: PlainObject, document: PlainObject): readonly string[] {
  const ownServers = declaredServerUrls(operation.servers);
  if (ownServers !== undefined) {
    return ownServers;
  }
  const pathItemServers = isPlainObject(pathItem) ? declaredServerUrls(pathItem.servers) : undefined;
  if (pathItemServers !== undefined) {
    return pathItemServers;
  }
  return declaredServerUrls(document.servers) ?? [];
}

function declaredServerUrls(value: unknown): readonly string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value.filter(isPlainObject).filter(hasStringUrl).map((entry) => entry.url);
}

function hasStringUrl(value: PlainObject): value is PlainObject & { readonly url: string } {
  return typeof value.url === 'string';
}

function operationEntry(document: PlainObject, path: string, method: string): OperationEntry {
  const paths: PlainObject = isPlainObject(document.paths) ? document.paths : {};
  const pathItem = resolveRef(document, paths[path]);
  const operationKey = method.toLowerCase();
  const rawOperation = isPlainObject(pathItem) ? pathItem[operationKey] : undefined;
  if (!isPlainObject(rawOperation)) {
    throw new OpenApiOperationNotFoundError(path, method);
  }
  return { pathItem, operation: rawOperation, operationKey };
}

function parametersOf(
  document: PlainObject,
  pathItem: unknown,
  operation: PlainObject,
): readonly OpenApiOperationParameter[] {
  const operationParams = resolvedParameterList(document, operation.parameters);
  const pathItemParams = isPlainObject(pathItem) ? resolvedParameterList(document, pathItem.parameters) : [];
  const isOwnConflict = (candidate: OpenApiOperationParameter): boolean =>
    operationParams.some((own) => own.name === candidate.name && own.location === candidate.location);
  return [...operationParams, ...pathItemParams.filter((candidate) => !isOwnConflict(candidate))];
}

function resolvedParameterList(document: PlainObject, rawList: unknown): readonly OpenApiOperationParameter[] {
  if (!Array.isArray(rawList)) {
    return [];
  }
  return rawList
    .map((entry) => resolveRef(document, entry))
    .filter(isPlainObject)
    .filter(isOpenApiParameter)
    .map((entry) => ({ name: entry.name, location: entry.in }));
}

function isOpenApiParameter(value: PlainObject): value is RawOpenApiParameter {
  return typeof value.name === 'string' && isParameterLocation(value.in);
}

function requestBodyFieldNamesOf(document: PlainObject, operation: PlainObject): readonly string[] {
  const requestBody = resolveRef(document, operation.requestBody);
  const content = isPlainObject(requestBody) ? requestBody.content : undefined;
  const mediaType = isPlainObject(content) ? content['application/json'] : undefined;
  const schema = isPlainObject(mediaType) ? resolveRef(document, mediaType.schema) : undefined;
  return isPlainObject(schema) && isPlainObject(schema.properties) ? Object.keys(schema.properties) : [];
}

function requiredSecuritySchemesOf(
  document: PlainObject,
  operation: PlainObject,
): readonly OpenApiRequiredSecurityScheme[] {
  const securityInEffect = operation.security !== undefined ? operation.security : document.security;
  if (!Array.isArray(securityInEffect) || securityInEffect.length === 0) {
    return [];
  }
  const firstRequirement = securityInEffect[0];
  const schemeNames = isPlainObject(firstRequirement) ? Object.keys(firstRequirement) : [];
  return schemeNames.map((schemeName) => requiredSecurityScheme(document, schemeName));
}

function requiredSecurityScheme(document: PlainObject, schemeName: string): OpenApiRequiredSecurityScheme {
  const scheme = resolvedSecuritySchemeDeclaration(document, schemeName);
  if (scheme.type === 'apiKey' && typeof scheme.name === 'string' && isApiKeyLocation(scheme.in)) {
    return { schemeName, kind: 'apiKey', name: scheme.name, location: scheme.in };
  }
  if (scheme.type === 'http' && typeof scheme.scheme === 'string') {
    return { schemeName, kind: 'http', httpScheme: scheme.scheme };
  }
  if (isOtherSecuritySchemeKind(scheme.type)) {
    return { schemeName, kind: scheme.type };
  }
  throw notReadable('unparseable', `the security scheme "${schemeName}"`);
}

function resolvedSecuritySchemeDeclaration(document: PlainObject, schemeName: string): PlainObject {
  const components: PlainObject = isPlainObject(document.components) ? document.components : {};
  const rawScheme = isPlainObject(components.securitySchemes) ? components.securitySchemes[schemeName] : undefined;
  const scheme = resolveRef(document, rawScheme);
  if (!isPlainObject(scheme)) {
    throw notReadable('unparseable', `the security scheme "${schemeName}"`);
  }
  return scheme;
}

function resolveRef(document: PlainObject, value: unknown): unknown {
  const seenPointers = new Set<string>();
  let current = value;
  while (isPlainObject(current) && typeof current.$ref === 'string') {
    if (seenPointers.has(current.$ref)) {
      throw notReadable('unparseable', `a $ref cycle at "${current.$ref}"`);
    }
    seenPointers.add(current.$ref);
    current = pointerTarget(document, current.$ref);
  }
  return current;
}

function pointerTarget(document: PlainObject, pointer: string): unknown {
  if (!pointer.startsWith('#/')) {
    throw notReadable('unparseable', `the $ref "${pointer}"`);
  }
  const segments = pointer.slice(2).split('/').map(decodedPointerSegment);
  return segments.reduce<unknown>((node, segment) => {
    if (!isPlainObject(node) || !(segment in node)) {
      throw notReadable('unparseable', `the $ref "${pointer}"`);
    }
    return node[segment];
  }, document);
}

function decodedPointerSegment(segment: string): string {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~');
}

function parsedOpenApiDocument(documentText: string): PlainObject {
  const parsed = parsedAsJsonOrYaml(documentText);
  if (!isPlainObject(parsed)) {
    throw notReadable('unparseable', 'the fetched document text');
  }
  return parsed;
}

function parsedAsJsonOrYaml(documentText: string): unknown {
  try {
    return JSON.parse(documentText);
  } catch {
    return parsedAsYaml(documentText);
  }
}

function parsedAsYaml(documentText: string): unknown {
  try {
    return loadYamlDocument(documentText);
  } catch (error) {
    throw notReadable('unparseable', 'the fetched document text', error);
  }
}

function refuseUnsupportedVersion(document: PlainObject): void {
  if (typeof document.openapi === 'string') {
    if (!document.openapi.startsWith('3.')) {
      throw new OpenApiDocumentNotReadableError({ kind: 'unsupported-version', declaredVersion: document.openapi });
    }
    return;
  }
  if (typeof document.swagger === 'string') {
    throw new OpenApiDocumentNotReadableError({ kind: 'unsupported-version', declaredVersion: document.swagger });
  }
  throw new OpenApiDocumentNotReadableError({ kind: 'no-version-declared' });
}

function notReadable(kind: 'unparseable', detail: string, cause?: unknown): OpenApiDocumentNotReadableError {
  return new OpenApiDocumentNotReadableError({ kind, detail }, cause === undefined ? undefined : { cause });
}

function isParameterLocation(value: unknown): value is OpenApiParameterLocation {
  return value === 'path' || value === 'query' || value === 'header' || value === 'cookie';
}

function isApiKeyLocation(value: unknown): value is 'header' | 'query' | 'cookie' {
  return value === 'header' || value === 'query' || value === 'cookie';
}

function isOtherSecuritySchemeKind(value: unknown): value is 'oauth2' | 'openIdConnect' | 'mutualTLS' {
  return value === 'oauth2' || value === 'openIdConnect' || value === 'mutualTLS';
}

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
