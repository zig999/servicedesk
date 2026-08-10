/**
 * A business error of the diagnose entry point: no requester travels in
 * the diagnose payload itself, and requester is always required
 * (contracts/investigation/diagnosis, domain/investigation/investigation's
 * own "requester and ticket_ref both arrive in the diagnose call itself;
 * requester is always given") — refused before any investigation starts.
 * The same name-message-context shape SubjectCarriesNoAttributeError and
 * CaseNotFoundError already establish for their own contexts.
 */
export class RequesterRequiredError extends Error {
  public readonly context: Readonly<{ given: string | undefined }>;

  public constructor(given: string | undefined) {
    super('diagnose requires a requester in its own payload; none was given');
    this.name = 'RequesterRequiredError';
    this.context = { given };
  }
}
