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
  - location: domain/investigation/investigation.md
    field: attributes.requester.type
    unstated: No node stated where a diagnose call's requester value originates — the standing BLOCKING on task/investigation-lifecycle/diagnose-entry-point.
    decided: The caller supplies it directly in the diagnose call's own payload; no further resolution or inference happens inside the domain.
    why: Resolves the standing BLOCKING; the human confirmed the caller supplies it directly, the same way ticket_ref now does.
  - location: domain/investigation/investigation.md
    field: attributes.ticket_ref.required
    unstated: The same BLOCKING left unstated where ticket_ref originates, and whether every diagnose call must carry one.
    decided: Not required — ticket_ref travels in the diagnose call's own payload when given, but not every call carries one.
    why: The human confirmed a ticket reference is optional; nothing forces every request to have a ticket to attach.
  - location: domain/investigation/investigation.md
    field: attributes.ticket_ref
    unstated: Removing the window-deduplication rule deletes the only node that gave ticket_ref an operative role, and the node itself does not say why the attribute survives.
    decided: ticket_ref stays on the investigation, optional and unchanged — correlation with the ticketing system for traceability and audit, participating in no matching or deduplication logic.
    why: The product owner confirmed the attribute keeps its correlation value with repetition semantics gone; removing it would cut the audit link between an investigation and the ticket that occasioned it, which nothing in the removal asked for.
  - location: rules/investigation/the-writing-input-is-narrowed.md
    field: statement
    unstated: The material admits the pinned case's title and when_to_use into the judgment prompt without saying what becomes of this rule's unqualified clause that the when_to_use enters no prompt.
    decided: The exclusion is scoped to consolidation — the case's hypotheses, their criteria and the when_to_use enter no consolidation prompt; what the judgment prompt contains is its own constraint's to state.
    why: Read unqualified, the clause would contradict the confirmed decision that title and when_to_use now enter the judgment prompt; the rule's own rationale — never give consolidation the case body to reason from — was always about the writing, and the closed consolidation prompt keeps them out of consolidation regardless.
  - location: constraints/the-judgment-prompt-is-closed.md
    field: statement
    unstated: Live testing against the real provider exposed that rules/investigation/a-cited-field-exists-in-the-capability-output-schema cannot be satisfied by a model never shown the output schema it cites against, but the product owner's confirmed decision to widen the closed prompt did not itself fix the exact shape of what enters — the field names alone, the whole schema text, or the schema with its types and descriptions.
    decided: Only the field names — the output schema's own `properties` keys, per evidence item — enter the prompt; the schema's types, descriptions and any other content stay out.
    why: The citation rule only ever holds a citation's field to existing among those keys, so the field names are the whole vocabulary it requires; admitting the schema's other content would let data the rule never asked for start reading as instruction, against this constraint's own data-is-data discipline.
  - location: constraints/the-system-persists-to-one-relational-database.md
    field: statement
    unstated: The material says the application starts persisting to a database without saying which of the four things the system keeps move there — the cases, the published vocabularies, the capability registrations and the investigations each have their own store today.
    decided: All four, in one store; nothing stays in a file — and the constraint names no engine and no driver, saying only that the store is transactional and relational.
    why: A record left in a file would keep the constraint this replaces alive for part of the system while the rest denies it, and the two homes would have to be kept in step by hand; the engine is named by the project's standard in STK-12 and its driver in STK-05, so naming it here as well would put one fact in two houses where changing stores means remembering to edit both, and only the property that survives such a change belongs here.
  - location: constraints/the-database-is-externally-provisioned.md
    field: statement
    unstated: The material names the provider that provisions the database; it does not say whether the provider is part of the solution bound or a deployment choice the specification stays out of.
    decided: A deployment choice — the constraint states external provisioning reached through a connection URL from configuration, and names no provider.
    why: A provider's name written here would refuse a second environment provisioned differently, and it is not what any check could hold; what a check can hold is that the deployment provisions no database service and hardcodes no endpoint, which is the property the material was actually asserting.
  - location: constraints/the-schema-replays-from-its-scripts.md
    field: statement
    unstated: The material asks for SQL scripts in the style of migrations under migrations/, versioned, without saying which of those facts is a bound on the solution and which is the project's own arrangement — and the project's standard already states the arrangement half, in STK-06 and PRH-04, differently.
    decided: The constraint states only that the schema replays from the numbered scripts; the directory, the file form and the prohibition on runtime DDL stay with the standard.
    why: Stated here as well, the directory would put two review passes in contradiction over the same file — one requiring migrations/ while the standard's rule reaches src/migrations and nothing else — and the constraint schema assigns a project's arrangement convention to the standard even where the property is identical; what survives a change of standard is that the scripts are the whole schema and their order suffices, which is what this keeps.
  - location: constraints/the-stored-schema-mirrors-the-declared-model.md
    field: fitness
    unstated: The material requires the tables and attributes to conform to the current entities but names no check that would find a departure.
    decided: A pairing in both directions — each relation and column against the element and declared attribute it encodes, and each required attribute against the column that holds it.
    why: Both sides are enumerable, so the pairing is mechanical rather than a reading; and the second direction is the one no schema review would find on its own, because a fact the specification states and the store cannot record is invisible from the schema alone.
  - location: constraints/a-case-is-read-whole.md
    field: statement
    unstated: Retiring the one-JSON-document constraint says the case stops being stored whole; it does not say whether the aggregate may now be read in pieces.
    decided: A case is read whole, in one transaction, or not at all.
    why: What kept hypotheses, resolutions and referrals arriving together was the document rather than any decision, so retiring the document silently retires the guarantee; a partially loaded case has a short collection plan and a holed precedence order, and resolve-outcome would answer from it without anything failing.
  - location: rules/knowledge/a-case-version-is-written-once.md
    field: statement
    unstated: Dropping the hash leaves slug and version as the whole of the pin, and the material does not say what makes that pair name one content.
    decided: A case version is written once and never altered; revising a case writes a new version.
    why: The pair only identifies content while no version can be rewritten — with the digest gone, nothing else would detect a rewritten version, and every investigation that pinned it would name a procedure other than the one that ran.
  - location: rules/knowledge/a-slug-identifies-one-case.md
    field: statement
    unstated: The rule that a case's slug equals its file name goes with the file, and the material does not say what keeps a slug identifying one case once no file system enforces it.
    decided: No two cases share a slug, stated as an invariant of its own.
    why: The uniqueness was real and was being kept by the medium rather than by a decision; leaving it unstated would drop a standing invariant as a side effect of changing the store, and two cases under one slug would leave every pin to that slug ambiguous.
  - location: rules/knowledge/validation-runs-at-every-read.md
    field: statement
    unstated: The case element justified holding no draft by work in progress being a git fact, a branch or a pull request; with curation moving to the database, the material does not say what keeps a draft out of the domain.
    decided: Validation at every read is the whole of the gate — an unfinished version does not validate, so it is not a case, and no publication state is introduced.
    why: The alternative is a status on the case, which no class here admits and which the specification deliberately refused; the rule already ran at every read with no intermediate gate, so it covers an unfinished version without any new field to maintain.
  - location: constraints/the-stored-schema-mirrors-the-declared-model.md
    field: statement
    unstated: Stated per relation, this constraint and constraints/the-evidence-cache-admits-only-ok-results decide the evidence cache differently — the cache's key is a concept, a subject type, a subject's whole set of attribute-values and the inputs, declared by different elements and by no element named cache, so a relation-level pairing makes a cache the specification already admits a departure.
    decided: The pairing is per column, not per relation — every column pairs with one attribute some element declares, and a relation may draw columns from more than one element.
    why: What this constraint exists to catch is a column no element declares, and that is caught identically per column; the relation-level reading additionally forbade shapes the specification elsewhere requires, and the aggregate boundary it seemed to protect is held by constraints/a-case-is-read-whole rather than by the schema's shape.
  - location: domain/knowledge/hypothesis.md
    field: attributes
    unstated: The precedence rules/knowledge/hypotheses-are-ordered-by-precedence calls the declared order was carried by the order of the hypotheses inside their case's one document, and nothing declared it; decomposed into relations, rows have no order and constraints/the-stored-schema-mirrors-the-declared-model refuses a column no attribute declares.
    decided: A hypothesis declares position, a required integer.
    why: The precedence is a domain fact the rule already states experts affirm, so it cannot survive as an arrangement of the storage; declaring it on the hypothesis keeps the rule's statement true word for word and lets resolve-outcome read the order from a fact rather than from however rows came back.
  - location: rules/knowledge/a-hypothesis-position-is-unique-within-its-case.md
    field: statement
    unstated: Moving the order into a position field says nothing about two hypotheses holding the same position, which the document's arrangement made impossible without any rule.
    decided: No two hypotheses of one case share a position.
    why: resolve-outcome needs a total order to have a first confirmed hypothesis at all; with positions free to collide, a tie would be settled by whichever row was read first, which is the ambiguity the declared order exists to remove.
  - location: domain/investigation/investigation.md
    field: attributes
    unstated: The material does not say whether an investigation records when it was written; the file's own modification time carried it by accident and a row carries nothing by accident.
    decided: written_at, a required datetime.
    why: The record exists to be audited and replayed, and when it was written is the one fact an audit cannot recover from any other attribute; it is not a closing state, because nothing reads it to decide whether the investigation finished and there is no value it moves to next.
  - location: domain/knowledge/case.md
    field: attributes
    unstated: Version history used to be readable from the commits that produced the files; with the file gone, the material does not say whether a case version records when it was authored.
    decided: authored_at, a required datetime.
    why: Curation history was a fact of the version control the case no longer lives in, and an audit of which procedure was current when an old investigation ran needs it; the alternative was leaving a column no attribute declares, which constraints/the-stored-schema-mirrors-the-declared-model refuses.
  - location: domain/integration/capability.md
    field: attributes
    unstated: rules/integration/one-capability-answers-one-concept states that each concept resolves to exactly one capability, and domain/integration/capability-registry's own resolve-concept operation looks a capability up by the concept it answers, but no attribute of the capability itself ever named which concept that is — the element's own Description already spoke of "its concept" in prose, an operative fact with nowhere to be held.
    decided: A capability declares concept, a required reference to domain/glossary/concept.
    why: The lookup resolve-concept performs and the one-to-one invariant one-capability-answers-one-concept states both presuppose a fact readable off the capability itself; leaving it unstated left a column no attribute would declare, which constraints/the-stored-schema-mirrors-the-declared-model refuses, and left an operative claim living only in the element's own Description, which SPEC-001 R7 refuses. The reference is singular, not many, since the existing resolution reads one capability as answering one concept.
  - location: domain/knowledge/case.md
    field: attributes
    unstated: The material describes a case's identity as distinct from any one of its versions, and gives the identity a next-draft behavior, but does not say whether it carries any attribute of its own beyond the slug.
    decided: slug alone.
    why: Everything the material once described as belonging to "the case" beyond bare identity — title, when-to-use, subject, fallback, its hypotheses — is now explicitly per-version or per-hypothesis; nothing the material states is a fact of the identity itself, and inventing one would be exactly the kind of technical bookkeeping this class refuses.
  - location: domain/knowledge/hypothesis-revision.md
    field: type
    unstated: The material describes a hypothesis's content as revisioned, reused across several case versions, but does not say whether one revision is an entity living inside the hypothesis's own aggregate or a root of its own.
    decided: aggregate-root, referenced both by the hypothesis it belongs to and by the manifest entry that adopts it.
    why: A manifest entry belongs to a different aggregate (case-version) than the hypothesis whose content it adopts, and a reference may only target another aggregate's root, never reach into a sibling aggregate's own entity (SPEC-002 R11); a revision that a manifest entry outside the hypothesis aggregate must address by identity therefore has to stand as a root of its own.
  - location: domain/knowledge/manifest-entry.md
    field: attributes.position
    unstated: The material shows a hypothesis's precedence position without saying whether it belongs to the hypothesis's revisioned content or to the version's own placement of it.
    decided: position is the manifest entry's own attribute, never a fact of the hypothesis-revision it references.
    why: The material's own example reorders hypotheses between one version and the next with neither hypothesis's content changing; had position lived on the revision, that same reorder would force a content revision nobody asked for, purely to relabel a number.
  - location: rules/knowledge/validation-runs-at-every-read.md
    field: statement
    unstated: The material says a draft may be temporarily incomplete or incoherent while it is being composed, without saying whether reading a case version in that state is refused, exactly as an incoherent version already is today, or answered as partial data.
    decided: Reading a case version — draft or released alike — still requires every validator rule to hold at that reading; an incomplete or incoherent draft is not yet readable as a case at all, whether previewed or diagnosed against, and this needs no field of its own to track.
    why: Keeps the specification's own established mechanism — an unfinished version does not validate, so it is not a case, and nothing has to mark it as not ready — doing exactly the job it already did, rather than inventing a second, parallel notion of partial readability the material never asked for; draft and released answer a different question (whether a version may yet be diagnosed against), never whether it is coherent.
  - location: rules/knowledge/a-case-has-at-most-one-draft.md
    field: statement
    unstated: The material's own working-copy metaphor implies a single draft in flight per case, without stating this as a standing rule.
    decided: A case holds at most one version in draft state at a time.
    why: The material's own accepted numbering choice — assign the next version number the moment a draft is created, not at release — only avoids two drafts racing for the same number if at most one draft can exist per case at once; without this as a standing rule, that numbering choice has nothing stopping the collision it was meant to prevent.
  - location: rules/knowledge/a-case-version-number-is-never-reused.md
    field: statement
    unstated: The material states that a discarded draft's version number is never reused as a described behavior of rollback, without saying whether this is a standing invariant or an implementation detail nobody has to honor.
    decided: A standing rule of the case aggregate, not an implementation detail.
    why: The whole reason the material insists rollback always mints a new, higher version rather than reactivating an old one is auditability; leaving the no-reuse guarantee as an unstated implementation detail would let a future implementation derive the next number from whichever rows happen to still exist, silently reopening exactly the ambiguity rollback's own discipline exists to close.
  - location: rules/knowledge/a-hypothesis-revision-number-is-never-reused.md
    field: statement
    unstated: The intake scope for /plan-work describes revise-hypothesis assigning the next hypothesis-revision number as that hypothesis's own highest existing revision plus one, or one if none exists yet — an implementation-level assumption, not cited against any specification node — and never states whether this is a standing rule of the specification or whether a revision number may ever be reused for that hypothesis, the same gap a-case-version-number-is-never-reused once closed for case versions.
    decided: A hypothesis's first-ever revision is numbered 1; each later revision is numbered exactly one past that hypothesis's own highest existing revision, and a revision number, once assigned, is never reused for that hypothesis.
    why: Mirrors a-case-version-number-is-never-reused's own precedent exactly — a manifest entry, and a released version's pin through it, address a hypothesis-revision by this very number, so a reused number would let two different pieces of content answer to the same reference; unlike a case version, a hypothesis-revision is never discarded, so the guarantee holds without any counter needing to survive past a deleted row.
  - location: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft.md
    field: statement
    unstated: Which case version's declared subject type governs the concept-acceptance check performed when a hypothesis is revised, and whether a case must hold a draft version for a hypothesis of that case to be revised at all, is not stated.
    decided: A hypothesis is revised only while its case holds a draft version, and the concept-acceptance check the new revision undergoes uses that draft version's declared subject type.
    why: A hypothesis-revision carries no version reference of its own, so a-concept-accepts-the-declared-subject-type has nothing to check against unless one version is named; a-case-has-at-most-one-draft makes the case's own draft the one unambiguous candidate, and a-case-version-is-written-once already routes every content change through a draft rather than a released version, so anchoring the check there closes the gap without introducing a second route revision could take.
  - location: domain/knowledge/case.md
    field: attributes
    unstated: An earlier entry in this same log decided the case identity carries no attribute beyond slug, reasoning that a durable version-number counter was technical bookkeeping with no domain home. /plan-work's own execution-contract-binder later found this in direct conflict with a task built from the human-authored implementation scope, which requires exactly such a counter to satisfy a-case-version-number-is-never-reused (a version number, once issued, is never reused even after its draft is discarded — which a counter derived only from currently-existing rows cannot guarantee). The conflict was reported as a BLOCKING note, and the human explicitly chose to settle it by extending the specification rather than loosening the scope's own criterion.
    decided: The case identity gains a required attribute, next_version, an integer — the counter that assigns each new draft's version number, always greater than every version number the case has ever held, including one later discarded. This reverses the earlier "slug alone" entry rather than replacing it, since that entry is not itself wrong about anything the material stated in analysis, only insufficient once a-case-version-number-is-never-reused's own guarantee needed a durable, unambiguous home the analysis had not yet been asked to consider.
    why: The human's own explicit instruction, given the two paths a BLOCKING note offers (loosen the scope's criterion, or extend the specification) — this is the "extend the specification" path, chosen over asking whoever authors the scope to retract a criterion that is itself sound engineering, just previously homeless in the domain model.
  - location: domain/knowledge/case-version.md
    field: operations
    unstated: The human, reviewing a gap analysis of the HTTP surface an administration front-end needs, decided a curator must be able to correct a draft's own declared attributes (title, when_to_use, subject, fallback, consolidation_register) after create-draft, without naming the operation itself.
    decided: update-draft, added to case-version's own declared operations.
    why: Mirrors create-draft's own naming — a verb naming the lifecycle action — and sits beside place-hypothesis and remove-hypothesis as a third kind of in-draft composition, this one over the version's own attributes rather than its manifest; a-case-version-is-written-once already refuses it once released, so no new rule is needed to bound it.
  - location: contracts/knowledge/case-lifecycle.md
    field: operations
    unstated: The same review decided update-draft belongs to the curator's published entrance, without naming where it is exposed.
    decided: update-draft, added alongside create-draft, revise-hypothesis, place-hypothesis and remove-hypothesis in case-lifecycle's own operations.
    why: case-lifecycle already publishes every other in-draft composition action and the two terminal transitions (release, discard); update-draft is the same kind of action over the version's own attributes, so it belongs beside them rather than under a new api.
  - location: contracts/knowledge/case-query.md
    field: operations
    unstated: The same review decided that cases, the versions of a case, the hypotheses of a case and the revisions of a hypothesis each need a listing a curator browses by, without naming the operations or which api exposes them.
    decided: list-cases, list-case-versions, list-hypotheses and list-hypothesis-revisions, added to case-query's own operations, alongside read-case.
    why: case-query is already the one published api for every synchronous read the knowledge context offers; a listing is the same kind of read as read-case — validated, never file-backed — at a different cardinality, so it belongs beside read-case rather than splitting the context's one read surface into a second api. constraints/a-case-is-read-whole already anticipates independent reads of a hypothesis and its revisions apart from a whole case-version read, so this introduces no new tension with it.
  - location: contracts/glossary/glossary-query.md
    field: operations
    unstated: The same review decided the glossary's vocabularies and its concepts both need a listing, without naming the operations.
    decided: list-vocabulary-terms and list-concepts, added to glossary-query's own operations, alongside read-vocabulary-term and read-concept.
    why: Mirrors this api's own existing pairing of a term read and a concept read — one more operation per existing read, exposed through the one published-language interface a consumer already depends on, never a second interface.
  - location: contracts/integration/capability-registry.md
    field: operations
    unstated: The same review decided registered capabilities need a listing, without naming the operation.
    decided: list-capabilities, added to capability-registry's own operations, alongside read-capability.
    why: The registry already publishes the one synchronous read a consumer depends on; a listing is the same read at a different cardinality, so it belongs beside read-capability rather than a second api.
---
