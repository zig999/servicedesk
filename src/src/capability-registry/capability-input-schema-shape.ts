export type DeclaredInputSchemaShape = {
  readonly properties: readonly string[];
  readonly required: readonly string[];
};

const EMPTY_SHAPE: DeclaredInputSchemaShape = { properties: [], required: [] };

export function inputSchemaShapeProblems(parsed: unknown): readonly string[] {
  const problems: string[] = [];
  const propertiesValue = isPlainObject(parsed) ? parsed.properties : undefined;
  const propertiesIsObject = propertiesValue === undefined || isPlainObject(propertiesValue);
  if (!isPlainObject(parsed) || !propertiesIsObject) {
    problems.push('properties is not declared as an object');
  }
  const propertyKeys = isPlainObject(propertiesValue) ? Object.keys(propertiesValue) : [];
  problems.push(...requiredProblems(isPlainObject(parsed) ? parsed.required : undefined, propertyKeys));
  return problems;
}

function requiredProblems(requiredValue: unknown, propertyKeys: readonly string[]): readonly string[] {
  if (requiredValue === undefined) {
    return [];
  }
  if (!Array.isArray(requiredValue)) {
    return ['required is not declared as an array'];
  }
  const absentKeys = requiredValue.filter((key) => typeof key !== 'string' || !propertyKeys.includes(key));
  return absentKeys.length > 0 ? [`required names a key absent from properties: ${absentKeys.join(', ')}`] : [];
}

export function declaredInputSchemaShape(inputSchema: string | undefined): DeclaredInputSchemaShape {
  if (inputSchema === undefined) {
    return EMPTY_SHAPE;
  }
  const parsed = parseJsonOrUndefined(inputSchema);
  if (inputSchemaShapeProblems(parsed).length > 0 || !isPlainObject(parsed)) {
    return EMPTY_SHAPE;
  }
  const properties = isPlainObject(parsed.properties) ? Object.keys(parsed.properties) : [];
  const required = Array.isArray(parsed.required)
    ? parsed.required.filter((item): item is string => typeof item === 'string')
    : [];
  return { properties, required };
}

function parseJsonOrUndefined(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
