import { OpenApiDocumentNotReadableError } from '../errors/openapi-document-not-readable.error.js';
import { OpenApiOperationNotFoundError } from '../errors/openapi-operation-not-found.error.js';
import { readOpenApiDocument } from './openapi-document-reader.js';

type PlainObject = Readonly<Record<string, unknown>>;

export type OpenApiParameterLocation = 'path' | 'query' | 'header' | 'cookie';

export type OpenApiOperationParameter = {
  readonly name: string;
  readonly location: OpenApiParameterLocation;
};

export type OpenApiOperationParameterDetail = {
  readonly name: string;
  readonly location: OpenApiParameterLocation;
  readonly required: boolean;
  readonly reducedType?: string;
};

export type OpenApiRequestBodyField = {
  readonly name: string;
  readonly required: boolean;
  readonly reducedType?: string;
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

export type OpenApiResponseKeyKind = 'status' | 'range' | 'default';

export type OpenApiOperationResponse = {
  readonly key: string;
  readonly kind: OpenApiResponseKeyKind;
  readonly description?: string;
};

export type OpenApiSuccessResponseField = {
  readonly name: string;
  readonly path: string;
  readonly status: string;
  readonly declaredType?: string;
  readonly reducedType?: string;
  readonly declaredRequired?: boolean;
  readonly envelope?: string;
};

export type OpenApiSuccessResponseReading = {
  readonly key: string;
  readonly hasJsonContent: boolean;
  readonly variantsUnited: boolean;
  readonly declaresNoProperties: boolean;
  readonly envelope?: string;
};

export type OpenApiOperationReading = {
  readonly method: string;
  readonly parameters: readonly OpenApiOperationParameter[];
  readonly parameterDetails: readonly OpenApiOperationParameterDetail[];
  readonly requestBodyFieldNames: readonly string[];
  readonly requestBodyFields: readonly OpenApiRequestBodyField[];
  readonly requiredSecuritySchemes: readonly OpenApiRequiredSecurityScheme[];
  readonly serversInEffect: readonly string[];
  readonly responses: readonly OpenApiOperationResponse[];
  readonly successResponseFields: readonly OpenApiSuccessResponseField[];
  readonly successResponseReadings: readonly OpenApiSuccessResponseReading[];
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
  const document = readOpenApiDocument(documentText);
  const { pathItem, operation } = operationEntry(document, path, method);
  const parameterDetails = parameterDetailsOf(document, pathItem, operation);
  return {
    method: method.toUpperCase(),
    parameters: parametersOf(parameterDetails),
    parameterDetails,
    requestBodyFieldNames: requestBodyFieldNamesOf(document, operation),
    requestBodyFields: requestBodyFieldsOf(document, operation),
    requiredSecuritySchemes: requiredSecuritySchemesOf(document, operation),
    serversInEffect: serversInEffectOf(pathItem, operation, document),
    responses: responsesOf(document, operation),
    successResponseFields: successResponseFieldsOf(document, operation),
    successResponseReadings: successResponseReadingsOf(document, operation),
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
  const pathItem = resolvedPathItem(document, paths[path]);
  const operationKey = method.toLowerCase();
  const rawOperation = isPlainObject(pathItem) ? pathItem[operationKey] : undefined;
  if (!isPlainObject(rawOperation)) {
    throw new OpenApiOperationNotFoundError(path, method);
  }
  return { pathItem, operation: rawOperation, operationKey };
}

function resolvedPathItem(document: PlainObject, value: unknown): unknown {
  try {
    return resolveRef(document, value);
  } catch {
    return undefined;
  }
}

function parametersOf(parameterDetails: readonly OpenApiOperationParameterDetail[]): readonly OpenApiOperationParameter[] {
  return parameterDetails.map(({ name, location }) => ({ name, location }));
}

function parameterDetailsOf(
  document: PlainObject,
  pathItem: unknown,
  operation: PlainObject,
): readonly OpenApiOperationParameterDetail[] {
  const operationParams = resolvedParameterDetailsList(document, operation.parameters);
  const pathItemParams = isPlainObject(pathItem) ? resolvedParameterDetailsList(document, pathItem.parameters) : [];
  const isOwnConflict = (candidate: OpenApiOperationParameterDetail): boolean =>
    operationParams.some((own) => own.name === candidate.name && own.location === candidate.location);
  return [...operationParams, ...pathItemParams.filter((candidate) => !isOwnConflict(candidate))];
}

function resolvedParameterDetailsList(
  document: PlainObject,
  rawList: unknown,
): readonly OpenApiOperationParameterDetail[] {
  if (!Array.isArray(rawList)) {
    return [];
  }
  return rawList
    .map((entry) => resolveRef(document, entry))
    .filter(isPlainObject)
    .filter(isOpenApiParameter)
    .map((entry) => parameterDetailOf(document, entry));
}

function parameterDetailOf(document: PlainObject, entry: RawOpenApiParameter): OpenApiOperationParameterDetail {
  const base = { name: entry.name, location: entry.in, required: entry.required === true };
  const reducedType = reducedTypeOf(document, entry.schema);
  return reducedType === undefined ? base : { ...base, reducedType };
}

function isOpenApiParameter(value: PlainObject): value is RawOpenApiParameter {
  return typeof value.name === 'string' && isParameterLocation(value.in);
}

function requestBodySchemaOf(document: PlainObject, operation: PlainObject): PlainObject | undefined {
  const requestBody = resolveRef(document, operation.requestBody);
  const content = isPlainObject(requestBody) ? requestBody.content : undefined;
  const mediaType = isPlainObject(content) ? content['application/json'] : undefined;
  const schema = isPlainObject(mediaType) ? resolveRef(document, mediaType.schema) : undefined;
  return isPlainObject(schema) ? schema : undefined;
}

function requestBodyFieldNamesOf(document: PlainObject, operation: PlainObject): readonly string[] {
  const schema = requestBodySchemaOf(document, operation);
  return schema !== undefined && isPlainObject(schema.properties) ? Object.keys(schema.properties) : [];
}

function requestBodyFieldsOf(document: PlainObject, operation: PlainObject): readonly OpenApiRequestBodyField[] {
  const schema = requestBodySchemaOf(document, operation);
  const properties = schema !== undefined ? schema.properties : undefined;
  if (!isPlainObject(properties)) {
    return [];
  }
  const requiredNames =
    schema !== undefined && Array.isArray(schema.required) ? schema.required.filter(isStringValue) : [];
  return Object.keys(properties).map((name) => requestBodyField({ document, properties, name, requiredNames }));
}

function requestBodyField(input: {
  readonly document: PlainObject;
  readonly properties: PlainObject;
  readonly name: string;
  readonly requiredNames: readonly string[];
}): OpenApiRequestBodyField {
  const { document, properties, name, requiredNames } = input;
  const base = { name, required: requiredNames.includes(name) };
  const reducedType = reducedTypeOf(document, properties[name]);
  return reducedType === undefined ? base : { ...base, reducedType };
}

function responsesOf(document: PlainObject, operation: PlainObject): readonly OpenApiOperationResponse[] {
  const responses = operation.responses;
  if (!isPlainObject(responses)) {
    return [];
  }
  return Object.keys(responses).map((key) => responseReading(document, key, responses[key]));
}

function responseReading(document: PlainObject, key: string, rawResponse: unknown): OpenApiOperationResponse {
  const response = resolveRef(document, rawResponse);
  const description = isPlainObject(response) && typeof response.description === 'string' ? response.description : undefined;
  const kind = responseKeyKind(key);
  return description === undefined ? { key, kind } : { key, kind, description };
}

function responseKeyKind(key: string): OpenApiResponseKeyKind {
  if (key === 'default') {
    return 'default';
  }
  return /^[1-5][0-9]{2}$/.test(key) ? 'status' : 'range';
}

function isSuccessStatusKey(key: string): boolean {
  return responseKeyKind(key) === 'status' && key.startsWith('2');
}

function successResponseFieldsOf(
  document: PlainObject,
  operation: PlainObject,
): readonly OpenApiSuccessResponseField[] {
  const responses = operation.responses;
  if (!isPlainObject(responses)) {
    return [];
  }
  return Object.keys(responses)
    .filter(isSuccessStatusKey)
    .flatMap((status) => successResponseFieldsAt(document, status, responses[status]));
}

function successResponseFieldsAt(
  document: PlainObject,
  status: string,
  rawResponse: unknown,
): readonly OpenApiSuccessResponseField[] {
  const response = resolveRef(document, rawResponse);
  const content = isPlainObject(response) ? response.content : undefined;
  const mediaType = isPlainObject(content) ? content['application/json'] : undefined;
  const schema = isPlainObject(mediaType) ? resolveRef(document, mediaType.schema) : undefined;
  return isPlainObject(schema) ? schemaReadingAt(document, schema, status).fields : [];
}

function successResponseReadingsOf(
  document: PlainObject,
  operation: PlainObject,
): readonly OpenApiSuccessResponseReading[] {
  const responses = operation.responses;
  if (!isPlainObject(responses)) {
    return [];
  }
  return Object.keys(responses)
    .filter(isSuccessStatusKey)
    .map((key) => successResponseReadingAt(document, key, responses[key]));
}

function successResponseReadingAt(
  document: PlainObject,
  key: string,
  rawResponse: unknown,
): OpenApiSuccessResponseReading {
  const response = resolveRef(document, rawResponse);
  const content = isPlainObject(response) ? response.content : undefined;
  const mediaType = isPlainObject(content) ? content['application/json'] : undefined;
  if (!isPlainObject(mediaType)) {
    return { key, hasJsonContent: false, variantsUnited: false, declaresNoProperties: false };
  }
  const schema = resolveRef(document, mediaType.schema);
  if (!isPlainObject(schema)) {
    return { key, hasJsonContent: true, variantsUnited: false, declaresNoProperties: true };
  }
  const reading = schemaReadingAt(document, schema, key);
  return {
    key,
    hasJsonContent: true,
    variantsUnited: reading.variantsUnited,
    declaresNoProperties: reading.declaresNoProperties,
    ...(reading.envelope === undefined ? {} : { envelope: reading.envelope }),
  };
}

type SchemaReading = {
  readonly fields: readonly OpenApiSuccessResponseField[];
  readonly variantsUnited: boolean;
  readonly declaresNoProperties: boolean;
  readonly envelope?: string;
};

function schemaReadingAt(document: PlainObject, schema: PlainObject, status: string): SchemaReading {
  const combinatorKind = combinatorKindOf(schema);
  const variantsUnited = combinatorKind === 'oneOf' || combinatorKind === 'anyOf';
  const merged = mergedSchemaProperties(schemaPropertySources(document, schema, combinatorKind));
  const topLevelNames = Object.keys(merged.properties);
  const envelopeSchema =
    topLevelNames.length === 1 ? envelopeSchemaOf(document, merged.properties[topLevelNames[0]]) : undefined;
  if (envelopeSchema === undefined) {
    return directSchemaReading({ document, merged, topLevelNames, status, variantsUnited });
  }
  return envelopedSchemaReading({ document, envelopeSchema, envelope: topLevelNames[0], status, variantsUnited });
}

function directSchemaReading(input: {
  readonly document: PlainObject;
  readonly merged: MergedSchemaProperties;
  readonly topLevelNames: readonly string[];
  readonly status: string;
  readonly variantsUnited: boolean;
}): SchemaReading {
  const { document, merged, topLevelNames, status, variantsUnited } = input;
  return {
    fields: topLevelNames.map((name) =>
      responseField({
        document,
        name,
        propertySchema: merged.properties[name],
        requiredNames: merged.requiredNames,
        status,
      }),
    ),
    variantsUnited,
    declaresNoProperties: topLevelNames.length === 0,
  };
}

function envelopedSchemaReading(input: {
  readonly document: PlainObject;
  readonly envelopeSchema: PlainObject;
  readonly envelope: string;
  readonly status: string;
  readonly variantsUnited: boolean;
}): SchemaReading {
  const { document, envelopeSchema, envelope, status, variantsUnited } = input;
  const enveloped = mergedSchemaProperties(schemaPropertySources(document, envelopeSchema));
  const envelopedNames = Object.keys(enveloped.properties);
  return {
    fields: envelopedNames.map((name) =>
      responseField({
        document,
        name,
        propertySchema: enveloped.properties[name],
        requiredNames: enveloped.requiredNames,
        status,
        envelope,
      }),
    ),
    variantsUnited,
    declaresNoProperties: envelopedNames.length === 0,
    envelope,
  };
}

function envelopeSchemaOf(document: PlainObject, propertySchema: unknown): PlainObject | undefined {
  const resolved = resolveRef(document, propertySchema);
  return isPlainObject(resolved) && Object.prototype.hasOwnProperty.call(resolved, 'properties') ? resolved : undefined;
}

type SchemaCombinatorKind = 'allOf' | 'oneOf' | 'anyOf';

function combinatorKindOf(schema: PlainObject): SchemaCombinatorKind | undefined {
  if (Array.isArray(schema.allOf)) {
    return 'allOf';
  }
  if (Array.isArray(schema.oneOf)) {
    return 'oneOf';
  }
  return Array.isArray(schema.anyOf) ? 'anyOf' : undefined;
}

function schemaPropertySources(
  document: PlainObject,
  schema: PlainObject,
  combinatorKind: SchemaCombinatorKind | undefined = combinatorKindOf(schema),
): readonly PlainObject[] {
  if (combinatorKind === undefined) {
    return [schema];
  }
  const combinator = schema[combinatorKind];
  return (combinator as readonly unknown[]).map((part) => resolveRef(document, part)).filter(isPlainObject);
}

type MergedSchemaProperties = {
  readonly properties: PlainObject;
  readonly requiredNames: readonly string[] | undefined;
};

function mergedSchemaProperties(parts: readonly PlainObject[]): MergedSchemaProperties {
  const properties: Record<string, unknown> = {};
  let requiredNames: string[] | undefined;
  for (const part of parts) {
    if (isPlainObject(part.properties)) {
      Object.assign(properties, part.properties);
    }
    if (Array.isArray(part.required)) {
      requiredNames = [...(requiredNames ?? []), ...part.required.filter(isStringValue)];
    }
  }
  return { properties, requiredNames };
}

function isStringValue(value: unknown): value is string {
  return typeof value === 'string';
}

function declaredTypeOf(propertySchema: unknown): string | undefined {
  return isPlainObject(propertySchema) && typeof propertySchema.type === 'string' ? propertySchema.type : undefined;
}

function reducedTypeOf(document: PlainObject, rawSchema: unknown): string | undefined {
  const schema = resolveRef(document, rawSchema);
  if (!isPlainObject(schema)) {
    return undefined;
  }
  const directType = declaredTypeOf(schema);
  if (directType !== undefined) {
    return directType;
  }
  const combinatorKind = combinatorKindOf(schema);
  return combinatorKind === undefined ? undefined : agreeingBranchType(document, schema[combinatorKind]);
}

function agreeingBranchType(document: PlainObject, branches: unknown): string | undefined {
  if (!Array.isArray(branches) || branches.length === 0) {
    return undefined;
  }
  const branchTypes = branches.map((branch) => declaredTypeOf(resolveRef(document, branch)));
  const firstType = branchTypes[0];
  return firstType !== undefined && branchTypes.every((type) => type === firstType) ? firstType : undefined;
}

function responseField(input: {
  readonly document: PlainObject;
  readonly name: string;
  readonly propertySchema: unknown;
  readonly requiredNames: readonly string[] | undefined;
  readonly status: string;
  readonly envelope?: string;
}): OpenApiSuccessResponseField {
  const { document, name, propertySchema, requiredNames, status, envelope } = input;
  const path = envelope === undefined ? name : `${envelope}.${name}`;
  const declaredType = declaredTypeOf(propertySchema);
  const reducedType = reducedTypeOf(document, propertySchema);
  const declaredRequired = requiredNames === undefined ? undefined : requiredNames.includes(name);
  const withPath: OpenApiSuccessResponseField =
    envelope === undefined ? { name, path, status } : { name, path, status, envelope };
  const withType = declaredType === undefined ? withPath : { ...withPath, declaredType };
  const withReducedType = reducedType === undefined ? withType : { ...withType, reducedType };
  return declaredRequired === undefined ? withReducedType : { ...withReducedType, declaredRequired };
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
