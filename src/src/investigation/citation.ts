// The citation value object as data (domain/investigation/citation): the
// traceability a decided evaluation must carry
// (rules/investigation/a-decided-evaluation-cites-evidence), and the pointer
// a no-data reason attaches to the evidence whose result is not ok
// (rules/investigation/an-inconclusive-evaluation-declares-its-reason).

/**
 * One pointer into the evidence that grounded a verdict
 * (domain/investigation/citation): a concept, by its glossary name, and one
 * field of that concept's observation. Machine-checkable by construction —
 * the field must exist in the output schema of the capability that produced
 * that evidence — but checking that is citation-validation's own behavior
 * (rules/investigation/a-cited-field-exists-in-the-capability-output-schema),
 * never this port's or its fake's (task/hypothesis-judgment/citation-validation).
 */
export type Citation = {
  readonly concept: string;
  readonly field: string;
};
