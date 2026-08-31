/**
 * task/subject-input-requirements/derive-subject-fields-from-input-requirements: this file's
 * own field-set derivation now comes from GET .../input-requirements
 * (contracts/knowledge/case-input-requirements, hooks/use-case-input-requirements.ts) rather
 * than from scanning connector configuration text for '${subject:<name>}' placeholders --
 * deriveRequiredFields and collectionPlanFromManifest (the collection-plan ->
 * capability-registry -> connector-configuration -> placeholder walk they implemented) are
 * gone from this file entirely (criteria 11-13; the placeholder-based walk lives on only
 * through subjectPlaceholderNamesInConfiguration below, kept for its other, unrelated
 * caller).
 *
 * deriveSubjectFields (below) is the new derivation: use-simulation-subject.ts calls it once
 * per render with the case version's own already-read case-input-requirements
 * (useCaseInputRequirements) and the currently-registered capabilities (useCapabilities),
 * and it does nothing but map one requirement to one field and enrich each of that
 * requirement's own asking capabilities with its connector and input_schema wherever that
 * exact {name, version} identity is found among the capabilities passed in
 * (domain/knowledge/case-input-requirement's own "an asking capability reaches whatever
 * reads this entry ... by its identity alone"; rules/investigation/a-composed-subject-
 * presents-every-case-input-requirement's own "each by its own name and version, together
 * with that capability's own connector"). Factored out of the hook the same way
 * deriveRequiredFields used to be, so this walk stays readable -- and testable -- without a
 * hook's own render lifecycle.
 *
 * subjectPlaceholderNamesInConfiguration (and the private helpers it composes:
 * subjectAttributeNameOf, subjectPlaceholderNamesInString(Record)/InValue) is unrelated to
 * that derivation from here on -- it stays in this file only because
 * hooks/use-test-connector-panel.ts still imports it for its own, separate purpose
 * (reconciling the connector-authoring Test panel's own attribute rows against a connector
 * configuration's own current text, task/connector-test-panel-placeholder-attributes), and
 * this file remains where that walk was first written
 * (task/connector-test-panel-placeholder-attributes/extract-connector-placeholder-parsing's
 * own header comment already explains why the token grammar itself lives in
 * shared/services/connector-placeholder-token.ts rather than here). No field this file's own
 * deriveSubjectFields exposes is derived from that scan (criterion 8).
 */

import type { Capability } from "../hooks/use-capabilities";
import type { CaseInputRequirement } from "../hooks/use-case-input-requirements";
import {
  PLACEHOLDER_PATTERN,
  isSubjectPlaceholderToken,
  splitPlaceholderToken,
} from "../shared/services/connector-placeholder-token";
import { isPlainRecord } from "../shared/services/plain-record";

/**
 * One capability currently registered to answer a case-input-requirement, annotated with the
 * connector and input_schema this derivation reaches only because that exact {name, version}
 * identity is found among the capabilities useCapabilities() has already composed (criteria
 * 3-4) -- never invented for a capability the requirement names that this derivation does not
 * currently find there (criterion 6).
 */
export type SimulationSubjectFieldCapability = {
  readonly name: string;
  readonly version: string;
  readonly connector: string;
  readonly inputSchemaHint: string;
};

/**
 * One editable subject field this hook exposes for `attribute`, one per case-input-requirement
 * the read names (criterion 1): that requirement's own required flag, carried through unchanged
 * (criterion 2), and every one of that requirement's own asking capabilities this derivation
 * currently finds among useCapabilities()'s composed list, each named by its own identity
 * together with its connector and input_schema (rules/investigation/a-composed-subject-
 * presents-every-case-input-requirement's own "never only one of them where more than one
 * currently-registered capability asks for the same attribute" -- this task's own
 * UNDERDETERMINED note, see this task's delivery record). A requirement whose every asking
 * capability resolves to none among those currently composed still exposes this field, with an
 * empty `capabilities` array rather than an invented entry (criteria 5-6).
 */
export type DerivedSubjectField = {
  readonly attribute: string;
  readonly required: boolean;
  readonly capabilities: readonly SimulationSubjectFieldCapability[];
};

/**
 * Resolves one requirement's own asking-capability references to the currently-registered
 * capabilities that answer them, matched by name-and-version identity alone (criterion 3): a
 * reference this derivation cannot currently find among `capabilities` contributes nothing to
 * the returned list -- never a partial entry carrying identity with no connector, since this
 * derivation never invents one (criterion 6).
 */
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

/**
 * The full set of editable subject fields the pinned case version's own case-input-requirements
 * read names (criteria 1-2, 5-9): one field per requirement in the read's own order, each
 * carrying that requirement's own required flag unchanged, and every one of that requirement's
 * own asking capabilities this derivation currently finds among `capabilities`, annotated with
 * that capability's own connector and input_schema (criteria 3-4, 6).
 */
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

/**
 * One '${kind[:argument]}' token's own subject-attribute name, or undefined for a
 * requester/credential placeholder or a malformed token
 * (rules/integration/an-http-connector-configuration-declares-its-call) -- this module
 * only ever needs the "subject" kind. Composes the shared splitPlaceholderToken and
 * isSubjectPlaceholderToken primitives (shared/services/connector-placeholder-token.ts)
 * rather than re-declaring the split and the kind filter here
 * (task/connector-test-panel-placeholder-attributes/extract-connector-placeholder-parsing).
 */
function subjectAttributeNameOf(token: string): string | undefined {
  const parts = splitPlaceholderToken(token);
  return isSubjectPlaceholderToken(parts) ? parts[1] : undefined;
}

/** Every distinct subject-attribute placeholder name found anywhere inside one string value, in the order they occur. */
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

/** Every distinct subject-attribute placeholder name found anywhere inside a flat record of values -- a connector's own declared query or headers; a non-object, or a non-string entry within one, carries none rather than failing the whole read. */
function subjectPlaceholderNamesInStringRecord(record: unknown): readonly string[] {
  if (!isPlainRecord(record)) {
    return [];
  }
  return Object.values(record).flatMap((value) =>
    typeof value === "string" ? subjectPlaceholderNamesInString(value) : [],
  );
}

/** Every distinct subject-attribute placeholder name found anywhere inside a connector's own declared body, of any shape: a string leaf contributes its own placeholders, an array or object is walked recursively in its own key/index order, any other value (number, boolean, null) carries none. */
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

/**
 * Every distinct subject-attribute placeholder name one connector's own configuration text
 * embeds, across its address, query, headers and body, in that declared order
 * (rules/integration/an-http-connector-configuration-declares-its-call). Kept for its one
 * remaining caller, hooks/use-test-connector-panel.ts (this file's own header comment) --
 * no field this file's own deriveSubjectFields exposes is derived from this scan (criterion
 * 8). A configuration whose own registered text does not parse as a well-formed JSON object
 * embeds none, a defensive empty read rather than a thrown error.
 */
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
