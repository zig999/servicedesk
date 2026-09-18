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
  return fieldsFromProperties(parsed.properties);
}

function fieldsFromProperties(properties: Record<string, unknown>, parentPath?: string): readonly FieldSemantics[] {
  return Object.entries(properties).flatMap(([key, value]) => fieldsFromNode(pathWith(parentPath, key), value));
}

function pathWith(parentPath: string | undefined, key: string): string {
  return parentPath === undefined ? key : `${parentPath}.${key}`;
}

function fieldsFromNode(path: string, value: unknown): readonly FieldSemantics[] {
  const declared = isPlainObject(value) ? value : {};
  return [fieldSemanticsFrom(path, declared), ...descendantFieldsOf(path, declared)];
}

function descendantFieldsOf(path: string, declared: Record<string, unknown>): readonly FieldSemantics[] {
  if (isPlainObject(declared.properties)) {
    return fieldsFromProperties(declared.properties, path);
  }
  if (isPlainObject(declared.items)) {
    return fieldsFromNode(`${path}[]`, declared.items);
  }
  return [];
}

function fieldSemanticsFrom(name: string, declared: Record<string, unknown>): FieldSemantics {
  return {
    name,
    ...(typeof declared.type === 'string' ? { type: declared.type } : {}),
    ...(typeof declared.description === 'string' ? { description: declared.description } : {}),
  };
}
