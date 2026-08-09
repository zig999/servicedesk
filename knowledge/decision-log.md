---
entries:
  - location: domain/glossary/_context.md
    field: strategic
    unstated: The material's distillation table classifies knowledge, execution and corporate-system access, but never the glossary.
    decided: supporting
    why: Pure published data serving the core without being it; not generic, because the vocabulary is this business's own.
  - location: domain/glossary/subject-type.md
    field: type
    unstated: The material calls the vocabularies closed but discovered, growing with cases, and leaves their initial sets open as Decision 4.
    decided: value-object
    why: An enumeration would fix values the material has not decided; a named value object holds an open registered set.
  - location: domain/glossary/outcome.md
    field: type
    unstated: Same as subject-type — a contributed vocabulary with no fixed value set stated.
    decided: value-object
    why: Outcomes grow one per confirmable hypothesis; only the two non-conclusion outcomes are known today, which a rule states.
  - location: domain/glossary/action.md
    field: type
    unstated: The material fixes governance for actions but not their values.
    decided: value-object
    why: Same open-set reasoning as the other vocabularies.
  - location: domain/glossary/recipient.md
    field: type
    unstated: The material fixes governance for recipients but not their values.
    decided: value-object
    why: Same open-set reasoning as the other vocabularies.
  - location: domain/glossary/concept.md
    field: attributes.ttl.type
    unstated: The material gives ttl no unit or shape.
    decided: integer
    why: A tolerance is compared against elapsed time; whole seconds are the coarsest unit that still expresses every tolerance the material discusses.
  - location: domain/knowledge/case.md
    field: type
    unstated: The material classifies the case as a value object identified by content, while also giving it composition of named hypotheses, outside references to it, and its own behavior.
    decided: aggregate-root
    why: Content identity is still identity — the domain cares which case answered — and only an aggregate root can own entities by name, be referenced from another aggregate, and carry the declared operations.
  - location: domain/knowledge/case.md
    field: attributes.version.type
    unstated: The material shows a version in the case pin without stating its form.
    decided: integer
    why: Versions are counted at each change of the file; a count is an integer.
  - location: domain/knowledge/resolution.md
    field: type
    unstated: The material states outcome and referral on every hypothesis and on the fallback, but never names their grouping.
    decided: value-object
    why: One shared shape keeps a position from declaring one field without the other, which a rule then states once.
  - location: domain/investigation/investigation.md
    field: attributes.id.type
    unstated: The material lists id without a shape.
    decided: string
    why: Nothing in the material orders or computes over ids; an opaque string is the weakest sufficient claim.
  - location: domain/investigation/investigation.md
    field: attributes.requester.type
    unstated: The material names the requester and their authorization scope without a shape.
    decided: string
    why: The requester is an identity carried to the connectors for scoping; an opaque identifier suffices and the scope itself lives with authorization, not the domain.
  - location: domain/investigation/evidence.md
    field: attributes.inputs.type
    unstated: The material shows inputs on evidence without a shape.
    decided: string
    why: Inputs vary per capability and are pinned for replay as recorded bytes; a serialized form is the only shape common to all.
  - location: domain/investigation/evidence.md
    field: attributes.observation.type
    unstated: The material says the observation is normalized to the glossary vocabulary but gives it no shape of its own.
    decided: string
    why: The observation's real schema is the producing capability's output schema; the record carries the serialized form and the citation check reads the schema, not this field.
  - location: domain/investigation/evidence.md
    field: attributes.origin.type
    unstated: The material lists origin on evidence without saying what it holds.
    decided: string
    why: It names where the observation came from for audit; an opaque name suffices.
  - location: domain/investigation/durations.md
    field: attributes
    unstated: The material measures durations per stage without a unit.
    decided: integer milliseconds per stage
    why: Stage budgets are single-digit seconds; milliseconds keep them integral and comparable.
  - location: domain/investigation/evaluation.md
    field: attributes.hypothesis.type
    unstated: The material indexes evaluations by hypothesis name but does not say how the record points at the hypothesis.
    decided: string
    why: A hypothesis is an entity inside the case aggregate and is reached only through its root; the name within the pinned case is the reference that respects the boundary.
  - location: domain/integration/capability.md
    field: type
    unstated: The material classifies capability as a value object while also registering it, versioning it and referencing it from evidence.
    decided: aggregate-root
    why: Registration is identity plus lifecycle — the domain cares which capability answered — and evidence must reference it across aggregates, which only a root admits.
  - location: domain/integration/capability.md
    field: attributes.version.type
    unstated: The material shows a capability version without a format.
    decided: string
    why: Versions of an integration contract follow the provider's scheme, which the material does not constrain.
  - location: domain/integration/capability.md
    field: attributes.input_schema.type
    unstated: The material says a capability declares schemas without saying how a schema is held.
    decided: string
    why: A schema is carried as its serialized declaration; what reads it is the citation check, not the domain record.
  - location: domain/integration/capability.md
    field: attributes.output_schema.type
    unstated: Same as input_schema.
    decided: string
    why: Same as input_schema.
  - location: domain/integration/capability.md
    field: attributes.timeout.type
    unstated: The material demands a timeout per capability without a unit.
    decided: integer
    why: Milliseconds, consistent with durations, since capability budgets are fractions of the collection stage.
  - location: domain/integration/capability.md
    field: attributes.connector.type
    unstated: The context map draws connectors beside capabilities without ever linking one to the other.
    decided: string
    why: A capability must say which adapter executes it or the registration cannot be run; the name is configuration, so an opaque string keeps vendors out of the model.
  - location: domain/integration/capability-nature.md
    field: values
    unstated: The material names only read-only and says the field exists so the registry has something to refuse.
    decided: read-only and mutating
    why: A refusable value must exist to be refused; mutating is the material's own name for what the registry turns away.
  - location: contracts/investigation/assessment-reviewed.md
    field: payload
    unstated: The material names the event and its role as regression label, but never its shape.
    decided: domain/investigation/assessment
    why: The event is the operator's judgment of the assessment; the assessment is the thing reviewed, and no reviewed-assessment element exists to carry more.
  - location: contracts/glossary/glossary-query.md
    field: operations
    unstated: The material demands the glossary be readable by every context but names no operations.
    decided: read-vocabulary-term and read-concept
    why: The two reads the consumers actually perform; validation reads terms, normalization and collection read concepts.
  - location: contracts/investigation/diagnosis.md
    field: operations
    unstated: The material describes the synchronous flow but names no interface operation.
    decided: diagnose
    why: One entry point, one name, matching the flow the material draws end to end.
  - location: contracts/system/corporate-records.md
    field: type
    unstated: The material shows corporate systems as an external box with no contract of their own.
    decided: capability
    why: A third-party system enters the specification as an upstream capability named by what it supplies, never by vendor name.
  - location: rules/knowledge/validation-runs-at-every-read.md
    field: statement
    unstated: The material demands validation at every read and also that every case version stays readable for replay, without saying whether a replayed old version must still validate against the current glossary.
    decided: Validation gates a case's use for new diagnoses; a replay reads the pinned version without revalidation.
    why: Replay pins content to reproduce what ran; revalidating history against today's glossary would destroy the reproducibility the pins exist for.
  - location: rules/glossary/an-outcome-is-contributed-by-a-confirmable-hypothesis.md
    field: statement
    unstated: A new case introduces its outcome, yet validation refuses a case whose outcome the glossary lacks; the material never says whether contribution registers the term or presupposes it.
    decided: Contribution is a curation act in the same change that introduces the case; validation still refuses a case whose outcome is absent at reading.
    why: Automatic registration would make the outcome-existence refusal unreachable and let a typo mint a vocabulary term; the same-change discipline keeps both rules decidable.
  - location: constraints/a-case-is-stored-as-one-json-document.md
    field: statement
    unstated: The material says the case and all its entities are stored in a single JSON, without saying whether one document holds one case or every case.
    decided: One JSON document per case, holding the whole aggregate.
    why: The singular contrasts with decomposition into separate stores, matching the aggregate boundary already declared; one document for every case would break the standing rules that the slug matches the file and that every version stays readable, which the material does not retract.
  - location: constraints/a-case-is-stored-as-one-json-document.md
    field: scope
    unstated: The material does not say what format the case file on disk takes now that its stored form is JSON, while the case element described its file as markdown.
    decided: The stored form is the JSON document; the case element's description drops the format and keeps one file versioned in git.
    why: The authoring format was implementation detail living in prose; the storage bound is the addressable fact, and one statement of the file's form must not disagree with the other.
  - location: rules/knowledge/a-collected-concept-declares-a-ttl.md
    field: statement
    unstated: The material delegates the default ttl to the analysis without naming a value.
    decided: Sixty seconds.
    why: The material itself states a short ttl never produces an error, only less cache efficiency, so the safe default is short; one minute keeps any cached observation fresher than the investigation deadline by a factor of three.
  - location: rules/investigation/the-customer-sees-only-the-text.md
    field: statement
    unstated: The material answers that the writing is what the assessment exposes to the end customer, without saying explicitly that nothing else is exposed.
    decided: The text is the only customer-facing part; outcome, referral, verdicts and evidence stay operational.
    why: Naming the writing as the answer to what-is-exposed reads as exclusive, and an exclusive bound is the only falsifiable form of it.
  - location: rules/integration/a-capability-declares-its-contract.md
    field: statement
    unstated: Decision 3 demanded two figures — the per-capability timeout and the collection stage's global deadline — and the material answered with the single figure of sixty seconds.
    decided: Sixty seconds binds the capability timeout default; no second figure is recorded for the collection stage.
    why: The collection stage runs its concepts in parallel, so its bound is the slowest capability clamped by the propagated remaining time, and a separate stage figure would add nothing the propagation constraint does not already enforce.
---
