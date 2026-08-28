// Proof for task/capability-input-schema-contract/refuse-malformed-capability-input-schema:
// inputSchemaShapeProblems names every way an already-parsed input schema value departs from
// the declared shape (rules/integration/a-capability-input-schema-holds-a-well-formed-object) —
// properties not an object once declared, required not an array, or required naming a key
// properties does not hold — reading an absent properties key as declaring it implicitly empty
// rather than a departure. declaredInputSchemaShape is the permissive shared reader every other
// consumer uses: properties and required both empty for anything that does not parse as JSON,
// is undefined, or does not hold the shape, rather than throwing or refusing.
import { expect, it } from 'vitest';
import {
  declaredInputSchemaShape,
  inputSchemaShapeProblems,
} from '../../../capability-registry/capability-input-schema-shape.js';

// ------------------------------------------------------------------ inputSchemaShapeProblems

it('reports no problem for a parsed value declaring an empty properties object and no required array', () => {
  const problems = inputSchemaShapeProblems({ properties: {} });

  expect(problems).toEqual([]);
});

it('reports no problem when the parsed value declares no properties key at all, reading the omission as declaring it empty rather than a departure', () => {
  const problems = inputSchemaShapeProblems({});

  expect(problems).toEqual([]);
});

it('reports a problem naming properties when it is declared as something other than an object', () => {
  const problems = inputSchemaShapeProblems({ properties: 'not-an-object' });

  expect(problems).toEqual(['properties is not declared as an object']);
});

it('reports a problem naming properties when it is declared as an array rather than an object', () => {
  const problems = inputSchemaShapeProblems({ properties: [] });

  expect(problems).toEqual(['properties is not declared as an object']);
});

it('reports a problem when the parsed value itself is not an object at all', () => {
  const problems = inputSchemaShapeProblems(['not', 'an', 'object']);

  expect(problems).toEqual(['properties is not declared as an object']);
});

it('reports no problem when required is declared as an empty array', () => {
  const problems = inputSchemaShapeProblems({ properties: { a: {} }, required: [] });

  expect(problems).toEqual([]);
});

it('reports a problem naming the key when required names a key absent from properties', () => {
  const problems = inputSchemaShapeProblems({ properties: { a: {} }, required: ['a', 'b'] });

  expect(problems).toEqual(['required names a key absent from properties: b']);
});

it('reports a problem naming required when it is declared as something other than an array', () => {
  const problems = inputSchemaShapeProblems({ properties: {}, required: 'not-an-array' });

  expect(problems).toEqual(['required is not declared as an array']);
});

it('reports both problems together when properties and required depart from the shape at once', () => {
  const problems = inputSchemaShapeProblems({ properties: 'not-an-object', required: ['a'] });

  expect(problems).toEqual([
    'properties is not declared as an object',
    'required names a key absent from properties: a',
  ]);
});

// ------------------------------------------------------------------ declaredInputSchemaShape

it('reads the declared properties and required keys from a well-formed input_schema', () => {
  const shape = declaredInputSchemaShape('{"properties":{"a":{},"b":{}},"required":["a"]}');

  expect(shape).toEqual({ properties: ['a', 'b'], required: ['a'] });
});

it('answers properties and required both empty for an input_schema that does not hold the declared shape, rather than throwing or refusing', () => {
  const shape = declaredInputSchemaShape('{"properties":"not-an-object"}');

  expect(shape).toEqual({ properties: [], required: [] });
});

it('answers properties and required both empty for an input_schema that is not valid JSON at all, rather than throwing', () => {
  const shape = declaredInputSchemaShape('not valid json');

  expect(shape).toEqual({ properties: [], required: [] });
});

it('answers properties and required both empty for an input_schema that is undefined, rather than throwing', () => {
  const shape = declaredInputSchemaShape(undefined);

  expect(shape).toEqual({ properties: [], required: [] });
});
