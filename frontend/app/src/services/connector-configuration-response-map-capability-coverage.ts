import { isPlainRecord } from "../shared/services/plain-record";
import type { Capability } from "../hooks/use-capabilities";

function parseConfigurationObject(configurationText: string): Record<string, unknown> | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(configurationText);
  } catch {
    return null;
  }
  return isPlainRecord(parsed) ? parsed : null;
}

function capabilityLabel(capability: Capability): string {
  return `${capability.name} (${capability.version})`;
}

function capabilityOutputSchemaPropertyNames(capability: Capability): ReadonlySet<string> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(capability.output_schema);
  } catch {
    return new Set();
  }
  if (!isPlainRecord(parsed) || !isPlainRecord(parsed.properties)) {
    return new Set();
  }
  return new Set(Object.keys(parsed.properties));
}

export type ResponseMapKeyCoverageStatement =
  | {
      readonly kind: "read";
      readonly key: string;
      readonly capabilityLabels: readonly string[];
    }
  | {
      readonly kind: "read-by-none";
      readonly key: string;
    };

export type ResponseMapExpectedFieldStatement = {
  readonly capabilityLabel: string;
  readonly fieldName: string;
};

export type ResponseMapCapabilityCoverage =
  | { readonly kind: "cannot-be-read" }
  | {
      readonly kind: "coverage";
      readonly keyStatements: readonly ResponseMapKeyCoverageStatement[];
      readonly expectedFieldStatements: readonly ResponseMapExpectedFieldStatement[];
    };

export function computeResponseMapCapabilityCoverage(
  configurationText: string,
  connectorCapabilities: readonly Capability[],
): ResponseMapCapabilityCoverage | null {
  const configuration = parseConfigurationObject(configurationText);
  if (configuration === null || !isPlainRecord(configuration.responseMap)) {
    return null;
  }
  const responseMap = configuration.responseMap;

  if (connectorCapabilities.length === 0) {
    return { kind: "cannot-be-read" };
  }

  const capabilityPropertyNames = connectorCapabilities.map((capability) => ({
    label: capabilityLabel(capability),
    propertyNames: capabilityOutputSchemaPropertyNames(capability),
  }));

  const responseMapKeys = Object.keys(responseMap);
  const keyStatements: ResponseMapKeyCoverageStatement[] = responseMapKeys.map((key) => {
    const readingCapabilityLabels = capabilityPropertyNames
      .filter((entry) => entry.propertyNames.has(key))
      .map((entry) => entry.label);

    if (readingCapabilityLabels.length === 0) {
      return { kind: "read-by-none", key };
    }
    return { kind: "read", key, capabilityLabels: readingCapabilityLabels };
  });

  const responseMapKeySet = new Set(responseMapKeys);
  const expectedFieldStatements: ResponseMapExpectedFieldStatement[] = [];
  for (const entry of capabilityPropertyNames) {
    for (const fieldName of entry.propertyNames) {
      if (!responseMapKeySet.has(fieldName)) {
        expectedFieldStatements.push({ capabilityLabel: entry.label, fieldName });
      }
    }
  }

  if (keyStatements.length === 0 && expectedFieldStatements.length === 0) {
    return null;
  }

  return { kind: "coverage", keyStatements, expectedFieldStatements };
}
