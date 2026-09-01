import { declaredInputSchemaShape } from '../capability-registry/capability-input-schema-shape.js';
import { subjectAttributePlaceholderNamesIn } from '../http-connector/connector-request-resolver.js';

export function orphanedPlaceholders(
  configurationText: string,
  inputSchema: string | undefined,
): readonly string[] {
  const { properties } = declaredInputSchemaShape(inputSchema);
  return subjectAttributePlaceholderNamesIn(configurationText).filter((name) => !properties.includes(name));
}
