Refinement to the original scope, after discovering during binding that
src/glossary/glossary.service.ts's registerConcept already throws
ConceptDescriptionRequiredError (mapped to HTTP 422 in status-map.ts) whenever description is
undefined or the empty string -- the runtime HTTP behavior for a registration with no description
is already correct today.

src/http/register-concept.routes.ts runs registerConceptBodySchema.safeParse(request.body) before
the controller/service ever run; a parse failure returns a generic 400 VALIDATION_ERROR without
ever reaching the service. Making the Zod schema itself require description (the original scope's
own proposal) would move the rejection ahead of the service and change the response from
422 + ConceptDescriptionRequiredError to a generic 400 -- a regression, not a correction.

The human decided: fix only the DTO's exported TypeScript type to require description, matching
domain/glossary/concept's own required attribute, without changing the runtime Zod schema's
`.optional()` -- so the type stops admitting an input the specification says must never be
accepted, while the HTTP response for that same input stays exactly what it is today (422 +
ConceptDescriptionRequiredError, produced by the service, unaffected by this fix).
