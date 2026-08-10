/**
 * A business error of the investigation context: the given investigation
 * could not be written within what remained of the declared deadline
 * (rules/investigation/no-stage-aborts-on-its-deadline's own persistence
 * exception, rules/investigation/the-response-follows-the-record) —
 * persistence is the one stage this codebase never lets degrade to a
 * recorded fact the way collection and judgment do, so a write that does
 * not conclude in time is answered to the requester as an error rather than
 * as an assessment with no record behind it
 * (scenarios/investigation/no-response-without-a-record). The same
 * name-message-context shape InvestigationAlreadyStoredError and
 * InvestigationNotBuildableError already establish for their own
 * investigation-context refusals.
 */
export class InvestigationWriteDeadlineExceededError extends Error {
  public readonly context: Readonly<{ id: string; remainingMs: number }>;

  public constructor(id: string, remainingMs: number) {
    super(
      `the investigation with id "${id}" could not be written within the ${remainingMs}ms remaining of the declared deadline, so no assessment is returned without a corresponding record`,
    );
    this.name = 'InvestigationWriteDeadlineExceededError';
    this.context = { id, remainingMs };
  }
}
