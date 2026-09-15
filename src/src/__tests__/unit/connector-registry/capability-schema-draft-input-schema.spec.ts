import { expect, it } from 'vitest';
import { draftedInputSchema } from '../../../connector-registry/capability-schema-draft-input-schema.js';
import { readOpenApiOperation } from '../../../connector-registry/openapi-operation-reader.js';
import type { CapabilitySchemaDraftInputSchemaReading } from '../../../connector-registry/capability-schema-draft-input-schema.js';
import { inputSchemaShapeProblems } from '../../../capability-registry/capability-input-schema-shape.js';

function inputSchemaFor(document: unknown, path: string, method: string): CapabilitySchemaDraftInputSchemaReading {
  const reading = readOpenApiOperation(JSON.stringify(document), path, method);
  return draftedInputSchema(reading);
}

function parsedInputSchema(draft: CapabilitySchemaDraftInputSchemaReading): Readonly<Record<string, unknown>> {
  return JSON.parse(draft.inputSchema) as Readonly<Record<string, unknown>>;
}

function propertiesOf(draft: CapabilitySchemaDraftInputSchemaReading): Readonly<Record<string, unknown>> {
  return parsedInputSchema(draft).properties as Readonly<Record<string, unknown>>;
}

it('parses input_schema as a JSON object declaring a top-level properties object', () => {
  const document = {
    openapi: '3.0.0',
    paths: { '/widgets': { get: { parameters: [{ name: 'q', in: 'query', schema: { type: 'string' } }] } } },
  };

  const draft = inputSchemaFor(document, '/widgets', 'get');

  const parsed: unknown = JSON.parse(draft.inputSchema);
  expect(typeof parsed).toBe('object');
  expect(parsed).not.toBeNull();
  expect(Array.isArray(parsed)).toBe(false);
  expect(typeof (parsed as Record<string, unknown>).properties).toBe('object');
});

function requiredPathAndOptionalQueryDocument(): unknown {
  return {
    openapi: '3.0.0',
    paths: {
      '/patients/{cpf}': {
        parameters: [{ name: 'cpf', in: 'path', required: true, schema: { type: 'string' } }],
        get: { parameters: [{ name: 'includeHistory', in: 'query', schema: { type: 'boolean' } }] },
      },
    },
  };
}

it('drafts a properties object holding cpf typed string and includeHistory typed boolean, and a required array holding exactly cpf, for a required path parameter alongside an optional query parameter', () => {
  const draft = inputSchemaFor(requiredPathAndOptionalQueryDocument(), '/patients/{cpf}', 'get');

  const parsed = parsedInputSchema(draft);
  const properties = parsed.properties as Readonly<Record<string, { readonly type: string }>>;
  expect(Object.keys(properties).sort()).toEqual(['cpf', 'includeHistory']);
  expect(properties.cpf.type).toBe('string');
  expect(properties.includeHistory.type).toBe('boolean');
  expect(parsed.required).toEqual(['cpf']);
});

it('declares an empty properties object and no required key for an operation declaring neither a parameter nor a request-body field', () => {
  const document = { openapi: '3.0.0', paths: { '/widgets': { get: {} } } };

  const draft = inputSchemaFor(document, '/widgets', 'get');

  const parsed = parsedInputSchema(draft);
  expect(parsed.properties).toEqual({});
  expect('required' in parsed).toBe(false);
});

it('declares no required key when properties holds entries but the operation declares none of them required', () => {
  const document = {
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'offset', in: 'query', schema: { type: 'integer' } },
          ],
        },
      },
    },
  };

  const draft = inputSchemaFor(document, '/widgets', 'get');

  const parsed = parsedInputSchema(draft);
  expect(Object.keys(parsed.properties as object).sort()).toEqual(['limit', 'offset']);
  expect('required' in parsed).toBe(false);
});

it('excludes a name from properties and from required, even where declared required, when another part of the operation also claims the same name', () => {
  const document = {
    openapi: '3.0.0',
    paths: {
      '/widgets/{cpf}': {
        parameters: [{ name: 'cpf', in: 'path', required: true, schema: { type: 'string' } }],
        post: {
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { properties: { id: { type: 'string' } } } } },
          },
        },
      },
    },
  };

  const draft = inputSchemaFor(document, '/widgets/{cpf}', 'post');

  const parsed = parsedInputSchema(draft);
  expect('id' in (parsed.properties as object)).toBe(false);
  expect(Object.keys(parsed.properties as object)).toEqual(['cpf']);
  expect(parsed.required).toEqual(['cpf']);
});

