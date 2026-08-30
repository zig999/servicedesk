/**
 * The client-side validation schema for the Concept create/edit form
 * (task/concept-authoring/concept-create-edit-form, widened by
 * task/glossary-concept-description/concept-form-description-field): name,
 * accepts, ttl and description -- domain/glossary/concept's own four
 * attributes, all four declared `required: true` there.
 *
 * Mirrors the real backend contract, the same convention
 * case-version-form-schema.ts already established (that module's own header
 * comment): PUT /v1/glossary/concepts/{name} validates its path parameter
 * against registerConceptParamsSchema (name, non-empty) and its request body
 * against registerConceptBodySchema (src/src/http/dto/register-concept.dto.ts,
 * confirmed directly against that file) -- accepts required, each named
 * subject type non-empty, ttl optional there only because
 * GlossaryService.registerConcept substitutes its own default
 * (DEFAULT_CONCEPT_TTL_SECONDS) when a registration states none, and
 * description optional there only because that same service raises its own
 * typed ConceptDescriptionRequiredError (rules/glossary/a-concept-declares-its-description)
 * when a registration states none, rather than the route's generic 400
 * VALIDATION_ERROR envelope a required-at-the-DTO-level field would produce
 * instead.
 *
 * `ttl` and `description` are both required here rather than mirroring
 * those two optional wire fields verbatim: domain/glossary/concept states
 * all four of its attributes as `required: true`, and requiring both
 * client-side keeps this form from ever exercising the backend's own silent
 * ttl default or dispatching a registration the service would refuse for a
 * missing description -- an operator always states both rather than either
 * being invented on their behalf or discovered only after a round trip.
 * Disclosed as this task's own inference in its delivery record, the same
 * stricter-than-the-wire-shape reasoning `ttl` above already established: not
 * a contradiction of the wire shape (the backend still accepts a body this
 * form always fills in), and the one refusal a registration naming no
 * description can still reach -- scenarios/glossary/a-concept-with-no-description-is-refused
 * -- is answered by the form's own failure path (use-concept-form.ts) rather
 * than by this schema ever forwarding an empty description.
 *
 * `accepts` requires at least one subject type (criterion 4: "Submitting the
 * form with no subject type selected in accepts is blocked, accepts being a
 * required field").
 */

import { z } from "zod";

export const conceptFormSchema = z.object({
  name: z.string().min(1),
  accepts: z.array(z.string().min(1)).min(1),
  ttl: z.number().int().positive(),
  description: z.string().min(1),
});

export type ConceptFormValues = z.infer<typeof conceptFormSchema>;
