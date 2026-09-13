import { isPlainRecord } from "../shared/services/plain-record";

const CREDENTIAL_PLACEHOLDER_PATTERN = /\$\{credential:([^}]+)\}/g;

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

function extractCredentialNames(configuration: Record<string, unknown>): readonly string[] {
  const strings: string[] = [];
  collectStrings(configuration, strings);

  const seen = new Set<string>();
  for (const text of strings) {
    for (const match of text.matchAll(CREDENTIAL_PLACEHOLDER_PATTERN)) {
      const name = match[1];
      if (name !== undefined) {
        seen.add(name);
      }
    }
  }
  return Array.from(seen);
}

export function computeCredentialPlaceholderStatements(configurationText: string): readonly string[] {
  const configuration = parseConfigurationObject(configurationText);
  if (configuration === null) {
    return [];
  }
  return extractCredentialNames(configuration);
}
