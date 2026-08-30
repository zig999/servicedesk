/**
 * The pure step of the Subject derivation (task/subject-derivation/
 * use-simulation-subject-hook, the scope's own "Subject (D7)" walkthrough:
 * collection plan -> concepts -> capability and connector -> connector
 * configuration -> placeholder -> required field), factored out of
 * use-simulation-subject.ts the same way release-checklist.ts is factored
 * out of use-edit-draft-version-form.ts -- a service module the hook
 * composes, holding no React state of its own so this walk can be read (and,
 * separately, tested) without a hook's own render lifecycle.
 *
 * domain/knowledge/case-version's own collection-plan operation is "the
 * deduplicated union of every manifested revision's collects" -- read here
 * from CaseVersionManifestEntry.hypothesis_revision.collects, the same field
 * case-version-record.ts already carries for every other reader of a
 * version's manifest, rather than a new `collectionPlan` field
 * CaseVersionRecord does not expose (this app's own inventory risk on this
 * exact gap, work/case-simulation-frontend/inventory/
 * case-simulation-frontend-area.md) -- confirmed against the backend's own
 * identical operation, case-resolution.ts's own collectionPlan(): sort by
 * each entry's own declared position (rules/knowledge/hypotheses-are-
 * ordered-by-precedence), flatMap collects, then Set-dedupe. This module's
 * own collectionPlanFromManifest mirrors that exactly, disclosed as this
 * task's own inference in its delivery record.
 *
 * domain/integration/capability answers exactly one concept
 * (capabilityForConcept resolves the one currently registered to answer
 * it, contracts/integration/capability-registry's own read-capability);
 * domain/integration/connector-configuration is held "by name", and
 * "nothing enforces that the name resolves to a configuration that exists"
 * (configurationForConnector may resolve nothing, contributing no required
 * field from that capability at all -- not a gap this module invents an
 * answer for, simply the mechanical absence of anything to derive placeholders
 * from).
 *
 * rules/integration/an-http-connector-configuration-declares-its-call states
 * the placeholder mechanism this module parses: any of a connector's own
 * address, query, headers or body may embed one or more
 * '${kind[:argument]}' tokens; only a "subject" kind names a required field
 * here (a "requester" or "credential" token is recognized and skipped, never
 * mistaken for a subject attribute -- criterion 2). The token grammar itself
 * (the PLACEHOLDER_PATTERN regex, the kind/argument split at the first ':',
 * and the filter keeping only kind === "subject") is no longer declared in
 * this file: it moved to shared/services/connector-placeholder-token.ts, a
 * new, feature-neutral module this file now imports it from
 * (task/connector-test-panel-placeholder-attributes/extract-connector-placeholder-parsing),
 * because the connector-authoring test panel is a second, not-yet-written
 * consumer of the exact same grammar. That module's own header comment
 * carries the mirrored-from-the-backend confirmation this file's header used
 * to state directly (src/http-connector/connector-request-resolver.ts,
 * PLACEHOLDER_PATTERN `/\$\{([^}]+)\}/g`, kind split at the first ':',
 * confirmed identical by reading that file) -- this hook stays the first
 * frontend consumer to parse a connector configuration's own text this way
 * (this task's own header comment).
 *
 * The well-formed-configuration-object check (isPlainRecord below) is, for the
 * same reason, no longer declared privately in this file either: it moved to
 * shared/services/plain-record.ts, because hooks/use-test-connector-panel.ts
 * declared an identical private copy of its own
 * (task/connector-test-panel-placeholder-attributes/deduplicate-configuration-object-check).
 * That module's own header comment carries the mirrored-from-the-backend
 * confirmation (isPlainObject, src/http-connector/connector-request-resolver.ts)
 * this file's own isPlainRecord used to state directly.
 */

import type { Capability } from "../hooks/use-capabilities";
import type { ConnectorConfiguration } from "../hooks/use-connector-configurations";
import type { CaseVersionManifestEntry } from "./case-version-record";
import {
  PLACEHOLDER_PATTERN,
  isSubjectPlaceholderToken,
  splitPlaceholderToken,
} from "../shared/services/connector-placeholder-token";
import { isPlainRecord } from "../shared/services/plain-record";

/**
 * One subject field this simulation requires before it can run, derived
 * from the version's own collection plan through the capability and
 * connector-configuration registries (criteria 1-3): the distinct
 * '${subject:<attribute>}' placeholder name, the connector whose own
 * configuration named it, the capability that resolved to that connector,
 * and that capability's own input_schema carried through untouched as a
 * free-text hint (criterion 3 -- never parsed or validated as structured
 * data here or by any caller of this module).
 */
export type DerivedSubjectField = {
  readonly attribute: string;
  readonly connector: string;
  readonly capability: { readonly name: string; readonly version: string };
  readonly inputSchemaHint: string;
};

/**
 * domain/knowledge/case-version's own collection-plan operation: the
 * deduplicated union of every manifested entry's own hypothesis-revision
 * collects, in declared precedence order (position ascending) -- mirrors
 * this project's own backend implementation of the same operation,
 * case-resolution.ts's own collectionPlan(), since CaseVersionRecord carries
 * no separate `collectionPlan` field of its own to read (this module's own
 * inference; see this task's delivery record). `manifest` absent (a version
 * never yet read back through GET, case-version-record.ts's own header
 * comment) derives an empty plan rather than throwing.
 */
export function collectionPlanFromManifest(
  manifest: readonly CaseVersionManifestEntry[] | undefined,
): readonly string[] {
  const byPrecedence = [...(manifest ?? [])].sort((a, b) => a.position - b.position);
  return [...new Set(byPrecedence.flatMap((entry) => entry.hypothesis_revision.collects))];
}

