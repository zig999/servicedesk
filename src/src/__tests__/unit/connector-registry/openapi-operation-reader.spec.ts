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

it('yields a status entry for each of three declared numeric response keys', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { responses: { '200': {}, '403': {}, '503': {} } } } },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  const keysAndKinds = new Set(reading.responses.map((response) => `${response.key}|${response.kind}`));
  expect(keysAndKinds).toEqual(new Set(['200|status', '403|status', '503|status']));
  expect(reading.responses).toHaveLength(3);
});

it('carries the description the document declares for a response', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { responses: { '200': { description: 'Widget created' } } } } },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.responses).toEqual([{ key: '200', kind: 'status', description: 'Widget created' }]);
});

it('omits the description property for a response declaring none, rather than carrying an empty one', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { responses: { '200': {} } } } },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.responses).toEqual([{ key: '200', kind: 'status' }]);
  expect(Object.prototype.hasOwnProperty.call(reading.responses[0], 'description')).toBe(false);
});

it('classifies a response keyed default apart from any numeric status key', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { responses: { '200': {}, default: {} } } } },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  const defaultEntry = reading.responses.find((response) => response.key === 'default');
  const statusEntry = reading.responses.find((response) => response.key === '200');
  expect(defaultEntry?.kind).toBe('default');
  expect(statusEntry?.kind).toBe('status');
});

it('classifies a response keyed by an upper-case status range apart from any numeric status key', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { responses: { '200': {}, '4XX': {} } } } },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  const rangeEntry = reading.responses.find((response) => response.key === '4XX');
  expect(rangeEntry?.kind).toBe('range');
});

it('yields no response key and raises nothing when the operation declares no responses object', () => {
  const documentText = JSON.stringify({ openapi: '3.0.0', paths: { '/widgets': { get: {} } } });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.responses).toEqual([]);
});

it("follows a response's $ref to its target before reading its description", () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { responses: { '200': { $ref: '#/components/responses/Created' } } } } },
    components: { responses: { Created: { description: 'The widget was created' } } },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.responses).toEqual([{ key: '200', kind: 'status', description: 'The widget was created' }]);
});

it('refuses (as OpenApiDocumentNotReadableError) a response whose $ref points nowhere the document declares', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { responses: { '200': { $ref: '#/components/responses/Missing' } } } } },
  });

  const error = readableErrorThrownBy(() => readOpenApiOperation(documentText, '/widgets', 'get'));

  expect(error.context.kind).toBe('unparseable');
});

it('classifies a lower-case status range key the same as its upper-case spelling', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { responses: { '2xx': {} } } } },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.responses).toEqual([{ key: '2xx', kind: 'range' }]);
});

it('classifies a digits-only response key outside 100 through 599 as a range key', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { responses: { '42': {}, '600': {} } } } },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  const kinds = new Set(reading.responses.map((response) => response.kind));
  expect(kinds).toEqual(new Set(['range']));
  expect(reading.responses).toHaveLength(2);
});

it('yields a field named and pathed for each of three top-level properties a success response schema declares', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: {
                    properties: { id: { type: 'string' }, name: { type: 'string' }, active: { type: 'boolean' } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  const namesAndPaths = reading.successResponseFields.map((field) => ({ name: field.name, path: field.path }));
  expect(namesAndPaths).toEqual([
    { name: 'id', path: 'id' },
    { name: 'name', path: 'name' },
    { name: 'active', path: 'active' },
  ]);
  expect(reading.successResponseFields).toHaveLength(3);
});

it("carries the type each field's own schema declares, and omits declaredType entirely where the schema declares none", () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '200': {
              content: { 'application/json': { schema: { properties: { id: { type: 'string' }, extra: {} } } } },
            },
          },
        },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  const idField = reading.successResponseFields.find((field) => field.name === 'id');
  const extraField = reading.successResponseFields.find((field) => field.name === 'extra');
  expect(idField?.declaredType).toBe('string');
  expect(Object.prototype.hasOwnProperty.call(extraField, 'declaredType')).toBe(false);
});

it("carries whether a schema's required list names each field, true for a named field and false for one it omits", () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { properties: { a: { type: 'string' }, b: { type: 'string' } }, required: ['a'] },
                },
              },
            },
          },
        },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  const aField = reading.successResponseFields.find((field) => field.name === 'a');
  const bField = reading.successResponseFields.find((field) => field.name === 'b');
  expect(aField?.declaredRequired).toBe(true);
  expect(bField?.declaredRequired).toBe(false);
});

