// Maps one validated read-case-input-requirements request to the published
// ICaseInputRequirementsQuery call, and the resulting
// CaseInputRequirementsResult back to the wire response
// (contracts/knowledge/case-input-requirements): transport in, transport
// out, no business decision of its own — the domain's own
// deriveCaseInputRequirements already computes the union, its required
// flags and its askers fresh at this reading
// (rules/knowledge/a-case-versions-input-requirements-are-derived). Receives
// its one dependency as an interface (ARC-01); constructs none of it itself
// (ARC-02) — the composition root that builds ICaseInputRequirementsQuery is
// src/factories/case-input-requirements.factory.ts's own
// createCaseInputRequirementsQuery.
//
// A request naming a slug or version nothing stores, or a version failing a
// structural rule, is left to raise CaseNotFoundError or CaseNotValidError
// respectively — case-query.service.ts's own readCaseInputRequirements
// reuses read-case's own heldVersion/structuralCase pipeline for exactly
// this reason — so this controller adds no error-mapping logic of its own:
// the shared status map (src/errors/status-map.ts, COR-04) resolves each
// once it reaches error-handler.middleware.ts, exactly as
// read-case.controller.ts already leaves both to it.

import type { ICaseInputRequirementsQuery } from '../case/case-input-requirements.port.js';
import type { CaseInputRequirementsParamsDto, CaseInputRequirementsResponseDto } from './dto/case-input-requirements.dto.js';

/** Everything the controller needs beyond one request's own path parameters: the published case-input-requirements read. */
export type CaseInputRequirementsControllerDependencies = {
  readonly caseInputRequirementsQuery: ICaseInputRequirementsQuery;
};

/**
 * Handles one read-case-input-requirements request end to end: resolves the
 * named slug and version through the published case-input-requirements
 * contract, and answers with the derived result unchanged — every field
 * case-input-requirements.ts's own CaseInputRequirementsResult already
 * computed, projected onto the wire shape with no field of its own.
 */
export async function handleReadCaseInputRequirementsRequest(
  dependencies: CaseInputRequirementsControllerDependencies,
  params: CaseInputRequirementsParamsDto,
): Promise<CaseInputRequirementsResponseDto> {
  const result = await dependencies.caseInputRequirementsQuery.readCaseInputRequirements(params.slug, params.version);
  return {
    requirements: result.requirements,
    capabilities_with_malformed_input_schema: result.capabilities_with_malformed_input_schema,
  };
}
