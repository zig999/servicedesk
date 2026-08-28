// The shared reconciliation check
// (rules/integration/a-connector-placeholder-is-declared-by-its-capability):
// every Subject-attribute placeholder a connector configuration's own call
// text embeds that a capability's declared input-schema properties does not
// hold. A pure function naming the departure as data rather than raising a
// refusal, so both the capability registry's own registerCapability and the
// connector-configuration registry's own registerConnector refusal
// pipelines can each raise their own distinct error over the same list.
// Wiring this check into either write path, and issuing the HTTP 422
// ConnectorPlaceholderOutsideInputSchemaError refusal the rule itself
// states, are a sibling task's own concern
// (task/connector-configuration-and-placeholder-contract/refuse-connector-registration-with-orphaned-placeholder,
// .../refuse-capability-registration-with-orphaned-placeholder) — this
// task's own Notes disclose the same gap as a REMAINDER from the
// specification.
//
// Lives beside connector-configuration-registry.service.ts rather than
// under capability-registry: it needs connector-request-resolver.ts's own
// placeholder-token walk, and capability-registry is held, by its own
// existing test suite (domain-depends-on-no-infrastructure.spec.ts), to
// importing nothing from http-connector at all — connector-registry carries
// no such restriction. A future capability-registration refusal (the
// sibling task above) reaches this function by importing it from here,
// never the reverse. Reuses capability-input-schema-shape.ts's own
// declaredInputSchemaShape as the one shape reader for a capability's
// input_schema (rather than a second parser) exactly as its own header
// comment already anticipates for "every other consumer" of that permissive
// reading.

import { declaredInputSchemaShape } from '../capability-registry/capability-input-schema-shape.js';
import { subjectAttributePlaceholderNamesIn } from '../http-connector/connector-request-resolver.js';

/**
 * Every Subject-attribute placeholder embedded in one connector
 * configuration's own call text that a capability's declared input-schema
 * properties does not hold — the empty array where every embedded
 * placeholder is already declared, or where the text embeds none at all.
 * Reuses subjectAttributePlaceholderNamesIn's own placeholder-token walk
 * (connector-request-resolver.ts) and declaredInputSchemaShape's own shape
 * reading (capability-input-schema-shape.ts) rather than a second regex or a
 * second JSON-shape parser (the inventory's own must_not_duplicate note); a
 * requester or credential placeholder is never extracted, so it is never
 * named orphaned here either (criterion 3). Pure and never throws: naming
 * the departure is this function's whole job — declaredInputSchemaShape's
 * own defensive "malformed reads as declaring nothing" posture means a
 * capability whose own input_schema is malformed simply names every
 * embedded Subject-attribute placeholder as orphaned, never a thrown error
 * from this function.
 */
export function orphanedPlaceholders(
  configurationText: string,
  inputSchema: string | undefined,
): readonly string[] {
  const { properties } = declaredInputSchemaShape(inputSchema);
  return subjectAttributePlaceholderNamesIn(configurationText).filter((name) => !properties.includes(name));
}
