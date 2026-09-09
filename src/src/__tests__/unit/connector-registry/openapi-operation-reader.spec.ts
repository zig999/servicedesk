import { expect, it } from 'vitest';
import { readOpenApiOperation } from '../../../connector-registry/openapi-operation-reader.js';
import { OpenApiDocumentNotReadableError } from '../../../errors/openapi-document-not-readable.error.js';
import { OpenApiOperationNotFoundError } from '../../../errors/openapi-operation-not-found.error.js';

function readableErrorThrownBy(act: () => unknown): OpenApiDocumentNotReadableError {
  try {
    act();
  } catch (error) {
    if (error instanceof OpenApiDocumentNotReadableError) {
      return error;
    }
    throw error;
  }
  throw new Error('expected the reader to refuse with OpenApiDocumentNotReadableError, but it did not throw');
}

function operationNotFoundThrownBy(act: () => unknown): OpenApiOperationNotFoundError {
  try {
    act();
  } catch (error) {
    if (error instanceof OpenApiOperationNotFoundError) {
      return error;
    }
    throw error;
  }
  throw new Error('expected the reader to refuse with OpenApiOperationNotFoundError, but it did not throw');
}

it('refuses a document declaring swagger 2.0, naming the declared version', () => {
  const documentText = JSON.stringify({ swagger: '2.0', paths: {} });

  const error = readableErrorThrownBy(() => readOpenApiOperation(documentText, '/widgets', 'GET'));

  expect(error.context).toEqual({ kind: 'unsupported-version', declaredVersion: '2.0' });
});

it('refuses a document declaring an openapi version outside 3.x, naming the version it declared', () => {
  const documentText = JSON.stringify({ openapi: '4.0.0', paths: {} });

  const error = readableErrorThrownBy(() => readOpenApiOperation(documentText, '/widgets', 'GET'));

  expect(error.context).toEqual({ kind: 'unsupported-version', declaredVersion: '4.0.0' });
});

it('refuses text that parses as neither JSON nor a YAML mapping, naming what failed to parse', () => {
  const documentText = 'just some plain prose, neither JSON nor a YAML mapping at all';

  const error = readableErrorThrownBy(() => readOpenApiOperation(documentText, '/widgets', 'GET'));

  expect(error.context).toEqual({ kind: 'unparseable', detail: 'the fetched document text' });
});

it('refuses an empty document text the same way as any other text that does not parse', () => {
  const documentText = '';

  const error = readableErrorThrownBy(() => readOpenApiOperation(documentText, '/widgets', 'GET'));

  expect(error.context).toEqual({ kind: 'unparseable', detail: 'the fetched document text' });
});

it('refuses a document that parses to an object declaring neither an openapi nor a swagger field, naming that no version was declared', () => {
  const documentText = JSON.stringify({ paths: {} });

  const error = readableErrorThrownBy(() => readOpenApiOperation(documentText, '/widgets', 'GET'));

  expect(error.context).toEqual({ kind: 'no-version-declared' });
});

it('refuses a genuine YAML syntax error the same way as any other unparseable text, preserving it as the cause', () => {
  const documentText = 'openapi: "3.0.0"\n\tpaths: {}';

  const error = readableErrorThrownBy(() => readOpenApiOperation(documentText, '/widgets', 'GET'));

  expect(error.context).toEqual({ kind: 'unparseable', detail: 'the fetched document text' });
  expect(error.cause).toBeInstanceOf(Error);
});

it('refuses when the document declares no entry at all for the requested path, naming that path and method', () => {
  const documentText = JSON.stringify({ openapi: '3.0.0', paths: {} });

  const error = operationNotFoundThrownBy(() => readOpenApiOperation(documentText, '/absent', 'GET'));

  expect(error.context).toEqual({ path: '/absent', method: 'GET' });
});

it('refuses when the path exists but declares no operation under the requested method', () => {
  const documentText = JSON.stringify({ openapi: '3.0.0', paths: { '/widgets': { get: {} } } });

  const error = operationNotFoundThrownBy(() => readOpenApiOperation(documentText, '/widgets', 'DELETE'));

  expect(error.context).toEqual({ path: '/widgets', method: 'DELETE' });
});

