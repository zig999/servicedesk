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
  - location: rules/investigation/collection-has-its-own-budget-within-the-total.md
    field: statement
    unstated: Decision 3 demanded two figures, and the entry above decided only the capability timeout default, reasoning that the propagation constraint made a second figure redundant — but no nominal per-stage budget is stated anywhere for that constraint to clamp against, so the collection stage's own bound was never actually pinned; the material itself, at Decision 3, says a slow system hangs the investigation without both numbers.
    decided: Seven seconds, the collection stage's own nominal budget inside the total deadline.
    why: The material's engineering proposal for the synchronous budget (Decision 1) is the only concrete split it offers, and it allocates seven of the twenty seconds to collection because the stage runs in parallel and is bound by its slowest capability, not by a sum.
  - location: rules/investigation/an-answer-arrives-within-the-declared-deadline.md
    field: statement
    unstated: The specification held a total deadline of three hundred seconds with no decision-log entry disclosing it — an undisclosed decision, and one at odds with Decision 1, closed as synchronous with the attendant waiting on screen, and with the material's own proposed twenty-second synchronous budget, referenced twice more elsewhere in the material as the orçamento the durations record against.
    decided: Twenty seconds — two of overhead and margin, seven of collection, five of judgment, four of writing and two of persistence.
    why: A five-minute wait contradicts the synchronous, on-screen experience Decision 1 closed on; twenty seconds is the only total the material gives, so the undisclosed three-hundred-second figure is corrected to it, pending the operational confirmation the material itself still asks for.
  - location: domain/glossary/subject-attribute.md
    field: type
    unstated: The material asks for a closed vocabulary of attribute names, discovered from the glossary, without naming the value's construct or fixing an initial set.
    decided: value-object
    why: Mirrors subject-type, concept, outcome, action and recipient exactly — an open, registered set that grows as a new kind of identifying data enters, never a fixed enumeration.
  - location: domain/investigation/subject-attribute-value.md
    field: attributes
    unstated: The material gives the attribute-value pair only as a worked example (attribute "id", value "12345") without naming the element that holds it or its own two fields.
    decided: attribute, domain/glossary/subject-attribute, required; value, string, required.
    why: Mirrors domain/investigation/citation's own pairing of a governed-vocabulary reference with a free string in this same context — one governed name and one free value travel together as one fact rather than two arrays kept in step by convention.
  - location: domain/investigation/subject.md
    field: attributes
    unstated: The material replaces the subject's single id with a described set of attribute-value pairs but does not name the field the set is held in.
    decided: attributes, subject-attribute-value, many, required — alongside the unchanged type field.
    why: Matches the material's own top-level word for the set ("conjunto de atributos-valor") and avoids "values", a key the element schema reserves for an enumeration's own closed set.
  - location: rules/investigation/a-subject-carries-at-least-one-attribute.md
    field: statement
    unstated: The material explicitly asks whether the new subject shape needs an invariant analogous to a-hypothesis-collects-at-least-one-concept, without deciding it.
    decided: A subject carries at least one attribute-value, as its own invariant.
    why: Mirrors a-hypothesis-collects-at-least-one-concept's own reasoning exactly — a subject with no attribute-value at all identifies nothing, and no capability's connector would have anything to derive its call from.
  - location: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary.md
    field: statement
    unstated: The material asks for machine-checkable governance of attribute names from the glossary, without deciding whether this extends case-terms-exist-in-the-glossary or stands as its own rule.
    decided: A new, separate policy — every attribute a subject's attribute-values name exists in the glossary.
    why: case-terms-exist-in-the-glossary's own statement and rationale are specifically about what a case names; a subject's attribute-values are never declared by a case — the entry point resolves and assembles them at request time — so folding this into that rule would state a case-time check that never actually runs for them.
  - location: rules/investigation/an-investigation-is-idempotent-within-a-window.md
    field: statement
    unstated: The material asks explicitly what substitutes subject id in the repeat-request key now that no singular id exists, without deciding it.
    decided: The subject's whole set of attribute-values, compared as a set, replaces subject id in the key.
    why: Repeating a request means repeating everything that identifies the subject, not one field of it; the exact comparison mechanism (a canonicalization or a hash) is an implementation choice, not a domain fact, and is left undecided here on purpose.
  - location: constraints/the-evidence-cache-admits-only-ok-results.md
    field: statement
    unstated: The same substitution the idempotency key needed applies to this cache-key constraint, which the material does not mention directly but which names subject id in the same way.
    decided: The subject's whole set of attribute-values, in place of subject id, consistent with the idempotency key's own substitution.
    why: Both keys identify "this same subject"; a day-two feature should not diverge from the identity the rest of the specification already gives it.
  - location: domain/investigation/assessment-consolidator.md
    field: operations
    unstated: The material asks for a new domain-service and port analogous to hypothesis-evaluator, without naming its own operation.
    decided: assessment-consolidator, one operation, consolidate.
    why: Mirrors hypothesis-evaluator/evaluate exactly — a domain-service named for the role, one operation named for the verb the material itself uses ("consolidação").
  - location: domain/knowledge/consolidation-register.md
    field: values
    unstated: The material asks for a closed, structured field guiding the write-up's framing, offering "which aspects to prioritize" and "expected register/tone" only as examples, without deciding which parameters actually exist or their values.
    decided: One parameter only — register, an enumeration of formal and plain — explicitly excluding any content-priority or emphasis parameter.
    why: A parameter naming which aspect to prioritize would let a curator's framing steer which findings the text foregrounds, in tension with judgment-does-not-infer and the-outcome-comes-from-the-case, which this whole field exists to stay reconciled with; register is purely cosmetic and carries no such risk, and a closed pair (formal, plain) is the smallest defensible set the material's own example gestures at.
  - location: domain/knowledge/consolidation-register.md
    field: type
    unstated: The material asks the analysis to decide whether this parameter needs a glossary vocabulary of its own (the subject-attribute pattern) or a fixed enumeration suffices.
    decided: enumeration, not a glossary-discovered vocabulary.
    why: A register is a closed style choice known ahead of time, unlike concept, outcome or subject-attribute, which grow as new cases or new integrations are authored; nothing about a register grows the same way, so no case-terms-exist-in-the-glossary-style governance rule is needed for it.
  - location: domain/knowledge/case.md
    field: attributes.consolidation_register.required
    unstated: The material says the curator authors this alongside the hypotheses but does not say whether every case must declare one.
    decided: Not required.
    why: Forcing every existing case to declare a register retroactively is a burden the material never asks for; an absent register defers to whatever the consolidation adapter's own default carries, the same absence-is-data convention domain/investigation/assessment already uses for determining_hypothesis.
  - location: rules/investigation/the-writing-input-is-narrowed.md
    field: statement
    unstated: The material states explicitly that this rule is replaced, not relaxed — the outcome-based branching disappears — but leaves the exact new statement for the analysis to write.
    decided: One shape in every outcome — every required hypothesis's evaluation (verdict, reason when present, citations) plus the evidence any citation names; the case's hypotheses, their criteria and the when_to_use still enter no prompt, without exception.
    why: Directly reflects the material's own description of the unified input, keeping the two absolute exclusions (case body, criteria) the material repeats as never lifted.
  - location: rules/investigation/an-answer-arrives-within-the-declared-deadline.md
    field: statement
    unstated: The material asks the analysis to confirm, as an explicit decision rather than an absence of change, whether the four-second writing slice still holds now that its mechanism moves from a pure function to a single LLM call.
    decided: The total stays twenty seconds and the writing slice stays four, unchanged, now covering the consolidation call.
    why: A single, non-parallel LLM call fits a four-second slice at least as comfortably as one individual judgment call already fits inside judgment's own five-second slice across a whole pool; nothing in the material gives evidence the mechanism change demands a larger number.
---
