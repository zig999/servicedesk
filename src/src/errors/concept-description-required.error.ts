/**
 * A business error of the glossary: a concept registration named no
 * description, and rules/glossary/a-concept-declares-its-description
 * requires the registry to refuse registering or updating a concept with
 * none — a name with no stated meaning is a published term nobody
 * downstream could read (domain/glossary/concept). Refused before
 * GlossaryService.registerConcept writes anything (EDG-04), the same
 * name-message-context shape RequesterRequiredError and
 * WrittenAtRequiredError already establish for their own "no X was given"
 * refusals — and the same absent-or-empty-names-nothing reading
 * connector-configuration-registry.service.ts's own isUndeclared already
 * applies to a connector's identity (MNT-03).
 */
export class ConceptDescriptionRequiredError extends Error {
  public readonly context: Readonly<{ name: string; given: string | undefined }>;

  public constructor(name: string, given: string | undefined) {
    super(`concept "${name}" requires a description; none was given`);
    this.name = 'ConceptDescriptionRequiredError';
    this.context = { name, given };
  }
}
