One wrong behavior observed in delivered code, found by this session's /reconcile over
corrective-batch-hotfixes-post-closure-drift: src/http/dto/register-concept.dto.ts types the
concept registration body's description field as optional, though the specification declares it
required and mandates a refusal when it is absent.

Specifically, registerConceptBodySchema's description field is `z.string().optional()`, so
RegisterConceptBodyDto types a registration body with no description as well-formed input. But
domain/glossary/concept states `description` is `required: true`, and
rules/glossary/a-concept-declares-its-description states the registry must refuse registration
with no description (HTTP 422, ConceptDescriptionRequiredError), reinforced by
scenarios/glossary/a-concept-with-no-description-is-refused. The DTO's own type contract
disagrees with this by admitting exactly the input the specification says must never be accepted.

Note: ttl being typed optional (z.number().int().positive().optional()) in the same schema is NOT
part of this defect -- rules/knowledge/a-collected-concept-declares-a-ttl states a registration
stating no ttl takes a sixty-second default, so ttl's optionality at the HTTP boundary is
consistent with the specification and must not be changed by this fix.

Full reconciliation record: siegard-reconcile/corrective-batch-hotfixes-post-closure-drift.md --
the specific return is at
siegard-reconcile/corrective-batch-hotfixes-post-closure-drift.returns/src__http__dto__register-concept.dto.ts.yaml.

The specification node already states this fact (domain/glossary/concept) -- this is source
drifting from an already-stated spec, not a specification gap.
