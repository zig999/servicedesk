// Maps one validated read-case request to the published ICaseQuery call, and
// the resulting Case back to the wire response
// (task/case-query-http/read-case-route, contracts/knowledge/case-query):
// transport in, transport out, no business decision of its own — the
// domain's own read-case already runs every structural and coherence rule at
// the moment of this reading and answers the case whole or refuses
// (constraints/a-case-is-read-whole, rules/knowledge/validation-runs-at-every-read).
// Receives its one dependency as an interface (ARC-01); constructs none of
// it itself (ARC-02) — the composition root that builds ICaseQuery is
// src/factories/case-query.factory.ts's own createCaseQuery.
//
// A request naming a slug or version nothing stores is left to raise
// CaseNotFoundError, and a version that fails a structural or coherence rule
// is left to raise CaseNotValidError — case-query.service.ts's own readCase
// already throws each rather than answering a partial result (this task's
// own criteria 2 and 3) — so this controller adds no error-mapping logic of
// its own: the shared status map (src/errors/status-map.ts, COR-04) resolves
// each once it reaches error-handler.middleware.ts, exactly as
// read-capability.controller.ts already leaves ConceptNotAnsweredError to it.

import type { Case } from '../case/case.js';
import type { ICaseQuery } from '../case/case-query.port.js';
import type { ReadCaseParamsDto, ReadCaseResponseDto } from './dto/read-case.dto.js';

/** Everything the controller needs beyond one request's own path parameters: the published knowledge-context read. */
export type ReadCaseControllerDependencies = {
  readonly caseQuery: ICaseQuery;
};

/**
 * Handles one read-case request end to end: resolves the named slug and
 * version through the published case-query contract, and answers with the
 * case whole, projected onto the wire shape (toReadCaseResponse below).
 */
export async function handleReadCaseRequest(
  dependencies: ReadCaseControllerDependencies,
  params: ReadCaseParamsDto,
): Promise<ReadCaseResponseDto> {
  const { case: theCase } = await dependencies.caseQuery.readCase(params.slug, params.version);
  return toReadCaseResponse(theCase);
}

/**
 * Projects the assembled, validated case (domain/knowledge/case,
 * domain/knowledge/case-version) onto the wire response: every declared
 * attribute of both nodes, unchanged, and the manifest handed through as
 * read-case already assembled it — never Case.hypotheses, the flattened
 * projection case.ts's own header comment keeps for out-of-scope internal
 * consumers rather than declaring as a domain-version attribute (this
 * module's own dto's header comment).
 */
function toReadCaseResponse(theCase: Case): ReadCaseResponseDto {
  return {
    slug: theCase.slug,
    title: theCase.title,
    when_to_use: theCase.when_to_use,
    version: theCase.version,
    authored_at: theCase.authored_at,
    subject: theCase.subject,
    fallback: theCase.fallback,
    ...(theCase.consolidation_register !== undefined ? { consolidation_register: theCase.consolidation_register } : {}),
    state: theCase.state,
    ...(theCase.released_at !== undefined ? { released_at: theCase.released_at } : {}),
    manifest: theCase.manifest,
  };
}
