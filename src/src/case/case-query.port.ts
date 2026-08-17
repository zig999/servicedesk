import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { Case } from './case.js';
import type {
  CaseIdentity,
  CaseVersionListItem,
  HypothesisIdentity,
  HypothesisRevisionListItem,
} from './case-store.port.js';

/**
 * What read-case answers: the case whole, validated at this reading
 * (contracts/knowledge/case-query). No document hash accompanies it — a
 * case is pinned by slug and version alone, never by a digest over its
 * stored bytes (rules/investigation/replay-is-pinned, domain/investigation/
 * investigation) — so this shape carries nothing read-case's own caller
 * could mistake for such a pin.
 */
export type ReadCaseResult = {
  readonly case: Case;
};

/**
 * The published case-query contract (contracts/knowledge/case-query): the
 * synchronous read the knowledge context offers — read-case, a case by slug
 * and version, validated whole at the moment of this reading and refused
 * otherwise with every violated rule named at once
 * (rules/knowledge/validation-runs-at-every-read,
 * contracts/system/case-authoring); list-cases, every case currently held,
 * by its own bare identity, at a different cardinality and with nothing of
 * its own to validate (task/case-query-http/list-cases-route); and
 * list-case-versions, every version one named case currently holds, by its
 * own bare number and declared state, refused where the named slug names no
 * case at all (task/case-query-http/list-case-versions-route); and
 * list-hypotheses, every hypothesis one named case has ever originated, by
 * its own bare name, refused the same way (task/case-query-http/
 * list-hypotheses-route); and list-hypothesis-revisions, every revision one
 * named hypothesis (case slug plus hypothesis name) currently holds, by its
 * own full content, refused where either half of that pair names nothing
 * this case has originated (task/case-query-http/
 * list-hypothesis-revisions-route). A consumer — this task's own HTTP
 * controller among them — depends on this interface, never on the case
 * store, the glossary or the capability registry behind it, so a consumer
 * of list-cases, list-case-versions, list-hypotheses or
 * list-hypothesis-revisions reaches the case store only through this same
 * published seam rather than a second one opened just for it.
 */
export interface ICaseQuery {
  /**
   * read-case: answers the case at slug and version whole, validated at
   * this reading — every structural and coherence rule holds for it right
   * now; refuses with CaseNotFoundError where no such version is stored, or
   * with CaseNotValidError naming every violated rule together where any
   * rule fails at this reading.
   */
  readCase(slug: string, version: number): Promise<ReadCaseResult>;

  /**
   * list-cases: answers every case currently held, by its own bare identity,
   * paginated per src/types/pagination.ts. Carries no filter and runs no
   * validation of its own — a bare identity listing has nothing structural
   * or coherent to check the way one assembled version does — so this is a
   * direct pass-through onto the case store's own listCases
   * (case-store.port.ts), kept behind this interface rather than exposing
   * the store directly to this contract's own consumers. An empty store
   * answers an empty page, never an error or undefined, unchanged from what
   * the store itself already guarantees.
   */
  listCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseIdentity>>;

  /**
   * list-case-versions: answers every version the named case currently
   * holds, by its own bare number and declared state, paginated per
   * src/types/pagination.ts. Runs no validation of its own — the same
   * bare-listing reasoning listCases's own header comment already states —
   * so this is a direct pass-through onto the case store's own
   * listCaseVersions (case-store.port.ts), kept behind this interface
   * rather than exposing the store directly to this contract's own
   * consumers. Refused, through CaseNotFoundError, where the named slug
   * names no case at all — raised by the store itself rather than
   * re-checked here — and a case currently holding no version answers an
   * empty page instead, unchanged from what the store itself already
   * guarantees.
   */
  listCaseVersions(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>>;

  /**
   * list-hypotheses: answers every hypothesis the named case has ever
   * originated, by its own bare name, paginated per
   * src/types/pagination.ts. Runs no validation of its own — the same
   * bare-listing reasoning listCases's own header comment already states —
   * so this is a direct pass-through onto the case store's own
   * listHypotheses (case-store.port.ts), kept behind this interface rather
   * than exposing the store directly to this contract's own consumers.
   * Refused, through CaseNotFoundError, where the named slug names no case
   * at all — raised by the store itself rather than re-checked here — and a
   * case currently holding no hypothesis answers an empty page instead,
   * unchanged from what the store itself already guarantees.
   */
  listHypotheses(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<HypothesisIdentity>>;

  /**
   * list-hypothesis-revisions: answers every revision the named hypothesis
   * (case slug plus hypothesis name) currently holds, by its own full
   * content, paginated per src/types/pagination.ts. Runs no validation of
   * its own — the same bare-listing reasoning listCases's own header
   * comment already states — so this is a direct pass-through onto the
   * case store's own listHypothesisRevisions (case-store.port.ts), kept
   * behind this interface rather than exposing the store directly to this
   * contract's own consumers. Refused, through CaseNotFoundError, where the
   * slug or the hypothesis name (or both) names nothing this case has
   * originated — raised by the store itself rather than re-checked here,
   * and covering both absences with the same error since no separate
   * "hypothesis not found under this case" distinction exists
   * (case-store.port.ts's own header comment).
   */
  listHypothesisRevisions(
    slug: string,
    hypothesisName: string,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<HypothesisRevisionListItem>>;
}
