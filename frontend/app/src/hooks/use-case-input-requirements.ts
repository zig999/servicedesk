/**
 * Reads one case version's derived input requirements through the published
 * read-case-input-requirements operation (GET /v1/cases/{slug}/versions/
 * {version}/input-requirements, contracts/knowledge/case-input-requirements),
 * task/subject-input-requirements/read-case-input-requirements-hook. The
 * first frontend consumer of this endpoint -- no sibling hook reads it today
 * -- so this file is a new one rather than a reuse, following the app's own
 * established read-hook shape rather than inventing a second one
 * (work/case-simulation-input-requirements/inventory/case-simulation-subject-
 * derivation-and-composition.md's own must_not_duplicate entry naming
 * use-capabilities.ts as that shape).
 *
 * Mirrors use-capabilities.ts's and use-connector-configurations.ts's own
 * loading/error/refetch convention exactly -- apiFetch<T>, a query key naming
 * the resource, and {list-field(s), isLoading, isError, refetch} with
 * refetch already wrapped void-returning -- but the response this endpoint
 * answers with is not one page of a registry list: it carries two top-level
 * fields, `requirements` and `capabilities_with_malformed_input_schema`,
 * neither nested under a `data` array, so there is no PageType wrapper here
 * to narrow to (unlike those two siblings' own CapabilitiesPage/
 * ConnectorConfigurationsPage).
 *
 * Scoped to one case version's pinned identity the same way
 * use-case-simulation-version.ts and use-simulate-hypothesis.ts already are:
 * `slug` and `version` are received as this hook's own arguments (never read
 * from a route param or a context here -- this file names no screen and no
 * route), and both feed the query key so a different pinned version is a
 * different cache entry, the same convention use-case-simulation-version.ts's
 * own ["case-version", slug, version] key already keeps.
 *
 * domain/knowledge/case-input-requirement states that a capability referenced
 * in a requirement already carries its own name, version, connector and
 * concept, and that nothing here restates them -- so `CaseInputRequirement`'s
 * own `capabilities` field is typed to bare {name, version} identity alone
 * (CapabilityReference below), the same restraint the inventory's own
 * "cross-registry reference is carried by bare identity" convention names
 * (src/src/http/dto/case-input-requirements.dto.ts:38-49). The same
 * CapabilityReference type is reused, unwidened, for
 * `capabilitiesWithMalformedInputSchema` -- domain/knowledge/case-input-
 * requirement's own description states that a malformed capability "is
 * referenced by none [requirement]... the read names it apart from the
 * attributes instead, by identity, and that is the whole of what reaches the
 * person composing a subject about it", so restating anything past that
 * identity here would be encoding a fact this task's own Notes (the
 * UNDERDETERMINED entry) already settled against.
 *
 * `capabilitiesWithMalformedInputSchema` is kept as its own field, mirroring
 * the response's own two-field shape verbatim -- never merged into any
 * requirement's own `capabilities` array, and never read as if it were one
 * (criterion: "returned as their own list, never merged into any
 * requirement's own capabilities").
 *
 * A response naming no requirements at all still resolves `query.data` to an
 * object whose own `requirements` is an empty array; `query.data?.requirements
 * ?? []` reads that array through unchanged rather than substituting the
 * fallback, so an empty read surfaces as an empty list, never as
 * isError/isLoading standing in for it (criterion: "answering no requirements
 * at all returns an empty requirement list rather than an error state").
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";

/**
 * A capability referenced by identity alone -- name and version, nothing
 * else of that capability's own registration (domain/integration/capability's
 * own eight attributes) restated here. Reused for both a requirement's own
 * asking capabilities and the malformed-input-schema list below, since
 * neither ever carries more than this.
 */
export type CapabilityReference = {
  readonly name: string;
  readonly version: string;
};

/**
 * domain/knowledge/case-input-requirement: one subject attribute a case
 * version's collection plan reaches, whether the case requires it, and every
 * currently-registered capability that asks for it, each by bare identity.
 */
export type CaseInputRequirement = {
  readonly attribute: string;
  readonly required: boolean;
  readonly capabilities: readonly CapabilityReference[];
};

/** The whole shape of GET /v1/cases/{slug}/versions/{version}/input-requirements. */
type CaseInputRequirementsResponse = {
  readonly requirements: readonly CaseInputRequirement[];
  readonly capabilities_with_malformed_input_schema: readonly CapabilityReference[];
};

export type CaseInputRequirementsResult = {
  readonly requirements: readonly CaseInputRequirement[];
  readonly capabilitiesWithMalformedInputSchema: readonly CapabilityReference[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => void;
};

/**
 * Reads `slug`'s `version`'s derived input requirements, and, apart from
 * them, the capabilities the read names as holding no well-formed input
 * schema (contracts/knowledge/case-input-requirements). Answers for a case
 * version in either state, draft included -- this hook applies no state
 * branch of its own, since the read itself is not conditioned on one.
 */
export function useCaseInputRequirements(
  slug: string,
  version: number,
): CaseInputRequirementsResult {
  const query: UseQueryResult<CaseInputRequirementsResponse> = useQuery({
    queryKey: ["case-input-requirements", slug, version],
    queryFn: () =>
      apiFetch<CaseInputRequirementsResponse>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${version}/input-requirements`,
      ),
  });

  return {
    requirements: query.data?.requirements ?? [],
    capabilitiesWithMalformedInputSchema:
      query.data?.capabilities_with_malformed_input_schema ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
  };
}
