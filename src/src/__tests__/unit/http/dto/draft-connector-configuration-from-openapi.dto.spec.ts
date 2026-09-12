import { expect, expectTypeOf, it } from 'vitest';
import { CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS } from '../../../../connector-registry/connector-configuration-draft.js';
import {
  draftConnectorConfigurationFromOpenApiResponseSchema,
  type DraftConnectorConfigurationFromOpenApiResponseDto,
} from '../../../../http/dto/draft-connector-configuration-from-openapi.dto.js';

function without(base: Record<string, unknown>, key: string): Record<string, unknown> {
  const copy = { ...base };
  delete copy[key];
  return copy;
}

function aValidAnswer(): Record<string, unknown> {
  return {
    connector: 'a-connector',
    configuration: 'a-configuration-string',
    unresolved: [],
    generated_credentials: [],
    method_mismatch: { registered: 'POST', operation: 'GET' },
    status_readings: [],
    response_fields: [],
    reading_notes: [],
  };
}

const REQUIRED_TOP_LEVEL_ATTRIBUTES = [
  'connector',
  'configuration',
  'unresolved',
  'generated_credentials',
  'status_readings',
  'response_fields',
  'reading_notes',
] as const;

it('declares exactly the eight attributes ConnectorConfigurationDraft declares, method_mismatch optional and every other attribute required', () => {
  const shapeKeys = Object.keys(draftConnectorConfigurationFromOpenApiResponseSchema.shape).sort();
  expect(shapeKeys).toEqual([...REQUIRED_TOP_LEVEL_ATTRIBUTES, 'method_mismatch'].sort());

  for (const attribute of REQUIRED_TOP_LEVEL_ATTRIBUTES) {
    const rejected = draftConnectorConfigurationFromOpenApiResponseSchema.safeParse(without(aValidAnswer(), attribute));
    expect(rejected.success).toBe(false);
  }

  const accepted = draftConnectorConfigurationFromOpenApiResponseSchema.safeParse(without(aValidAnswer(), 'method_mismatch'));
  expect(accepted.success).toBe(true);
});

it("declares exactly status, ending and declared_as as status_readings' own attributes, status and ending required and declared_as optional", () => {
  const itemSchema = draftConnectorConfigurationFromOpenApiResponseSchema.shape.status_readings.element;
  expect(Object.keys(itemSchema.shape).sort()).toEqual(['declared_as', 'ending', 'status']);

  const valid = { status: '200', ending: 'ok', declared_as: 'OK' };
  expect(itemSchema.safeParse(without(valid, 'status')).success).toBe(false);
  expect(itemSchema.safeParse(without(valid, 'ending')).success).toBe(false);
  expect(itemSchema.safeParse(without(valid, 'declared_as')).success).toBe(true);
});

it("declares exactly name, path, status, declared_type, declared_required and envelope as response_fields' own attributes, name/path/status required and the rest optional", () => {
  const itemSchema = draftConnectorConfigurationFromOpenApiResponseSchema.shape.response_fields.element;
  expect(Object.keys(itemSchema.shape).sort()).toEqual([
    'declared_required',
    'declared_type',
    'envelope',
    'name',
    'path',
    'status',
  ]);

  const valid = {
    name: 'a-field',
    path: '$.a',
    status: '200',
    declared_type: 'string',
    declared_required: true,
    envelope: 'data',
  };
  expect(itemSchema.safeParse(without(valid, 'name')).success).toBe(false);
  expect(itemSchema.safeParse(without(valid, 'path')).success).toBe(false);
  expect(itemSchema.safeParse(without(valid, 'status')).success).toBe(false);
  expect(itemSchema.safeParse(without(valid, 'declared_type')).success).toBe(true);
  expect(itemSchema.safeParse(without(valid, 'declared_required')).success).toBe(true);
  expect(itemSchema.safeParse(without(valid, 'envelope')).success).toBe(true);
});

it("declares exactly kind, subject and detail as reading_notes' own attributes, kind and subject required and detail optional", () => {
  const itemSchema = draftConnectorConfigurationFromOpenApiResponseSchema.shape.reading_notes.element;
  expect(Object.keys(itemSchema.shape).sort()).toEqual(['detail', 'kind', 'subject']);

  const valid = { kind: CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS[0], subject: 'GET /widgets', detail: 'a detail' };
  expect(itemSchema.safeParse(without(valid, 'kind')).success).toBe(false);
  expect(itemSchema.safeParse(without(valid, 'subject')).success).toBe(false);
  expect(itemSchema.safeParse(without(valid, 'detail')).success).toBe(true);
});

const READING_NOTE_KIND_CASES: ReadonlyArray<readonly [string, boolean]> = [
  ...CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS.map((kind) => [kind, true] as const),
  ['an-undeclared-kind', false] as const,
];

it.each(READING_NOTE_KIND_CASES)(
  'parses reading_notes.kind %s as valid only when it is one of the declared nine values (expected valid: %s)',
  (kind, expectedValid) => {
    const kindSchema = draftConnectorConfigurationFromOpenApiResponseSchema.shape.reading_notes.element.shape.kind;
    expect(kindSchema.safeParse(kind).success).toBe(expectedValid);
  },
);

it("declares exactly ConnectorConfigurationDraft's own eight attribute names as DraftConnectorConfigurationFromOpenApiResponseDto's keys, no field the draft type does not declare", () => {
  expectTypeOf<keyof DraftConnectorConfigurationFromOpenApiResponseDto>().toEqualTypeOf<
    | 'connector'
    | 'configuration'
    | 'unresolved'
    | 'generated_credentials'
    | 'method_mismatch'
    | 'status_readings'
    | 'response_fields'
    | 'reading_notes'
  >();
});