/** The capability currently registered to answer one concept (criterion 1, contracts/integration/capability-registry's own read-capability) -- the registry resolves at most one, so the first match is the one it currently answers with. */
function capabilityForConcept(
  capabilities: readonly Capability[],
  concept: string,
): Capability | undefined {
  return capabilities.find((capability) => capability.concept === concept);
}

/** The configuration currently registered under one connector's own name -- may resolve nothing (domain/integration/connector-configuration's own "nothing enforces that the name resolves to a configuration that exists"). */
function configurationForConnector(
  connectorConfigurations: readonly ConnectorConfiguration[],
  connector: string,
): ConnectorConfiguration | undefined {
  return connectorConfigurations.find((entry) => entry.connector === connector);
}

/**
 * One '${kind[:argument]}' token's own subject-attribute name, or undefined for a
 * requester/credential placeholder or a malformed token
 * (rules/integration/an-http-connector-configuration-declares-its-call) -- this module
 * only ever needs the "subject" kind (criterion 2). Composes the shared
 * splitPlaceholderToken and isSubjectPlaceholderToken primitives
 * (shared/services/connector-placeholder-token.ts) rather than re-declaring the split
 * and the kind filter here (task/connector-test-panel-placeholder-attributes/extract-connector-placeholder-parsing).
 */
function subjectAttributeNameOf(token: string): string | undefined {
  const parts = splitPlaceholderToken(token);
  return isSubjectPlaceholderToken(parts) ? parts[1] : undefined;
}

/** Every distinct subject-attribute placeholder name found anywhere inside one string value, in the order they occur (criterion 2). */
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

/** Every distinct subject-attribute placeholder name found anywhere inside a flat record of values -- a connector's own declared query or headers (criterion 2); a non-object, or a non-string entry within one, carries none rather than failing the whole read. */
function subjectPlaceholderNamesInStringRecord(record: unknown): readonly string[] {
  if (!isPlainRecord(record)) {
    return [];
  }
  return Object.values(record).flatMap((value) =>
    typeof value === "string" ? subjectPlaceholderNamesInString(value) : [],
  );
}

/** Every distinct subject-attribute placeholder name found anywhere inside a connector's own declared body, of any shape (criterion 2): a string leaf contributes its own placeholders, an array or object is walked recursively in its own key/index order, any other value (number, boolean, null) carries none. */
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
 * Every distinct subject-attribute placeholder name one connector's own
 * configuration text embeds, across its address, query, headers and body,
 * in that declared order (criterion 2, rules/integration/an-http-connector-
 * configuration-declares-its-call). A configuration whose own registered
 * text does not parse as a well-formed JSON object embeds none -- registration
 * already holds every configuration to well-formedness
 * (domain/integration/connector-configuration's own Description names
 * a-connector-configuration-holds-a-well-formed-object), so this is a
 * defensive empty read rather than a thrown error: one connector's own
 * malformed text should not fail this derivation for every other connector
 * (this module's own inference; see this task's delivery record).
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

/**
 * The full set of required subject fields one version's own collection plan
 * derives (criteria 1-3): for every concept the plan names, the capability
 * currently registered to answer it and that capability's own declared
 * connector (criterion 1); for every resolved connector whose own
 * configuration embeds one or more '${subject:<attribute>}' placeholders,
 * one required field per distinct placeholder name, annotated with the
 * connector and the capability that asked for it, and that capability's own
 * input_schema carried through as a free-text hint (criteria 2-3).
 *
 * Deduplicates by attribute name across the whole derivation: resolution
 * walks the collection plan's own declared concept order, and within one
 * connector's own configuration, address before query before headers before
 * body, each in its own declared key order -- the first connector/capability
 * pair to name a given attribute keeps that field's own annotation where a
 * second, later-resolved connector would otherwise also ask for it.
 * Criterion 2 states "one required field per distinct placeholder name"
 * without naming a tie-break for two different connectors naming the same
 * attribute; this module's own inference is to keep the first asker in this
 * deterministic order, drawn from the collection plan's own declared
 * precedence (rules/knowledge/hypotheses-are-ordered-by-precedence) rather
 * than an invented ranking of its own -- see this task's delivery record.
 */
export function deriveRequiredFields(params: {
  readonly manifest: readonly CaseVersionManifestEntry[] | undefined;
  readonly capabilities: readonly Capability[];
  readonly connectorConfigurations: readonly ConnectorConfiguration[];
}): readonly DerivedSubjectField[] {
  const { manifest, capabilities, connectorConfigurations } = params;
  const concepts = collectionPlanFromManifest(manifest);

  const fields: DerivedSubjectField[] = [];
  const claimedAttributeNames = new Set<string>();

  for (const concept of concepts) {
    const capability = capabilityForConcept(capabilities, concept);
    if (capability === undefined) {
      continue;
    }
    const configuration = configurationForConnector(connectorConfigurations, capability.connector);
    if (configuration === undefined) {
      continue;
    }
    const attributeNames = subjectPlaceholderNamesInConfiguration(configuration.configuration);
    for (const attribute of attributeNames) {
      if (claimedAttributeNames.has(attribute)) {
        continue;
      }
      claimedAttributeNames.add(attribute);
      fields.push({
        attribute,
        connector: capability.connector,
        capability: { name: capability.name, version: capability.version },
        inputSchemaHint: capability.input_schema,
      });
    }
  }

  return fields;
}
