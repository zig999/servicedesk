import { lowestStatusSuccessFieldsOf } from './success-response-field-selection.js';
import type { OpenApiOperationReading, OpenApiSuccessResponseField } from './openapi-operation-reader.js';
import type {
  CapabilitySchemaDraftUnresolvedItem,
  CapabilitySchemaDraftUnresolvedReason,
} from './capability-schema-draft.js';

const NOT_REDUCIBLE_REASON: CapabilitySchemaDraftUnresolvedReason = 'schema-not-reducible-to-a-type';

export type CapabilitySchemaDraftOutputSchemaReading = {
  readonly outputSchema: string;
  readonly unresolved: readonly CapabilitySchemaDraftUnresolvedItem[];
};

type ResolvedSuccessResponseField = OpenApiSuccessResponseField & { readonly reducedType: string };

type OutputSchemaProperties = Readonly<Record<string, { readonly type: string }>>;

export function draftedOutputSchema(reading: OpenApiOperationReading): CapabilitySchemaDraftOutputSchemaReading {
  const lowestStatusFields = lowestStatusSuccessFieldsOf(reading.successResponseFields);
  const resolved = lowestStatusFields.filter(hasReducedType);
  const properties = propertiesOf(resolved);
  const required = resolved.filter((field) => field.declaredRequired === true).map((field) => field.name);
  const unresolved = lowestStatusFields.filter((field) => !hasReducedType(field)).map(unresolvedItemOf);
  return { outputSchema: JSON.stringify(outputSchemaObject(properties, required)), unresolved };
}

function outputSchemaObject(
  properties: OutputSchemaProperties,
  required: readonly string[],
): Readonly<Record<string, unknown>> {
  return required.length > 0 ? { properties, required } : { properties };
}

function propertiesOf(resolved: readonly ResolvedSuccessResponseField[]): OutputSchemaProperties {
  return Object.fromEntries(resolved.map((field) => [field.name, { type: field.reducedType }]));
}

function hasReducedType(field: OpenApiSuccessResponseField): field is ResolvedSuccessResponseField {
  return field.reducedType !== undefined;
}

function unresolvedItemOf(field: OpenApiSuccessResponseField): CapabilitySchemaDraftUnresolvedItem {
  return { name: field.name, reason: NOT_REDUCIBLE_REASON };
}
