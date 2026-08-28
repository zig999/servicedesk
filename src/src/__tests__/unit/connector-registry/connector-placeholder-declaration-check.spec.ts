// Proof for task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check
// (rules/integration/a-connector-placeholder-is-declared-by-its-capability): orphanedPlaceholders
// names every Subject-attribute placeholder a connector configuration's own call text embeds that
// a capability's declared input-schema properties does not hold — never a requester or credential
// placeholder, whatever the capability declares. Pure, so no stand-in is needed anywhere below
// (TST-03): both arguments are plain values, never a store or a network boundary.
import { expect, it } from 'vitest';
import { orphanedPlaceholders } from '../../../connector-registry/connector-placeholder-declaration-check.js';

/** A well-formed input schema declaring exactly the given property names, so a test can state which Subject attributes the capability holds without spelling out the whole JSON Schema shape each time. */
function inputSchemaDeclaring(...propertyNames: readonly string[]): string {
  const properties = Object.fromEntries(propertyNames.map((name) => [name, {}]));
  return JSON.stringify({ properties });
}

// ------------------------------------------------------------------ criterion 1

it("names a Subject-attribute placeholder as orphaned when the capability's declared properties does not name it", () => {
  const configurationText = 'https://api.example.test/records/${subject:customer_document}';

  const orphaned = orphanedPlaceholders(configurationText, inputSchemaDeclaring('id'));

  expect(orphaned).toEqual(['customer_document']);
});

// ------------------------------------------------------------------ criterion 2

it("names no orphaned placeholder for a Subject-attribute placeholder the capability's declared properties does name", () => {
  const configurationText = 'https://api.example.test/records/${subject:customer_document}';

  const orphaned = orphanedPlaceholders(configurationText, inputSchemaDeclaring('customer_document'));

  expect(orphaned).toEqual([]);
});

it('names only the undeclared placeholder, leaving a declared one out, when the call text embeds both', () => {
  const configurationText = '${subject:id}/${subject:customer_document}';

  const orphaned = orphanedPlaceholders(configurationText, inputSchemaDeclaring('id'));

  expect(orphaned).toEqual(['customer_document']);
});

// ------------------------------------------------------------------ criterion 3

it('never names a requester placeholder orphaned, even when the capability declares no properties at all', () => {
  const configurationText = 'https://api.example.test/as/${requester}';

  const orphaned = orphanedPlaceholders(configurationText, inputSchemaDeclaring());

  expect(orphaned).toEqual([]);
});

it('never names a credential placeholder orphaned, even when the capability declares no properties at all', () => {
  const configurationText = 'Bearer ${credential:ACME_API_KEY}';

  const orphaned = orphanedPlaceholders(configurationText, inputSchemaDeclaring());

  expect(orphaned).toEqual([]);
});

// ------------------------------------------------------------------ inference: a raw input_schema is read through declaredInputSchemaShape's own permissive posture

it('treats an undefined input_schema as declaring no properties, naming every embedded Subject-attribute placeholder as orphaned', () => {
  const configurationText = '${subject:customer_document}';

  const orphaned = orphanedPlaceholders(configurationText, undefined);

  expect(orphaned).toEqual(['customer_document']);
});

it('treats an input_schema that is not syntactically valid JSON as declaring no properties, naming every embedded Subject-attribute placeholder as orphaned rather than throwing', () => {
  const configurationText = '${subject:customer_document}';

  const orphaned = orphanedPlaceholders(configurationText, '{not valid json');

  expect(orphaned).toEqual(['customer_document']);
});

it('treats an input_schema whose properties is not declared as an object as declaring no properties, naming every embedded Subject-attribute placeholder as orphaned', () => {
  const configurationText = '${subject:customer_document}';

  const orphaned = orphanedPlaceholders(configurationText, '{"properties":"not-an-object"}');

  expect(orphaned).toEqual(['customer_document']);
});

// ------------------------------------------------------------------ edge cases

it('answers the empty array when the call text embeds no placeholder at all', () => {
  const configurationText = 'https://api.example.test/records';

  const orphaned = orphanedPlaceholders(configurationText, inputSchemaDeclaring());

  expect(orphaned).toEqual([]);
});

it('answers the empty array when the capability declares every attribute the call text embeds, across several placeholders at once', () => {
  const configurationText = '${subject:id}/${subject:customer_document}/${requester}';

  const orphaned = orphanedPlaceholders(configurationText, inputSchemaDeclaring('id', 'customer_document'));

  expect(orphaned).toEqual([]);
});

it('never throws for a bare "${subject}" placeholder naming no attribute, and does not name it orphaned', () => {
  const configurationText = 'https://api.example.test/${subject}';

  const orphaned = orphanedPlaceholders(configurationText, inputSchemaDeclaring());

  expect(orphaned).toEqual([]);
});
