// Wires the knowledge context's published read-case-input-requirements
// (contracts/knowledge/case-input-requirements): the same relational case
// store, glossary-query and capability-query composition
// case-query.factory.ts's own createCaseQuery already builds for the sibling
// read-case contract — CaseQueryService answers both published interfaces
// (case-query.service.ts's own class declaration) — but wired here as a
// second instance built from the same connection, rather than widening
// createCaseQuery's own declared return type (and every already-typed
// ICaseQuery call site and stand-in that follows from it) to also carry
// ICaseInputRequirementsQuery. Disclosed divergence from
// existing-conventions-and-reuse.md's own "one composition root builds one
// instance per registry service and reuses it" convention: CaseQueryService
// holds no state of its own — every method reads fresh through the ports it
// composes on each call, never a cache — so a second instance built from the
// identical connection answers identically to the one createCaseQuery
// already builds, the same way createCaseQuery's own internal createCaseStore
// call already duplicates the case store composeResources builds separately
// for its own caseStore field (build-app.factory.ts). Widening ICaseQuery
// itself instead would force every existing ICaseQuery stand-in across this
// project's own query-side unit and route tests — none of which this task
// touches — to also satisfy the new method, which is exactly the widening
// this task must not do.

import type { ICaseInputRequirementsQuery } from '../case/case-input-requirements.port.js';
import { CaseQueryService } from '../case/case-query.service.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { createCapabilityQuery } from './capability-registry.factory.js';
import { createCaseStore } from './case-store.factory.js';
import { createGlossaryQuery } from './glossary.factory.js';

/**
 * Wires the published read-case-input-requirements read, composed from the
 * same connection every other leaf factory in this project's own composition
 * roots is given (task/service-on-the-database/store-wiring's own "every
 * record ... comes from the same connection"), never a data directory of its
 * own.
 */
export function createCaseInputRequirementsQuery(connection: DatabaseConnection): ICaseInputRequirementsQuery {
  return new CaseQueryService(
    createCaseStore(connection),
    createGlossaryQuery(connection),
    createCapabilityQuery(connection),
  );
}