it('excludes a name from properties, leaves it out of required even though the operation declares it required, and stands it in the unresolved list under schema-not-reducible-to-a-type, named exactly as the document gives it, for a schema stating no type and declaring no composition', () => {
  const document = {
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          parameters: [
            { name: 'cpf', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'Loyalty-Tier', in: 'query', required: true, schema: {} },
          ],
        },
      },
    },
  };

  const draft = inputSchemaFor(document, '/widgets', 'get');

  expect('Loyalty-Tier' in propertiesOf(draft)).toBe(false);
  const parsed = parsedInputSchema(draft);
  expect(parsed.required).toEqual(['cpf']);
  expect(draft.unresolved).toEqual([{ name: 'Loyalty-Tier', reason: 'schema-not-reducible-to-a-type' }]);
  expect(Object.keys(draft.unresolved[0]).sort()).toEqual(['name', 'reason']);
});

it('reduces a schema whose allOf branches all state the same type to that type', () => {
  const document = {
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          parameters: [
            {
              name: 'quantity',
              in: 'query',
              schema: { allOf: [{ type: 'integer' }, { type: 'integer', minimum: 0 }] },
            },
          ],
        },
      },
    },
  };

  const draft = inputSchemaFor(document, '/widgets', 'get');

  const properties = propertiesOf(draft) as Readonly<Record<string, { readonly type: string }>>;
  expect(Object.keys(properties)).toEqual(['quantity']);
  expect(properties.quantity.type).toBe('integer');
});

it('reduces a schema whose oneOf branches all name the same type to that type', () => {
  const document = {
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          parameters: [
            {
              name: 'code',
              in: 'query',
              schema: { oneOf: [{ type: 'string', minLength: 2 }, { type: 'string', maxLength: 5 }] },
            },
          ],
        },
      },
    },
  };

  const draft = inputSchemaFor(document, '/widgets', 'get');

  const properties = propertiesOf(draft) as Readonly<Record<string, { readonly type: string }>>;
  expect(Object.keys(properties)).toEqual(['code']);
  expect(properties.code.type).toBe('string');
});

it('declares no properties entry for a name whose oneOf branches name more than one type', () => {
  const document = {
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        get: {
          parameters: [
            { name: 'identifier', in: 'query', schema: { oneOf: [{ type: 'string' }, { type: 'integer' }] } },
          ],
        },
      },
    },
  };

  const draft = inputSchemaFor(document, '/widgets', 'get');

  expect('identifier' in propertiesOf(draft)).toBe(false);
});

it('includes a parameter declared only on the shared path item, and one reached only through a $ref, each correctly typed, in the drafted properties', () => {
  const document = {
    openapi: '3.0.0',
    paths: {
      '/orders/{order_id}': {
        parameters: [{ name: 'order_id', in: 'path', required: true, schema: { type: 'string' } }],
        get: { parameters: [{ $ref: '#/components/parameters/ApiVersion' }] },
      },
    },
    components: {
      parameters: { ApiVersion: { name: 'X-Api-Version', in: 'header', schema: { type: 'string' } } },
    },
  };

  const draft = inputSchemaFor(document, '/orders/{order_id}', 'get');

  const properties = propertiesOf(draft) as Readonly<Record<string, { readonly type: string }>>;
  expect(Object.keys(properties).sort()).toEqual(['X-Api-Version', 'order_id']);
  expect(properties.order_id.type).toBe('string');
  expect(properties['X-Api-Version'].type).toBe('string');
});

it("includes a top-level request-body field, required per the request-body schema's own required array, in properties and in required", () => {
  const document = {
    openapi: '3.0.0',
    paths: {
      '/widgets': {
        post: {
          requestBody: {
            content: {
              'application/json': {
                schema: { properties: { billing_address: { type: 'string' } }, required: ['billing_address'] },
              },
            },
          },
        },
      },
    },
  };

  const draft = inputSchemaFor(document, '/widgets', 'post');

  const parsed = parsedInputSchema(draft);
  const properties = parsed.properties as Readonly<Record<string, { readonly type: string }>>;
  expect(Object.keys(properties)).toEqual(['billing_address']);
  expect(properties.billing_address.type).toBe('string');
  expect(parsed.required).toEqual(['billing_address']);
});

it("produces an input_schema whose required array, wherever present, holds only keys properties itself declares -- the shape a registered capability's own input schema must hold", () => {
  const draft = inputSchemaFor(requiredPathAndOptionalQueryDocument(), '/patients/{cpf}', 'get');

  const problems = inputSchemaShapeProblems(JSON.parse(draft.inputSchema));

  expect(problems).toEqual([]);
});