it('keeps OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError as two distinct values, neither an instance of the other', () => {
  const notReadable = new OpenApiDocumentNotReadableError({ kind: 'no-version-declared' });
  const notFound = new OpenApiOperationNotFoundError('/a-path', 'GET');

  expect(notReadable).not.toBeInstanceOf(OpenApiOperationNotFoundError);
  expect(notFound).not.toBeInstanceOf(OpenApiDocumentNotReadableError);
  expect(notReadable.name).not.toBe(notFound.name);
});

it("returns the operation's own method key exactly as the document spells it, regardless of the requested method's own casing", () => {
  const documentText = JSON.stringify({ openapi: '3.0.0', paths: { '/widgets': { get: {} } } });

  const reading = readOpenApiOperation(documentText, '/widgets', 'GET');

  expect(reading.method).toBe('get');
});

it("merges the path item's own parameters with the operation's own, exposing every parameter from both", () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets/{Widget_Id}': {
        parameters: [{ name: 'Widget_Id', in: 'path' }],
        get: { parameters: [{ name: 'Limit-Count', in: 'query' }] },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets/{Widget_Id}', 'get');

  const parameterKeys = new Set(reading.parameters.map((parameter) => `${parameter.name}|${parameter.location}`));
  expect(parameterKeys).toEqual(new Set(['Widget_Id|path', 'Limit-Count|query']));
  expect(reading.parameters).toHaveLength(2);
});

it("follows a parameter's $ref to its target before exposing its name and location", () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { parameters: [{ $ref: '#/components/parameters/ApiVersion' }] } } },
    components: { parameters: { ApiVersion: { name: 'X-Api-Version', in: 'header' } } },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.parameters).toEqual([{ name: 'X-Api-Version', location: 'header' }]);
});

it('keeps a single parameter when the operation redeclares a path item parameter under the same name and location', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        parameters: [{ name: 'q', in: 'query' }],
        get: { parameters: [{ name: 'q', in: 'query' }] },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.parameters).toEqual([{ name: 'q', location: 'query' }]);
});

it('returns an empty parameter list when neither the path item nor the operation declares any', () => {
  const documentText = JSON.stringify({ openapi: '3.0.0', paths: { '/widgets': { get: {} } } });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.parameters).toEqual([]);
});

it("exposes a parameter as exactly its name and declared location, with no separate position field", () => {
  const documentText = JSON.stringify({ openapi: '3.0.0', paths: { '/widgets': { get: { parameters: [{ name: 'q', in: 'query' }] } } } });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(Object.keys(reading.parameters[0]).sort()).toEqual(['location', 'name']);
});

it('refuses (as OpenApiDocumentNotReadableError) a parameter whose $ref points nowhere the document declares', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { parameters: [{ $ref: '#/components/parameters/Missing' }] } } },
  });

  const error = readableErrorThrownBy(() => readOpenApiOperation(documentText, '/widgets', 'get'));

  expect(error.context.kind).toBe('unparseable');
});

it('refuses (as OpenApiDocumentNotReadableError) a parameter whose $ref chain cycles back to itself', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { parameters: [{ $ref: '#/components/parameters/A' }] } } },
    components: {
      parameters: {
        A: { $ref: '#/components/parameters/B' },
        B: { $ref: '#/components/parameters/A' },
      },
    },
  });

  const error = readableErrorThrownBy(() => readOpenApiOperation(documentText, '/widgets', 'get'));

  expect(error.context.kind).toBe('unparseable');
});

it('exposes the top-level property names of the application/json request-body schema, in the order the document declares them', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        post: {
          requestBody: {
            content: { 'application/json': { schema: { properties: { Serial_Number: { type: 'string' }, name: { type: 'string' } } } } },
          },
        },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'post');

  expect(reading.requestBodyFieldNames).toEqual(['Serial_Number', 'name']);
});

it('reads no request-body field names when the content declares no application/json entry', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        post: {
          requestBody: { content: { 'application/xml': { schema: { properties: { a: { type: 'string' } } } } } },
        },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'post');

  expect(reading.requestBodyFieldNames).toEqual([]);
});

it('reads no request-body field names when the application/json schema is an array rather than an object', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        post: {
          requestBody: { content: { 'application/json': { schema: { type: 'array', items: { type: 'string' } } } } },
        },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'post');

  expect(reading.requestBodyFieldNames).toEqual([]);
});