it('leaves declaredRequired absent, never false, for a field whose success response schema declares no required list at all', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '200': { content: { 'application/json': { schema: { properties: { a: { type: 'string' } } } } } },
          },
        },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  const aField = reading.successResponseFields.find((field) => field.name === 'a');
  expect(Object.prototype.hasOwnProperty.call(aField, 'declaredRequired')).toBe(false);
});

it('carries the success status of the response each field was read from, distinguishing fields read from different statuses', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '200': { content: { 'application/json': { schema: { properties: { a: { type: 'string' } } } } } },
            '201': { content: { 'application/json': { schema: { properties: { b: { type: 'string' } } } } } },
          },
        },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  const aField = reading.successResponseFields.find((field) => field.name === 'a');
  const bField = reading.successResponseFields.find((field) => field.name === 'b');
  expect(aField?.status).toBe('200');
  expect(bField?.status).toBe('201');
});

it('yields no field for a success response whose content declares a media type other than application/json', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '200': { content: { 'application/xml': { schema: { properties: { a: { type: 'string' } } } } } },
          },
        },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.successResponseFields).toEqual([]);
});

it('yields no field for a success response declaring no content at all', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: { '/widgets': { get: { responses: { '200': { description: 'ok' } } } } },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.successResponseFields).toEqual([]);
});

it('reads a success response and its schema reached through $refs into fields, the same as if declared inline', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: { responses: { '200': { $ref: '#/components/responses/Widget' } } },
      },
    },
    components: {
      responses: {
        Widget: { content: { 'application/json': { schema: { $ref: '#/components/schemas/WidgetBody' } } } },
      },
      schemas: {
        WidgetBody: { properties: { serial: { type: 'string' } } },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.successResponseFields).toEqual([
    { name: 'serial', path: 'serial', status: '200', declaredType: 'string' },
  ]);
});

it('refuses (as OpenApiDocumentNotReadableError) a success response schema whose $ref chain cycles back to itself', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: { '200': { content: { 'application/json': { schema: { $ref: '#/components/schemas/A' } } } } },
        },
      },
    },
    components: {
      schemas: {
        A: { $ref: '#/components/schemas/B' },
        B: { $ref: '#/components/schemas/A' },
      },
    },
  });

  const error = readableErrorThrownBy(() => readOpenApiOperation(documentText, '/widgets', 'get'));

  expect(error.context.kind).toBe('unparseable');
});

it('merges the properties of every allOf part into one set of fields', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { allOf: [{ properties: { a: { type: 'string' } } }, { properties: { b: { type: 'string' } } }] },
                },
              },
            },
          },
        },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  const names = reading.successResponseFields.map((field) => field.name).sort();
  expect(names).toEqual(['a', 'b']);
});

it('unites the properties of every oneOf variant into one set of fields', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { oneOf: [{ properties: { a: { type: 'string' } } }, { properties: { b: { type: 'string' } } }] },
                },
              },
            },
          },
        },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  const names = reading.successResponseFields.map((field) => field.name).sort();
  expect(names).toEqual(['a', 'b']);
});

it('yields no field for a success response schema declaring no properties object', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: { responses: { '200': { content: { 'application/json': { schema: { type: 'object' } } } } } },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  expect(reading.successResponseFields).toEqual([]);
});

it('contributes fields only from response keys within 200 through 299, excluding a status just outside the range, a default key and a range key', () => {
  const documentText = JSON.stringify({
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '199': { content: { 'application/json': { schema: { properties: { tooLow: { type: 'string' } } } } } },
            '200': { content: { 'application/json': { schema: { properties: { lowBoundary: { type: 'string' } } } } } },
            '299': { content: { 'application/json': { schema: { properties: { highBoundary: { type: 'string' } } } } } },
            '300': { content: { 'application/json': { schema: { properties: { tooHigh: { type: 'string' } } } } } },
            default: { content: { 'application/json': { schema: { properties: { defaultField: { type: 'string' } } } } } },
            '2XX': { content: { 'application/json': { schema: { properties: { rangeField: { type: 'string' } } } } } },
          },
        },
      },
    },
  });

  const reading = readOpenApiOperation(documentText, '/widgets', 'get');

  const names = reading.successResponseFields.map((field) => field.name).sort();
  expect(names).toEqual(['highBoundary', 'lowBoundary']);
});
