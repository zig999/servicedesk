import { isPlainRecord } from "../shared/services/plain-record";
import type { Capability } from "../hooks/use-capabilities";

const SUBJECT_PLACEHOLDER_PATTERN = /\$\{subject:([^}]+)\}/g;

function collectStrings(value: unknown, into: string[]): void {
  if (typeof value === "string") {
    into.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectStrings(item, into);
    }
    return;
  }
  if (isPlainRecord(value)) {
    for (const item of Object.values(value)) {
      collectStrings(item, into);
    }
  }
}

function parseConfigurationObject(configurationText: string): Record<string, unknown> | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(configurationText);
  } catch {
    return null;
  }
  return isPlainRecord(parsed) ? parsed : null;
}

function extractSubjectAttributeNames(configuration: Record<string, unknown>): readonly string[] {
  const strings: string[] = [];
  collectStrings(configuration, strings);

  const seen = new Set<string>();
  for (const text of strings) {
    for (const match of text.matchAll(SUBJECT_PLACEHOLDER_PATTERN)) {
      const attributeName = match[1];
      if (attributeName !== undefined) {
        seen.add(attributeName);
      }
    }
  }
  return Array.from(seen);
}

function capabilityLabel(capability: Capability): string {
  return `${capability.name} (${capability.version})`;
}

function capabilityInputSchemaPropertyNames(capability: Capability): ReadonlySet<string> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(capability.input_schema);
  } catch {
    return new Set();
  }
  if (!isPlainRecord(parsed) || !isPlainRecord(parsed.properties)) {
    return new Set();
  }
  return new Set(Object.keys(parsed.properties));
}

export type SubjectPlaceholderStatement =
  | {
      readonly kind: "cannot-be-checked";
    }
  | {
      readonly kind: "declared";
      readonly attributeName: string;
    }
  | {
      readonly kind: "undeclared";
      readonly attributeName: string;
      readonly nonDeclaringCapabilityLabels: readonly string[];
    };

export function computeSubjectPlaceholderStatements(
  configurationText: string,
  connectorCapabilities: readonly Capability[],
): readonly SubjectPlaceholderStatement[] {
  const configuration = parseConfigurationObject(configurationText);
  if (configuration === null) {
    return [];
  }

  const attributeNames = extractSubjectAttributeNames(configuration);
  if (attributeNames.length === 0) {
    return [];
  }

  if (connectorCapabilities.length === 0) {
    return [{ kind: "cannot-be-checked" }];
  }

  const capabilityPropertyNames = connectorCapabilities.map((capability) => ({
    label: capabilityLabel(capability),
    propertyNames: capabilityInputSchemaPropertyNames(capability),
  }));

  return attributeNames.map((attributeName) => {
    const nonDeclaringCapabilityLabels = capabilityPropertyNames
      .filter((entry) => !entry.propertyNames.has(attributeName))
      .map((entry) => entry.label);

    if (nonDeclaringCapabilityLabels.length === 0) {
      return { kind: "declared", attributeName };
    }
    return { kind: "undeclared", attributeName, nonDeclaringCapabilityLabels };
  });
}
