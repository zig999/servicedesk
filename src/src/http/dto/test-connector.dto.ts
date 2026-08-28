// Wire shapes for POST /v1/test-connector
// (task/connector-diagnostics/test-connector-route,
// contracts/integration/connector-diagnostics,
// rules/integration/a-connector-configuration-is-tested-through-a-registered-capability):
// the request and response DTOs the route validates and types against
// (DTO-02/DTO-03), named for this use case.
//
// testConnectorRequestSchema's own subject field mirrors diagnose.dto.ts's
// own subjectSchema exactly — a governed type plus its whole attribute-value
// set, at least one pair
// (rules/investigation/a-subject-carries-at-least-one-attribute) — since
// this operation assembles its subject the same way any other observation
// does (contracts/integration/connector-diagnostics's own description,
// criterion 5). capability names the tested capability by its own identity
// (name, version — domain/integration/capability's own "identified by name
// and version"), and connector names the connector configuration the
// request asks to exercise, checked against the named capability's own
// connector field (criterion 4) before any call is issued. requester
// travels the same way diagnoseRequestSchema's own requester does — an
// unverified claim taken straight from the body
// (constraints/no-route-enforces-authentication, criterion 7) — because
// resolveConnectorRequest requires one to resolve a `${requester}`
// placeholder the same way a real observation would. input is this route's
// own optional, opaque sample payload (matching the capability's own
// input_schema by convention, never validated against it by this task):
// accepted for a caller that wants to record what it intended to send, but
// unused in translation, since neither resolveConnectorRequest nor
// criterion 2 gives it anywhere to go — the request issued is assembled
// only from the subject and the connector's own configuration.
//
// testConnectorResponseSchema answers the raw request actually assembled
// (credential-redacted, this route's own SEC-03/SEC-04 accommodation — see
// test-connector.controller.ts) and the raw outcome of the one call issued:
// a received response's status, headers, body and elapsed time; a timeout;
// or the raw error, each carrying how long the call took — never
// reclassified into one of the four evidence-result endings, since this
// operation is diagnostic-only and answers to no investigation
// (contracts/integration/connector-diagnostics's own "no investigation ever
// reads what it returned").
//
// orphaned_placeholders names, for the pair under test, every
// Subject-attribute placeholder the tested connector configuration's own
// call text embeds that the tested capability's own input_schema properties
// does not declare
// (rules/integration/a-connector-placeholder-is-declared-by-its-capability) —
// snake_case, matching this route's own capabilities_with_malformed_input_schema
// sibling in case-input-requirements.dto.ts. Always present, an empty array
// where every embedded placeholder is already declared: this diagnostic
// reports the gap, it never refuses the test on account of it.

import { z } from 'zod';

/** One attribute-value pair identifying the subject instance, mirroring diagnose.dto.ts's own subjectAttributeValueSchema. */
const subjectAttributeValueSchema = z.object({
  attribute: z.string().min(1),
  value: z.string().min(1),
});

/** The subject this diagnostic call examines, mirroring diagnose.dto.ts's own subjectSchema exactly (criterion 5). */
const subjectSchema = z.object({
  type: z.string().min(1),
  attributes: z.array(subjectAttributeValueSchema).min(1),
});

/** The tested capability's own identity: name and version (domain/integration/capability). */
const capabilityIdentitySchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
});

/**
 * The whole test-connector request body: the capability to test through,
 * the connector configuration named to be exercised, the subject to
 * examine, the requester the call runs under, and an optional sample input
 * payload accepted but not translated (see this file's own header comment).
 */
export const testConnectorRequestSchema = z.object({
  capability: capabilityIdentitySchema,
  connector: z.string().min(1),
  subject: subjectSchema,
  requester: z.string().min(1),
  input: z.unknown().optional(),
});

export type TestConnectorRequestDto = z.infer<typeof testConnectorRequestSchema>;

/** The raw outbound request actually assembled: method, resolved address (query merged in), headers and body, credential-redacted. */
const testConnectorRequestEchoSchema = z.object({
  method: z.string().min(1),
  address: z.string().min(1),
  headers: z.record(z.string(), z.string()),
  body: z.unknown().optional(),
});

/** The raw outcome of the one call actually issued: a received response, a timeout, or a raw error — each carrying its own elapsed time in milliseconds. */
const testConnectorOutcomeSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('response'),
    status: z.int(),
    headers: z.record(z.string(), z.string()),
    body: z.unknown().optional(),
    elapsedMs: z.number().nonnegative(),
  }),
  z.object({
    kind: z.literal('timed-out'),
    elapsedMs: z.number().nonnegative(),
  }),
  z.object({
    kind: z.literal('error'),
    message: z.string().min(1),
    elapsedMs: z.number().nonnegative(),
  }),
]);

/**
 * The whole test-connector response: the raw request sent and the raw
 * outcome received (criterion 1), plus every Subject-attribute placeholder
 * the tested connector configuration's own call text embeds that the tested
 * capability's own input_schema does not declare
 * (rules/integration/a-connector-placeholder-is-declared-by-its-capability),
 * named rather than refusing the test.
 */
export const testConnectorResponseSchema = z.object({
  request: testConnectorRequestEchoSchema,
  response: testConnectorOutcomeSchema,
  orphaned_placeholders: z.array(z.string()).readonly(),
});

export type TestConnectorResponseDto = z.infer<typeof testConnectorResponseSchema>;
