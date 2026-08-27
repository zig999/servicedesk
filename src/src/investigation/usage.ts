// The usage value object as data (domain/investigation/usage): what one
// provider call spent, at the granularity of the call itself rather than
// domain/investigation/cost's own total across every call an investigation
// or a simulation made. A plain count with no behavior
// (domain/investigation/usage's own Responsibility: "None").

/**
 * What one provider call spent (domain/investigation/usage): the input and
 * output tokens the provider charged for exactly that call. Carried by
 * domain/investigation/evaluation's own `usage` attribute for a judgment
 * call and by domain/investigation/assessment's own `usage` attribute for
 * the consolidation call — the same call-level shape in both places, never
 * an investigation- or simulation-wide total, which is
 * domain/investigation/cost's own concern instead.
 */
export type Usage = {
  readonly input_tokens: number;
  readonly output_tokens: number;
};
