/**
 * The client-side validation schema for the Concept create/edit form
 * (task/concept-authoring/concept-create-edit-form): name, accepts and ttl --
 * domain/glossary/concept's own three attributes, all three declared
 * `required: true` there.
 *
 * Mirrors the real backend contract, the same convention
 * case-version-form-schema.ts already established (that module's own header
 * comment): PUT /v1/glossary/concepts/{name} validates its path parameter
 * against registerConceptParamsSchema (name, non-empty) and its request body
 * against registerConceptBodySchema (src/src/http/dto/register-concept.dto.ts,
 * confirmed directly against that file) -- accepts required, each named
 * subject type non-empty, ttl optional there only because
 * GlossaryService.registerConcept substitutes its own default
 * (DEFAULT_CONCEPT_TTL_SECONDS) when a registration states none.
 *
 * `ttl` is required here rather than mirroring that one optional field
 * verbatim: domain/glossary/concept states all three of its attributes as
 * `required: true`, including ttl, and requiring it client-side keeps this
 * form from ever exercising the backend's own silent default -- an operator
 * always states the freshness tolerance a concept declares rather than one
 * being invented on their behalf. Disclosed as this task's own inference in
 * its delivery record: a stricter-than-the-wire-shape requirement, not a
 * contradiction of it (the backend still accepts a body this form always
 * fills in).
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
});

export type ConceptFormValues = z.infer<typeof conceptFormSchema>;
