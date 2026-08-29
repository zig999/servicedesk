// Proof for domain/investigation/field-semantics, as field-semantics.ts's own concrete shape:
// fieldSemanticsOf reads a capability's own output schema structurally, as a JSON Schema's
// top-level `properties` object, answering one FieldSemantics entry per key that object declares —
// each entry's own `name` is that key, and its own `type`/`description` travel along only where the
// schema states them as strings, exactly as the node's own "an operator's own hint, never enforced"
// keeps them optional rather than validated or coerced. A schema that is not parseable JSON, or that
// holds no top-level `properties` object, answers an empty array rather than throwing — the same
// "malformed or absent is nothing declared, never a fault" posture citation-validation.ts's own
// declaredFieldsOf and capability-input-schema-shape.ts's own declaredInputSchemaShape already keep
// for their own schemas (this module's own header comment).
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { fieldSemanticsOf } from '../../../investigation/field-semantics.js';

const MODULE_PATH = fileURLToPath(new URL('../../../investigation/field-semantics.ts', import.meta.url));

/** Matches static imports, re-exports and dynamic imports, capturing the module specifier. */
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

/** Every module specifier field-semantics.ts itself imports. */
async function fieldSemanticsImports(): Promise<readonly string[]> {
  const source = await readFile(MODULE_PATH, 'utf8');
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

/** A JSON-Schema-shaped output_schema declaring exactly the given top-level properties object. */
function schemaWithProperties(properties: Record<string, unknown>): string {
  return JSON.stringify({ type: 'object', properties });
}

it('answers one entry per top-level property key the schema declares, in the order the schema states them', () => {
  const schema = schemaWithProperties({
    'field-one': { type: 'string' },
    'field-two': { type: 'string' },
    'field-three': { type: 'string' },
  });

  const fields = fieldSemanticsOf(schema);

  expect(fields.map((field) => field.name)).toEqual(['field-one', 'field-two', 'field-three']);
});

it("carries a key's own type and description together when the schema states both as strings", () => {
  const schema = schemaWithProperties({
    'a-field': { type: 'string', description: 'what this field means' },
  });

  const fields = fieldSemanticsOf(schema);

  expect(fields).toEqual([{ name: 'a-field', type: 'string', description: 'what this field means' }]);
});

it('carries only the type, with no description key at all, when the schema declares a type but no description', () => {
  const schema = schemaWithProperties({ 'a-field': { type: 'string' } });

  const fields = fieldSemanticsOf(schema);

  expect(fields).toEqual([{ name: 'a-field', type: 'string' }]);
  expect(fields[0]).not.toHaveProperty('description');
});

it('carries only the description, with no type key at all, when the schema declares a description but no type', () => {
  const schema = schemaWithProperties({ 'a-field': { description: 'what this field means' } });

  const fields = fieldSemanticsOf(schema);

  expect(fields).toEqual([{ name: 'a-field', description: 'what this field means' }]);
  expect(fields[0]).not.toHaveProperty('type');
});

it('carries neither type nor description for a key whose own declared value is an empty object', () => {
  const schema = schemaWithProperties({ 'a-field': {} });

  const fields = fieldSemanticsOf(schema);

  expect(fields).toEqual([{ name: 'a-field' }]);
});

it('answers name alone for a key whose own declared value is not an object at all, never throwing over its shape', () => {
  const schema = schemaWithProperties({ 'a-field': 'not-an-object' });

  const fields = fieldSemanticsOf(schema);

  expect(fields).toEqual([{ name: 'a-field' }]);
});

it("never carries a key's own type when the schema declares it as a non-string value, since only a string is read as this key's own declared type", () => {
  const schema = schemaWithProperties({ 'a-field': { type: 42, description: 'a real description' } });

  const fields = fieldSemanticsOf(schema);

  expect(fields).toEqual([{ name: 'a-field', description: 'a real description' }]);
});

it("never carries a key's own description when the schema declares it as a non-string value", () => {
  const schema = schemaWithProperties({ 'a-field': { type: 'string', description: { nested: 'not a string' } } });

  const fields = fieldSemanticsOf(schema);

  expect(fields).toEqual([{ name: 'a-field', type: 'string' }]);
});

it('reads no content of the schema beyond each property key\'s own type and description, ignoring every other declared JSON Schema keyword', () => {
  const schema = schemaWithProperties({
    'a-field': { type: 'string', description: 'a description', minLength: 3, pattern: '^[a-z]+$', enum: ['x', 'y'] },
  });

  const fields = fieldSemanticsOf(schema);

  expect(fields).toEqual([{ name: 'a-field', type: 'string', description: 'a description' }]);
});

it('answers an empty array for an undefined output schema', () => {
  expect(fieldSemanticsOf(undefined)).toEqual([]);
});

it('answers an empty array for a schema that is not parseable JSON at all, rather than throwing', () => {
  expect(fieldSemanticsOf('this is not JSON at all {{{')).toEqual([]);
});

it('answers an empty array for the empty string, which is not parseable JSON', () => {
  expect(fieldSemanticsOf('')).toEqual([]);
});

it('answers an empty array for a schema that parses to valid JSON holding no top-level properties object at all', () => {
  expect(fieldSemanticsOf(JSON.stringify({ type: 'object' }))).toEqual([]);
});

it("answers an empty array when the schema's own top-level properties is declared but is not itself an object — a string, say, rather than a map of keys", () => {
  expect(fieldSemanticsOf(JSON.stringify({ type: 'object', properties: 'not-an-object' }))).toEqual([]);
});

it('answers an empty array when the schema declares a top-level properties object with no keys at all', () => {
  expect(fieldSemanticsOf(schemaWithProperties({}))).toEqual([]);
});

it('answers an empty array for a schema that parses to a JSON array rather than an object', () => {
  expect(fieldSemanticsOf(JSON.stringify(['not', 'an', 'object']))).toEqual([]);
});

it('answers an empty array for a schema that parses to a bare JSON scalar, such as a number', () => {
  expect(fieldSemanticsOf('42')).toEqual([]);
});

it("imports neither citation-validation.ts's own declaredFieldsOf nor capability-input-schema-shape.ts's own declaredInputSchemaShape, keeping this a third, independently-implemented structural reader rather than a shared one (this task's own recorded inference)", async () => {
  const specifiers = await fieldSemanticsImports();

  expect(specifiers.some((specifier) => specifier.includes('citation-validation') || specifier.includes('capability-input-schema-shape'))).toBe(false);
});
