import { expect, it } from 'vitest';
import { draftedOutputSchema } from '../../../connector-registry/capability-schema-draft-output-schema.js';
import { readOpenApiOperation } from '../../../connector-registry/openapi-operation-reader.js';
import type { CapabilitySchemaDraftOutputSchemaReading } from '../../../connector-registry/capability-schema-draft-output-schema.js';

function outputSchemaFor(document: unknown, path: string, method: string): CapabilitySchemaDraftOutputSchemaReading {
  const reading = readOpenApiOperation(JSON.stringify(document), path, method);
  return draftedOutputSchema(reading);
}

function parsedOutputSchema(draft: CapabilitySchemaDraftOutputSchemaReading): Readonly<Record<string, unknown>> {
  return JSON.parse(draft.outputSchema) as Readonly<Record<string, unknown>>;
}

function propertiesOf(draft: CapabilitySchemaDraftOutputSchemaReading): Readonly<Record<string, unknown>> {
  return parsedOutputSchema(draft).properties as Readonly<Record<string, unknown>>;
}

it('parses output_schema as a JSON object declaring a top-level properties object', () => {
  const document = {
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '200': { content: { 'application/json': { schema: { properties: { id: { type: 'string' } } } } } },
          },
        },
      },
    },
  };

  const draft = outputSchemaFor(document, '/widgets', 'get');

  const parsed: unknown = JSON.parse(draft.outputSchema);
  expect(typeof parsed).toBe('object');
  expect(parsed).not.toBeNull();
  expect(Array.isArray(parsed)).toBe(false);
  expect(typeof (parsed as Record<string, unknown>).properties).toBe('object');
});

it('includes a field from a 2xx response under application/json, excludes a field from a response keyed just outside 200-299, and excludes a success response declaring no content at all', () => {
  const document = {
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '200': { content: { 'application/json': { schema: { properties: { id: { type: 'string' } } } } } },
            '300': { content: { 'application/json': { schema: { properties: { ghost: { type: 'string' } } } } } },
            '202': { description: 'no content' },
          },
        },
      },
    },
  };

  const draft = outputSchemaFor(document, '/widgets', 'get');

  expect(Object.keys(propertiesOf(draft))).toEqual(['id']);
});

it('drafts an output_schema whose properties object holds exactly one entry named id, typed string, from a 200 and 201 both declaring id differently', () => {
  const document = {
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '200': { content: { 'application/json': { schema: { properties: { id: { type: 'string' } } } } } },
            '201': { content: { 'application/json': { schema: { properties: { id: { type: 'integer' } } } } } },
          },
        },
      },
    },
  };

  const draft = outputSchemaFor(document, '/widgets', 'get');

  const properties = propertiesOf(draft) as Readonly<Record<string, { readonly type: string }>>;
  expect(Object.keys(properties)).toEqual(['id']);
  expect(properties.id.type).toBe('string');
});

it('holds an entry for a field the 201 response declares that the 200 response does not', () => {
  const document = {
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '200': { content: { 'application/json': { schema: { properties: { id: { type: 'string' } } } } } },
            '201': {
              content: {
                'application/json': {
                  schema: { properties: { id: { type: 'string' }, createdAt: { type: 'string' } } },
                },
              },
            },
          },
        },
      },
    },
  };

  const draft = outputSchemaFor(document, '/widgets', 'get');

  const properties = propertiesOf(draft) as Readonly<Record<string, { readonly type: string }>>;
  expect(Object.keys(properties).sort()).toEqual(['createdAt', 'id']);
  expect(properties.createdAt.type).toBe('string');
});

it('excludes a field from properties and from required, and stands it in the unresolved list under schema-not-reducible-to-a-type, when its lowest-status declaration does not reduce to one type, even though the response declares it required', () => {
  const document = {
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { properties: { id: { type: 'string' }, status: {} }, required: ['id', 'status'] },
                },
              },
            },
          },
        },
      },
    },
  };

  const draft = outputSchemaFor(document, '/widgets', 'get');

  expect('status' in propertiesOf(draft)).toBe(false);
  const parsed = parsedOutputSchema(draft);
  expect(parsed.required).toEqual(['id']);
  expect(draft.unresolved).toEqual([{ name: 'status', reason: 'schema-not-reducible-to-a-type' }]);
});

function enveloppedDataSchema(required: readonly string[]): Readonly<Record<string, unknown>> {
  return {
    type: 'object',
    properties: { id: { type: 'string' }, name: { type: 'string' } },
    required,
  };
}

it("reads an enveloped field's required standing from the envelope's own inner schema, keeping the lowest status's own declaration however differently the outer schema or a higher status declares it", () => {
  const document = {
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { properties: { data: enveloppedDataSchema(['id']) }, required: ['data'] },
                },
              },
            },
            '201': {
              content: {
                'application/json': { schema: { properties: { data: enveloppedDataSchema(['name']) } } },
              },
            },
          },
        },
      },
    },
  };

  const draft = outputSchemaFor(document, '/widgets', 'get');

  const parsed = parsedOutputSchema(draft);
  expect(Object.keys(parsed.properties as object).sort()).toEqual(['id', 'name']);
  expect(parsed.required).toEqual(['id']);
});

it('declares no required key when properties holds entries but no response declares any of them required', () => {
  const document = {
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { properties: { limit: { type: 'integer' }, offset: { type: 'integer' } } },
                },
              },
            },
          },
        },
      },
    },
  };

  const draft = outputSchemaFor(document, '/widgets', 'get');

  const parsed = parsedOutputSchema(draft);
  expect(Object.keys(parsed.properties as object).sort()).toEqual(['limit', 'offset']);
  expect('required' in parsed).toBe(false);
});

it('declares an empty properties object and no required key for an operation from which no field is read', () => {
  const document = { openapi: '3.0.0', paths: { '/widgets': { get: {} } } };

  const draft = outputSchemaFor(document, '/widgets', 'get');

  const parsed = parsedOutputSchema(draft);
  expect(parsed.properties).toEqual({});
  expect('required' in parsed).toBe(false);
});

it("keys an enveloped field's properties entry by the field's own name, never by its envelope-qualified path", () => {
  const document = {
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { properties: { data: { type: 'object', properties: { id: { type: 'string' } } } } },
                },
              },
            },
          },
        },
      },
    },
  };

  const draft = outputSchemaFor(document, '/widgets', 'get');

  const properties = propertiesOf(draft) as Readonly<Record<string, { readonly type: string }>>;
  expect(Object.keys(properties)).toEqual(['id']);
  expect(properties.id.type).toBe('string');
});
