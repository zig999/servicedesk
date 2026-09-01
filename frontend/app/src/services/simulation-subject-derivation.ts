import type { Capability } from "../hooks/use-capabilities";
import type { CaseInputRequirement } from "../hooks/use-case-input-requirements";
import {
  PLACEHOLDER_PATTERN,
  isSubjectPlaceholderToken,
  splitPlaceholderToken,
} from "../shared/services/connector-placeholder-token";
import { isPlainRecord } from "../shared/services/plain-record";

export type SimulationSubjectFieldCapability = {
  readonly name: string;
  readonly version: string;
  readonly connector: string;
  readonly inputSchemaHint: string;
};

export type DerivedSubjectField = {
  readonly attribute: string;
  readonly required: boolean;
  readonly capabilities: readonly SimulationSubjectFieldCapability[];
};

function resolvedCapabilitiesFor(
  requirement: CaseInputRequirement,
  capabilities: readonly Capability[],
): readonly SimulationSubjectFieldCapability[] {
  const resolved: SimulationSubjectFieldCapability[] = [];
  for (const reference of requirement.capabilities) {
    const match = capabilities.find(
      (capability) => capability.name === reference.name && capability.version === reference.version,
    );
    if (match !== undefined) {
      resolved.push({
        name: match.name,
        version: match.version,
        connector: match.connector,
        inputSchemaHint: match.input_schema,
      });
    }
  }
  return resolved;
}

export function deriveSubjectFields(params: {
  readonly requirements: readonly CaseInputRequirement[];
  readonly capabilities: readonly Capability[];
}): readonly DerivedSubjectField[] {
  const { requirements, capabilities } = params;
  return requirements.map((requirement) => ({
    attribute: requirement.attribute,
    required: requirement.required,
    capabilities: resolvedCapabilitiesFor(requirement, capabilities),
  }));
}

function subjectAttributeNameOf(token: string): string | undefined {
  const parts = splitPlaceholderToken(token);
  return isSubjectPlaceholderToken(parts) ? parts[1] : undefined;
}

function subjectPlaceholderNamesInString(value: string): readonly string[] {
  const names: string[] = [];
  for (const match of value.matchAll(PLACEHOLDER_PATTERN)) {
    const name = subjectAttributeNameOf(match[1]);
    if (name !== undefined) {
      names.push(name);
    }
  }
  return names;
}

function subjectPlaceholderNamesInStringRecord(record: unknown): readonly string[] {
  if (!isPlainRecord(record)) {
    return [];
  }
  return Object.values(record).flatMap((value) =>
    typeof value === "string" ? subjectPlaceholderNamesInString(value) : [],
  );
}

function subjectPlaceholderNamesInValue(value: unknown): readonly string[] {
  if (typeof value === "string") {
    return subjectPlaceholderNamesInString(value);
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry: unknown) => subjectPlaceholderNamesInValue(entry));
  }
  if (isPlainRecord(value)) {
    return Object.values(value).flatMap((entry) => subjectPlaceholderNamesInValue(entry));
  }
  return [];
}

export function subjectPlaceholderNamesInConfiguration(
  configurationText: string,
): readonly string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(configurationText);
  } catch {
    return [];
  }
  if (!isPlainRecord(parsed)) {
    return [];
  }
  const address = typeof parsed.address === "string" ? parsed.address : "";
  return [
    ...subjectPlaceholderNamesInString(address),
    ...subjectPlaceholderNamesInStringRecord(parsed.query),
    ...subjectPlaceholderNamesInStringRecord(parsed.headers),
    ...subjectPlaceholderNamesInValue(parsed.body),
  ];
}
