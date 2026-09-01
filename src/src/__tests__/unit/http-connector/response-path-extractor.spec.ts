import { expect, it } from 'vitest';
import { extractResponseFields } from '../../../http-connector/response-path-extractor.js';

it('returns the value found at a nested object key', () => {
  const body = { a: { b: 'nested-value' } };
  const fieldPaths = { field: 'a.b' };

  const extracted = extractResponseFields(fieldPaths, body);

  expect(extracted.field).toBe('nested-value');
});

it('returns the value found at an array index', () => {
  const body = { readings: [10, 20, 30] };
  const fieldPaths = { field: 'readings[1]' };

  const extracted = extractResponseFields(fieldPaths, body);

  expect(extracted.field).toBe(20);
});

it('carries exactly the field names whose paths resolve, adding none the mapping does not declare', () => {
  const body = { a: 1, b: { c: 2 } };
  const fieldPaths = { alpha: 'a', beta: 'b.c' };

  const extracted = extractResponseFields(fieldPaths, body);

  expect(Object.keys(extracted).sort()).toEqual(['alpha', 'beta']);
  expect(extracted).toEqual({ alpha: 1, beta: 2 });
});

it('leaves out a field whose path names an object key the body does not carry', () => {
  const body = { a: 1 };
  const fieldPaths = { present: 'a', missing: 'x.y' };

  const extracted = extractResponseFields(fieldPaths, body);

  expect(extracted).toEqual({ present: 1 });
  expect(Object.prototype.hasOwnProperty.call(extracted, 'missing')).toBe(false);
});

it("leaves out a field whose path names an array index beyond the array's own bounds", () => {
  const body = { readings: [10, 20] };
  const fieldPaths = { present: 'readings[0]', missing: 'readings[2]' };

  const extracted = extractResponseFields(fieldPaths, body);

  expect(extracted).toEqual({ present: 10 });
  expect(Object.prototype.hasOwnProperty.call(extracted, 'missing')).toBe(false);
});

it('leaves out a field whose path expects an object but meets an array or a primitive instead', () => {
  const body = { a: [1, 2], b: 'a-string' };
  const fieldPaths = { onArray: 'a.key', onPrimitive: 'b.key' };

  const extracted = extractResponseFields(fieldPaths, body);

  expect(extracted).toEqual({});
});

it('leaves out a field whose path expects an array but meets a plain object or a primitive instead', () => {
  const body = { a: { notAnArray: true }, b: 'a-string' };
  const fieldPaths = { onObject: 'a[0]', onPrimitive: 'b[0]' };

  const extracted = extractResponseFields(fieldPaths, body);

  expect(extracted).toEqual({});
});

it('resolves a path chaining two consecutive bracketed indices into a nested array', () => {
  const body = { matrix: [[1, 2], [3, 4]] };
  const fieldPaths = { field: 'matrix[0][1]' };

  const extracted = extractResponseFields(fieldPaths, body);

  expect(extracted.field).toBe(2);
});

it('resolves a path that opens directly on a bracketed index for a top-level array body', () => {
  const body = [{ id: 'first-id' }, { id: 'second-id' }];
  const fieldPaths = { field: '[0].id' };

  const extracted = extractResponseFields(fieldPaths, body);

  expect(extracted.field).toBe('first-id');
});

it('returns an empty object when the mapping declares no fields', () => {
  const body = { anything: 'goes' };
  const fieldPaths = {};

  const extracted = extractResponseFields(fieldPaths, body);

  expect(extracted).toEqual({});
});

it('includes a resolved value that is falsy — zero, false, the empty string or null — rather than treating it as unresolved', () => {
  const body = { zero: 0, falseValue: false, emptyString: '', nullValue: null };
  const fieldPaths = { zero: 'zero', falseValue: 'falseValue', emptyString: 'emptyString', nullValue: 'nullValue' };

  const extracted = extractResponseFields(fieldPaths, body);

  expect(extracted).toEqual({ zero: 0, falseValue: false, emptyString: '', nullValue: null });
});

it("returns the entire body when a field's path is the empty string", () => {
  const body = { a: 1, b: 2 };
  const fieldPaths = { whole: '' };

  const extracted = extractResponseFields(fieldPaths, body);

  expect(extracted.whole).toEqual({ a: 1, b: 2 });
});
