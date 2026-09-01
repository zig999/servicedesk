import { isPlainObject, parseJsonOrUndefined } from './citation-validation.js';

export type FieldSemantics = {
  readonly name: string;
  readonly type?: string;
  readonly description?: string;
};

export function fieldSemanticsOf(outputSchema: string | undefined): readonly FieldSemantics[] {
  if (outputSchema === undefined) {
    return [];
  }
  const parsed = parseJsonOrUndefined(outputSchema);
  if (!isPlainObject(parsed) || !isPlainObject(parsed.properties)) {
    return [];
  }
  return Object.entries(parsed.properties).map(([name, value]) => fieldSemanticsFrom(name, value));
}

function fieldSemanticsFrom(name: string, value: unknown): FieldSemantics {
  const declared = isPlainObject(value) ? value : {};
  return {
    name,
    ...(typeof declared.type === 'string' ? { type: declared.type } : {}),
    ...(typeof declared.description === 'string' ? { description: declared.description } : {}),
  };
}
