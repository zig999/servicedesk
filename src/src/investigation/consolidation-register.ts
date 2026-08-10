// The consolidation-register vocabulary as data
// (domain/knowledge/consolidation-register): a closed set of two plain
// values naming the register a case's curator asks the write-up to keep —
// formal or plain, nothing else. Fixed and known ahead of time, unlike a
// discovered vocabulary such as concept or subject-attribute
// (domain/glossary/concept, domain/glossary/subject-attribute): a register
// is a closed style choice, never a growing set a new case could extend.
// This module is this task's own — task/assessment-consolidation/assessment-consolidator-port-and-fake
// — kept local to the port and its fake rather than added to the case
// document module (src/case/case.ts): the pinned case's own
// consolidation_register attribute is
// task/assessment-consolidation/case-coherence-optional-consolidation-register's
// own, separate objective, and that task's own rationale states this port
// can be demonstrated against a stub register without it landing first.

/**
 * The register a case's curator asks the write-up to keep
 * (domain/knowledge/consolidation-register): formal or plain, nothing else
 * — a closed style choice, never a growing set a new case could extend.
 */
export const CONSOLIDATION_REGISTERS = ['formal', 'plain'] as const;

/** One of the two registers the consolidation step may write in. */
export type ConsolidationRegister = (typeof CONSOLIDATION_REGISTERS)[number];