it("reads only the schema's own top-level property names, never a nested object's own properties", () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        post: {
          requestBody: {
            content: {
              'application/json': {
                schema: { properties: { Billing_Address: { type: 'object', properties: { street: { type: 'string' } } } } },
              },
            },
          },
        },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'post');

  expect(reading.requestBodyFieldNames).toEqual(['Billing_Address']);
});

it("exposes the scheme names required by the operation's own first security requirement, with an API-key scheme's own name and location", () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { security: [{ 'Api_Key-Scheme': [] }] } } },
    components: { securitySchemes: { 'Api_Key-Scheme': { type: 'apiKey', name: 'X-Api-Key', in: 'header' } } },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.requiredSecuritySchemes).toEqual([
    { schemeName: 'Api_Key-Scheme', kind: 'apiKey', name: 'X-Api-Key', location: 'header' },
  ]);
});

it('falls back to the document-level security field when the operation declares none at all', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    security: [{ ApiKeyAuth: [] }],
    paths: { '/widgets': { get: {} } },
    components: { securitySchemes: { ApiKeyAuth: { type: 'apiKey', name: 'X-Api-Key', in: 'header' } } },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.requiredSecuritySchemes).toEqual([
    { schemeName: 'ApiKeyAuth', kind: 'apiKey', name: 'X-Api-Key', location: 'header' },
  ]);
});

it("treats the operation's own empty security array as declared and in effect, requiring no scheme rather than falling back to the document's top level", () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    security: [{ ApiKeyAuth: [] }],
    paths: { '/widgets': { get: { security: [] } } },
    components: { securitySchemes: { ApiKeyAuth: { type: 'apiKey', name: 'X-Api-Key', in: 'header' } } },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.requiredSecuritySchemes).toEqual([]);
});

it('uses only the first requirement object when the security field lists more than one, ignoring the rest', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { security: [{ ApiKeyAuth: [] }, { OtherKey: [] }] } } },
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: 'apiKey', name: 'X-Api-Key', in: 'header' },
        OtherKey: { type: 'apiKey', name: 'X-Other-Key', in: 'query' },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.requiredSecuritySchemes).toEqual([
    { schemeName: 'ApiKeyAuth', kind: 'apiKey', name: 'X-Api-Key', location: 'header' },
  ]);
});

it("exposes an http security scheme's own kind and its own scheme sub-field", () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { security: [{ BearerAuth: [] }] } } },
    components: { securitySchemes: { BearerAuth: { type: 'http', scheme: 'bearer' } } },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.requiredSecuritySchemes).toEqual([{ schemeName: 'BearerAuth', kind: 'http', httpScheme: 'bearer' }]);
});

it("exposes a non-reducible security scheme's own kind (oauth2) rather than dropping it", () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { security: [{ OAuthFlow: [] }] } } },
    components: { securitySchemes: { OAuthFlow: { type: 'oauth2', flows: {} } } },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.requiredSecuritySchemes).toEqual([{ schemeName: 'OAuthFlow', kind: 'oauth2' }]);
});

it('refuses (as OpenApiDocumentNotReadableError) a security scheme declared with a type outside the five OpenAPI recognizes', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { security: [{ Weird: [] }] } } },
    components: { securitySchemes: { Weird: { type: 'notARealType' } } },
  });

  const error = readableErrorThrownBy(() => readOpenApiOperation(documentText, '/widgets', 'get'));

  expect(error.context.kind).toBe('unparseable');
});

it('refuses (as OpenApiDocumentNotReadableError) a security requirement naming a scheme the document does not declare', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { security: [{ MissingScheme: [] }] } } },
    components: { securitySchemes: {} },
  });

  const error = readableErrorThrownBy(() => readOpenApiOperation(documentText, '/widgets', 'get'));

  expect(error.context.kind).toBe('unparseable');
});

it('reads a document served as YAML exactly as one served as JSON, deciding the serialization only by parsing the text', () => {
  const jsonText = JSON.stringify({ openapi: '3.0.0', paths: { '/ping': { get: {} } } });
  const yamlText = 'openapi: "3.0.0"\npaths:\n  /ping:\n    get: {}\n';

  const fromJson = readOpenApiOperation(jsonText, '/ping', 'get');
  const fromYaml = readOpenApiOperation(yamlText, '/ping', 'get');

  expect(fromYaml).toEqual(fromJson);
});
