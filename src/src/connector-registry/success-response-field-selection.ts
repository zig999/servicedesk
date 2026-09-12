import type { OpenApiSuccessResponseField } from './openapi-operation-reader.js';

export function lowestStatusEntry(
  entries: readonly OpenApiSuccessResponseField[],
): OpenApiSuccessResponseField {
  return entries.reduce((lowest, entry) => (Number(entry.status) < Number(lowest.status) ? entry : lowest));
}

export function lowestStatusSuccessFieldsOf(
  fields: readonly OpenApiSuccessResponseField[],
): readonly OpenApiSuccessResponseField[] {
  const byName = new Map<string, OpenApiSuccessResponseField[]>();
  for (const field of fields) {
    const entries = byName.get(field.name);
    if (entries === undefined) {
      byName.set(field.name, [field]);
    } else {
      entries.push(field);
    }
  }
  return [...byName.values()].map(lowestStatusEntry);
}
