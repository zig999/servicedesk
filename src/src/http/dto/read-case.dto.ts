// Wire shapes for GET /v1/cases/{slug}/versions/{version}
// (task/case-query-http/read-case-route, contracts/knowledge/case-query): the
// path-parameter and response DTOs the route validates and serializes
// against (DTO-01/02/03), named for this use case the same way
// read-capability.dto.ts's own readCapabilityParamsSchema/ResponseSchema are.
//
// version is a URL segment, so it arrives as a string; readCaseParamsSchema
// coerces it the same way src/config/env.ts already coerces a numeric
// environment string (z.coerce.number()), rather than trusting Fastify to
// have parsed it — EDG-01, DTO-01.
//
// readCaseResponseSchema mirrors domain/knowledge/case's own identity
// (slug) and domain/knowledge/case-version's own declared attributes, in
// their declared order, plus every manifest entry's own hypothesis-revision
// (domain/knowledge/manifest-entry, domain/knowledge/hypothesis-revision,
// domain/knowledge/resolution) — exactly what this task's own criterion 1
// names ("its own attributes, its manifest and every manifest entry's own
// hypothesis-revision"). It deliberately excludes Case.hypotheses: case.ts's
// own header comment states that flattened projection is "never
// independently declared" and exists only for out-of-scope internal
// consumers (judgment-stage.ts, run-diagnosis.ts, validate-case-coherence.ts)
// — no domain node declares it as one of case-version's own attributes, and
// the scope that cut this task's own intake/scope.md states plainly that the
// exact shape of a read's return is the implementer's decision where the
// specification names only the operation. state and consolidation_register
// reuse case.ts's and consolidation-register.ts's own closed vocabularies
// rather than redeclaring them (MNT-03), the same convention
// read-capability.dto.ts already keeps for CAPABILITY_NATURES.
//
// collects and manifest are read back .readonly() so the inferred type
// matches Case's own readonly array fields structurally, letting the
// controller hand the assembled case's own manifest through unchanged
// (TYP-01/TYP-02 — no assertion needed where the two shapes already agree).

import { z } from 'zod';
import { CASE_VERSION_STATES } from '../../case/case.js';
import { CONSOLIDATION_REGISTERS } from '../../investigation/consolidation-register.js';

/**
 * The two path parameters this route reads: the case's own slug identity
 * (domain/knowledge/case) and the numbered version to read
 * (domain/knowledge/case-version), coerced from the URL's string segments
 * into the integer the domain operation expects.
 */
export const readCaseParamsSchema = z.object({
  slug: z.string().min(1),
  version: z.coerce.number().int().positive(),
});

export type ReadCaseParamsDto = z.infer<typeof readCaseParamsSchema>;

/** The forwarding a resolution carries, exactly domain/knowledge/referral's own two fields — matching diagnose.dto.ts's own referralSchema rather than redeclaring it (MNT-03 kept in spirit; not imported directly since diagnose.dto.ts declares it unexported). */
const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

/** domain/knowledge/resolution: one outcome paired with the referral to act on it. */
const resolutionSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
});

/** domain/knowledge/hypothesis's own stable identity: its name alone. */
const hypothesisIdentitySchema = z.object({
  name: z.string().min(1),
});

/** domain/knowledge/hypothesis-revision: one numbered state of a hypothesis's own content. */
const hypothesisRevisionSchema = z.object({
  hypothesis: hypothesisIdentitySchema,
  revision: z.int(),
  criterion: z.string().min(1),
  collects: z.array(z.string().min(1)).min(1).readonly(),
  resolution: resolutionSchema,
});

/** domain/knowledge/manifest-entry: one precedence position, pinning exactly one hypothesis-revision. */
const manifestEntrySchema = z.object({
  position: z.int(),
  hypothesis_revision: hypothesisRevisionSchema,
});

/**
 * The case version read whole (constraints/a-case-is-read-whole):
 * domain/knowledge/case's own slug plus every declared attribute of
 * domain/knowledge/case-version, in its declared order, with the manifest
 * assembled down to every entry's own hypothesis-revision.
 */
export const readCaseResponseSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  when_to_use: z.string().min(1),
  version: z.int().positive(),
  authored_at: z.string().min(1),
  subject: z.string().min(1),
  fallback: resolutionSchema,
  consolidation_register: z.enum(CONSOLIDATION_REGISTERS).optional(),
  state: z.enum(CASE_VERSION_STATES),
  released_at: z.string().min(1).optional(),
  manifest: z.array(manifestEntrySchema).min(1).readonly(),
});

export type ReadCaseResponseDto = z.infer<typeof readCaseResponseSchema>;
